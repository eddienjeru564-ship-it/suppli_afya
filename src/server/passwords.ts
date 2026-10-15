import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "./auth";
import { db } from "./db";
import { notifyPasswordChanged, sendPasswordReset } from "./email";

/**
 * Password resets by email. A link holds a random token; only its hash is stored. It works once,
 * for an hour, and using it signs the account out everywhere else.
 */

const LINK_MINUTES = 60;
/** Reset emails one account can be sent in an hour. */
const MAX_PER_HOUR = 3;
export const MIN_PASSWORD = 8;

const sha = (t: string) => createHash("sha256").update(t).digest("hex");

/**
 * Emails a reset link if the address has an account. The caller says the same thing either way,
 * so the form never reveals who has an account.
 */
export async function requestPasswordReset(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const d = await db();
  const [u] = await d.query<{ id: string; recent: number }>(
    `select u.id, (select count(*)::int from password_resets r where r.user_id = u.id and r.created_at > now() - interval '1 hour') as recent
       from users u where u.email = $1`,
    [email],
  );
  if (!u || u.recent >= MAX_PER_HOUR) return;
  const token = randomBytes(32).toString("base64url");
  await d.query(`insert into password_resets (token_hash, user_id, expires_at) values ($1, $2, now() + interval '${LINK_MINUTES} minutes')`, [
    sha(token),
    u.id,
  ]);
  await sendPasswordReset(email, token);
}

/** The account a reset link belongs to, if the link is still good. */
export async function resetTokenUser(token: string): Promise<{ userId: string; email: string } | null> {
  if (!token || token.length > 100) return null;
  const d = await db();
  const [r] = await d.query<{ user_id: string; email: string }>(
    `select r.user_id, u.email from password_resets r join users u on u.id = r.user_id
      where r.token_hash = $1 and r.used_at is null and r.expires_at > now()`,
    [sha(token)],
  );
  return r ? { userId: r.user_id, email: r.email } : null;
}

export type ResetResult = { ok: true; userId: string } | { ok: false; error: string; expired?: boolean };

/** Sets the new password, uses up every open link for the account and ends all its sessions. */
export async function resetPassword(token: string, password: string): Promise<ResetResult> {
  if (password.length < MIN_PASSWORD) return { ok: false, error: `Use a password of at least ${MIN_PASSWORD} characters.` };
  const d = await db();
  // Claim the link first, so two tabs submitting at once can't both use it.
  const [r] = await d.query<{ user_id: string }>(
    `update password_resets set used_at = now() where token_hash = $1 and used_at is null and expires_at > now() returning user_id`,
    [sha(token)],
  );
  if (!r) return { ok: false, expired: true, error: "This link has expired or has already been used. Ask for a new one." };
  const [u] = await d.query<{ email: string }>(`update users set password_hash = $2 where id = $1 returning email`, [
    r.user_id,
    await hashPassword(password),
  ]);
  await d.query(`update password_resets set used_at = coalesce(used_at, now()) where user_id = $1`, [r.user_id]);
  await d.query(`delete from sessions where user_id = $1`, [r.user_id]);
  await notifyPasswordChanged(u.email);
  return { ok: true, userId: r.user_id };
}
