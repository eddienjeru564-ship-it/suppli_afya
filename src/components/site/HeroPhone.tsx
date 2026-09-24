"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";

const ease = [0.22, 1, 0.36, 1] as const;
const SCENES = [3400, 3400, 4600]; // question, plan, whatsapp

/**
 * A looping, silent walkthrough: a customer picks goals, gets a plan, sends it
 * on WhatsApp, and the lead lands with the distributor.
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

  const shown = reduce ? 1 : scene;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[25rem] lg:max-w-none">
      {/* soft light behind the phone */}
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(185_200_174/0.55),transparent)] blur-2xl" />

      <div className="relative mx-auto h-[33rem] w-[17rem] rounded-[2.6rem] border-[9px] border-[#0b1711] bg-cream shadow-float sm:h-[36rem] sm:w-[18.5rem]">
        <div aria-hidden className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0b1711]" />
        <div className="relative h-full overflow-hidden rounded-[2rem]">
          <AnimatePresence mode="wait" initial={false}>
            {shown === 0 && <QuestionScene key={`q${tick}`} />}
            {shown === 1 && <PlanScene key={`p${tick}`} />}
            {shown === 2 && <ChatScene key={`c${tick}`} />}
          </AnimatePresence>
        </div>
      </div>

      {/* what the distributor sees */}
      <AnimatePresence>
        {(shown === 2 || reduce) && (
          <motion.div
            key={`lead${tick}`}
            initial={{ opacity: 0, x: 24, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.9, ease }}
            className="absolute -right-1 bottom-[20%] w-[12.5rem] rounded-2xl border border-ink/10 bg-paper p-3.5 shadow-float sm:-right-10 sm:bottom-auto sm:top-[14%] sm:w-[13.5rem] lg:-right-20"
          >
            <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-moss">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" /> New lead · via your link
            </div>
            <div className="mt-1.5 font-display text-lg leading-tight text-ink">Wanjiru, 34</div>
            <div className="text-[0.75rem] text-ink-soft">Energy · Joints & bones</div>
            <div className="mt-2 rounded-lg bg-sand/70 px-2 py-1.5 text-[0.7rem] leading-snug text-ink-soft">
              Wants a focused plan. Avoids pork.
            </div>
          </motion.div>
        )}
        {(shown === 2 || reduce) && (
          <motion.div
            key={`pay${tick}`}
            initial={{ opacity: 0, x: -20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 2.4, ease }}
            className="absolute -left-1 bottom-[4%] flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-paper px-3 py-2.5 shadow-float sm:-left-10 sm:bottom-[16%] lg:-left-16"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e3f4e0] text-[0.62rem] font-bold text-[#1f7a36]">M</span>
            <span className="leading-tight">
              <span className="block text-[0.7rem] text-ink-mute">M-Pesa · paid</span>
              <span className="block text-[0.85rem] font-semibold text-ink">KES 6,400 · Wanjiru</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={clsx("absolute inset-0 px-4 pt-9", className)}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.45, ease }}
    >
      {children}
    </motion.div>
  );
}

