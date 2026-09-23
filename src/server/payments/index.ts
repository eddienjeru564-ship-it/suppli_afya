import { PLANS_BY_ID, type PlanId } from "@/config/plans";
import { db, json } from "../db";
import { env, mpesaConfigured, paystackConfigured } from "../env";
import * as mpesa from "./mpesa";
import * as paystack from "./paystack";

export type Method = "mpesa" | "card";
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
  provider: "daraja" | "paystack" | "test";
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
}): Promise<StartResult> {
  const plan = PLANS_BY_ID[opts.plan];
  const mode = methodModes()[opts.method];
  if (mode === "off") return { ok: false, error: "This payment method isn't switched on yet. Please try the other one." };

  let phone: string | null = null;
  if (opts.method === "mpesa") {
    phone = mpesa.normaliseKenyanPhone(opts.phone ?? "");
    if (!phone) return { ok: false, error: "Enter the M-Pesa number to pay from, like 0712 345 678." };
  }

  const provider = mode === "test" ? "test" : opts.method === "mpesa" ? "daraja" : "paystack";
  const d = await db();
  const [row] = await d.query<PaymentRow>(
    `insert into payments (workspace_id, plan, amount, method, provider, phone)
     values ($1, $2, $3, $4, $5, $6) returning *`,
    [opts.workspaceId, plan.id, plan.price, opts.method, provider, phone],
  );

  if (provider === "test") return { ok: true, paymentId: row.id, next: "test" };

  try {
    if (provider === "daraja") {
      const { checkoutRequestId, raw } = await mpesa.stkPush({
        phone: phone!,
        amount: plan.price,
        reference: "SUPPLIAFYA",
        description: `${plan.name} plan`,
      });
      await d.query(`update payments set provider_ref = $2, raw = $3::jsonb, updated_at = now() where id = $1`, [
        row.id,
        checkoutRequestId,
        json(raw),
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
 * Idempotent: only the first call for a pending payment has any effect.
 */
export async function markSucceeded(paymentId: string, receipt: string | null) {
  const d = await db();
  const [p] = await d.query<PaymentRow>(
    `update payments set status = 'succeeded', receipt = coalesce($2, receipt), updated_at = now()
      where id = $1 and status = 'pending' returning *`,
    [paymentId, receipt],
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

/** For M-Pesa, if the callback hasn't arrived after a while, ask Daraja directly. */
export async function refreshPending(p: PaymentRow): Promise<PaymentRow> {
  if (p.status !== "pending" || p.provider !== "daraja" || !p.provider_ref) return p;
  const age = Date.now() - new Date(p.created_at).getTime();
  if (age < 15_000) return p;
  if (age > 5 * 60_000) {
    await markFailed(p.id, "We didn't hear back from M-Pesa. If money left your account, contact us with the M-Pesa message.");
    return (await getPayment(p.id))!;
  }
  try {
    const r = await mpesa.stkQuery(p.provider_ref);
    if (r.state === "success") await markSucceeded(p.id, r.receipt);
    if (r.state === "failed") await markFailed(p.id, r.reason);
  } catch {
    /* network hiccup; try again on the next poll */
  }
  return (await getPayment(p.id))!;
}
