"use server";

import { RESERVED_SLUGS } from "@/config/distributors";
import { BUSINESS_TYPES, CHANNELS, GOALS } from "@/config/onboarding";
import { site } from "@/config/site";
import { getAccount, subscriptionState } from "@/server/auth";
import { db, json } from "@/server/db";
import { normaliseKenyanPhone } from "@/server/payments/mpesa";
import { qrSvg } from "@/lib/qr";

export type SaveResult = { ok: true } | { ok: false; error: string };

async function requireWorkspace() {
  const a = await getAccount();
  if (!a || subscriptionState(a) === "inactive") throw new Error("Not allowed");
  return a;
}

const clean = (v: unknown, max = 60) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const pick = (v: unknown, allowed: readonly { id: string }[]) =>
  Array.isArray(v) ? [...new Set(v.map(String))].filter((x) => allowed.some((a) => a.id === x)) : [];

/** Saves one onboarding screen. Progress is stored, so a refresh or a new device carries on where they left off. */
export async function saveStep(step: number, data: Record<string, unknown>): Promise<SaveResult> {
  const a = await requireWorkspace();
  const d = await db();
  const id = a.workspace.id;
  const advance = `onboarding_step = greatest(onboarding_step, ${step})`;

  if (step === 1) {
    const name = clean(data.name);
    if (name.length < 2) return { ok: false, error: "Please tell us your name." };
    await d.query(`update workspaces set owner_name = $2, ${advance} where id = $1`, [id, name]);
  } else if (step === 2) {
    const businessName = clean(data.businessName, 80);
    const location = clean(data.location);
    const businessType = String(data.businessType ?? "");
    const whatsapp = normaliseKenyanPhone(String(data.whatsapp ?? ""));
    if (businessName.length < 2) return { ok: false, error: "Add your business name. Your own name is fine if you don't have one." };
    if (location.length < 2) return { ok: false, error: "Where are you based? A town or area is enough." };
    if (!BUSINESS_TYPES.some((t) => t.id === businessType)) return { ok: false, error: "Choose the option closest to your business." };
    if (!whatsapp) return { ok: false, error: "Enter the WhatsApp number your customers use, like 0712 345 678." };
    await d.query(
      `update workspaces set business_name = $2, location = $3, business_type = $4, whatsapp = $5, ${advance} where id = $1`,
      [id, businessName, location, businessType, whatsapp],
    );
  } else if (step === 3) {
    const channels = pick(data.channels, CHANNELS);
    if (!channels.length) return { ok: false, error: "Choose at least one." };
    await d.query(`update workspaces set channels = $2::jsonb, ${advance} where id = $1`, [id, json(channels)]);
  } else if (step === 4) {
    const goals = pick(data.goals, GOALS);
    if (!goals.length) return { ok: false, error: "Choose at least one." };
    await d.query(`update workspaces set goals = $2::jsonb, ${advance} where id = $1`, [id, json(goals)]);
  } else {
    return { ok: false, error: "Unknown step." };
  }
  return { ok: true };
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 32)
      .replace(/-$/, "") || "distributor"
  );
}

export type FinishResult =
  | { ok: true; slug: string; url: string; displayUrl: string; svg: string }
  | { ok: false; error: string };

/** Gives the workspace its public link and marks onboarding done. */
export async function finishOnboarding(): Promise<FinishResult> {
  const a = await requireWorkspace();
  const w = a.workspace;
  if (!w.owner_name || !w.whatsapp || !w.goals.length || !w.channels.length)
    return { ok: false, error: "A couple of answers are missing. Please go back and check." };
  const d = await db();
  let slug = w.slug;
  if (!slug) {
    const base = slugify(w.owner_name);
    for (let i = 0; i < 50 && !slug; i++) {
      const candidate = i === 0 ? base : `${base}-${i + 1}`;
      const taken = await d.query(`select 1 from workspaces where slug = $1`, [candidate]);
      if (!taken.length && !RESERVED_SLUGS.includes(candidate)) slug = candidate;
    }
    slug ??= `${base}-${Date.now().toString(36)}`;
  }
  await d.query(`update workspaces set slug = $2, onboarded_at = coalesce(onboarded_at, now()), onboarding_step = 5 where id = $1`, [
    w.id,
    slug,
  ]);
  const url = `${site.url}/d/${slug}`;
  return { ok: true, slug, url, displayUrl: `${site.displayDomain}/d/${slug}`, svg: await qrSvg(url) };
}
