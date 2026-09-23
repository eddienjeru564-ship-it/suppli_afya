import { DISTRIBUTORS, type Distributor } from "@/config/distributors";
import { db } from "./db";

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
    firstName: w.owner_name.split(" ")[0],
    area: w.location ?? "",
    whatsapp: w.whatsapp,
    demo: false,
    tagline: [w.business_name && w.business_name !== w.owner_name ? w.business_name : type, w.location].filter(Boolean).join(" · "),
    workspaceId: w.id,
  };
}
