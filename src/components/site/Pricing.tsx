import Link from "next/link";
import { EVERY_PLAN, PLANS_BY_ID, kes } from "@/config/plans";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { MPesa, keepTogether } from "@/components/ui/KeepTogether";

/**
 * The offer, and the end of the page. Starter is the way in, on one card with one button; Growth
 * and Pro sit underneath for distributors who need more, and checkout lets anyone switch.
 */
export function Pricing() {
  const starter = PLANS_BY_ID.starter;
  const more = [
    { plan: PLANS_BY_ID.growth, line: "Unlimited customers, and your existing customer list brought in from a spreadsheet." },
    { plan: PLANS_BY_ID.pro, line: "Everything in Growth, set up for you, with priority help from our team on WhatsApp." },
  ];

  return (
    <section id="pricing" className="relative overflow-hidden bg-forest-deep pb-24 pt-24 text-cream sm:pb-28 sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[56rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(90_122_83/0.4),transparent)]" />

      <div className="container-x relative">
        <Reveal className="text-center">
          <h2 className="display-lg mx-auto max-w-[17ch]">Simple Monthly Pricing</h2>
          <p className="mx-auto mt-6 max-w-[36rem] text-[1.1rem] leading-relaxed text-cream/75">
            One monthly price covers your own page, the customer assessment, your workspace and your daily follow-up list.
            There&apos;s no setup fee and no long-term contract.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-12 max-w-[56rem]">
          <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] bg-cream text-ink shadow-float md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="flex flex-col p-7 sm:p-10">
              <div className="flex items-center gap-2">
                <span className="font-display text-[1.5rem] leading-none text-ink">{starter.name}</span>
                <span className="rounded-full bg-sage-soft px-2.5 py-1 text-[0.75rem] font-semibold text-forest">Start here</span>
              </div>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="whitespace-nowrap font-display text-[3rem] leading-none tracking-[-0.02em] sm:text-[3.6rem]">
                  {kes(starter.price)}
                </span>
                <span className="text-[1rem] text-ink-mute">a month</span>
              </div>
              <p className="mt-4 text-[1rem] leading-relaxed text-ink-soft">
                Pay by <MPesa /> or card. No contract and no setup fee. You can stop whenever you like.
              </p>
              <div className="mt-8 md:mt-auto md:pt-10">
                <ButtonLink href={`/start?plan=${starter.id}`} size="lg" className="w-full !h-14 !text-[1.05rem]" arrow>
                  Claim your page now
                </ButtonLink>
                <p className="mt-3 text-center text-[0.85rem] text-ink-mute">Signing up takes about two minutes, and your page is ready the same day.</p>
              </div>
            </div>

            <div className="border-t border-ink/10 bg-paper p-7 sm:p-10 md:border-l md:border-t-0">
              <h3 className="text-[0.95rem] font-semibold text-ink">What you get</h3>
              <ul className="mt-4 grid gap-3 text-[0.98rem] leading-snug text-ink">
                {[...EVERY_PLAN, "Up to 50 customers"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                    {keepTogether(t)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {more.map(({ plan, line }) => (
              <div key={plan.id} className="flex flex-col rounded-[1.25rem] bg-cream/[0.06] p-5 ring-1 ring-cream/10">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-[1.25rem] text-cream">{plan.name}</span>
                  <span className="whitespace-nowrap text-[0.95rem] text-cream/80">{kes(plan.price)} a month</span>
                </div>
                <p className="mt-1.5 text-[0.92rem] leading-relaxed text-cream/70">{line}</p>
                <Link
                  href={`/start?plan=${plan.id}`}
                  className="group mt-3 inline-flex w-fit items-center gap-1.5 text-[0.92rem] font-semibold text-cream underline-offset-4 hover:underline"
                >
                  Choose {plan.name} <Arrow className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-[0.85rem] text-cream/60">You can switch plans at checkout or at any renewal.</p>
        </Reveal>
      </div>
    </section>
  );
}
