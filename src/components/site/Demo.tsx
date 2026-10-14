"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { TESTIMONIALS } from "@/config/testimonials";
import {
  GOALS_BY_ID,
  deriveProfile,
  distributorBrief,
  pruneAnswers,
  whatsappMessage,
  type Answers,
  type EngineResult,
} from "@/engine";
import { HealthCheck } from "@/components/check/HealthCheck";
import { PhoneFrame } from "@/components/check/PhoneFrame";
import { Arrow } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SWIRL_DOWN, SWIRL_RIGHT, SwirlArrow } from "@/components/ui/SwirlArrow";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { KateWhatsApp, type Draft } from "./DemoWhatsApp";

const KATE_FIRST = DEMO_DISTRIBUTOR.firstName;
const CTX = { distributorName: DEMO_DISTRIBUTOR.name, distributorFirstName: KATE_FIRST };
const ease = [0.22, 1, 0.36, 1] as const;

/** The whole story, and where it stops: the enquiry reaching Kate. The rail lights up as the visitor goes. */
const STEPS = [
  { short: "Answers", long: "Answers a few questions" },
  { short: "Plan", long: "Gets a personal recommendation" },
  { short: "WhatsApp", long: "Sends it on WhatsApp" },
  { short: KATE_FIRST, long: `${KATE_FIRST} gets the enquiry` },
];

/**
 * The visitor's message as it lands on Kate's WhatsApp, word for word, minus any note about
 * pregnancy or medicines (those stay between a real customer and their distributor) and the
 * "maybe later" products, to keep the demo to what matters first.
 */
function asSent(message: string) {
  return message
    .split("\n")
    .filter((l) => !/^\*(Note|Please note|Maybe later):\*/.test(l))
    .join("\n");
}

/** How the message words the plan size (the engine's PLAN_SIZE_LABEL, src/engine/handoff.ts). */
const SIZE: Record<string, string> = {
  one: "one product to start",
  focused: "a focused plan (2–3 products)",
  complete: "a complete plan",
};

/** The message so far: only what the visitor has actually answered. */
function draftFor(a: Answers): Draft {
  const p = deriveProfile(pruneAnswers(a));
  return {
    name: p.name || undefined,
    age: p.age ?? undefined,
    goals: p.goals.length ? p.goals.map((g, i) => `${i + 1}. ${GOALS_BY_ID[g].short}`).join("  ") : undefined,
    size: typeof a.plan_size === "string" ? SIZE[a.plan_size] : undefined,
  };
}

/** The visitor's enquiry on its way: phone → WhatsApp → Kate, who replies. */
type Phase = "rest" | "sending" | "arrived" | "replied";

/**
 * How it works, by doing it. The visitor plays the customer on Kate's real page: they answer,
 * get a personal recommendation and send it on WhatsApp; it lands on Kate's own WhatsApp as a
 * message that already says what they want, and Kate starts the conversation. The story stops
 * there. What happens after the enquiry is the next section's.
 */
