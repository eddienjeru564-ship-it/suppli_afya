import { PLANS_BY_ID, type PlanId } from "@/config/plans";
import { db, json } from "../db";
import { env, mpesaConfigured, paystackConfigured } from "../env";
import * as mpesa from "./mpesa";
import * as payhero from "./payhero";
import * as paystack from "./paystack";

export type Method = "mpesa" | "card";

/** M-Pesa prompts one workspace can send in 15 minutes. */
const MAX_PROMPTS = 5;
export type Mode = "live" | "test" | "off";

/** What each payment method can do right now, given the configured keys. */
export function methodModes(): Record<Method, Mode> {
  const test: Mode = env.allowTestPayments ? "test" : "off";
  return {
    mpesa: mpesaConfigured() ? "live" : test,
    card: paystackConfigured() ? "live" : test,
  };
}

export interface PaymentRow {
  id: string;
  workspace_id: string;
  plan: PlanId;
  amount: number;
  method: Method;
  provider: "payhero" | "paystack" | "test";
  status: "pending" | "succeeded" | "failed";
  phone: string | null;
  provider_ref: string | null;
  receipt: string | null;
  failure_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export type StartResult =
  | { ok: true; paymentId: string; next: "poll" | "test" }
  | { ok: true; paymentId: string; next: "redirect"; url: string }
  | { ok: false; error: string };

export async function startPayment(opts: {
  workspaceId: string;
  email: string;
  plan: PlanId;
  method: Method;
  phone?: string;
  customerName?: string;
}): Promise<StartResult> {
  const plan = PLANS_BY_ID[opts.plan];
  const mode = methodModes()[opts.method];
  if (mode === "off") return { ok: false, error: "This payment method isn't switched on yet. Please try the other one." };

  let phone: string | null = null;
  if (opts.method === "mpesa") {
    phone = mpesa.normaliseKenyanPhone(opts.phone ?? "");
    if (!phone) return { ok: false, error: "Enter the M-Pesa number to pay from, like 0712 345 678." };
  }

  const provider = mode === "test" ? "test" : opts.method === "mpesa" ? "payhero" : "paystack";
  const d = await db();

  // PayHero pauses the whole account after too many failed prompts, so one
  // person can't send prompt after prompt.
  if (provider === "payhero") {
    const [{ n }] = await d.query<{ n: number }>(
      `select count(*)::int as n from payments
        where workspace_id = $1 and provider = 'payhero' and created_at > now() - interval '15 minutes'`,
      [opts.workspaceId],
    );
    if (n >= MAX_PROMPTS)
      return { ok: false, error: "That's a few M-Pesa prompts in a short time. Wait ten minutes and try again, or pay by card." };
  }
  const [row] = await d.query<PaymentRow>(
    `insert into payments (workspace_id, plan, amount, method, provider, phone)
     values ($1, $2, $3, $4, $5, $6) returning *`,
    [opts.workspaceId, plan.id, plan.price, opts.method, provider, phone],
  );

  if (provider === "test") return { ok: true, paymentId: row.id, next: "test" };

  try {
    if (provider === "payhero") {
      const r = await payhero.stkPush({
        phone: phone!,
        amount: plan.price,
        externalReference: row.id,
        customerName: opts.customerName || opts.email,
      });
      await d.query(`update payments set provider_ref = $2, raw = $3::jsonb, updated_at = now() where id = $1`, [
        row.id,
        r.reference,
        json(r.raw),
      ]);
      return { ok: true, paymentId: row.id, next: "poll" };
    }
    const reference = `sa_${row.id.replace(/-/g, "")}`;
    const { url } = await paystack.initialize({
      email: opts.email,
      amount: plan.price,
      reference,
      metadata: { payment_id: row.id, plan: plan.id },
    });
    await d.query(`update payments set provider_ref = $2, updated_at = now() where id = $1`, [row.id, reference]);
    return { ok: true, paymentId: row.id, next: "redirect", url };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "The payment couldn't be started.";
    await markFailed(row.id, reason);
    return { ok: false, error: reason };
  }
}

/**
 * Marks a payment as paid and extends the subscription by a month.
 * Idempotent: only the first call has any effect.
 *
 * `confirmed` means the provider itself says the money moved (callback,
 * webhook or status check). That wins even over a payment we'd given up on,
 * e.g. one we timed out before a late M-Pesa confirmation arrived.
 */
export async function markSucceeded(paymentId: string, receipt: string | null, opts: { confirmed?: boolean } = {}) {
  const d = await db();
  const [p] = await d.query<PaymentRow>(
    `update payments set status = 'succeeded', receipt = coalesce($2, receipt), failure_reason = null, updated_at = now()
      where id = $1 and (status = 'pending' or ($3 and status = 'failed')) returning *`,
    [paymentId, receipt, Boolean(opts.confirmed)],
  );
  if (!p) return false;
  // A renewal starts where the current period ends; a new or lapsed plan starts today.
  await d.query(
    `insert into subscriptions (workspace_id, plan, status, current_period_start, current_period_end, updated_at)
     values ($1, $2, 'active', now(), now() + interval '1 month', now())
     on conflict (workspace_id) do update set
       plan = excluded.plan,
       status = 'active',
       current_period_start = greatest(now(), coalesce(subscriptions.current_period_end, now())),
       current_period_end = greatest(now(), coalesce(subscriptions.current_period_end, now())) + interval '1 month',
       updated_at = now()`,
    [p.workspace_id, p.plan],
  );
  await d.query(`update workspaces set plan = $2 where id = $1`, [p.workspace_id, p.plan]);
  return true;
}

export async function markFailed(paymentId: string, reason: string) {
  const d = await db();
  await d.query(
    `update payments set status = 'failed', failure_reason = $2, updated_at = now() where id = $1 and status = 'pending'`,
    [paymentId, reason],
  );
}

export async function getPayment(paymentId: string) {
  const d = await db();
  const [p] = await d.query<PaymentRow>(`select * from payments where id = $1`, [paymentId]);
  return p ?? null;
}

/** Applies what PayHero says happened to an M-Pesa payment. */
export async function applyMpesaOutcome(p: PaymentRow, o: payhero.StkOutcome) {
  if (o.state === "success") {
    if (o.amount !== null && o.amount < p.amount) {
      await markFailed(p.id, "The amount paid didn't match the plan price. Contact us with your M-Pesa message and we'll sort it out.");
    } else {
      await markSucceeded(p.id, o.receipt, { confirmed: true });
    }
  } else if (o.state === "failed") {
    await markFailed(p.id, mpesa.friendlyMpesaReason(o.code, o.reason));
  }
}

/** For M-Pesa, if the callback hasn't arrived after a few seconds, ask PayHero directly. */
export async function refreshPending(p: PaymentRow): Promise<PaymentRow> {
  if (p.status !== "pending" || p.provider !== "payhero" || !p.provider_ref) return p;
  const age = Date.now() - new Date(p.created_at).getTime();
  if (age < 8_000) return p;
  try {
    await applyMpesaOutcome(p, await payhero.transactionStatus(p.provider_ref));
  } catch {
    /* network hiccup; try again on the next poll */
  }
  const fresh = (await getPayment(p.id))!;
  if (fresh.status === "pending" && age > 4 * 60_000) {
    // A late confirmation still counts (see markSucceeded), so giving up here never loses a payment.
    await markFailed(p.id, "We didn't hear back from M-Pesa. If money left your account, you'll be set up as soon as it reaches us.");
    return (await getPayment(p.id))!;
  }
  return fresh;
}

/**
 * Whether this workspace has a successful payment started around the same time
 * as `p`. Covers "send it again" when the person then paid the first prompt.
 */
export async function siblingSucceeded(p: PaymentRow) {
  const d = await db();
  const rows = await d.query(
    `select 1 from payments where workspace_id = $1 and id <> $2 and status = 'succeeded'
      and created_at > $3::timestamptz - interval '15 minutes'`,
    [p.workspace_id, p.id, p.created_at],
  );
  return rows.length > 0;
}
