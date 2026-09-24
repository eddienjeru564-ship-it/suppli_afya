import { distributorBrief, profileFlags, recommend, type Answers } from "@/engine";
import { db, json } from "./db";

export const CHECK_REF = /^SA-[A-Z2-9]{4}$/;

/**
 * Saves a completed health check to a distributor's workspace as a prospect.
 * The plan is recomputed here from the answers rather than trusted from the browser.
 * Returns the prospect id, or null if the answers aren't usable.
 */
export async function saveProspect(opts: { workspaceId: string; answers: Answers; ref: string; phone: string | null; via: string }) {
  const result = recommend(opts.answers);
  const p = result.profile;
  if (!p.name) return null;
  const brief = distributorBrief(result);
  const d = await db();
  const rows = await d.query<{ id: string }>(
    `insert into prospects (workspace_id, ref, name, phone, age, sex, goals, products, flags, preference, result, answers)
     values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, $11::jsonb, $12::jsonb)
     on conflict (workspace_id, ref) do update set phone = coalesce(excluded.phone, prospects.phone)
     returning id`,
    [
      opts.workspaceId,
      opts.ref,
      p.name.slice(0, 40),
      opts.phone,
      p.age,
      p.sex,
      json(p.goals),
      json(result.core.map((c) => c.product.id)),
      json(profileFlags(p)),
      brief.preference,
      json({ ...result, profile: undefined, status: result.status, heard: result.heard, opener: brief.opener, tips: brief.tips }),
      json(opts.answers),
    ],
  );
  await d.query(`insert into interactions (workspace_id, prospect_id, kind, body) values ($1, $2, 'health_check', $3)`, [
    opts.workspaceId,
    rows[0].id,
    `Did the health check (${opts.ref}) and ${opts.via}.`,
  ]);
  return rows[0].id;
}
