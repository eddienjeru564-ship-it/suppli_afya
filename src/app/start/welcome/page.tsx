import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PLANS_BY_ID, kes } from "@/config/plans";
import { getAccount, subscriptionState } from "@/server/auth";
import { db } from "@/server/db";
import { ButtonLink } from "@/components/ui/Button";
import { StartShell } from "@/components/start/Shell";

export const metadata: Metadata = { title: "Payment confirmed" };

export default async function WelcomePage() {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (subscriptionState(account) === "inactive") redirect("/start/pay");

  const d = await db();
  const [p] = await d.query<{ amount: number; receipt: string | null; method: string; plan: string }>(
    `select amount, receipt, method, plan from payments where workspace_id = $1 and status = 'succeeded' order by updated_at desc limit 1`,
    [account.workspace.id],
  );
  const plan = PLANS_BY_ID[account.subscription!.plan];
  const until = new Date(account.subscription!.current_period_end!).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const onboarded = Boolean(account.workspace.onboarded_at);

  return (
    <StartShell step={onboarded ? 2 : 1}>
      <div className="mx-auto max-w-lg py-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest text-2xl text-cream">✓</div>
        <h1 className="mt-6 font-display text-[2.4rem] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[3rem]">
          Payment confirmed.
        </h1>
        <p className="mt-3 text-[1.1rem] leading-relaxed text-ink-soft">
          {onboarded ? "Your plan is renewed." : "Let's get Suppli Afya set up for your business."}
        </p>
        <dl className="mx-auto mt-8 grid max-w-sm gap-2 rounded-2xl bg-paper p-5 text-left text-[0.93rem]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-mute">Plan</dt>
            <dd className="font-semibold text-ink">{plan.name}</dd>
          </div>
          {p && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-mute">Paid</dt>
              <dd className="font-semibold text-ink">
                {kes(p.amount)} by {p.method === "mpesa" ? "M-Pesa" : "card"}
              </dd>
            </div>
          )}
          {p?.receipt && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-mute">Receipt</dt>
              <dd className="font-mono text-[0.85rem] text-ink">{p.receipt}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-ink-mute">Active until</dt>
            <dd className="font-semibold text-ink">{until}</dd>
          </div>
        </dl>
        <div className="mt-8">
          <ButtonLink href={onboarded ? "/portal" : "/start/setup"} size="lg" arrow>
            {onboarded ? "Back to my portal" : "Set up my workspace"}
          </ButtonLink>
        </div>
        {!onboarded && <p className="mt-4 text-[0.85rem] text-ink-mute">It takes a couple of minutes.</p>}
      </div>
    </StartShell>
  );
}
