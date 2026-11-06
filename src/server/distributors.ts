import { DISTRIBUTORS, type Distributor } from "@/config/distributors";
import { db } from "./db";
import { greetingName } from "@/lib/names";

const TYPE_LABEL: Record<string, string> = {
  independent: "BF Suma distributor",
  pharmacy: "Pharmacy",
  wellness_shop: "Health & wellness shop",
  clinic: "Clinic",
  online: "Online seller",
  other: "BF Suma distributor",
};

export function businessTypeLabel(t: string | null | undefined) {
  return TYPE_LABEL[t ?? ""] ?? "BF Suma distributor";
}

/**
 * A distributor's public entry point. Workspaces with an active plan come from
 * the database; the demo distributor comes from config.
 */
/**
 * Distributor pages are cached at the edge (see /d/[slug]/page.tsx), so customers get them in one
 * hop with no database query. Call this whenever something on the page, or whether it's live,
 * changes: the name or WhatsApp number, finishing setup, a payment. Never throws: a stale page for
 * a couple of minutes is better than a failed save.
 */
export async function refreshDistributorPage(workspaceId: string) {
  try {
    const d = await db();
    const [w] = await d.query<{ slug: string | null }>(`select slug from workspaces where id = $1`, [workspaceId]);
    if (!w?.slug) return;
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/d/${w.slug}`);
  } catch {
    // Outside a request (tests, scripts) there's no cache to clear.
  }
}

export async function distributorBySlug(slug: string): Promise<(Distributor & { workspaceId?: string }) | null> {
  const demo = DISTRIBUTORS.find((d) => d.slug === slug);
  if (demo) return demo;
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) return null;
  const d = await db();
  const [w] = await d.query<{
    id: string;
    slug: string;
    owner_name: string | null;
    business_name: string | null;
    business_type: string | null;
    location: string | null;
    whatsapp: string | null;
  }>(
    `select w.id, w.slug, w.owner_name, w.business_name, w.business_type, w.location, w.whatsapp
       from workspaces w join subscriptions s on s.workspace_id = w.id
      where w.slug = $1 and w.onboarded_at is not null and s.status = 'active'
        and s.current_period_end > now() - interval '3 days'`,
    [slug],
  );
  if (!w || !w.owner_name) return null;
  const type = businessTypeLabel(w.business_type);
  return {
    slug: w.slug,
    name: w.owner_name,
    firstName: greetingName(w.owner_name),
    area: w.location ?? "",
    whatsapp: w.whatsapp,
    demo: false,
    tagline: [w.business_name && w.business_name !== w.owner_name ? w.business_name : type, w.location].filter(Boolean).join(" · "),
    workspaceId: w.id,
  };
}
