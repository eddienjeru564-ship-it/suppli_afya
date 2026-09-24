import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount, nextStepFor, subscriptionState } from "@/server/auth";
import { db } from "@/server/db";
import { daysUntil } from "@/server/portal";
import { PortalShell } from "@/components/portal/PortalShell";
import { longDate } from "@/components/portal/ui";

export const metadata: Metadata = { title: { default: "Portal", template: "%s · Suppli Afya" }, robots: { index: false } };

export default async function PortalLayout({ children }: LayoutProps<"/portal">) {
  const account = await getAccount();
  const step = nextStepFor(account);
  if (step !== "/portal") redirect(step === "/login" ? "/login?next=/portal" : step);
  const a = account!;

  const d = await db();
  const [{ n }] = await d.query<{ n: number }>(`select count(*)::int as n from prospects where workspace_id = $1 and status = 'new'`, [
    a.workspace.id,
  ]);

  // Nothing renews automatically, so remind them a few days ahead.
  const end = a.subscription?.current_period_end ? new Date(a.subscription.current_period_end) : null;
  const daysLeft = daysUntil(end);
  const state = subscriptionState(a);
  const banner =
    state === "grace" || daysLeft <= 5 ? (
      <div className="border-b border-ochre/30 bg-[#f6ead2] px-4 py-2.5 text-center text-[0.88rem] text-[#6b4a10]">
        {state === "grace" ? `Your plan ended on ${longDate(end)}.` : `Your plan renews by ${longDate(end)}.`}{" "}
        <Link href="/start/pay?renew=1" className="font-semibold underline underline-offset-2">
          Renew now
        </Link>
      </div>
    ) : null;

  return (
    <PortalShell businessName={a.workspace.business_name ?? ""} ownerName={a.workspace.owner_name ?? ""} newProspects={n} banner={banner}>
      {children}
    </PortalShell>
  );
}
