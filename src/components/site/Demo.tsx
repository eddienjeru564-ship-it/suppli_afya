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
  recommend,
  whatsappMessage,
  type Answers,
  type EngineResult,
} from "@/engine";
import { HealthCheck } from "@/components/check/HealthCheck";
import { PhoneFrame } from "@/components/check/PhoneFrame";
import { Arrow } from "@/components/ui/Button";
import { Check, WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { KateSide, type Enquiry } from "./DemoKate";
import { SARAH, SARAH_ANSWERS, SARAH_MESSAGE } from "./story";

const KATE_FIRST = DEMO_DISTRIBUTOR.firstName;
const CTX = { distributorName: DEMO_DISTRIBUTOR.name, distributorFirstName: KATE_FIRST };
const ease = [0.22, 1, 0.36, 1] as const;

/** What happens, in order. The rail above the demo lights up as the visitor goes through it. */
const STEPS = [
  { short: "Answers", long: "Answers a few questions" },
  { short: "Plan", long: "Gets a recommendation" },
  { short: "WhatsApp", long: "Sends it on WhatsApp" },
  { short: `${KATE_FIRST}'s list`, long: `${KATE_FIRST} gets the enquiry` },
];

/** Things a careful distributor checks before trusting a tool with their customers. Each is true today. */
const TRUST = ["Independent of BF Suma", "Your customers stay yours", "Careful with health information", "No contract"];

/**
 * The opening of a customer's WhatsApp message: who they are, their goals and the plan. Notes about
 * pregnancy or medicines stay out of the demo; the real message and workspace still carry them.
 */
function opening(message: string) {
  return message
    .split("\n")
    .filter((l, i) => i === 0 || /^\*(About me|My goals|Suggested plan):\*/.test(l))
    .join("\n");
}

function fromResult(r: EngineResult, id: string, when: string, contact: string): Enquiry {
  const b = distributorBrief(r);
  const hasPlan = r.status !== "clinic-first" && r.core.length > 0;
  return {
    id,
    status: "new",
    title: b.title,
    when,
    goals: b.subtitle || undefined,
    wants: b.preference,
    plan: hasPlan ? r.core.map((c) => c.product) : undefined,
    note: hasPlan ? undefined : b.planLine,
    contact,
  };
}

function liveEnquiry(a: Answers): Enquiry {
  const p = deriveProfile(pruneAnswers(a));
  return {
    id: "you",
    status: "answering",
    title: [p.name, p.age].filter(Boolean).join(", ") || "Your enquiry",
    when: "Just now",
    goals: p.goals.map(goalLabel).join(" · ") || undefined,
    contact: "WhatsApp",
  };
}

/** Sarah, the homepage's example customer, built by the real engine from her answers (story.test.ts checks them). */
const SARAH_ENQUIRY = fromResult(recommend(SARAH_ANSWERS), "sarah", "9:14 am", `WhatsApp · ${SARAH.phone}`);
const SARAH_OPENING = opening(SARAH_MESSAGE);

/** An enquiry on its way: phone → WhatsApp → Kate's workspace. */
type Phase = "rest" | "sending" | "received" | "saving" | "landed";

/**
 * Kate's page, working. The visitor plays the customer on the left; on the right is what Kate gets:
 * the WhatsApp message, and the same enquiry saved in her workspace in a shape she can follow up on.
 * When the section comes into view, Sarah's enquiry arrives to show the path; when the visitor
 * finishes, theirs travels the same way.
 */
export function Demo() {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<EngineResult | null>(null);
  const [step, setStep] = useState("welcome");
  const [phase, setPhase] = useState<Phase>("rest");
  const [sendKey, setSendKey] = useState(0);
  const [owner, setOwner] = useState<"sarah" | "you">("sarah");
  const [delivered, setDelivered] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { margin: "-30% 0px -30% 0px" });
  const panelInView = useInView(panelRef, { margin: "0px 0px -20% 0px" });
  const stageSeen = useInView(stageRef, { once: true, amount: 0.35 });

  const started = step !== "welcome" || result !== null;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const send = useCallback(
    (who: "sarah" | "you") => {
      clearTimers();
      setOwner(who);
      const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
      if (reduce) {
        setPhase("landed");
        if (who === "you") setDelivered(true);
        at(2500, () => setPhase("rest"));
        return;
      }
      setSendKey((k) => k + 1);
      setPhase("sending");
      at(1000, () => setPhase("received"));
      at(1450, () => setPhase("saving"));
      at(1950, () => {
        setPhase("landed");
        if (who === "you") setDelivered(true);
      });
      at(4500, () => setPhase("rest"));
    },
    [reduce, clearTimers],
  );

  // The first time the stage is in view, Sarah's enquiry makes the trip, so the path is clear before anyone taps.
  const introPlayed = useRef(false);
  useEffect(() => {
    if (!stageSeen || introPlayed.current || started) return;
    introPlayed.current = true;
    const t = setTimeout(() => send("sarah"), 400);
    return () => clearTimeout(t);
  }, [stageSeen, started, send]);

  const onAnswers = useCallback((a: Answers) => setAnswers(a), []);
  const onStep = useCallback((id: string) => setStep(id), []);
  const onResult = useCallback(
    (r: EngineResult | null) => {
      setResult(r);
      if (r) send("you");
      else {
        clearTimers();
        setDelivered(false);
        setPhase("rest");
        setOwner("sarah");
      }
    },
    [send, clearTimers],
  );

  // How far along the visitor is: answers and recommendation, then WhatsApp, then Kate's list.
  const reached = !result ? 0 : delivered ? 4 : owner === "you" && (phase === "received" || phase === "saving") ? 3 : 2;

  const live = useMemo(() => (started ? liveEnquiry(answers) : null), [answers, started]);
  const mine = useMemo(() => (result ? fromResult(result, "you", "Just now", "WhatsApp") : null), [result]);
  const myOpening = useMemo(() => (result ? opening(whatsappMessage(result, CTX)) : null), [result]);

  const enquiries: Enquiry[] = mine
    ? [{ ...mine, status: delivered ? "new" : "sending" }, SARAH_ENQUIRY]
    : live
      ? [live, SARAH_ENQUIRY]
      : [SARAH_ENQUIRY];
  const showMine = Boolean(result && myOpening && reached >= 3);

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
            with your name. Answer the questions as a customer would, and you&apos;ll see what {KATE_FIRST}{" "}
            receives as you go.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-14">
          <Rail reached={reached} started={started} />
        </Reveal>

        <div
          ref={stageRef}
          className="mt-8 grid grid-cols-1 lg:mt-10 lg:grid-cols-[24.5rem_minmax(6.5rem,1fr)_minmax(0,31rem)] lg:items-start"
        >
          {/* The customer's side: Kate's real page, running the real assessment. */}
          <div ref={phoneRef} className="relative min-w-0">
            <AnimatePresence>
              {!started && (
                <motion.div
                  key="try-small"
                  initial={false}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className="mb-4 flex justify-center xl:hidden"
                >
                  <TryPill direction="down" still={reduce} />
                </motion.div>
              )}
              {!started && pillTop !== null && (
                <motion.div
                  key="try-large"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.4, ease }}
                  className="absolute left-[calc(100%+1.25rem)] z-10 hidden -translate-y-1/2 xl:block"
                  style={{ top: pillTop }}
                >
                  <TryPill direction="left" still={reduce} />
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
              message={showMine ? myOpening! : SARAH_OPENING}
              from={showMine ? mine!.title.split(",")[0] : SARAH.name}
              time={showMine ? "now" : SARAH_ENQUIRY.when}
              enquiries={enquiries}
              highlight={phase === "landed" ? owner : null}
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
        {showChip && live && (
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
                {result ? `Finished · see what ${KATE_FIRST} receives` : `Live in ${KATE_FIRST}'s workspace`}
              </span>
              <span className="block truncate text-[0.9rem] font-semibold">{live.title}</span>
              {live.goals && <span className="block truncate text-[0.78rem] text-ink-soft">{live.goals}</span>}
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
 * The link between the two sides: WhatsApp. Across on large screens, down on phones. When an
 * enquiry is sent, it travels along it.
 */
function Connector({ sendKey, sending }: { sendKey: number; sending: boolean }) {
  const packet = (axis: "x" | "y") => (
    <motion.span
      key={`${axis}-${sendKey}`}
      initial={axis === "x" ? { left: "0%", opacity: 0 } : { top: "0%", opacity: 0 }}
      animate={axis === "x" ? { left: ["0%", "100%"], opacity: [0, 1, 1, 0] } : { top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1, ease: "easeInOut", times: [0, 0.15, 0.85, 1] }}
      className={clsx(
        "absolute grid h-7 w-7 place-items-center rounded-full bg-wa text-[#06331f] shadow-[0_0_0_6px_rgb(37_211_102/0.18)]",
        axis === "x" ? "-ml-3.5 -mt-3.5" : "-ml-3.5 -mt-3.5 left-1/2",
      )}
    >
      <WhatsAppIcon className="h-3.5 w-3.5" />
    </motion.span>
  );

  return (
    <div aria-hidden className="relative">
      {/* phones: down, from the check to Kate's side */}
      <div className="relative mx-auto my-3 h-24 w-px lg:hidden">
        <span className="absolute inset-y-0 left-0 border-l border-dashed border-cream/25" />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[0.78rem] text-cream/55">via WhatsApp</span>
        {sending && packet("y")}
      </div>
      {/* large screens: across, level with the message on Kate's side */}
      <div className="absolute inset-x-3 top-[10.4rem] hidden lg:block">
        <span className="absolute inset-x-0 top-0 border-t border-dashed border-cream/25" />
        <span className="absolute right-0 top-0 h-2 w-2 -translate-y-1/2 translate-x-1/2 rotate-45 border-r border-t border-cream/40" />
        <span className="absolute inset-x-0 top-3 whitespace-nowrap text-center text-[0.78rem] text-cream/55">via WhatsApp</span>
        {sending && packet("x")}
      </div>
    </div>
  );
}

function TryPill({ direction, still }: { direction: "left" | "down"; still: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-cream py-1.5 pl-3 pr-3.5 text-[0.85rem] font-semibold text-forest-deep shadow-float">
      {direction === "left" && (
        <motion.span aria-hidden animate={still ? undefined : { x: [0, -3, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <Arrow className="h-3.5 w-3.5 rotate-180" />
        </motion.span>
      )}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-moss opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
      </span>
      Try it yourself
      <span className="font-normal text-ink-soft">· tap Start</span>
      {direction === "down" && (
        <motion.span aria-hidden animate={still ? undefined : { y: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <Arrow className="h-3.5 w-3.5 rotate-90" />
        </motion.span>
      )}
    </span>
  );
}
