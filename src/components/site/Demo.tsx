"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { TESTIMONIALS } from "@/config/testimonials";
import {
  deriveProfile,
  distributorBrief,
  goalLabel,
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
import { KateSide, type Enquiry } from "./DemoKate";

const KATE_FIRST = DEMO_DISTRIBUTOR.firstName;
const CTX = { distributorName: DEMO_DISTRIBUTOR.name, distributorFirstName: KATE_FIRST };
const ease = [0.22, 1, 0.36, 1] as const;

/** What happens, in order. The rail above the demo lights up as the visitor goes through it. */
const STEPS = [
  { short: "Answers", long: "Answers a few questions" },
  { short: "Plan", long: "Gets a personal recommendation" },
  { short: "WhatsApp", long: "Sends it on WhatsApp" },
  { short: `${KATE_FIRST}'s list`, long: `${KATE_FIRST} gets the enquiry` },
];

/** Things a careful distributor checks before trusting a tool with their customers. Each is true today. */
const TRUST = ["Independent of BF Suma", "Your customers stay yours", "Careful with health information", "No contract"];

/**
 * The opening of the WhatsApp message: who they are, their goals and the plan. Notes about
 * pregnancy or medicines stay out of the demo; the real message and workspace still carry them.
 */
function opening(message: string) {
  return message
    .split("\n")
    .filter((l, i) => i === 0 || /^\*(About me|My goals|Suggested plan):\*/.test(l))
    .join("\n");
}

/** The visitor's enquiry so far: nothing, what they've answered, or the finished plan. */
function enquiryFor(answers: Answers, result: EngineResult | null, started: boolean, delivered: boolean): Enquiry {
  if (result) {
    const b = distributorBrief(result);
    const hasPlan = result.status !== "clinic-first" && result.core.length > 0;
    return {
      status: delivered ? "new" : "sending",
      title: b.title,
      goals: b.subtitle || undefined,
      wants: b.preference,
      plan: hasPlan ? result.core.map((c) => c.product) : undefined,
      note: hasPlan ? undefined : b.planLine,
    };
  }
  if (!started) return { status: "waiting" };
  const p = deriveProfile(pruneAnswers(answers));
  return {
    status: "answering",
    title: [p.name, p.age].filter(Boolean).join(", ") || undefined,
    goals: p.goals.map(goalLabel).join(" · ") || undefined,
  };
}

/** The visitor's enquiry on its way: phone → WhatsApp → Kate's workspace. */
type Phase = "rest" | "sending" | "received" | "saving" | "landed";

/**
 * Kate's page, working. The visitor plays the customer on the left and gets a personal
 * recommendation; on the right is what Kate gets, built only from what they answer: the WhatsApp
 * message, and the same enquiry saved in her workspace in a shape she can follow up on.
 */
export function Demo() {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<EngineResult | null>(null);
  const [step, setStep] = useState("welcome");
  const [phase, setPhase] = useState<Phase>("rest");
  const [sendKey, setSendKey] = useState(0);
  const [delivered, setDelivered] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { margin: "-30% 0px -30% 0px" });
  const panelInView = useInView(panelRef, { margin: "0px 0px -20% 0px" });

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
      setDelivered(true);
      setPhase("landed");
      at(2500, () => setPhase("rest"));
      return;
    }
    setSendKey((k) => k + 1);
    setPhase("sending");
    at(1100, () => setPhase("received"));
    at(1550, () => setPhase("saving"));
    at(2050, () => {
      setPhase("landed");
      setDelivered(true);
    });
    at(4600, () => setPhase("rest"));
  }, [reduce, clearTimers]);

  const onAnswers = useCallback((a: Answers) => setAnswers(a), []);
  const onStep = useCallback((id: string) => setStep(id), []);
  const onResult = useCallback(
    (r: EngineResult | null) => {
      setResult(r);
      if (r) send();
      else {
        clearTimers();
        setDelivered(false);
        setPhase("rest");
      }
    },
    [send, clearTimers],
  );

  // How far along the visitor is: answers and recommendation, then WhatsApp, then Kate's list.
  const reached = !result ? 0 : delivered ? 4 : phase === "received" || phase === "saving" ? 3 : 2;

  const enquiry = useMemo(() => enquiryFor(answers, result, started, delivered), [answers, result, started, delivered]);
  const message = useMemo(() => (result && reached >= 3 ? opening(whatsappMessage(result, CTX)) : null), [result, reached]);

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

  // Phones: Kate's side sits below the check, so a small live summary follows the visitor while they answer.
  const showChip = started && sectionInView && !panelInView;

  return (
    <section ref={sectionRef} id="try" className="relative overflow-clip bg-forest-deep py-24 text-cream sm:py-28">
      <div className="container-x">
        <Reveal>
          <h2 className="display-lg max-w-[20ch]">Example Distributor Page</h2>
          <p className="mt-6 max-w-[34rem] text-[1.1rem] leading-relaxed text-cream/75">
            This is an example page for {DEMO_DISTRIBUTOR.name}, a BF Suma distributor. Yours would be set up the same way,
            with your name. Answer the questions as a customer would: you&apos;ll get your own recommendation, and see what{" "}
            {KATE_FIRST} receives as you go.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-14">
          <Rail reached={reached} started={started} />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 lg:mt-10 lg:grid-cols-[24.5rem_minmax(6.5rem,1fr)_minmax(0,31rem)] lg:items-start">
          {/* The customer's side: Kate's real page, running the real assessment. */}
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

          {/* Kate's side: the message, and the enquiry it becomes. */}
          <div ref={panelRef} id="what-reaches-you" className="min-w-0 scroll-mt-24 lg:pt-16">
            <KateSide
              message={message}
              from={enquiry.title?.split(",")[0] || "Customer"}
              enquiry={enquiry}
              highlight={phase === "landed"}
              received={phase === "received"}
              saving={phase === "saving"}
            />
          </div>
        </div>

        <ul className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-cream/10 pt-8 text-[0.92rem] text-cream/70">
          {TRUST.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-sage" />
              {t}
            </li>
          ))}
        </ul>

        {TESTIMONIALS.length > 0 && (
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
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
            onClick={() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease }}
            className="fixed inset-x-3 top-[4.6rem] z-40 flex items-center gap-3 rounded-2xl bg-paper p-3 text-left text-ink shadow-float ring-1 ring-ink/10 lg:hidden"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {!result && <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-moss opacity-60" />}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-moss" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.7rem] font-semibold text-moss">
                {result ? `Sent · see what ${KATE_FIRST} receives` : `What ${KATE_FIRST} will get`}
              </span>
              <span className="block truncate text-[0.9rem] font-semibold">{enquiry.title || "Your enquiry"}</span>
              {enquiry.goals && <span className="block truncate text-[0.78rem] text-ink-soft">{enquiry.goals}</span>}
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
    <ol className="grid grid-cols-4 lg:grid-cols-[12.25rem_12.25rem_minmax(6.5rem,1fr)_minmax(0,31rem)]">
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
 * The link between the two sides: WhatsApp, drawn as the site's swirl arrow. Across on large
 * screens, down on phones. When the visitor sends their plan, it lights up green along its length.
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
        transition={{ pathLength: { duration: 0.9, ease: "easeInOut" }, opacity: { duration: 1.1, times: [0, 0.8, 1] } }}
      />
    );

  return (
    <div aria-hidden className="relative">
      {/* phones and tablets: down, from the check to Kate's side */}
      <div className="flex items-center justify-center gap-3 py-4 lg:hidden">
        <SwirlArrow direction="down" strokeWidth={5} className="h-24 w-8 text-ochre">
          {travel(SWIRL_DOWN)}
        </SwirlArrow>
        <span className="font-display text-[1.05rem] italic text-cream/70">via WhatsApp</span>
      </div>
      {/* large screens: across, level with the message on Kate's side */}
      <div className="absolute inset-x-3 top-[6.6rem] hidden flex-col items-center lg:flex">
        <SwirlArrow direction="right" strokeWidth={5} className="w-full max-w-[13rem] text-ochre">
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
