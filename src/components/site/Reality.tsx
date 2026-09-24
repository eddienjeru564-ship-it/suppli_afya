"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/components/ui/useReducedMotion";

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { label: "Enquiry", leak: "Asked the price, then went quiet" },
  { label: "Follow-up", leak: "You meant to reply, then the week got busy" },
  { label: "First order", leak: null },
  { label: "Payment", leak: "“I'll send it on Friday”" },
  { label: "Reorder", leak: "The bottle ran out and nobody called" },
];

export function Reality() {
  const reduce = useReducedMotion();
  return (
    <section id="reality" className="relative bg-paper py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <div className="eyebrow">How it usually goes</div>
            <h2 className="display-lg mt-5 max-w-[12ch] text-ink">Where the sales actually go</h2>
          </Reveal>
          <div className="prose-big grid gap-7 text-ink">
            <Reveal delay={0.05}>
              <p>
                Someone sees your status and asks what you have for joint pain. You explain, send a few photos and a
                price, and they say they&apos;ll get back to you. A few do. Most don&apos;t, and in a busy week you
                forget to ask again.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-ink-soft">
                The ones who buy usually buy once. A month later the bottle is finished, and unless you happen to
                remember who bought what and when, nobody reaches out. They still need it; they just haven&apos;t heard
                from you.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p>
                None of this shows up as a lost sale, which is why it&apos;s easy to miss. It just looks like a{" "}
                <em className="text-clay">slow month.</em>
              </p>
            </Reveal>
          </div>
        </div>

        {/* the loop, and where it leaks */}
        <div className="mt-24">
          <div className="relative">
            <motion.div
              aria-hidden
              className="absolute left-[10%] right-[10%] top-[1.375rem] hidden h-px origin-left bg-ink/25 md:block"
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.4, ease }}
            />
            <motion.div
              aria-hidden
              className="absolute bottom-6 left-[1.375rem] top-6 w-px origin-top bg-ink/25 md:hidden"
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.4, ease }}
            />
            <ol className="relative grid gap-8 md:grid-cols-5 md:gap-4">
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.label}
                  className="flex gap-5 md:flex-col md:items-center md:gap-0 md:text-center"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.18, ease }}
                >
                  <span
                    className={clsx(
                      "relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border font-display text-lg",
                      s.leak ? "border-ink/20 bg-paper text-ink" : "border-forest bg-forest text-cream",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="md:mt-4">
                    <div className="text-[1.05rem] font-semibold text-ink">{s.label}</div>
                    {s.leak ? (
                      <motion.div
                        className="mt-2 flex items-start gap-2 text-[0.92rem] leading-snug text-clay md:flex-col md:items-center"
                        initial={reduce ? false : { opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-15% 0px" }}
                        transition={{ duration: 0.7, delay: 1.1 + i * 0.18 }}
                      >
                        <span aria-hidden className="mt-1.5 hidden h-6 border-l border-dashed border-clay/60 md:block" />
                        <span className="md:max-w-[12rem]">{s.leak}</span>
                      </motion.div>
                    ) : (
                      <div className="mt-2 text-[0.92rem] leading-snug text-moss">Where most distributors are already strong</div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
          <Reveal className="mt-14 max-w-2xl md:mx-auto md:text-center" delay={0.1}>
            <p className="lede">
              Suppli Afya is built around those gaps, so fewer people slip through between one step and the next.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
