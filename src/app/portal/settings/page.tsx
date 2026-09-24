import Link from "next/link";
import { PLANS_BY_ID, kes } from "@/config/plans";
import { site } from "@/config/site";
import { requirePortalAccount, subscriptionState } from "@/server/auth";
import { db } from "@/server/db";
import { businessTypeLabel } from "@/server/distributors";
import { QrCard } from "@/components/brand/QrCard";
import { ShareLink } from "@/components/portal/ShareLink";
import { Card, PageHeader, kesAmount, longDate } from "@/components/portal/ui";
import { buttonClass } from "@/components/ui/Button";
import { AppSettings } from "@/components/pwa/AppSettings";
import { LogoutButton } from "@/components/pwa/LogoutButton";
import { pushConfigured } from "@/server/env";
import { qrSvg } from "@/lib/qr";
import { ProfileForm } from "./ProfileForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const a = await requirePortalAccount();
  const w = a.workspace;
  const plan = PLANS_BY_ID[w.plan];
  const url = `${site.url}/d/${w.slug}`;
  const displayUrl = `${site.displayDomain}/d/${w.slug}`;
  const svg = await qrSvg(url);
  const phoneSvg = await qrSvg(`${site.url}/portal`);
  const d = await db();
  const payments = await d.query<{ id: string; amount: number; method: string; status: string; receipt: string | null; created_at: Date; plan: string }>(
    `select id, amount, method, status, receipt, created_at, plan from payments where workspace_id = $1 and status <> 'pending' order by created_at desc limit 12`,
    [w.id],
  );
  const state = subscriptionState(a);

  return (
    <div className="grid grid-cols-1 gap-10">
      <PageHeader title="Settings" sub={a.user.email} />

      <section>
        <h2 className="mb-3 font-display text-[1.5rem] text-ink">Your shop</h2>
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="max-w-md text-[0.93rem] leading-relaxed text-ink-soft">
            Your prices, delivery, payment details and the note customers see at the top of your shop.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/portal/shop" className={buttonClass("primary", "md")}>
              Edit your shop
            </Link>
            <Link href={`/d/${w.slug}`} target="_blank" className={buttonClass("secondary", "md")}>
              View it
            </Link>
          </div>
        </Card>
      </section>

      <section id="card" className="scroll-mt-20">
        <h2 className="mb-3 font-display text-[1.5rem] text-ink">Your link and QR card</h2>
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Card className="p-5">
            <ShareLink url={url} displayUrl={displayUrl} channels={w.channels} compact />
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/card" target="_blank" className={buttonClass("primary", "md")}>
                Print QR cards
              </Link>
              <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} download={`suppli-afya-${w.slug}-qr.svg`} className={buttonClass("secondary", "md")}>
                Download QR code
              </a>
            </div>
          </Card>
          <div className="py-6">
            <QrCard
              name={w.owner_name ?? ""}
              tagline={[w.business_name && w.business_name !== w.owner_name ? w.business_name : businessTypeLabel(w.business_type), w.location].filter(Boolean).join(" · ")}
              url={url}
              displayUrl={displayUrl}
              svg={svg}
            />
          </div>
        </div>
      </section>

      <section id="app" className="scroll-mt-20">
        <h2 className="mb-3 font-display text-[1.5rem] text-ink">Suppli Afya on your phone</h2>
        <AppSettings phoneQrSvg={phoneSvg} pushEnabled={pushConfigured()} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-[1.5rem] text-ink">Your business</h2>
        <Card className="p-5 sm:p-6">
          <ProfileForm
            initial={{
              owner_name: w.owner_name ?? "",
              business_name: w.business_name ?? "",
              location: w.location ?? "",
              business_type: w.business_type ?? "",
              whatsapp: w.whatsapp ?? "",
              channels: w.channels,
              goals: w.goals,
            }}
          />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-display text-[1.5rem] text-ink">Plan and billing</h2>
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-display text-[1.5rem] text-ink">
                {plan.name} · {kes(plan.price)} <span className="text-[1rem] text-ink-mute">a month</span>
              </div>
              <p className="mt-1 text-[0.93rem] text-ink-soft">
                {state === "grace"
                  ? `Ended on ${longDate(a.subscription?.current_period_end ?? null)}. Renew to keep your link working.`
                  : `Paid until ${longDate(a.subscription?.current_period_end ?? null)}. Nothing renews automatically.`}
              </p>
            </div>
            <Link href="/start/pay?renew=1" className={buttonClass("primary", "md")}>
              Renew or change plan
            </Link>
          </div>
          {payments.length > 0 && (
            <ul className="mt-5 divide-y divide-ink/10 border-t border-ink/10 text-[0.9rem]">
              {payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span className="text-ink">
                    {longDate(p.created_at)} · {PLANS_BY_ID[p.plan as keyof typeof PLANS_BY_ID]?.name ?? p.plan}
                  </span>
                  <span className={p.status === "succeeded" ? "text-ink-soft" : "text-clay"}>
                    {kesAmount(p.amount)} by {p.method === "mpesa" ? "M-Pesa" : "card"}
                    {p.status === "succeeded" ? (p.receipt ? ` · ${p.receipt}` : "") : " · didn't go through"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <LogoutButton />
    </div>
  );
}
