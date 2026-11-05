"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { keepTogether } from "@/components/ui/KeepTogether";
import { FAQ } from "./faq-data";


export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-paper py-16 sm:py-24 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <h2 className="display-lg max-w-[12ch] text-ink lg:sticky lg:top-28">Common Questions</h2>
        </Reveal>
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-[1.3rem] leading-snug text-ink sm:text-[1.45rem]">{keepTogether(f.q)}</span>
                  <span
                    className={clsx(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-[transform,background-color,color] duration-300",
                      isOpen ? "rotate-45 border-forest bg-forest text-cream" : "border-ink/15 text-ink",
                    )}
                  >
                    <Plus />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[40rem] pb-7 text-[1.02rem] leading-relaxed text-ink-soft">{keepTogether(f.a)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
