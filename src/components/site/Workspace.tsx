"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { SmsBubble } from "@/components/ui/SmsBubble";
import { reorderSms } from "@/server/sms/templates";
import { KindTag } from "./Screens";
import { KATE, SUGGESTED, TODAY, WHEN } from "./story";

const ease = [0.22, 1, 0.36, 1] as const;

/** The text Sarah gets from Kate on the morning of the story, two days before she runs out. */
const SARAH_TEXT = reorderSms({
  customer: { name: "Sarah" },
  seller: { name: KATE.name, whatsapp: "254722750455" },
  products: SUGGESTED.map((p) => p.name),
  dueAt: new Date("2026-10-28T09:00:00Z"),
  stopUrl: "suppliafya.co.ke/s/Ab3xK9q",
});

/** The journey so far, with the part this section is about at the end. */
const JOURNEY = ["Interest", "Recommendation", "WhatsApp", "Sale", "Follow-up", "Reorder"];

/**
 * The second story, after the enquiry: the distributor wakes up knowing who needs them today and
 * why. Kate's Today list as it really looks, one person open with the message ready; tap another
 * to open it. Simple on purpose: the point is who to talk to next, not a dashboard.
 */
export function Workspace() {
  const [open, setOpen] = useState<string | null>("sarah");

  return (
    <section id="after" className="bg-paper py-16 sm:py-24 lg:py-28">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <Reveal>
          <p className="font-display text-[1.45rem] italic leading-snug text-clay">And it doesn&apos;t stop at the enquiry.</p>
          <h2 className="display-lg mt-3 max-w-[12ch] text-ink">Your Daily Follow-Up List</h2>
          <p className="lede mt-6 max-w-[30rem]">
            Each morning, you see who needs you today and why. Some asked but haven&apos;t bought yet. Some are due a check-in,
            and some may be ready to reorder. Each one comes with a WhatsApp message ready to send.
          </p>
          <p className="mt-5 max-w-[30rem] text-[1.05rem] font-semibold leading-snug text-ink">
            You don&apos;t have to remember who to follow up with.
          </p>
          {/* Each arrow travels with the step after it, so a wrapped line never ends on an arrow. */}
          <p className="mt-8 flex flex-wrap gap-x-2 gap-y-1 text-[0.92rem] text-ink-mute">
            {JOURNEY.map((j, i) => (
              <span key={j} className="whitespace-nowrap">
                {i > 0 && <span aria-hidden className="mr-2">→</span>}
                <span className={i >= JOURNEY.length - 2 ? "font-semibold text-forest" : undefined}>{j}</span>
              </span>
            ))}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-cream shadow-float">
            <div className="border-b border-ink/10 px-5 py-4 sm:px-6">
              <div className="text-[0.8rem] text-ink-mute">{WHEN.today}</div>
              <div className="font-display text-[1.45rem] leading-tight text-ink">Good morning, {KATE.first}.</div>
              <div className="text-[0.9rem] text-ink-soft">{TODAY.length} people need you today.</div>
            </div>
            <ul className="grid grid-cols-1 gap-1.5 p-3">
              {TODAY.map((p) => {
                const isOpen = open === p.id;
                return (
                  <li key={p.id} className={clsx("pop-in min-w-0 origin-top rounded-2xl border transition-colors", isOpen ? "border-ink/15 bg-paper" : "border-transparent")}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : p.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand font-display text-[1rem] text-ink">
                        {p.name.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-[0.95rem] font-semibold text-ink">{p.name}</span>
                          <KindTag kind={p.kind} className="!px-2 !text-[0.7rem]" />
                        </span>
                        <span className={clsx("mt-0.5 block text-[0.86rem] text-ink-soft", !isOpen && "truncate")}>{p.why}</span>
                      </span>
                      <svg viewBox="0 0 16 16" aria-hidden className={clsx("h-4 w-4 shrink-0 text-ink-mute transition-transform", isOpen && "rotate-180")}>
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                      </svg>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 sm:pl-[3.75rem]">
                            <p className="rounded-xl bg-wa-bubble px-3.5 py-2.5 text-[0.92rem] leading-relaxed text-[#111b21]">{p.message}</p>
                            <span
                              aria-hidden
                              className="mt-2.5 inline-flex h-9 items-center gap-2 rounded-full bg-wa px-3.5 text-[0.84rem] font-semibold text-[#06331f]"
                            >
                              <WhatsAppIcon className="h-4 w-4" /> Send on WhatsApp
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* And the customers who need a nudge get one by text, without Kate lifting a finger. */}
      <div className="container-x mt-16 sm:mt-24">
        <Reveal className="grid grid-cols-1 items-center gap-10 rounded-[2rem] bg-cream p-6 ring-1 ring-ink/[0.06] sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-16 lg:p-14">
          <div className="min-w-0">
            <h3 className="font-display text-[1.9rem] leading-[1.1] tracking-[-0.015em] text-ink sm:text-[2.3rem]">
              And a text in your name, so nobody slips through.
            </h3>
            <p className="mt-4 max-w-[30rem] text-[1.02rem] leading-relaxed text-ink-soft">
              At 8 in the morning, customers who are about to run out get a short reminder text. So does anyone with an order
              still to pay. Each text is signed with your name, and your customers can stop them with one tap.
            </p>
            <ul className="mt-6 grid max-w-[30rem] gap-2.5 text-[0.95rem] text-ink">
              {["A reorder reminder three days before they run out", "One payment reminder, three days after an unpaid order", "Switch each one on or off in your settings"].map(
                (t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <svg viewBox="0 0 16 16" aria-hidden className="mt-1 h-4 w-4 shrink-0 text-moss">
                      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[25rem]">
            {/* What Sarah's lock screen shows: just the first line, so it has to be a good one. */}
            <div className="notify-in relative z-10 mx-3 flex items-start gap-3 rounded-[1.25rem] bg-forest-deep/95 px-4 py-3.5 text-cream shadow-float backdrop-blur">
              <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-[0.6rem] bg-[#34c759] text-white">
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                  <path d="M10 3C5.6 3 2 5.9 2 9.5c0 2 1.1 3.8 2.9 5L4.2 17l3-1.6c.9.3 1.8.4 2.8.4 4.4 0 8-2.9 8-6.4S14.4 3 10 3Z" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 text-[0.72rem] text-cream/60">
                  <span className="font-semibold tracking-[0.04em] text-cream/85">SUPPLIAFYA</span>
                  <span>08:00</span>
                </span>
                <span className="mt-0.5 block text-[0.9rem] leading-snug">{SARAH_TEXT.preview}</span>
              </span>
            </div>
            <SmsBubble body={SARAH_TEXT.body} time="Mon 08:00" className="-mt-5 pt-9 shadow-card" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
