import { getAccount } from "@/server/auth";
import { getPayment, refreshPending } from "@/server/payments";

/** Polled by the payment screen while the customer approves on their phone. */
export async function GET(_req: Request, ctx: RouteContext<"/api/payments/[id]">) {
  const { id } = await ctx.params;
  const account = await getAccount();
  const p = await getPayment(id);
  if (!account || !p || p.workspace_id !== account.workspace.id) return Response.json({ error: "Not found" }, { status: 404 });
  const fresh = await refreshPending(p);
  return Response.json({ status: fresh.status, reason: fresh.failure_reason, receipt: fresh.receipt });
}
