import clsx from "clsx";
import type { ReactNode } from "react";
import { PLANS, PLANS_BY_ID, kes, type Plan, type PlanFeature, type PlanId } from "@/config/plans";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { MPesa, keepTogether } from "@/components/ui/KeepTogether";

/**
 * The label on the featured plan. "Most popular" is a claim about real sign-ups, so it waits until
 * the numbers say so (no made-up statistics); until then the label says who Growth is for.
 */
const FEATURED_LABEL = "Best for repeat customers";

/** What each plan is for, drawn small: enquiries, customers, payments. */
const MARK: Record<PlanId, ReactNode> = {
  starter: (
    <svg viewBox="0 0 20 20" aria-hidden className="h-[1.3rem] w-[1.3rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M4 4.5h12A1.5 1.5 0 0 1 17.5 6v7a1.5 1.5 0 0 1-1.5 1.5H9.5L6 17.5v-3H4A1.5 1.5 0 0 1 2.5 13V6A1.5 1.5 0 0 1 4 4.5Z" />
      <path d="M7 9.5h.01M10 9.5h.01M13 9.5h.01" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  growth: (
    <svg viewBox="0 0 20 20" aria-hidden className="h-[1.3rem] w-[1.3rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="7.5" cy="7" r="2.75" />
      <path d="M2.5 16.5c.6-2.7 2.6-4.25 5-4.25s4.4 1.55 5 4.25" />
      <path d="M13 4.6a2.75 2.75 0 0 1 0 4.8M14.6 12.6c1.4.6 2.4 1.9 2.9 3.9" />
    </svg>
  ),
  pro: (
    <svg viewBox="0 0 20 20" aria-hidden className="h-[1.3rem] w-[1.3rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="2.5" width="9" height="15" rx="2" />
      <path d="M8 10.25 9.5 11.75 12.25 8.75" />
    </svg>
  ),
};

/**
 * The offer, and the end of the page. Three plans, each adding one step of the work: Starter gets
 * enquiries, Growth keeps the customers, Pro takes the payment. Each card leads with its price and
 * what it's for; Growth and Pro list only what they add.
 */
export function Pricing() {
  return (
    <section id="pricing" className="bg-sand/40 py-24 sm:py-28">
      <div className="container-x">
        <Reveal className="text-center">
          <h2 className="display-lg mx-auto max-w-[16ch] text-ink">Choose What Works for Your Business</h2>
        </Reveal>

        <ol className="mx-auto mt-12 grid max-w-[30rem] grid-cols-1 gap-5 sm:mt-14 lg:max-w-[68rem] lg:grid-cols-3 lg:gap-6">
          {PLANS.map((plan, i) => (
            <Reveal as="li" key={plan.id} delay={0.06 * i} className="min-w-0">
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1} className="mx-auto mt-10 max-w-[40rem] text-center">
          <p className="text-[0.98rem] font-semibold text-ink">
            No setup fee. Pay monthly by <MPesa /> or card. Upgrade or stop anytime.
          </p>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-mute">
            Not sure which plan is right for you? Start with Starter and upgrade when you need more.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const featured = Boolean(plan.featured);
  const mpesa = plan.features.filter((f) => f.group === "mpesa");
  const rest = plan.features.filter((f) => !f.group);

  return (
    <div
      className={clsx(
        "relative flex h-full flex-col rounded-[1.75rem] p-5 sm:p-7",
        featured ? "bg-paper shadow-float ring-2 ring-forest" : "bg-paper/75 ring-1 ring-ink/10",
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-5 rounded-full bg-forest px-3 py-1 text-[0.75rem] font-semibold text-cream sm:left-7">
          {FEATURED_LABEL}
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", featured ? "bg-forest text-cream" : "bg-sage-soft text-forest")}>
          {MARK[plan.id]}
        </span>
        <h3 className="font-display text-[1.6rem] leading-none text-ink">{plan.name}</h3>
      </div>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-1.5 sm:mt-6">
        <span className="whitespace-nowrap font-display text-[2.3rem] leading-none tracking-[-0.02em] text-ink sm:text-[2.6rem]">{kes(plan.price)}</span>
        <span className="text-[0.98rem] text-ink-mute">a month</span>
      </div>
      {/* Two lines tall when the cards sit side by side, so the three buttons line up. */}
      <p className="mt-2.5 text-[1.05rem] leading-snug text-ink sm:mt-3 lg:min-h-[2.75em]">{keepTogether(plan.tagline)}</p>

      <ButtonLink href={`/start?plan=${plan.id}`} variant={featured ? "primary" : "secondary"} size="lg" className="mt-5 w-full sm:mt-6" arrow>
        Get started<span className="sr-only"> with {plan.name}</span>
      </ButtonLink>

      <div className="mt-5 border-t border-ink/10 pt-4 sm:mt-6 sm:pt-5">
        {plan.includes && (
          <p className="mb-3 text-[0.92rem] font-semibold text-ink">Everything in {PLANS_BY_ID[plan.includes].name}, plus:</p>
        )}
        {mpesa.length > 0 && (
          <div className="mb-3 rounded-2xl bg-sage-soft/70 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[0.82rem] font-semibold text-forest">Payments</span>
              {mpesa.every((f) => f.soon) && <Soon />}
            </div>
            <Features items={mpesa} className="mt-2.5" hideSoon />
          </div>
        )}
        <Features items={rest} />
      </div>
    </div>
  );
}

function Features({ items, className, hideSoon }: { items: PlanFeature[]; className?: string; hideSoon?: boolean }) {
  return (
    <ul className={clsx("grid gap-2 text-[0.96rem] leading-snug text-ink sm:gap-2.5", className)}>
      {items.map((f) => (
        <li key={f.text} className="flex items-start gap-2.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
          <span>
            {keepTogether(f.text)}
            {f.soon && !hideSoon && (
              <>
                {" "}
                <Soon />
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Soon() {
  return <span className="inline-block rounded-full bg-paper px-2 py-0.5 text-[0.72rem] font-semibold text-ink-soft ring-1 ring-ink/10">Coming soon</span>;
}