function Bar({ fill }: { fill: number[] }) {
  return (
    <div className="flex gap-1">
      {fill.map((f, i) => (
        <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-forest" style={{ width: `${f * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

function QuestionScene() {
  const opts = ["Energy", "Immunity", "Digestion", "Joints & bones", "Sleep & stress", "Blood sugar"];
  const picks: Record<string, number> = { Energy: 1, "Joints & bones": 2 };
  return (
    <Screen>
      <Bar fill={[1, 0.4, 0, 0]} />
      <div className="mt-5 font-display text-[1.3rem] leading-[1.15] text-ink">What would you most like to improve?</div>
      <div className="mt-1 text-[0.7rem] text-ink-mute">Choose up to three, most important first.</div>
      <div className="mt-4 grid gap-1.5">
        {opts.map((o, i) => {
          const rank = picks[o];
          return (
            <motion.div
              key={o}
              className="flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[0.8rem] font-medium"
              initial={{ borderColor: "rgb(22 36 28 / 0.12)", backgroundColor: "#fbf8f2" }}
              animate={
                rank
                  ? { borderColor: "#1e3a2b", backgroundColor: "rgb(223 231 214 / 0.8)" }
                  : { borderColor: "rgb(22 36 28 / 0.12)", backgroundColor: "#fbf8f2" }
              }
              transition={{ delay: rank ? 0.7 + rank * 0.7 : 0, duration: 0.3 }}
            >
              <motion.span
                className="grid h-4 w-4 place-items-center rounded-[5px] border text-[0.6rem] font-bold text-cream"
                initial={{ backgroundColor: "#ffffff", borderColor: "rgb(22 36 28 / 0.3)" }}
                animate={rank ? { backgroundColor: "#1e3a2b", borderColor: "#1e3a2b" } : {}}
                transition={{ delay: rank ? 0.7 + rank * 0.7 : 0, duration: 0.3 }}
              >
                {rank ?? ""}
              </motion.span>
              <span className={clsx(i > 3 && "text-ink-soft")}>{o}</span>
            </motion.div>
          );
        })}
      </div>
      <motion.div
        className="mt-4 h-9 rounded-full bg-forest text-center text-[0.8rem] font-semibold leading-9 text-cream"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        Continue
      </motion.div>
    </Screen>
  );
}

function PlanScene() {
  const items = [
    { name: "4 in 1 Cordyceps Coffee", goal: "Energy", tone: "#5a7a53" },
    { name: "ArthroXtra Tablets", goal: "Joints & bones", tone: "#c48b2c" },
  ];
  return (
    <Screen>
      <Bar fill={[1, 1, 1, 1]} />
      <div className="mt-5 text-[0.65rem] font-semibold text-clay">Your plan · SA-7K3Q</div>
      <div className="mt-1 font-display text-[1.4rem] leading-[1.1] text-ink">Wanjiru, here&apos;s your plan.</div>
      <div className="mt-1 text-[0.7rem] leading-snug text-ink-soft">Your main goal is energy, followed by joints &amp; bones.</div>
      <div className="mt-3 grid gap-2">
        {items.map((it, i) => (
          <motion.div
            key={it.name}
            className="rounded-2xl border border-ink/10 bg-paper p-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.25, duration: 0.5, ease }}
          >
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-7 rounded-md" style={{ background: it.tone }} />
              <div className="min-w-0">
                <div className="truncate font-display text-[0.95rem] leading-tight text-ink">{it.name}</div>
                <span className="mt-0.5 inline-block rounded-full bg-sage-soft px-1.5 py-px text-[0.58rem] font-semibold text-forest">{it.goal}</span>
              </div>
            </div>
            <div className="mt-2 text-[0.62rem] leading-snug text-ink-soft">
              {i === 0
                ? "It replaces your morning cup, so it fits into a routine you already have."
                : "You've had joint trouble for a while, and this is the formula made for that."}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-3 rounded-2xl bg-forest p-3 text-cream"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5, ease }}
      >
        <div className="font-display text-[0.95rem]">Send your plan to Grace</div>
        <motion.div
          className="mt-2 flex h-8 items-center justify-center gap-1.5 rounded-full bg-wa text-[0.72rem] font-semibold text-[#06331f]"
          animate={{ scale: [1, 0.95, 1] }}
          transition={{ delay: 2.6, duration: 0.35 }}
        >
          <WhatsAppIcon className="h-3.5 w-3.5" /> Send on WhatsApp
        </motion.div>
      </motion.div>
    </Screen>
  );
}

function ChatScene() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-wa-bg"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.45, ease }}
    >
      <div className="flex items-center gap-2 bg-wa-deep px-3 pb-2.5 pt-8 text-white">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dfe5e7] text-xs font-semibold text-wa-deep">G</span>
        <div className="leading-tight">
          <div className="text-[0.8rem] font-semibold">Grace Wambui</div>
          <div className="text-[0.6rem] text-white/75">online</div>
        </div>
      </div>
      <div className="flex-1 px-2.5 pt-4">
        <motion.div
          className="ml-auto max-w-[88%] rounded-lg rounded-tr-none bg-wa-bubble px-2.5 pb-4 pt-2 text-[0.66rem] leading-[1.45] text-[#111b21] shadow-sm"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.5, ease }}
        >
          Hi Grace, I&apos;ve just done the health check.
          <br />
          <br />
          <b>About me:</b> Wanjiru, 34
          <br />
          <b>My goals:</b> 1. Energy 2. Joints
          <br />
          <b>Suggested plan:</b> 4 in 1 Cordyceps Coffee, ArthroXtra Tablets
          <br />
          <b>Please note:</b> Avoids pork
          <br />
          <br />
          Could you tell me the prices and how to get started?
          <div className="mt-0.5 text-right text-[0.55rem] text-[#667781]">9:14 pm ✓✓</div>
        </motion.div>
        <motion.div
          className="mt-2 max-w-[70%] rounded-lg rounded-tl-none bg-white px-2.5 py-2 text-[0.66rem] leading-[1.45] text-[#111b21] shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.9, duration: 0.5, ease }}
        >
          Hi Wanjiru! Thanks for doing the check. Let me send you the prices now 🙂
        </motion.div>
      </div>
    </motion.div>
  );
}
