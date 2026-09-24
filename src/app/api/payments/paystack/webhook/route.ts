import { db } from "@/server/db";
import { paystackConfigured } from "@/server/env";
import { markFailed, markSucceeded } from "@/server/payments";
import { validSignature } from "@/server/payments/paystack";

/** Paystack's signed webhook: the reliable confirmation, even if the customer closes the tab. */
export async function POST(req: Request) {
  if (!paystackConfigured()) return new Response("Not configured", { status: 404 });
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-paystack-signature"))) return new Response("Bad signature", { status: 401 });
  const event = JSON.parse(raw) as { event: string; data: { reference: string; amount: number; currency: string; gateway_response?: string } };
  const d = await db();
  const [p] = await d.query<{ id: string; amount: number }>(
    `select id, amount from payments where provider = 'paystack' and provider_ref = $1 and status = 'pending'`,
    [event.data.reference],
  );
  if (p) {
    if (event.event === "charge.success" && event.data.currency === "KES" && event.data.amount >= p.amount * 100) {
      await markSucceeded(p.id, event.data.reference, { confirmed: true });
    } else if (event.event === "charge.failed") {
      await markFailed(p.id, event.data.gateway_response || "The card payment didn't go through.");
    }
  }
  return new Response("ok");
}
