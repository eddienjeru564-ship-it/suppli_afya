import { timingSafeEqual } from "node:crypto";
import { db } from "@/server/db";
import { mpesaConfigured } from "@/server/env";
import { applyMpesaOutcome, type PaymentRow } from "@/server/payments";
import * as payhero from "@/server/payments/payhero";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PayHero posts the M-Pesa result here. PayHero doesn't sign callbacks, so:
 * - the URL carries a secret token,
 * - we only act on a PayHero payment of ours (matched by our reference),
 * - a success is double-checked with PayHero's status API when it answers.
 */
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const expected = mpesaConfigured() ? payhero.callbackToken() : "";
  const ok = expected.length > 0 && token.length === expected.length && timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  if (!ok) return Response.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => null);
  const cb = payhero.parseCallback(body);
  if (!cb) return Response.json({ ok: true, ignored: true });

  const d = await db();
  // Our own reference first; PayHero's CheckoutRequestID only if that's missing.
  const byId = cb.externalReference && UUID.test(cb.externalReference);
  const [p] = byId
    ? await d.query<PaymentRow>(`select * from payments where provider = 'payhero' and id = $1`, [cb.externalReference])
    : cb.checkoutRequestId
      ? await d.query<PaymentRow>(`select * from payments where provider = 'payhero' and raw->>'CheckoutRequestID' = $1`, [
          cb.checkoutRequestId,
        ])
      : [];
  if (!p || p.status === "succeeded") return Response.json({ ok: true, ignored: true });

  await d.query(`update payments set raw = coalesce(raw, '{}'::jsonb) || jsonb_build_object('callback', $2::jsonb) where id = $1`, [
    p.id,
    JSON.stringify(body),
  ]);

  let outcome = cb.outcome;
  if (outcome.state === "success" && p.provider_ref) {
    // Trust PayHero's own record over the posted body when it has one.
    const checked = await payhero.transactionStatus(p.provider_ref).catch(() => null);
    if (checked?.state === "failed") outcome = checked;
    else if (checked?.state === "success") outcome = { ...checked, receipt: checked.receipt ?? outcome.receipt, amount: checked.amount ?? outcome.amount };
  }
  await applyMpesaOutcome(p, outcome);
  return Response.json({ ok: true });
}
