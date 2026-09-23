import { getAccount } from "@/server/auth";
import { env } from "@/server/env";
import { getPayment, markFailed, markSucceeded } from "@/server/payments";

/**
 * Test mode only: approve or decline a test payment. Refuses anything that
 * isn't a test-provider payment owned by the signed-in distributor.
 */
export async function POST(req: Request, ctx: RouteContext<"/api/payments/[id]/test">) {
  if (!env.allowTestPayments) return Response.json({ error: "Test payments are off" }, { status: 403 });
  const { id } = await ctx.params;
  const account = await getAccount();
  const p = await getPayment(id);
  if (!account || !p || p.workspace_id !== account.workspace.id || p.provider !== "test")
    return Response.json({ error: "Not found" }, { status: 404 });
  const { outcome } = (await req.json().catch(() => ({}))) as { outcome?: string };
  if (outcome === "approve") await markSucceeded(p.id, `TEST${Date.now().toString(36).toUpperCase()}`);
  else await markFailed(p.id, p.method === "mpesa" ? "The M-Pesa prompt was cancelled." : "The card was declined.");
  const after = await getPayment(p.id);
  return Response.json({ status: after?.status, reason: after?.failure_reason });
}
