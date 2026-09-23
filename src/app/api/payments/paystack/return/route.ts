import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { markFailed, markSucceeded } from "@/server/payments";
import { verify } from "@/server/payments/paystack";

/** Where Paystack sends the customer back after the card page. We verify before trusting anything. */
export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get("reference") ?? "";
  const d = await db();
  const [p] = await d.query<{ id: string; amount: number; status: string }>(
    `select id, amount, status from payments where provider = 'paystack' and provider_ref = $1`,
    [reference],
  );
  if (!p) redirect("/start/pay");
  if (p.status === "pending") {
    const t = await verify(reference);
    if (t?.status === "success" && t.currency === "KES" && t.amount >= p.amount * 100) await markSucceeded(p.id, reference);
    else if (t && ["failed", "abandoned", "reversed"].includes(t.status))
      await markFailed(p.id, t.gateway_response || "The card payment didn't go through.");
  }
  const [after] = await d.query<{ status: string }>(`select status from payments where id = $1`, [p.id]);
  redirect(after.status === "succeeded" ? "/start/welcome" : `/start/pay?payment=${p.id}`);
}
