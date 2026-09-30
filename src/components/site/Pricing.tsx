import clsx from "clsx";
import { PLANS, kes } from "@/config/plans";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { MPesa, keepTogether } from "@/components/ui/KeepTogether";

const EVERY_PLAN = [
  "Your own page at your own link",
  "Printable QR cards",
  "The assessment and product suggestions",
  "Enquiries that arrive with what they're looking for",
  "WhatsApp messages ready to send",
  "M-Pesa and cash payments recorded against orders",
  "Your customer list stays yours",
];

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
            <div className="eyebrow">Plans and pricing</div>
            <h2 className="display-lg mt-5 max-w-[15ch] text-ink">One extra customer a month covers it</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede max-w-[34rem] lg:ml-auto">
              Every plan gets you your own page, the assessment your customers take and a workspace that remembers them.
              Pay monthly by <MPesa /> or card, with no contract and no setup fee. Nothing is taken automatically, so you
              can stop whenever you like.
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
                        {keepTogether(f.text)}
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
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-[0.2rem] h-3.5 w-3.5 shrink-0 text-moss" />
                  {keepTogether(t)}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <p className="mt-5 text-[0.85rem] text-ink-mute">
          Prices are in Kenyan shillings. You can move between plans at any renewal.
        </p>

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
