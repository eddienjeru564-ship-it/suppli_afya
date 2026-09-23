import { timingSafeEqual } from "node:crypto";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { markFailed, markSucceeded } from "@/server/payments";
import { friendlyMpesaReason } from "@/server/payments/mpesa";

/**
 * Daraja posts the STK Push result here. Daraja doesn't sign callbacks, so the
 * URL carries a shared secret, and we only act on a pending payment whose
 * CheckoutRequestID and amount match what we started.
 */
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const expected = env.mpesa.callbackToken;
  const ok =
    expected.length > 0 &&
    token.length === expected.length &&
    timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  if (!ok) return Response.json({ ResultCode: 1, ResultDesc: "Rejected" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    Body?: {
      stkCallback?: {
        CheckoutRequestID: string;
        ResultCode: number;
        ResultDesc: string;
        CallbackMetadata?: { Item: { Name: string; Value?: string | number }[] };
      };
    };
  } | null;
  const cb = body?.Body?.stkCallback;
  if (!cb) return Response.json({ ResultCode: 0, ResultDesc: "Ignored" });

  const d = await db();
  const [p] = await d.query<{ id: string; amount: number }>(
    `select id, amount from payments where provider = 'daraja' and provider_ref = $1 and status = 'pending'`,
    [cb.CheckoutRequestID],
  );
  if (p) {
    await d.query(`update payments set raw = $2::jsonb where id = $1`, [p.id, JSON.stringify(body)]);
    if (cb.ResultCode === 0) {
      const item = (n: string) => cb.CallbackMetadata?.Item.find((i) => i.Name === n)?.Value;
      const amount = Number(item("Amount"));
      if (Number.isFinite(amount) && amount >= p.amount) {
        await markSucceeded(p.id, String(item("MpesaReceiptNumber") ?? "") || null);
      } else {
        await markFailed(p.id, "The amount paid didn't match the plan price. Contact us with your M-Pesa message.");
      }
    } else {
      await markFailed(p.id, friendlyMpesaReason(cb.ResultCode, cb.ResultDesc));
    }
  }
  return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
