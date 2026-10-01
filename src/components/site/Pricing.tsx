import clsx from "clsx";
import { EVERY_PLAN, PLANS, kes } from "@/config/plans";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { MPesa, keepTogether } from "@/components/ui/KeepTogether";

/** Getting a page, in the order it actually happens (checkout, then the four onboarding screens). */
const START = [
  {
    title: "Choose a plan and pay",
    body: "By M-Pesa or card. It takes about two minutes, and your account is kept even if a payment doesn't go through first time.",
  },
  {
    title: "Tell us about your business",
    body: "Your name, your WhatsApp number, how customers find you and what matters most to you. Your page and workspace are set up from the answers.",
  },
  {
    title: "Share your page",
    body: "Post the link, print your QR cards, and your first enquiry can arrive the same day.",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-paper py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <div className="eyebrow">Pricing</div>
            <h2 className="display-lg mt-5 max-w-[15ch] text-ink">One extra customer a month covers it</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede max-w-[34rem] lg:ml-auto">
              Pay monthly by <MPesa /> or card, with no contract and no setup fee. Nothing is taken automatically, so you
              can stop whenever you like.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.05} className="mt-14">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 border-y border-ink/10 py-8 lg:grid-cols-[14rem_1fr]">
            <h3 className="font-display text-[1.5rem] leading-tight text-ink">Every plan includes</h3>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 text-[0.98rem] text-ink sm:grid-cols-2">
              {EVERY_PLAN.map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-moss" />
                  {keepTogether(t)}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
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
                    <span className="rounded-full bg-cream/15 px-2.5 py-1 text-[0.75rem] font-semibold text-cream">Recommended</span>
                  )}
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-[2.6rem] leading-none tracking-[-0.02em]">{kes(p.price)}</span>
                  <span className={clsx("text-[0.95rem]", p.featured ? "text-cream/70" : "text-ink-mute")}>a month</span>
                </div>
                <p className={clsx("mt-4 text-[0.98rem] leading-relaxed", p.featured ? "text-cream/80" : "text-ink-soft")}>{p.tagline}</p>
                <ul className={clsx("mt-6 grid gap-3 border-t pt-6 text-[0.98rem] leading-snug", p.featured ? "border-cream/15" : "border-ink/10")}>
                  {p.adds.map((f) => (
                    <li key={f.text} className="flex gap-2.5">
                      <Check className={clsx("mt-0.5 h-4 w-4 shrink-0", p.featured ? "text-sage" : "text-moss")} />
                      <span className={clsx(f.soon && (p.featured ? "text-cream/70" : "text-ink-soft"))}>
                        {keepTogether(f.text)}
                        {f.soon && (
                          <span
                            className={clsx(
                              "ml-1.5 rounded-full px-1.5 py-0.5 text-[0.7rem] font-semibold",
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
        <p className="mt-5 text-[0.88rem] text-ink-mute">Prices are in Kenyan shillings. You can move between plans at any renewal.</p>

        <div id="setup" className="mt-20 grid grid-cols-1 gap-10 border-t border-ink/10 pt-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <h3 className="display-md max-w-[14ch] text-ink">Your page can be live this afternoon</h3>
          </Reveal>
          <ol className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {START.map((s, i) => (
              <Reveal as="li" key={s.title} delay={0.06 * i}>
                <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 font-display text-lg text-ink">
                  {i + 1}
                </span>
                <h4 className="mt-4 font-display text-[1.3rem] leading-tight text-ink">{s.title}</h4>
                <p className="mt-1.5 text-[0.98rem] leading-relaxed text-ink-soft">{keepTogether(s.body)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
