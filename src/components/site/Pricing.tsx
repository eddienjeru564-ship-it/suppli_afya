import clsx from "clsx";
import { PLANS, kes } from "@/config/plans";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";

const EVERY_PLAN = [
  "Your health check link and QR card",
  "Leads that arrive with answers and a plan",
  "WhatsApp messages ready to send",
  "M-Pesa and cash payments recorded against orders",
  "Your customer list stays yours",
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-paper py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <div className="eyebrow">Plans and pricing</div>
            <h2 className="display-lg mt-5 max-w-[15ch] text-ink">One extra reorder a month covers it</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede max-w-[34rem] lg:ml-auto">
              Pay monthly by M-Pesa or card. There&apos;s no contract and no setup fee, and nothing is taken
              automatically: each month you choose to renew, so you can stop whenever you like.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            // On phones the recommended plan is the first one you read.
            <Reveal key={p.id} delay={0.06 * i} className={p.featured ? "order-first lg:order-none" : undefined}>
              <article
                className={clsx(
                  "relative flex h-full flex-col rounded-[1.75rem] p-7 sm:p-8",
                  p.featured ? "bg-forest text-cream shadow-float" : "border border-ink/10 bg-cream text-ink",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-[1.7rem] leading-none">{p.name}</h3>
                  {p.featured && (
                    <span className="rounded-full bg-cream/15 px-2.5 py-1 text-[0.72rem] font-semibold text-cream">Recommended</span>
                  )}
                </div>
                <p className={clsx("mt-3 text-[0.95rem] leading-relaxed", p.featured ? "text-cream/75" : "text-ink-soft")}>
                  {p.tagline}
                </p>
                <div className="mt-7 flex items-baseline gap-2">
                  <span className="font-display text-[2.6rem] leading-none tracking-[-0.02em]">{kes(p.price)}</span>
                  <span className={clsx("text-[0.95rem]", p.featured ? "text-cream/70" : "text-ink-mute")}>a month</span>
                </div>
                <ul className="mt-7 grid gap-3 text-[0.95rem] leading-snug">
                  {p.features.map((f) => (
                    <li key={f.text} className="flex gap-2.5">
                      <Check className={clsx("mt-0.5 h-4 w-4 shrink-0", p.featured ? "text-sage" : "text-moss")} />
                      <span className={clsx(f.soon && (p.featured ? "text-cream/70" : "text-ink-soft"))}>
                        {f.text}
                        {f.soon && (
                          <span
                            className={clsx(
                              "ml-1.5 rounded-full px-1.5 py-0.5 text-[0.68rem] font-semibold",
                              p.featured ? "bg-cream/15" : "bg-sand text-ink-soft",
                            )}
                          >
                            Coming soon
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <ButtonLink
                    href={`/start?plan=${p.id}`}
                    size="lg"
                    variant={p.featured ? "light" : "primary"}
                    className="w-full"
                    arrow
                  >
                    Choose {p.name}
                  </ButtonLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10">
          <div className="rounded-[1.5rem] border border-ink/10 p-6 sm:p-7">
            <div className="text-[0.9rem] font-semibold text-ink">Every plan includes</div>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[0.93rem] text-ink-soft">
              {EVERY_PLAN.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-moss" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <p className="mt-5 text-[0.85rem] text-ink-mute">
          Prices are in Kenyan shillings. You can move between plans at any renewal.
        </p>
      </div>
    </section>
  );
}
