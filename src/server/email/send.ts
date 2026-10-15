import { env } from "../env";

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** What kind of email this is ("welcome", "password_reset"…), for Resend's logs. */
  kind: string;
  /** Resend ignores a second send with the same key for 24 hours. */
  idempotencyKey?: string;
}

/** Emails that weren't sent because there's no RESEND_API_KEY (local development and tests). */
export const outbox: Email[] = [];

/**
 * Sends one email through Resend. Never throws: an email that can't go out is logged and the
 * caller carries on, because no payment, sign-up or reset should fail over an email.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  if (!env.email.resendApiKey) {
    outbox.push(email);
    if (outbox.length > 50) outbox.shift();
    if (env.isProduction) console.warn(`Email not sent (RESEND_API_KEY isn't set): ${email.kind} to ${email.to}`);
    else console.info(`[email] ${email.kind} to ${email.to}: ${email.subject}\n${email.text}\n`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.email.resendApiKey}`,
        "Content-Type": "application/json",
        ...(email.idempotencyKey ? { "Idempotency-Key": email.idempotencyKey.slice(0, 256) } : {}),
      },
      body: JSON.stringify({
        from: env.email.from,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(env.email.replyTo ? { reply_to: env.email.replyTo } : {}),
        tags: [{ name: "kind", value: email.kind }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return true;
    console.error(`Email ${email.kind} to ${email.to} failed: Resend answered ${res.status} ${(await res.text()).slice(0, 300)}`);
  } catch (e) {
    console.error(`Email ${email.kind} to ${email.to} failed:`, e instanceof Error ? e.message : e);
  }
  return false;
}
