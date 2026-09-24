import type { Answers } from "@/engine";
import { distributorBySlug } from "@/server/distributors";
import { CHECK_REF, saveProspect } from "@/server/leads";
import { normaliseKenyanPhone } from "@/server/payments/mpesa";

/**
 * Called when a customer taps "Send" at the end of the health check on a
 * distributor's link. Sending is the customer's choice, and it's what shares
 * their answers with that distributor.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { slug?: string; answers?: Answers; ref?: string; phone?: string } | null;
  if (!body?.slug || !body.answers || typeof body.answers !== "object") return Response.json({ ok: false }, { status: 400 });
  const ref = typeof body.ref === "string" && CHECK_REF.test(body.ref) ? body.ref : null;
  if (!ref) return Response.json({ ok: false }, { status: 400 });

  const dist = await distributorBySlug(body.slug);
  if (!dist?.workspaceId) return Response.json({ ok: true, stored: false });

  const id = await saveProspect({
    workspaceId: dist.workspaceId,
    answers: body.answers,
    ref,
    phone: body.phone ? normaliseKenyanPhone(body.phone) : null,
    via: "sent it on WhatsApp",
  });
  if (!id) return Response.json({ ok: false }, { status: 400 });
  return Response.json({ ok: true, stored: true });
}
