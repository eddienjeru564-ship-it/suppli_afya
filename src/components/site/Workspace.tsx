"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { KindTag } from "./Screens";
import { KATE, TODAY, WHEN } from "./story";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The second layer of the offer, kept light: after the sale, the workspace remembers. Kate's
 * Today list as it really looks, one person open with the message ready; tap another to open it.
 */
export function Workspace() {
  const [open, setOpen] = useState<string | null>("sarah");

  return (
    <section id="after" className="bg-paper py-24 sm:py-28">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <Reveal>
          <div className="eyebrow">After the sale</div>
          <h2 className="display-lg mt-5 max-w-[14ch] text-ink">Your workspace remembers every customer</h2>
          <p className="lede mt-6 max-w-[30rem]">
            Every enquiry from your page is saved with what they were looking for. Each morning you get a short list:
            who&apos;s new, who owes you, who to check in with and who&apos;s due to reorder. The WhatsApp message is
            already written, so you just send it.
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
                  <li key={p.id} className={clsx("min-w-0 rounded-2xl border transition-colors", isOpen ? "border-ink/15 bg-paper" : "border-transparent")}>
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
    </section>
  );
}
