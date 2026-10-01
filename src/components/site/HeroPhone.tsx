"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { ChatScreen, KindTag, MockPhone, Pack, PageScreen, QuestionScreen, SuggestionsScreen } from "./Screens";
import { KATE, SARAH, SUGGESTED } from "./story";

const ease = [0.22, 1, 0.36, 1] as const;

const SCENES = [
  { label: `${KATE.first}'s page`, ms: 3400 },
  { label: "Questions", ms: 3600 },
  { label: "Suggestions", ms: 4400 },
  { label: "WhatsApp", ms: 5600 },
];

/**
 * The whole idea in one silent loop: Kate's page, a question, Sarah's plan, then WhatsApp to
 * Kate, while the enquiry lands in Kate's workspace. A rail under the phone names each step. The
 * first frame is Kate's page, drawn in the HTML, so the product is on screen before any script
 * runs; with reduced motion it stays there.
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
    }, SCENES[scene].ms);
    return () => clearTimeout(t);
  }, [scene, reduce, inView]);

  const shown = reduce ? 0 : scene;
  const handedOff = !reduce && shown === 3;

  return (
    <div ref={ref} aria-hidden className="relative mx-auto w-full max-w-[25rem] lg:max-w-none">
      <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(185_200_174/0.55),transparent)] blur-2xl" />

      <MockPhone>
        <AnimatePresence mode="wait" initial={false}>
          <Scene key={`${shown}-${tick}`}>
            {shown === 0 && <PageScreen pressed={false} />}
            {shown === 1 && <QuestionScreen live />}
            {shown === 2 && <SuggestionsScreen live />}
            {shown === 3 && <ChatScreen stage="sent" live />}
          </Scene>
        </AnimatePresence>
      </MockPhone>

      {/* Kate's side: the enquiry arrives with what Sarah was looking for. */}
      <AnimatePresence>
        {(handedOff || reduce) && (
          <motion.div
            key={`lead${tick}`}
            initial={reduce ? false : { opacity: 0, x: 24, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 1.4, ease }}
            className="absolute -right-1 bottom-[22%] w-[13rem] rounded-2xl border border-ink/10 bg-paper p-3.5 shadow-float sm:-right-12 sm:bottom-auto sm:top-[16%] lg:-right-20"
          >
            <div className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-moss">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-moss/50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
              </span>
              In {KATE.first}&apos;s workspace
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="font-display text-[1.15rem] leading-tight text-ink">
                {SARAH.name}, {SARAH.age}
              </span>
              <KindTag kind="new" />
            </div>
            <div className="text-[0.75rem] text-ink-soft">{SARAH.goals.join(" · ")}</div>
            <div className="mt-2 grid gap-1">
              {SUGGESTED.map((p) => (
                <span key={p.id} className="flex items-center gap-2 rounded-lg bg-sand/60 px-1.5 py-1">
                  <Pack product={p} className="h-7 w-6 rounded-md bg-transparent p-0" />
                  <span className="truncate text-[0.72rem] font-medium text-ink">{p.name}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The four steps, named. */}
      <ol className="mx-auto mt-7 grid max-w-[22rem] grid-cols-4 gap-2">
        {SCENES.map((s, i) => {
          const on = i === shown;
          const done = i < shown;
          return (
            <li key={s.label} className="min-w-0">
              <div className="h-[3px] overflow-hidden rounded-full bg-ink/10">
                {on && !reduce ? (
                  <motion.div
                    key={`bar${tick}`}
                    className="h-full rounded-full bg-forest"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: s.ms / 1000, ease: "linear" }}
                  />
                ) : (
                  <div className={clsx("h-full rounded-full", done || on ? "w-full bg-forest" : "w-0")} />
                )}
              </div>
              <div className={clsx("mt-2 truncate text-[0.72rem] font-semibold transition-colors", on ? "text-ink" : "text-ink-mute")}>
                {s.label}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Scene({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease }}
    >
      {children}
    </motion.div>
  );
}
