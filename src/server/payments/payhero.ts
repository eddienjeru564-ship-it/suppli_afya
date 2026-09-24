import { createHash } from "node:crypto";
import { env } from "../env";

/**
 * PayHero (payhero.co.ke): M-Pesa STK Push through a payment channel
 * (a Till, Paybill or bank account) registered on the PayHero dashboard.
 *
 * - Start:    POST {base}/payments           → { reference, CheckoutRequestID, status: "QUEUED" }
 * - Result:   PayHero POSTs to our callback   → { response: { ExternalReference, ResultCode, MpesaReceiptNumber, … } }
 * - Fallback: GET  {base}/transaction-status?reference=… → { status: "QUEUED" | "SUCCESS" | "FAILED", … }
 *
 * PayHero's field names aren't all documented consistently, so every response
 * is read defensively.
 */

export function authHeader() {
  const p = env.payhero;
  if (p.authToken) return p.authToken.startsWith("Basic ") ? p.authToken : `Basic ${p.authToken}`;
  return `Basic ${Buffer.from(`${p.username}:${p.password}`).toString("base64")}`;
}

/**
 * PayHero doesn't sign callbacks, so the callback URL carries a secret.
 * Set PAYHERO_CALLBACK_TOKEN, or it's derived from the API credentials.
 */
export function callbackToken() {
  if (env.payhero.callbackToken) return env.payhero.callbackToken;
  return createHash("sha256").update(`suppli-afya:payhero-callback:${authHeader()}`).digest("hex").slice(0, 40);
}

export function callbackUrl() {
  return `${env.siteUrl}/api/payments/payhero/callback?token=${callbackToken()}`;
}

type Json = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : typeof v === "number" ? String(v) : null);

async function call(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: Json }> {
  const res = await fetch(`${env.payhero.baseUrl}/${path}`, {
    ...init,
    headers: { Authorization: authHeader(), "Content-Type": "application/json", Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const body = (await res.json().catch(() => ({}))) as Json;
  return { ok: res.ok, status: res.status, body };
}

function errorMessage(body: Json, status: number) {
  const m = str(body.error_message) ?? str(body.message) ?? str(body.error) ?? str(body.detail);
  if (status === 401 || status === 403) return "M-Pesa payments aren't set up correctly on our side. Please pay by card, or try again later.";
  return m ? `M-Pesa couldn't start the payment: ${m}` : "M-Pesa couldn't start the payment. Check the number and try again.";
}

/** Sends the M-Pesa prompt. `phone` is 2547XXXXXXXX. */
export async function stkPush(opts: { phone: string; amount: number; externalReference: string; customerName: string }) {
  const { ok, status, body } = await call("payments", {
    method: "POST",
    body: JSON.stringify({
      amount: Math.round(opts.amount),
      phone_number: `0${opts.phone.slice(3)}`,
      channel_id: Number(env.payhero.channelId),
      provider: "m-pesa",
      external_reference: opts.externalReference,
      customer_name: opts.customerName.slice(0, 60),
      callback_url: callbackUrl(),
    }),
  });
  const reference = str(body.reference);
  if (!ok || body.success === false || !reference) throw new Error(errorMessage(body, status));
  return { reference, checkoutRequestId: str(body.CheckoutRequestID), raw: body };
}

export type StkOutcome =
  | { state: "pending" }
  | { state: "success"; receipt: string | null; amount: number | null }
  | { state: "failed"; code: string | null; reason: string | null };

function outcome(status: string | null, receipt: string | null, amount: number | null, code: string | null, reason: string | null): StkOutcome {
  const s = (status ?? "").toUpperCase();
  if (s === "SUCCESS" || s === "COMPLETED" || s === "PAID") return { state: "success", receipt, amount };
  if (s === "FAILED" || s === "CANCELLED" || s === "CANCELED") return { state: "failed", code, reason };
  return { state: "pending" };
}

/** Asks PayHero where a payment stands. `reference` is the one returned by stkPush. */
export async function transactionStatus(reference: string): Promise<StkOutcome> {
  const { ok, body } = await call(`transaction-status?reference=${encodeURIComponent(reference)}`);
  if (!ok) return { state: "pending" };
  return outcome(
    str(body.status),
    str(body.provider_reference) ?? str(body.third_party_reference) ?? str(body.MpesaReceiptNumber),
    Number.isFinite(Number(body.amount)) ? Number(body.amount) : null,
    str(body.ResultCode) ?? str(body.result_code),
    str(body.ResultDesc) ?? str(body.result_desc) ?? str(body.message),
  );
}

export interface Callback {
  externalReference: string | null;
  checkoutRequestId: string | null;
  outcome: StkOutcome;
}

/** Reads the body PayHero posts to the callback URL. */
export function parseCallback(body: unknown): Callback | null {
  if (!body || typeof body !== "object") return null;
  const r = ((body as Json).response ?? body) as Json;
  if (!r || typeof r !== "object") return null;
  const code = str(r.ResultCode);
  const status = str(r.Status) ?? (code === "0" ? "SUCCESS" : code ? "FAILED" : null);
  return {
    externalReference: str(r.ExternalReference),
    checkoutRequestId: str(r.CheckoutRequestID),
    outcome: outcome(
      status,
      str(r.MpesaReceiptNumber),
      Number.isFinite(Number(r.Amount)) ? Number(r.Amount) : null,
      code,
      str(r.ResultDesc),
    ),
  };
}
