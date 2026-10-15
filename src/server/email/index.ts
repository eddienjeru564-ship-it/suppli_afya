import { PLANS_BY_ID, type PlanId } from "@/config/plans";
import { site } from "@/config/site";
import { greetingName } from "@/lib/names";
import { db } from "../db";
import { env } from "../env";
import { sendEmail, type Email } from "./send";
import * as t from "./templates";

/**
 * The emails the app sends, and when. Each one that marks an event (a payment, a page going live,
 * a renewal reminder for one period) is recorded in email_log first, so it goes out once however
 * often the event is reported. Nothing here throws: an email is never a reason for the caller to fail.
 */

const url = (path: string) => `${env.siteUrl}${path}`;

/** Claims an event for sending. False if it was already sent (or claimed by a parallel call). */
async function claim(kind: string, ref: string, userId: string | null) {
  const d = await db();
  const rows = await d.query(`insert into email_log (kind, ref, user_id) values ($1, $2, $3) on conflict do nothing returning kind`, [
    kind,
    ref,
    userId,
  ]);
  return rows.length > 0;
}

async function sendOnce(kind: string, ref: string, userId: string | null, email: Omit<Email, "kind" | "idempotencyKey">) {
  if (!(await claim(kind, ref, userId))) return false;
  const sent = await sendEmail({ ...email, kind, idempotencyKey: `${kind}:${ref}` });
  // Not sent (no key yet, or Resend unreachable): release the claim so the next run can try again.
  if (!sent) await (await db()).query(`delete from email_log where kind = $1 and ref = $2`, [kind, ref]);
  return sent;
}

function safely<A extends unknown[]>(name: string, fn: (...a: A) => Promise<unknown>) {
  return async (...a: A) => {
    try {
      await fn(...a);
    } catch (e) {
      console.error(`Email "${name}" failed`, e);
    }
  };
}

const METHOD: Record<string, string> = { mpesa: "M-Pesa", card: "Card" };

/** After a payment goes through: a welcome on the first one, a receipt on every later one. */
export const notifyPaymentSucceeded = safely("payment", async (paymentId: string) => {
  const d = await db();
  const [p] = await d.query<{
    workspace_id: string;
    plan: PlanId;
    amount: number;
    method: string;
    provider: string;
    receipt: string | null;
    user_id: string;
    email: string;
    owner_name: string | null;
    paid_until: Date;
    earlier: number;
  }>(
    `select p.workspace_id, p.plan, p.amount, p.method, p.provider, p.receipt, u.id as user_id, u.email, w.owner_name,
            s.current_period_end as paid_until,
            (select count(*)::int from payments q where q.workspace_id = p.workspace_id and q.status = 'succeeded' and q.id <> p.id
               and q.created_at < p.created_at) as earlier
       from payments p
       join workspaces w on w.id = p.workspace_id
       join users u on u.id = w.owner_id
       join subscriptions s on s.workspace_id = p.workspace_id
      where p.id = $1 and p.status = 'succeeded'`,
    [paymentId],
  );
  if (!p) return;
  const details: t.PaymentDetails = {
    name: p.owner_name ? greetingName(p.owner_name) : null,
    plan: PLANS_BY_ID[p.plan]?.name ?? p.plan,
    amount: p.amount,
    method: p.provider === "test" ? "Test payment" : (METHOD[p.method] ?? p.method),
    receipt: p.receipt,
    paidUntil: p.paid_until,
  };
  const email =
    p.earlier === 0 ? t.welcomeEmail({ ...details, setupUrl: url("/start/setup") }) : t.receiptEmail({ ...details, portalUrl: url("/portal") });
  await sendOnce(p.earlier === 0 ? "welcome" : "receipt", paymentId, p.user_id, { to: p.email, ...email });
});

/** When onboarding finishes and the page first goes live. */
export const notifyPageLive = safely("page_live", async (workspaceId: string) => {
  const d = await db();
  const [w] = await d.query<{ slug: string | null; owner_name: string | null; email: string; user_id: string }>(
    `select w.slug, w.owner_name, u.email, u.id as user_id from workspaces w join users u on u.id = w.owner_id where w.id = $1`,
    [workspaceId],
  );
  if (!w?.slug) return;
  const email = t.pageLiveEmail({
    name: w.owner_name ? greetingName(w.owner_name) : null,
    pageUrl: `${site.url}/d/${w.slug}`,
    displayUrl: `${site.displayDomain}/d/${w.slug}`,
    cardUrl: url("/card"),
    portalUrl: url("/portal"),
  });
  await sendOnce("page_live", workspaceId, w.user_id, { to: w.email, ...email });
});

/** Not claimed in email_log: every request gets its own link. Rate limiting is the caller's. */
export async function sendPasswordReset(to: string, token: string) {
  const email = t.passwordResetEmail({ resetUrl: url(`/login/reset?token=${encodeURIComponent(token)}`) });
  return sendEmail({ to, ...email, kind: "password_reset" });
}

export const notifyPasswordChanged = safely("password_changed", async (to: string) => {
  await sendEmail({ to, ...t.passwordChangedEmail({ when: new Date(), forgotUrl: url("/login/forgot") }), kind: "password_changed" });
});

/** Days before the end of a paid period that the reminder goes out. */
export const REMIND_DAYS = 3;
/** Matches the grace period in auth.ts: pages stay open this many days after a period ends. */
const GRACE_DAYS = 3;

/**
 * Run by the morning job: a reminder a few days before a subscription ends, and a note the day it
 * has ended. Nothing renews automatically, so these are what keep a distributor's page open.
 */
export async function sendSubscriptionEmails() {
  const d = await db();
  const rows = await d.query<{
    workspace_id: string;
    user_id: string;
    email: string;
    owner_name: string | null;
    plan: PlanId;
    period_end: Date;
    ended: boolean;
  }>(
    `select s.workspace_id, u.id as user_id, u.email, w.owner_name, s.plan, s.current_period_end as period_end,
            s.current_period_end <= now() as ended
       from subscriptions s
       join workspaces w on w.id = s.workspace_id
       join users u on u.id = w.owner_id
      where s.status = 'active'
        and s.current_period_end > now() - interval '${GRACE_DAYS} days'
        and s.current_period_end <= now() + interval '${REMIND_DAYS} days'`,
  );
  let sent = 0;
  for (const r of rows) {
    const plan = PLANS_BY_ID[r.plan] ?? PLANS_BY_ID.starter;
    const name = r.owner_name ? greetingName(r.owner_name) : null;
    const renewUrl = url(`/start/pay?renew=1&plan=${plan.id}`);
    const ref = `${r.workspace_id}:${new Date(r.period_end).toISOString().slice(0, 10)}`;
    try {
      const ok = r.ended
        ? await sendOnce("subscription_ended", ref, r.user_id, {
            to: r.email,
            ...t.subscriptionEndedEmail({
              name,
              plan: plan.name,
              endedOn: r.period_end,
              pageClosesOn: new Date(new Date(r.period_end).getTime() + GRACE_DAYS * 86400_000),
              renewUrl,
            }),
          })
        : await sendOnce("renewal_due", ref, r.user_id, {
            to: r.email,
            ...t.renewalDueEmail({ name, plan: plan.name, price: plan.price, endsOn: r.period_end, renewUrl }),
          });
      if (ok) sent++;
    } catch (e) {
      console.error(`Subscription email for workspace ${r.workspace_id} failed`, e);
    }
  }
  return { due: rows.length, sent };
}
