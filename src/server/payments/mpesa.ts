import { env } from "../env";

/**
 * Safaricom Daraja: Lipa na M-Pesa Online (STK Push).
 * The customer gets a prompt on their phone and enters their M-Pesa PIN.
 * The result arrives on our callback URL; we also poll the query API as a fallback.
 */
const base = () => (env.mpesa.env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke");

let cachedToken: { token: string; expires: number } | null = null;

async function accessToken() {
  if (cachedToken && cachedToken.expires > Date.now() + 30_000) return cachedToken.token;
  const auth = Buffer.from(`${env.mpesa.consumerKey}:${env.mpesa.consumerSecret}`).toString("base64");
  const res = await fetch(`${base()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`M-Pesa auth failed (${res.status})`);
  const body = (await res.json()) as { access_token: string; expires_in: string };
  cachedToken = { token: body.access_token, expires: Date.now() + Number(body.expires_in) * 1000 };
  return cachedToken.token;
}

function timestamp() {
  // Daraja wants East Africa Time, YYYYMMDDHHmmss.
  const eat = new Date(Date.now() + 3 * 3600_000);
  return eat.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
}

function password(ts: string) {
  return Buffer.from(`${env.mpesa.shortcode}${env.mpesa.passkey}${ts}`).toString("base64");
}

/** 07XX / 01XX / +2547XX → 2547XXXXXXXX. Returns null if it isn't a Kenyan mobile number. */
export function normaliseKenyanPhone(input: string): string | null {
  const d = input.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const m = d.match(/^(?:254|0)?([17]\d{8})$/);
  return m ? `254${m[1]}` : null;
}

export async function stkPush(opts: { phone: string; amount: number; reference: string; description: string }) {
  const ts = timestamp();
  const isTill = env.mpesa.type === "till";
  const res = await fetch(`${base()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: env.mpesa.shortcode,
      Password: password(ts),
      Timestamp: ts,
      TransactionType: isTill ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
      Amount: Math.round(opts.amount),
      PartyA: opts.phone,
      PartyB: isTill ? env.mpesa.tillNumber || env.mpesa.shortcode : env.mpesa.shortcode,
      PhoneNumber: opts.phone,
      CallBackURL: `${env.siteUrl}/api/payments/mpesa/callback?token=${encodeURIComponent(env.mpesa.callbackToken)}`,
      AccountReference: opts.reference.slice(0, 12),
      TransactionDesc: opts.description.slice(0, 13),
    }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as {
    CheckoutRequestID?: string;
    ResponseCode?: string;
    errorMessage?: string;
    CustomerMessage?: string;
  };
  if (!res.ok || body.ResponseCode !== "0" || !body.CheckoutRequestID) {
    throw new Error(body.errorMessage || "M-Pesa couldn't start the payment. Check the number and try again.");
  }
  return { checkoutRequestId: body.CheckoutRequestID, raw: body };
}

/** Result codes that mean the attempt is over and failed (1032 = cancelled by user, 1037 = timeout, etc.). */
export type StkOutcome = { state: "pending" } | { state: "success"; receipt: string | null } | { state: "failed"; reason: string };

export async function stkQuery(checkoutRequestId: string): Promise<StkOutcome> {
  const ts = timestamp();
  const res = await fetch(`${base()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ BusinessShortCode: env.mpesa.shortcode, Password: password(ts), Timestamp: ts, CheckoutRequestID: checkoutRequestId }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as { ResultCode?: string; ResultDesc?: string; errorCode?: string };
  // While the customer hasn't answered, Daraja returns an error ("The transaction is being processed").
  if (body.ResultCode === undefined) return { state: "pending" };
  if (body.ResultCode === "0") return { state: "success", receipt: null };
  return { state: "failed", reason: friendlyMpesaReason(body.ResultCode, body.ResultDesc) };
}

export function friendlyMpesaReason(code: string | number, desc?: string) {
  switch (String(code)) {
    case "1032":
      return "The M-Pesa prompt was cancelled.";
    case "1037":
      return "The M-Pesa prompt timed out before a PIN was entered.";
    case "1":
      return "There wasn't enough in the M-Pesa account.";
    case "2001":
      return "The M-Pesa PIN was incorrect.";
    default:
      return desc || "M-Pesa didn't complete the payment.";
  }
}
