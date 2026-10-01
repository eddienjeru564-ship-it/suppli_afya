"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { KindTag } from "./Screens";
import { KATE, TODAY, WHEN } from "./story";

const NAV = ["Today", "Prospects", "Orders", "Customers"];

const FACTS = [
  { title: "On your phone, like an app", body: "Install it from the browser. No app store, and it opens on the day's list." },
  { title: "A reminder each morning", body: "If you'd like one, a notification tells you how many people need you today." },
  { title: "Orders and M-Pesa codes", body: "Record an order and its payment in a couple of taps, so nobody has to remember who paid." },
];

/**
 * After the first sale: Kate's real Today list, one person of each kind, with the record and the
 * ready message for whoever is selected. Everything the workspace keeps, shown rather than listed.
 */
export function Workspace() {
  const [selected, setSelected] = useState("sarah");
  const person = TODAY.find((p) => p.id === selected) ?? TODAY[0];

  return (
    <section id="workspace" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <div className="eyebrow">After the first sale</div>
            <h2 className="display-lg mt-5 max-w-[15ch] text-ink">You still know where every customer stands</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede max-w-[34rem] lg:ml-auto">
              Every enquiry from your page becomes a customer record. Each morning your workspace puts together a short
              list: who&apos;s new, who owes you, who to check in with, who&apos;s due to reorder and who&apos;s gone quiet. Each
              one comes with a message ready to send.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.05} className="mt-14">
          <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-paper shadow-float">
            <div className="flex items-center gap-4 border-b border-ink/10 px-5 py-3 sm:px-6">
              <span className="text-[0.85rem] font-semibold text-ink">{KATE.first}&apos;s workspace</span>
              <nav aria-hidden className="hidden gap-1 text-[0.82rem] sm:flex">
                {NAV.map((n, i) => (
                  <span key={n} className={clsx("rounded-full px-3 py-1", i === 0 ? "bg-forest text-cream" : "text-ink-soft")}>
                    {n}
                  </span>
                ))}
              </nav>
              <span className="ml-auto hidden text-[0.8rem] text-ink-mute sm:block">{WHEN.reorderDay}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <div className="border-b border-ink/10 p-3 sm:p-4 lg:border-b-0 lg:border-r">
                <div className="px-2 pb-3 pt-1">
                  <div className="font-display text-[1.45rem] leading-tight text-ink">Good morning, {KATE.first}.</div>
                  <div className="text-[0.88rem] text-ink-soft">{TODAY.length} people need you today. Tap one to see it.</div>
                </div>
                <ul className="grid grid-cols-1 gap-1.5">
                  {TODAY.map((p) => {
                    const on = p.id === person.id;
                    return (
                      <li key={p.id} className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelected(p.id)}
                          aria-pressed={on}
                          className={clsx(
                            "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
                            on ? "border-forest/30 bg-cream" : "border-transparent hover:bg-cream/60",
                          )}
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand font-display text-[1rem] text-ink">
                            {p.name.charAt(0)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-[0.95rem] font-semibold text-ink">{p.name}</span>
                              <KindTag kind={p.kind} className="!text-[0.7rem] !px-2" />
                            </span>
                            <span className="mt-0.5 block truncate text-[0.84rem] text-ink-soft">{p.why}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="relative p-5 sm:p-7" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[1.6rem] leading-tight text-ink">{person.name}</span>
                      <KindTag kind={person.kind} className="!text-[0.72rem] !px-2" />
                    </div>
                    <p className="mt-1 text-[0.95rem] leading-snug text-ink-soft">{person.why}</p>

                    <div className="mt-5 text-[0.78rem] font-semibold text-ink-mute">Message, ready to send</div>
                    <p className="mt-1.5 rounded-2xl bg-wa-bubble px-4 py-3 text-[0.95rem] leading-relaxed text-[#111b21]">{person.message}</p>
                    <div aria-hidden className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex h-10 items-center gap-2 rounded-full bg-wa px-4 text-[0.88rem] font-semibold text-[#06331f]">
                        <WhatsAppIcon className="h-4 w-4" /> Send on WhatsApp
                      </span>
                      <span className="inline-flex h-10 items-center rounded-full border border-ink/15 px-4 text-[0.88rem] font-semibold text-ink">
                        Mark done
                      </span>
                    </div>

                    <div className="mt-7 text-[0.78rem] font-semibold text-ink-mute">History</div>
                    <ol className="mt-2">
                      {person.history.map((h, n) => (
                        <li key={n} className="grid grid-cols-[1rem_4.5rem_1fr] gap-x-2 pb-3">
                          <span className="relative flex justify-center">
                            <span className={clsx("mt-1.5 h-2 w-2 rounded-full", n === person.history.length - 1 ? "bg-clay" : "bg-forest")} />
                            {n < person.history.length - 1 && <span className="absolute top-4 h-full w-px bg-ink/15" />}
                          </span>
                          <span className="text-[0.82rem] text-ink-mute">{h.when}</span>
                          <span className="leading-snug">
                            <span className="block text-[0.92rem] font-medium text-ink">{h.what}</span>
                            {h.detail && <span className="block text-[0.84rem] text-ink-soft">{h.detail}</span>}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {FACTS.map((f, n) => (
            <Reveal key={f.title} delay={0.05 * n}>
              <h3 className="text-[1rem] font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
