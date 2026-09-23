import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env";

/**
 * Paystack for card payments (it supports KES in Kenya). We use the standard
 * redirect checkout: Paystack collects card details on its secure page, then
 * sends the customer straight back to our confirmation step.
 */
const API = "https://api.paystack.co";

export async function initialize(opts: { email: string; amount: number; reference: string; metadata: Record<string, unknown> }) {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.paystack.secretKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: opts.email,
      amount: Math.round(opts.amount * 100), // smallest currency unit
      currency: "KES",
      reference: opts.reference,
      channels: ["card"],
      callback_url: `${env.siteUrl}/api/payments/paystack/return`,
      metadata: opts.metadata,
    }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as { status?: boolean; message?: string; data?: { authorization_url: string } };
  if (!res.ok || !body.status || !body.data) throw new Error(body.message || "Card payments are unavailable right now.");
  return { url: body.data.authorization_url };
}

export async function verify(reference: string) {
  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as {
    data?: { status: string; amount: number; currency: string; gateway_response?: string; id?: number };
  };
  return body.data ?? null;
}

export function validSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", env.paystack.secretKey).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
