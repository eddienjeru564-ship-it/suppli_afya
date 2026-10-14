"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ChatScreen, MockPhone, PageScreen, QuestionScreen, SuggestionsScreen, WaText } from "./Screens";
import { KATE, SARAH, SARAH_MESSAGE } from "./story";

const ease = [0.22, 1, 0.36, 1] as const;

/** Kate's page, a question, Sarah's plan, then WhatsApp: how long each stays on screen. */
const SCENES = [3400, 3600, 4400, 5600];

/** What Kate sees arrive: the start of Sarah's message, who she is, her goals and her plan. */
const ARRIVING = SARAH_MESSAGE.split("\n")
  .filter((l, i) => i === 0 || /^\*(My goals|Suggested plan):\*/.test(l))
  .join("\n");

/**
 * The whole idea in one silent loop: Kate's page, a question, Sarah's plan, then WhatsApp, and
 * the message arriving on Kate's own phone. The first frame is Kate's page, drawn in the HTML, so
 * the product is on screen before any script runs; with reduced motion it stays there.
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
  const handedOff = !reduce && shown === 3;

  return (
    <div ref={ref} aria-hidden className="relative mx-auto w-full max-w-[25rem] lg:max-w-none">
      <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(185_200_174/0.55),transparent)] blur-2xl" />

      <MockPhone>
        <AnimatePresence mode="wait" initial={false}>
          <Scene key={`${shown}-${tick}`}>
            {shown === 0 && <PageScreen />}
            {shown === 1 && <QuestionScreen live />}
            {shown === 2 && <SuggestionsScreen live />}
            {shown === 3 && <ChatScreen live />}
          </Scene>
        </AnimatePresence>
      </MockPhone>

      {/* Kate's side: the enquiry arrives on her WhatsApp, already saying what Sarah wants. */}
      <AnimatePresence>
        {(handedOff || reduce) && (
          <motion.div
            key={`lead${tick}`}
            initial={reduce ? false : { opacity: 0, x: 24, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 1.4, ease }}
            className="absolute -right-1 bottom-[22%] w-[14rem] rounded-2xl border border-ink/10 bg-paper p-3 shadow-float sm:-right-12 sm:bottom-auto sm:top-[16%] lg:-right-20"
          >
            <div className="flex items-center gap-1.5 px-0.5 text-[0.7rem] font-semibold text-wa-deep">
              <WhatsAppIcon className="h-3.5 w-3.5 text-wa" />
              On {KATE.first}&apos;s WhatsApp
              <span className="ml-auto font-normal text-ink-mute">now</span>
            </div>
            <div className="mt-2 rounded-xl bg-wa-bg p-2">
              <div className="px-0.5 text-[0.72rem] font-semibold text-ink">{SARAH.name}</div>
              <p className="mt-1 rounded-lg rounded-tl-none bg-white px-2 py-1.5 text-[0.66rem] leading-[1.45] text-[#111b21] shadow-sm">
                <WaText text={ARRIVING} />
              </p>
            </div>
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease }}
    >
      {children}
    </motion.div>
  );
}
