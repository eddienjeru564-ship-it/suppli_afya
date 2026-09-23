import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { PlanId } from "@/config/plans";
import { db } from "./db";
import { env } from "./env";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "sa_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const sha = (t: string) => createHash("sha256").update(t).digest("hex");

/** Starts a session and sets the cookie. Call only from a Server Action or Route Handler. */
export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  const d = await db();
  await d.query(`insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)`, [sha(token), userId, expires]);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.siteUrl.startsWith("https://"),
    path: "/",
    expires,
  });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const d = await db();
    await d.query(`delete from sessions where token_hash = $1`, [sha(token)]);
  }
  store.delete(SESSION_COOKIE);
}

export interface Workspace {
  id: string;
  plan: PlanId;
  slug: string | null;
  owner_name: string | null;
  business_name: string | null;
  location: string | null;
  business_type: string | null;
  whatsapp: string | null;
  channels: string[];
  goals: string[];
  onboarding_step: number;
  onboarded_at: Date | null;
  community_dismissed_at: Date | null;
  created_at: Date;
}

export interface Subscription {
  plan: PlanId;
  status: "pending" | "active" | "cancelled";
  current_period_start: Date | null;
  current_period_end: Date | null;
}

export interface Account {
  user: { id: string; email: string };
  workspace: Workspace;
  subscription: Subscription | null;
}

/** The signed-in distributor for this request, or null. Cached per request. */
export const getAccount = cache(async (): Promise<Account | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const d = await db();
  const rows = await d.query<{ user_id: string; email: string }>(
    `select u.id as user_id, u.email from sessions s join users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now()`,
    [sha(token)],
  );
  if (!rows[0]) return null;
  const ws = await d.query<Workspace>(`select * from workspaces where owner_id = $1`, [rows[0].user_id]);
  if (!ws[0]) return null;
  const sub = await d.query<Subscription>(
    `select plan, status, current_period_start, current_period_end from subscriptions where workspace_id = $1`,
    [ws[0].id],
  );
  return { user: { id: rows[0].user_id, email: rows[0].email }, workspace: ws[0], subscription: sub[0] ?? null };
});

/** Days of access we allow after a period ends, while a renewal payment goes through. */
const GRACE_DAYS = 3;

export function subscriptionState(a: Account): "active" | "grace" | "inactive" {
  const s = a.subscription;
  if (!s || s.status !== "active" || !s.current_period_end) return "inactive";
  const end = new Date(s.current_period_end).getTime();
  if (end > Date.now()) return "active";
  if (end + GRACE_DAYS * 86400_000 > Date.now()) return "grace";
  return "inactive";
}

/** Where this person belongs next in the journey. */
export function nextStepFor(a: Account | null): string {
  if (!a) return "/login";
  if (subscriptionState(a) === "inactive") return "/start/pay";
  if (!a.workspace.onboarded_at) return "/start/setup";
  return "/portal";
}

/**
 * The signed-in distributor for a portal page. Layouts and pages render in
 * parallel, so each page guards itself rather than relying on the layout.
 */
export async function requirePortalAccount(): Promise<Account> {
  const a = await getAccount();
  const step = nextStepFor(a);
  if (step !== "/portal") redirect(step === "/login" ? "/login?next=/portal" : step);
  return a!;
}
