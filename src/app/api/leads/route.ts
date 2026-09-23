import { recommend, type Answers } from "@/engine";
import { distributorBrief, profileFlags } from "@/engine";
import { db, json } from "@/server/db";
import { distributorBySlug } from "@/server/distributors";
import { normaliseKenyanPhone } from "@/server/payments/mpesa";

/**
 * Called when a customer taps "Send" at the end of the health check on a
 * distributor's link. Sending is the customer's choice, and it's what shares
 * their answers with that distributor. We recompute the plan on the server
 * rather than trusting what the browser sends.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { slug?: string; answers?: Answers; ref?: string; phone?: string } | null;
  if (!body?.slug || !body.answers || typeof body.answers !== "object") return Response.json({ ok: false }, { status: 400 });
  const ref = typeof body.ref === "string" && /^SA-[A-Z2-9]{4}$/.test(body.ref) ? body.ref : null;
  if (!ref) return Response.json({ ok: false }, { status: 400 });

  const dist = await distributorBySlug(body.slug);
  if (!dist?.workspaceId) return Response.json({ ok: true, stored: false });

  const result = recommend(body.answers);
  const p = result.profile;
  if (!p.name) return Response.json({ ok: false }, { status: 400 });
  const brief = distributorBrief(result);
  const phone = body.phone ? normaliseKenyanPhone(body.phone) : null;

  const d = await db();
  const rows = await d.query<{ id: string }>(
    `insert into prospects (workspace_id, ref, name, phone, age, sex, goals, products, flags, preference, result, answers)
     values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, $11::jsonb, $12::jsonb)
     on conflict (workspace_id, ref) do update set phone = coalesce(excluded.phone, prospects.phone)
     returning id`,
    [
      dist.workspaceId,
      ref,
      p.name.slice(0, 40),
      phone,
      p.age,
      p.sex,
      json(p.goals),
      json(result.core.map((c) => c.product.id)),
      json(profileFlags(p)),
      brief.preference,
      json({ ...result, profile: undefined, status: result.status, heard: result.heard, opener: brief.opener, tips: brief.tips }),
      json(body.answers),
    ],
  );
  await d.query(
    `insert into interactions (workspace_id, prospect_id, kind, body) values ($1, $2, 'health_check', $3)`,
    [dist.workspaceId, rows[0].id, `Did the health check (${ref}) and sent it on WhatsApp.`],
  );
  return Response.json({ ok: true, stored: true });
}
