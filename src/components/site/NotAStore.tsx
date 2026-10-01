import { Fragment } from "react";
import type { ProductFormat, ProductLine } from "@/engine";
import { PackArt } from "@/components/check/ProductGlyph";
import { Reveal } from "@/components/ui/Reveal";
import { Check, WhatsAppIcon } from "@/components/ui/icons";
import { Pack } from "./Screens";
import { KATE, SUGGESTED } from "./story";

/** A shelf of look-alike packs: what a shop shows someone who doesn't know what they need. */
const SHELF: [ProductFormat, ProductLine][] = [
  ["capsules", "Immune Booster"],
  ["coffee", "Immune Booster"],
  ["tablets", "Sport Fit"],
  ["capsules", "Women's Beauty"],
  ["drink", "Suma Fit"],
  ["capsules", "Men's Power"],
  ["tea", "Suma Living"],
  ["coffee", "Heart & Blood Fit"],
  ["capsules", "Sport Fit"],
  ["tablets", "Immune Booster"],
  ["drink", "Immune Booster"],
  ["capsules", "Suma Fit"],
];

function Flow({ steps, tone }: { steps: string[]; tone: "muted" | "forest" }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 sm:gap-x-2">
      {steps.map((s, i) => (
        <Fragment key={s}>
          <li
            className={
              tone === "muted"
                ? "rounded-full border border-ink/15 px-2.5 py-1 text-[0.85rem] text-ink-soft sm:px-3"
                : "rounded-full bg-cream/12 px-2.5 py-1 text-[0.85rem] font-medium text-cream sm:px-3"
            }
          >
            {s}
          </li>
          {i < steps.length - 1 && (
            <li aria-hidden className={tone === "muted" ? "text-ink-mute" : "text-sage"}>
              →
            </li>
          )}
        </Fragment>
      ))}
    </ol>
  );
}

export function NotAStore() {
  return (
    <section id="different" className="bg-paper py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <div className="eyebrow">Not another online shop</div>
          <h2 className="display-lg mt-5 max-w-[18ch] text-ink">A shop asks people to choose. Your page helps them decide.</h2>
          <p className="lede mt-6 max-w-[40rem]">
            Most people who ask about supplements don&apos;t know which one they need. A shop expects them to. Your page
            helps them work it out, then hands them to you.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Reveal className="flex flex-col rounded-[1.75rem] border border-ink/10 bg-cream/60 p-6 sm:p-8">
            <h3 className="text-[0.95rem] font-semibold text-ink-soft">A typical online shop</h3>
            <div className="mt-4">
              <Flow steps={["Browse", "Choose", "Checkout"]} tone="muted" />
            </div>
            <div aria-hidden className="mt-8 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {SHELF.map(([format, line], i) => (
                <div key={i} className="rounded-xl bg-ink/[0.04] p-1.5 opacity-75 grayscale-[70%]">
                  <div className="aspect-[5/6]">
                    <PackArt format={format} line={line} />
                  </div>
                  <div className="mx-auto mt-1 h-1.5 w-3/4 rounded-full bg-ink/10" />
                </div>
              ))}
            </div>
            <p className="mt-auto pt-8 text-[1rem] leading-relaxed text-ink-soft">
              Works when people already know what they want. Everyone else compares labels on their own, closes the tab,
              and nobody ever knows they were there.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col rounded-[1.75rem] bg-forest p-6 text-cream shadow-float sm:p-8">
            <h3 className="text-[0.95rem] font-semibold text-sage">{KATE.first}&apos;s page</h3>
            <div className="mt-4">
              <Flow steps={["Tell us what you're looking for", "Get guidance", `Talk to ${KATE.first}`]} tone="forest" />
            </div>
            <div aria-hidden className="mt-8 grid gap-3">
              <div className="flex flex-wrap gap-2">
                {["Energy", "Joints & bones"].map((g, i) => (
                  <span key={g} className="inline-flex items-center gap-2 rounded-xl bg-cream px-3 py-2 text-[0.88rem] font-medium text-ink">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-forest text-[0.7rem] font-bold text-cream">{i + 1}</span>
                    {g}
                  </span>
                ))}
                <span className="inline-flex items-center rounded-xl border border-cream/20 px-3 py-2 text-[0.88rem] text-cream/60">Sleep</span>
              </div>
              {SUGGESTED.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-cream/[0.08] p-2.5 ring-1 ring-cream/10">
                  <Pack product={p} className="h-14 w-12 bg-cream/90" />
                  <div className="min-w-0">
                    <div className="font-display text-[1.05rem] leading-tight">{p.name}</div>
                    <div className="mt-0.5 flex gap-1.5 text-[0.82rem] leading-snug text-cream/70">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-sage" />
                      <span className="line-clamp-2">{p.why}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex h-11 items-center justify-center gap-2 rounded-full bg-wa text-[0.9rem] font-semibold text-[#06331f]">
                <WhatsAppIcon className="h-4 w-4" /> Send my plan to {KATE.first}
              </div>
            </div>
            <p className="mt-auto pt-8 text-[1rem] leading-relaxed text-cream/80">
              Works for people who don&apos;t know where to start. They get guidance first and reach you with their answers,
              and you know who they are even if they don&apos;t buy today.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
