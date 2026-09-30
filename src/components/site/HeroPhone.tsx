"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { ChatScreen, MockPhone, PageScreen, QuestionScreen, SuggestionsScreen } from "./Screens";
import { KATE, ORDER_TOTAL, SARAH, SUGGESTED } from "./story";

const ease = [0.22, 1, 0.36, 1] as const;
const SCENES = [3600, 3400, 4200, 5200]; // Kate's page, a question, the plan, WhatsApp

/**
 * The whole idea in one silent loop: Kate's page, a question, Sarah's plan, then WhatsApp to
 * Kate, while the enquiry lands in Kate's workspace. The first frame is Kate's page, drawn in
 * the HTML, so the product is on screen before any script runs; with reduced motion it stays there.
 */
export function HeroPhone() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const [scene, setScene] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const t = setTimeout(() => {
      setScene((s) => (s + 1) % SCENES.length);
      setTick((n) => n + 1);
    }, SCENES[scene]);
    return () => clearTimeout(t);
  }, [scene, reduce, inView]);

  const shown = reduce ? 0 : scene;
  const talking = !reduce && shown === 3;

  return (
    <div ref={ref} aria-hidden className="relative mx-auto w-full max-w-[25rem] lg:max-w-none">
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(185_200_174/0.55),transparent)] blur-2xl" />

      <MockPhone>
        <AnimatePresence mode="wait" initial={false}>
          <Scene key={`${shown}-${tick}`}>
            {shown === 0 && <PageScreen />}
            {shown === 1 && <QuestionScreen live />}
            {shown === 2 && <SuggestionsScreen live />}
            {shown === 3 && <ChatScreen stage={2} live />}
          </Scene>
        </AnimatePresence>
      </MockPhone>

      {/* Kate's side: the enquiry arrives with what Sarah was looking for. */}
      <AnimatePresence>
        {(talking || reduce) && (
          <motion.div
            key={`lead${tick}`}
            initial={reduce ? false : { opacity: 0, x: 24, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.9, ease }}
            className="absolute -right-1 bottom-[20%] w-[12.5rem] rounded-2xl border border-ink/10 bg-paper p-3.5 shadow-float sm:-right-10 sm:bottom-auto sm:top-[14%] sm:w-[13.5rem] lg:-right-20"
          >
            <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-moss">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" /> New enquiry · in {KATE.first}&apos;s workspace
            </div>
            <div className="mt-1.5 font-display text-lg leading-tight text-ink">
              {SARAH.name}, {SARAH.age}
            </div>
            <div className="text-[0.75rem] text-ink-soft">{SARAH.goals.join(" · ")}</div>
            <div className="mt-2 rounded-lg bg-sand/70 px-2 py-1.5 text-[0.7rem] leading-snug text-ink-soft">
              Suggested: {SUGGESTED.map((p) => p.short).join(", ")}
            </div>
          </motion.div>
        )}
        {talking && (
          <motion.div
            key={`pay${tick}`}
            initial={{ opacity: 0, x: -20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, delay: 3, ease }}
            className="absolute -left-1 bottom-[4%] flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-paper px-3 py-2.5 shadow-float sm:-left-10 sm:bottom-[16%] lg:-left-16"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e3f4e0] text-[0.62rem] font-bold text-[#1f7a36]">M</span>
            <span className="leading-tight">
              <span className="block text-[0.7rem] text-ink-mute">M-Pesa · paid</span>
              <span className="block text-[0.85rem] font-semibold text-ink">
                {ORDER_TOTAL} · {SARAH.name}
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Scene({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.45, ease }}
    >
      {children}
    </motion.div>
  );
}
