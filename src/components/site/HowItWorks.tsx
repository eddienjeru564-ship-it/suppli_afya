import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Check } from "@/components/ui/icons";
import { FakeQr, Monogram, Pack, WaText } from "./Screens";
import { KATE, PLAN_REF, SARAH, SARAH_MESSAGE, SUGGESTED, kes } from "./story";

/** The opening of Sarah's message: who she is, her goals and her plan (the rest is in the real message). */
const OPENING = SARAH_MESSAGE.split("\n")
  .filter((l, i) => i === 0 || /^\*(About me|My goals|Suggested plan):\*/.test(l))
  .join("\n");

/**
 * The whole product in three steps, each with the real screen it happens on. The workspace, which
 * keeps the customer after the sale, follows straight after.
 */
export function HowItWorks() {
  const [coffee, joints] = SUGGESTED;
  const steps: { title: string; body: string; visual: ReactNode }[] = [
    {
      title: "Share your link",
      body: "Put it on your WhatsApp status, in your bio and on a QR card. It opens your own page, with your name at the top.",
      visual: (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-1.5 rounded-full bg-sand/70 px-3 py-1.5 text-[0.75rem] text-ink-soft">
            <svg viewBox="0 0 12 12" aria-hidden className="h-2.5 w-2.5 shrink-0">
              <rect x="2.5" y="5.5" width="7" height="5" rx="1.2" fill="currentColor" />
              <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
            <span className="truncate">{KATE.link}</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Monogram className="h-11 w-11 text-[1rem]" />
            <div className="min-w-0 leading-tight">
              <div className="truncate font-display text-[1.15rem] text-ink">{KATE.name}</div>
              <div className="truncate text-[0.78rem] text-ink-mute">{KATE.title}</div>
            </div>
          </div>
          <div className="mt-3 font-display text-[1.2rem] leading-snug text-ink">Let&apos;s find what actually suits you.</div>
          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {["WhatsApp status", "Bio", "QR card"].map((c) => (
                <span key={c} className="rounded-full border border-ink/15 px-2.5 py-1 text-[0.72rem] text-ink-soft">
                  {c}
                </span>
              ))}
            </div>
            <FakeQr className="h-14 w-14 shrink-0 rounded-md p-0.5 ring-1 ring-ink/10" />
          </div>
        </div>
      ),
    },
    {
      title: "They get their own plan",
      body: "A few short questions, then the products that fit what they're looking for, each with the reason why. Anything that doesn't suit them is left out.",
      visual: (
        <div className="flex h-full flex-col">
          <div className="text-[0.75rem] font-semibold text-clay">Your plan · {PLAN_REF}</div>
          <div className="mt-0.5 font-display text-[1.3rem] leading-tight text-ink">{SARAH.name}, here&apos;s your plan.</div>
          <div className="mt-3 grid gap-2">
            {SUGGESTED.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-cream/60 p-2">
                <Pack product={p} className="h-14 w-12" />
                <div className="min-w-0">
                  <div className="truncate font-display text-[1rem] leading-tight text-ink">{p.name}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-ink-soft">
                    <Check className="h-3 w-3 shrink-0 text-moss" />
                    <span className="truncate">Fits: {p.goal.toLowerCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "You close on WhatsApp",
      body: "They message you with their answers already written. You reply with prices and sell, the way you already do.",
      visual: (
        <div className="-m-4 flex h-[calc(100%+2rem)] flex-col justify-end gap-2 bg-wa-bg p-3">
          <div className="ml-auto max-w-[92%] rounded-xl rounded-tr-none bg-wa-bubble px-3 py-2 text-[0.78rem] leading-[1.45] text-[#111b21] shadow-sm">
            <WaText text={OPENING} />
          </div>
          <div className="max-w-[88%] rounded-xl rounded-tl-none bg-white px-3 py-2 text-[0.78rem] leading-[1.45] text-[#111b21] shadow-sm">
            Hi {SARAH.name}! The coffee is {kes(coffee.price)} and {joints.short} is {kes(joints.price)}. I can deliver both
            tomorrow. Shall I?
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how" className="py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="eyebrow">How it works</div>
          <h2 className="display-lg mt-5 max-w-[20ch] text-ink">Share a link. They get a plan. You close the sale.</h2>
        </Reveal>

        <ol className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6 lg:gap-8">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={0.06 * i}>
              <div aria-hidden className="h-[15rem] overflow-hidden rounded-[1.5rem] bg-paper p-4 shadow-card ring-1 ring-ink/10">
                {s.visual}
              </div>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-[1.6rem] leading-none text-clay">{i + 1}</span>
                <h3 className="font-display text-[1.55rem] leading-tight text-ink">{s.title}</h3>
              </div>
              <p className="mt-2 max-w-[24rem] text-[1rem] leading-relaxed text-ink-soft">{s.body}</p>
            </Reveal>
          ))}
        </ol>

      </div>
    </section>
  );
}