export function Demo() {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<EngineResult | null>(null);
  const [step, setStep] = useState("welcome");
  const [phase, setPhase] = useState<Phase>("rest");
  const [sendKey, setSendKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const kateRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { margin: "-30% 0px -30% 0px" });
  const kateInView = useInView(kateRef, { margin: "0px 0px -25% 0px" });

  const started = step !== "welcome" || result !== null;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const send = useCallback(() => {
    clearTimers();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    if (reduce) {
      setPhase("replied");
      return;
    }
    setSendKey((k) => k + 1);
    setPhase("sending");
    at(950, () => setPhase("arrived"));
    at(2600, () => setPhase("replied"));
  }, [reduce, clearTimers]);

  const onAnswers = useCallback((a: Answers) => setAnswers(a), []);
  const onStep = useCallback((id: string) => setStep(id), []);
  const onResult = useCallback(
    (r: EngineResult | null) => {
      setResult(r);
      if (r) send();
      else {
        clearTimers();
        setPhase("rest");
      }
    },
    [send, clearTimers],
  );

  const arrived = result !== null && (phase === "arrived" || phase === "replied");
  const reached = !result ? 0 : arrived ? 4 : 2;

  const sent = useMemo(() => {
    if (!result) return null;
    return {
      name: result.profile.name || "Your customer",
      message: asSent(whatsappMessage(result, CTX)),
      reply: distributorBrief(result).opener,
    };
  }, [result]);

  // "Try it yourself" sits beside the Start button on wide screens (where there's room), wherever the button ends up.
  const [pillTop, setPillTop] = useState<number | null>(null);
  useEffect(() => {
    const col = phoneRef.current;
    if (!col || started) return;
    const measure = () => {
      const btn = col.querySelector<HTMLElement>(".invite-ring");
      if (!btn) return setPillTop(null);
      const c = col.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      setPillTop(b.top - c.top + b.height / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(col);
    return () => ro.disconnect();
  }, [started]);

  const draft = useMemo(() => draftFor(answers), [answers]);

  // Phones: Kate's WhatsApp sits below the check, so a small bar keeps the message in view and leads down to it.
  const showChip = started && sectionInView && !kateInView;

  return (
    <section ref={sectionRef} id="try" className="relative overflow-clip bg-forest-deep py-24 text-cream sm:py-28">
      <div className="container-x">
        <Reveal>
          <h2 className="display-lg max-w-[20ch]">How Suppli Afya Works</h2>
          <p className="mt-6 max-w-[34rem] text-[1.1rem] leading-relaxed text-cream/75">
            This is {DEMO_DISTRIBUTOR.name}&apos;s page, an example of what yours would look like with your name. Answer the
            questions as a customer would. You&apos;ll get a personal recommendation, then see it arrive on{" "}
            {KATE_FIRST}&apos;s WhatsApp.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-14">
          <Rail reached={reached} started={started} />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 lg:mt-10 lg:grid-cols-[24.5rem_minmax(7rem,1fr)_21rem] lg:items-center">
          {/* The customer: Kate's real page, running the real assessment. */}
          <div ref={phoneRef} className="relative min-w-0">
            <AnimatePresence>
              {!started && (
                <motion.div
                  key="try-small"
                  initial={false}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className="mb-3 flex items-end justify-center gap-1 xl:hidden"
                >
                  <TryNote />
                  <SwirlArrow direction="down" strokeWidth={5} className="h-16 w-5 shrink-0 translate-y-2 text-ochre" />
                </motion.div>
              )}
              {!started && pillTop !== null && (
                <motion.div
                  key="try-large"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.45, ease }}
                  className="absolute left-[calc(100%+0.75rem)] z-10 hidden -translate-y-1/2 items-center gap-3 xl:flex"
                  style={{ top: pillTop }}
                >
                  <SwirlArrow direction="left" strokeWidth={5} className="h-9 w-28 shrink-0 text-ochre" />
                  <TryNote />
                </motion.div>
              )}
            </AnimatePresence>
            <PhoneFrame className="mx-auto">
              <HealthCheck
                distributor={DEMO_DISTRIBUTOR}
                mode="embedded"
                invite={!started}
                onAnswersChange={onAnswers}
                onResult={onResult}
                onStep={onStep}
              />
            </PhoneFrame>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.8rem] text-cream/55">
              <span>Demo only. Nothing you enter is saved or sent.</span>
              <Link href="/check" className="group inline-flex items-center gap-1 font-semibold text-cream/80 hover:text-cream">
                Open {KATE_FIRST}&apos;s page on its own <Arrow className="h-3 w-3" />
              </Link>
            </p>
          </div>

          <Connector sendKey={sendKey} sending={phase === "sending"} />

          {/* Kate: her own WhatsApp, where the enquiry lands and the conversation starts. */}
          <div ref={kateRef} id="kate-whatsapp" className="min-w-0 scroll-mt-24">
            <div className="mb-3 text-center text-[0.85rem] font-semibold text-cream/70">{KATE_FIRST}&apos;s WhatsApp</div>
            <KateWhatsApp
              customer={arrived ? sent!.name : null}
              message={arrived ? sent!.message : null}
              reply={phase === "replied" && sent ? sent.reply : null}
              draft={draft}
            />
          </div>
        </div>

        {TESTIMONIALS.length > 0 && (
          <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <Reveal key={t.name}>
                <figure className="rounded-[1.5rem] bg-cream/[0.06] p-6 ring-1 ring-cream/10 sm:p-8">
                  <blockquote className="font-display text-[1.35rem] leading-snug text-cream">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 text-[0.92rem] text-cream/70">
                    <span className="font-semibold text-cream">{t.name}</span> · {t.role}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showChip && (
          <motion.button
            type="button"
            onClick={() => kateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease }}
            className="fixed inset-x-3 top-[4.6rem] z-40 flex items-center gap-3 rounded-2xl bg-paper p-3 text-left text-ink shadow-float ring-1 ring-ink/10 lg:hidden"
          >
            <span className={clsx("relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full", arrived ? "bg-wa" : "bg-ochre")} />
            <span className="min-w-0 flex-1">
              <span className="block text-[0.7rem] font-semibold text-moss">
                {arrived ? "Sent on WhatsApp" : `Your message to ${KATE_FIRST}, so far`}
              </span>
              <span className="block truncate text-[0.9rem] font-semibold">
                {arrived ? `See it arrive on ${KATE_FIRST}'s phone` : [draft.name, draft.goals].filter(Boolean).join(" · ") || "Fills in as you answer"}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-forest px-3 py-1.5 text-[0.72rem] font-semibold text-cream">See it</span>
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}

/** The four steps, lined up over the part of the demo where each happens (on large screens). */
function Rail({ reached, started }: { reached: number; started: boolean }) {
  return (
    <ol className="grid grid-cols-4 lg:grid-cols-[12.25rem_12.25rem_minmax(7rem,1fr)_21rem]">
      {STEPS.map((s, i) => {
        const done = reached > i;
        const current = reached === i;
        return (
          <li key={s.long} className="relative min-w-0 pr-2" aria-current={current ? "step" : undefined}>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="absolute left-8 right-1 top-[0.8rem] h-px bg-cream/15">
                <span
                  className="block h-full bg-sage transition-[width] duration-700 ease-[var(--ease-soft)]"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </span>
            )}
            <span
              className={clsx(
                "relative grid h-[1.6rem] w-[1.6rem] place-items-center rounded-full text-[0.78rem] font-semibold transition-colors duration-500",
                done ? "bg-sage text-forest-deep" : current ? "bg-cream text-forest-deep" : "border border-cream/25 text-cream/55",
              )}
            >
              {current && !started && <span className="absolute inset-0 rounded-full bg-cream/50 motion-safe:animate-ping" />}
              <span className="relative">{done ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
            </span>
            <span
              className={clsx(
                "mt-2.5 block text-[0.74rem] leading-snug transition-colors duration-500 sm:text-[0.86rem]",
                done || current ? "text-cream" : "text-cream/55",
              )}
            >
              <span className="lg:hidden">{s.short}</span>
              <span className="hidden lg:inline">{s.long}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The link between the customer and Kate: WhatsApp, drawn as the site's swirl arrow. Across on
 * large screens, down on phones. When the visitor sends their plan, it lights up green along its length.
 */
function Connector({ sendKey, sending }: { sendKey: number; sending: boolean }) {
  const travel = (d: string) =>
    sending && (
      <motion.path
        key={sendKey}
        d={d}
        stroke="#25d366"
        strokeWidth={5.5}
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: [1, 1, 0] }}
        transition={{ pathLength: { duration: 0.85, ease: "easeInOut" }, opacity: { duration: 1.1, times: [0, 0.8, 1] } }}
      />
    );

  return (
    <div aria-hidden className="flex items-center justify-center">
      {/* phones and tablets: down, from the customer to Kate */}
      <div className="flex items-center justify-center gap-3 py-5 lg:hidden">
        <SwirlArrow direction="down" strokeWidth={5} className="h-24 w-8 text-ochre">
          {travel(SWIRL_DOWN)}
        </SwirlArrow>
        <span className="font-display text-[1.05rem] italic text-cream/70">via WhatsApp</span>
      </div>
      {/* large screens: across */}
      <div className="hidden w-full flex-col items-center px-3 lg:flex">
        <SwirlArrow direction="right" strokeWidth={5} className="w-full max-w-[15rem] text-ochre">
          {travel(SWIRL_RIGHT)}
        </SwirlArrow>
        <span className="mt-1 whitespace-nowrap font-display text-[1.05rem] italic text-cream/70">via WhatsApp</span>
      </div>
    </div>
  );
}

/** The invitation, written like a note beside the page: hard to miss, not shouting. */
function TryNote() {
  return (
    <span className="block leading-none">
      <span className="block whitespace-nowrap font-display text-[2.1rem] italic text-cream">Try it yourself</span>
      <span className="mt-1.5 block whitespace-nowrap text-[0.85rem] text-cream/65">Tap Start and answer as a customer</span>
    </span>
  );
}
