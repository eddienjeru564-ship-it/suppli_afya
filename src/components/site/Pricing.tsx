import Link from "next/link";
import { EVERY_PLAN, PLANS_BY_ID, kes } from "@/config/plans";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { MPesa, keepTogether } from "@/components/ui/KeepTogether";

/**
 * The offer, and the end of the page: one card, one price, one button. The bigger plans are a
 * line underneath for the distributors who need them, and checkout lets anyone switch.
 */
export function Pricing() {
  const starter = PLANS_BY_ID.starter;
  const growth = PLANS_BY_ID.growth;
  const pro = PLANS_BY_ID.pro;

  return (
    <section id="pricing" className="relative overflow-hidden bg-forest-deep pb-24 pt-24 text-cream sm:pb-28 sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[56rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(90_122_83/0.4),transparent)]" />

      <div className="container-x relative">
        <Reveal className="text-center">
          <div className="eyebrow mx-auto !text-ochre">Pricing</div>
          <h2 className="display-lg mx-auto mt-5 max-w-[17ch]">Your page can be live this afternoon</h2>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-12 max-w-[56rem]">
          <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] bg-cream text-ink shadow-float md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="flex flex-col p-7 sm:p-10">
              <div className="text-[0.95rem] font-semibold text-clay">Your own page and workspace</div>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="whitespace-nowrap font-display text-[3rem] leading-none tracking-[-0.02em] sm:text-[3.6rem]">
                  {kes(starter.price)}
                </span>
                <span className="text-[1rem] text-ink-mute">a month</span>
              </div>
              <p className="mt-4 text-[1rem] leading-relaxed text-ink-soft">
                Pay by <MPesa /> or card. No contract and no setup fee. Nothing renews by itself, so you can stop whenever you
                like.
              </p>
              <div className="mt-8 md:mt-auto md:pt-10">
                <ButtonLink href={`/start?plan=${starter.id}`} size="lg" className="w-full !h-14 !text-[1.05rem]" arrow>
                  Claim your page now
                </ButtonLink>
                <p className="mt-3 text-center text-[0.85rem] text-ink-mute">Takes about two minutes. Your page is ready the same day.</p>
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

          <p className="mx-auto mt-8 max-w-[44rem] text-center text-[0.95rem] leading-relaxed text-cream/70">
            More than 50 customers?{" "}
            <Link href={`/start?plan=${growth.id}`} className="font-semibold text-cream underline-offset-4 hover:underline">
              {growth.name}
            </Link>{" "}
            is {kes(growth.price)} a month, with unlimited customers and your existing list brought in.{" "}
            <Link href={`/start?plan=${pro.id}`} className="font-semibold text-cream underline-offset-4 hover:underline">
              {pro.name}
            </Link>{" "}
            is {kes(pro.price)}, and we set everything up for you. You can switch at checkout or at any renewal.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
