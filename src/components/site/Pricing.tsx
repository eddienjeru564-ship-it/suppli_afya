import clsx from "clsx";
import type { ReactNode } from "react";
import { MONTHLY_PRICE, PLAN, SETUP_PRICE, kes, type FeatureGroup } from "@/config/plans";
import { LogoMark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { MPesa, keepTogether } from "@/components/ui/KeepTogether";

/** One small drawing per part of the work: the shop, the follow-up, the payment, the setup. */
const ICON: Record<FeatureGroup["id"], ReactNode> = {
  sell: (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5" />
      <path d="M2.5 4.5 4 2.75h12l1.5 1.75v1.75a2.25 2.25 0 0 1-4.5 0 2.25 2.25 0 0 1-4.5 0 2.25 2.25 0 0 1-4.5 0Z" />
      <path d="M8 17v-4.25h4V17" />
    </svg>
  ),
  follow: (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3.5" width="14" height="13.5" rx="2" />
      <path d="M3 7.5h14M7 2v3M13 2v3" />
      <path d="m7.5 12 1.75 1.75L12.75 10" />
    </svg>
  ),
  paid: (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5.5" y="2.5" width="9" height="15" rx="2" />
      <path d="M8 10.25 9.5 11.75 12.25 8.75" />
    </svg>
  ),
  setup: (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 2.5 12.2 7l4.8.6-3.5 3.3.9 4.8L10 13.4l-4.4 2.3.9-4.8L3 7.6 7.8 7Z" />
    </svg>
  ),
};

/** What happens after someone pays: the setup fee buys real work, so show the work. */
const STEPS = [
  {
    title: "Join in two minutes",
    body: "Create your account and pay by M-Pesa or card. Tell us your name, area and what your customers ask about.",
  },
  {
    title: "We build everything",
    body: "Your shop with your products and prices, your QR cards and your customer app, with your existing customers moved in.",
  },
  {
    title: "Share and start selling",
    body: "Put your link on your WhatsApp status and hand out your cards. Enquiries and orders come straight to you.",
  },
];

/** The two columns of included features, balanced by length. */
const COLUMNS: FeatureGroup["id"][][] = [
  ["sell", "paid"],
  ["follow", "setup"],
];

const PER_DAY = Math.ceil(PLAN.monthly / 30 / 5) * 5;

/**
 * The offer, and the end of the page. One subscription with everything in it, so the section can
 * spend its space on what's included rather than on comparing plans: the price card, the four parts
 * of the work it covers, and what the setup fee pays for.
 */
export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-sand/40 py-16 sm:py-24 lg:py-28">
      {/* A soft light behind the offer, like morning on the tea estate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[60rem] max-w-[160vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(185_200_174/0.45),transparent)]"
      />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-[44rem] text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-paper/80 px-3.5 py-1.5 text-[0.8rem] font-semibold text-forest ring-1 ring-forest/10">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-moss" />
            One subscription, everything included
          </p>
          <h2 className="display-lg mx-auto mt-5 max-w-[18ch] text-ink">Everything You Need to Sell, Set Up for You</h2>
          <p className="lede mx-auto mt-5 max-w-[36rem]">
            Your shop, your customer app, your cards and our team&apos;s time, in one price. There are no plans to compare and nothing held
            back.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-[30rem] grid-cols-1 gap-5 sm:mt-14 md:max-w-[46rem] lg:max-w-[58rem] xl:max-w-[72rem] xl:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] xl:items-start xl:gap-7">
          <Reveal className="min-w-0 xl:sticky xl:top-24">
            <PriceCard />
          </Reveal>
          {/* Two packed columns, so a short card never leaves a hole. On phones they stack: Sell, Get paid, Follow up, Done for you. */}
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 md:items-start lg:gap-5">
            {COLUMNS.map((col, c) => (
              <ul key={c} className="grid min-w-0 gap-4 lg:gap-5">
                {col.map((id, i) => (
                  <Reveal as="li" key={id} delay={0.05 + 0.05 * (c + i * 2)} className="min-w-0">
                    <Group group={PLAN.groups.find((x) => x.id === id)!} />
                  </Reveal>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <Setup />
      </div>
    </section>
  );
}

function PriceCard() {
  return (
    <div className="price-card relative isolate overflow-hidden rounded-[2rem] bg-forest p-6 text-cream shadow-float ring-1 ring-forest-deep sm:p-8">
      <div aria-hidden className="price-sheen pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgb(185_200_174/0.22),transparent)]"
      />

      <div className="md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-10 xl:block">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark tone="cream" className="h-8 w-auto" />
            <span className="text-[0.95rem] font-semibold tracking-[0.01em] text-cream/85">{PLAN.name}</span>
          </div>

          <div className="mt-7">
            <div className="text-[0.8rem] font-semibold text-sage">To start</div>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
              <span className="whitespace-nowrap font-display text-[3.1rem] leading-none tracking-[-0.025em] sm:text-[3.5rem]">
                {kes(PLAN.setupFee)}
              </span>
              <span className="text-[1rem] text-cream/70">once</span>
            </div>
            <p className="mt-2 text-[0.95rem] leading-snug text-cream/80">Full setup by our team, plus your first month.</p>
          </div>

          <div aria-hidden className="my-6 flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-cream/45">
            <span className="h-px flex-1 bg-cream/15" />
            then
            <span className="h-px flex-1 bg-cream/15" />
          </div>

          <div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="whitespace-nowrap font-display text-[2.2rem] leading-none tracking-[-0.02em]">{kes(PLAN.monthly)}</span>
              <span className="text-[1rem] text-cream/70">a month</span>
            </div>
            <p className="mt-2 text-[0.95rem] leading-snug text-cream/80">Under {kes(PER_DAY)} a day, from your second month.</p>
          </div>
        </div>

        <div className="md:flex md:flex-col md:justify-end xl:block">
          <ButtonLink href="/start" variant="light" size="lg" className="mt-7 w-full" arrow>
            Get started
          </ButtonLink>

          <ul className="mt-6 grid gap-2.5 border-t border-cream/10 pt-5 text-[0.9rem] leading-snug text-cream/80">
            <li className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <span>
                Pay by <MPesa /> or card
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <span>Nothing renews automatically</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <span>No contract. Stop anytime.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Group({ group }: { group: FeatureGroup }) {
  return (
    <div className="group/card rounded-[1.6rem] bg-paper p-5 ring-1 ring-ink/[0.07] transition-[box-shadow,transform] duration-500 ease-[var(--ease-soft)] hover:-translate-y-0.5 hover:shadow-card sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage-soft text-forest transition-colors duration-500 group-hover/card:bg-forest group-hover/card:text-cream">
          {ICON[group.id]}
        </span>
        <h3 className="font-display text-[1.45rem] leading-none text-ink">{group.title}</h3>
      </div>
      <ul className="mt-5 grid gap-4">
        {group.features.map((f) => (
          <li key={f.title} className="flex items-start gap-3">
            <Check className={clsx("mt-[0.2rem] h-4 w-4 shrink-0", f.soon ? "text-ink-mute/60" : "text-moss")} />
            <div className="min-w-0">
              <div className="text-[0.98rem] font-semibold leading-snug text-ink">
                {keepTogether(f.title)}
                {f.soon && (
                  <>
                    {" "}
                    <span className="ml-0.5 inline-block translate-y-[-1px] whitespace-nowrap rounded-full bg-sand/70 px-2 py-0.5 align-middle text-[0.68rem] font-semibold text-ink-soft">
                      Coming soon
                    </span>
                  </>
                )}
              </div>
              <p className="mt-0.5 text-[0.9rem] leading-relaxed text-ink-soft">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Setup() {
  return (
    <div className="mx-auto mt-16 max-w-[72rem] sm:mt-20">
      <Reveal className="text-center">
        <h3 className="font-display text-[1.9rem] leading-tight tracking-[-0.015em] text-ink sm:text-[2.2rem]">
          What the setup fee pays for
        </h3>
        <p className="mx-auto mt-3 max-w-[34rem] text-[1rem] leading-relaxed text-ink-soft">
          You don&apos;t fill in a template. Our team does the work, so your shop is ready to share from day one.
        </p>
      </Reveal>
      <ol className="relative mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {STEPS.map((s, i) => (
          <Reveal
            as="li"
            key={s.title}
            delay={0.06 * i}
            className="relative min-w-0 rounded-[1.6rem] bg-paper/70 p-5 ring-1 ring-ink/[0.07] sm:p-6"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-forest font-display text-[1.05rem] text-cream">{i + 1}</span>
            <h4 className="mt-4 text-[1.05rem] font-semibold text-ink">{s.title}</h4>
            <p className="mt-1.5 text-[0.93rem] leading-relaxed text-ink-soft">{s.body}</p>
          </Reveal>
        ))}
      </ol>
      <Reveal className="mt-10 flex flex-col items-center gap-3 text-center">
        <ButtonLink href="/start" size="lg" arrow>
          Get your shop set up
        </ButtonLink>
        <p className="text-[0.85rem] text-ink-mute">
          {SETUP_PRICE} once, then {MONTHLY_PRICE} a month. Questions first?{" "}
          <a href="#faq" className="font-semibold text-forest underline underline-offset-2">
            Read the answers
          </a>
          .
        </p>
      </Reveal>
    </div>
  );
}
