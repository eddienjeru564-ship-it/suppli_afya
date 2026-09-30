"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import {
  ChatScreen,
  MockPhone,
  OrderScreen,
  PageScreen,
  QuestionScreen,
  RecordScreen,
  ReorderScreen,
  ScanScreen,
  StatusScreen,
  SuggestionsScreen,
  TodayScreen,
  ViewLabel,
} from "./Screens";
import { KATE, SARAH } from "./story";

export const STAGES = ["Attract", "Qualify", "Recommend", "Convert", "Follow up", "Reorder"];

type Who = "customer" | "distributor";
interface Step {
  title: string;
  body: string;
  stage: number;
  who: Who;
  screen: () => ReactNode;
}

const STEPS: Step[] = [
  {
    title: `${KATE.first} shares her page`,
    body: "Her QR code is on her business cards and the bag every order goes out in. The link is on her WhatsApp status.",
    stage: 0,
    who: "distributor",
    screen: () => <StatusScreen />,
  },
  {
    title: `${SARAH.name} scans it`,
    body: "With her phone's camera. There's no app to download and no account to make.",
    stage: 0,
    who: "customer",
    screen: () => <ScanScreen />,
  },
  {
    title: `She lands on ${KATE.first}'s page`,
    body: `${KATE.first}'s name, what she does, and one clear place to start.`,
    stage: 0,
    who: "customer",
    screen: () => <PageScreen />,
  },
  {
    title: "She starts the assessment",
    body: "One question at a time, about three minutes in all.",
    stage: 1,
    who: "customer",
    screen: () => <PageScreen pressed />,
  },
  {
    title: "She says what she's looking for",
    body: "Her goals and her routine, and anything that matters for safety, like medicine or pregnancy.",
    stage: 1,
    who: "customer",
    screen: () => <QuestionScreen />,
  },
  {
    title: "She sees what could fit, and why",
    body: "Two products, each with the reason it came up. Anything that doesn't suit her is left out, and she's told why.",
    stage: 2,
    who: "customer",
    screen: () => <SuggestionsScreen />,
  },
  {
    title: `She chooses to talk to ${KATE.first}`,
    body: `“Want help deciding?” One tap and she's on her way to ${KATE.first}'s WhatsApp.`,
    stage: 3,
    who: "customer",
    screen: () => <SuggestionsScreen highlight />,
  },
  {
    title: "WhatsApp opens, already written",
    body: "Her goals and the suggested products go with her, so she doesn't have to explain herself.",
    stage: 3,
    who: "customer",
    screen: () => <ChatScreen stage={1} />,
  },
  {
    title: `${KATE.first} picks it up`,
    body: `She knows what ${SARAH.name} wants before saying hello, so she answers with prices instead of questions.`,
    stage: 3,
    who: "customer",
    screen: () => <ChatScreen stage={3} />,
  },
  {
    title: `${SARAH.name} buys`,
    body: `${KATE.first} records the order and the M-Pesa payment in a couple of taps.`,
    stage: 3,
    who: "distributor",
    screen: () => <OrderScreen />,
  },
  {
    title: `${SARAH.name} is now ${KATE.first}'s customer`,
    body: "What she was looking for, what she was suggested and what she bought, in one record.",
    stage: 4,
    who: "distributor",
    screen: () => <RecordScreen />,
  },
  {
    title: `${KATE.first} knows when to check in`,
    body: `Two weeks later, ${SARAH.name} shows up on ${KATE.first}'s list for the day, with a message ready to send.`,
    stage: 4,
    who: "distributor",
    screen: () => <TodayScreen />,
  },
  {
    title: `${SARAH.name} orders again`,
    body: "Before she runs out, not after she's found someone else.",
    stage: 5,
    who: "customer",
    screen: () => <ReorderScreen />,
  },
];

/** Four chapters of the one story. On phones each gets one screen instead of a phone that follows you. */
const ACTS = [
  { label: "Attract", title: `${KATE.first} shares her page`, from: 0, to: 2, cover: 1 },
  { label: "Qualify and recommend", title: `${SARAH.name} finds where to start`, from: 3, to: 6, cover: 5 },
  { label: "Convert", title: `${KATE.first} makes the sale`, from: 7, to: 9, cover: 8 },
  { label: "Follow up and reorder", title: `${KATE.first} keeps ${SARAH.name}`, from: 10, to: 12, cover: 11 },
];

export function Journey() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  // The phone shows whichever step is crossing the middle of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const el of refs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  const step = STEPS[active];

  return (
    <section id="how" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <Reveal>
              <div className="eyebrow">How it works</div>
              <h2 className="display-lg mt-5 max-w-[17ch] text-ink">
                From “which product should I take?” to a customer who comes back
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lede mt-6 max-w-[36rem]">
                Here&apos;s one customer&apos;s path, start to finish. {KATE.name} sells BF Suma products. {SARAH.name}{" "}
                has never bought from her. Suppli Afya carries her from the first scan to the second order, and{" "}
                {KATE.first} does the selling.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <Flywheel className="mx-auto w-full max-w-[20rem]" />
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-16 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-20">
          <div className="grid grid-cols-1">
            {ACTS.map((act, a) => (
              <div key={act.label} className={clsx(a > 0 && "pt-14 lg:pt-10")}>
                <div className="text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-clay">{act.label}</div>
                <h3 className="mt-2 font-display text-[1.9rem] leading-tight text-ink">{act.title}</h3>
                <div aria-hidden className="mt-8 lg:hidden">
                  <div className="mb-3 text-center">
                    <ViewLabel who={STEPS[act.cover].who} />
                  </div>
                  <MockPhone size="sm">{STEPS[act.cover].screen()}</MockPhone>
                </div>
                <ol start={act.from + 1} className="mt-6 grid grid-cols-1">
                  {STEPS.slice(act.from, act.to + 1).map((s, j) => {
                    const i = act.from + j;
                    return (
                      <li
                        key={s.title}
                        ref={(el) => {
                          refs.current[i] = el;
                        }}
                        data-step={i}
                        className="grid grid-cols-[2.5rem_1fr] gap-4 py-3 lg:min-h-[26vh] lg:py-6"
                      >
                        <span
                          aria-hidden
                          className={clsx(
                            "grid h-10 w-10 place-items-center rounded-full border font-display text-[1.05rem] transition-colors duration-300",
                            i === active ? "border-forest bg-forest text-cream" : "border-ink/15 text-ink",
                          )}
                        >
                          {i + 1}
                        </span>
                        <div className="pt-1.5">
                          <h4 className="font-display text-[1.45rem] leading-tight text-ink">{s.title}</h4>
                          <p className="mt-1.5 max-w-[32rem] text-[1rem] leading-relaxed text-ink-soft">{s.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>

          {/* Desktop: the phone stays in view and follows the story. */}
          <div aria-hidden className="hidden lg:block">
            <div className="sticky top-24">
              <div className="mb-4 flex justify-center">
                <ViewLabel who={step.who} />
              </div>
              <MockPhone>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    className="absolute inset-0"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step.screen()}
                  </motion.div>
                </AnimatePresence>
              </MockPhone>
              <ol className="mt-5 flex flex-wrap justify-center gap-1.5" aria-label="Where this step sits">
                {STAGES.map((s, i) => (
                  <li
                    key={s}
                    aria-current={i === step.stage ? "step" : undefined}
                    className={clsx(
                      "rounded-full px-2.5 py-1 text-[0.72rem] font-semibold transition-colors duration-300",
                      i === step.stage ? "bg-forest text-cream" : "bg-ink/[0.06] text-ink-soft",
                    )}
                  >
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The six stages as one loop, not six features: Kate's page brings Sarah in, and the reorder
 * brings her back around.
 */
export function Flywheel({ className }: { className?: string }) {
  const R = 38;
  const at = (deg: number) => ({ x: 50 + R * Math.cos((deg * Math.PI) / 180), y: 50 + R * Math.sin((deg * Math.PI) / 180) });
  return (
    <div className={clsx("relative aspect-square", className)}>
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full text-ink/25">
        <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.2 1.6" />
        {STAGES.map((_, i) => {
          const deg = -90 + i * 60 + 30;
          const p = at(deg);
          return (
            <path
              key={i}
              d="M-1.4,-1.8 L0.6,0 L-1.4,1.8"
              transform={`translate(${p.x} ${p.y}) rotate(${deg + 90})`}
              fill="none"
              stroke="var(--color-clay)"
              strokeWidth="0.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-[30%] grid place-items-center rounded-full bg-paper text-center shadow-card ring-1 ring-ink/10">
        <span className="px-2 font-display text-[1rem] leading-tight text-ink sm:text-[1.1rem]">
          One loop,
          <br />
          <span className="italic text-forest">{KATE.first}&apos;s customers</span>
        </span>
      </div>
      <ol aria-label="The loop, in order">
        {STAGES.map((s, i) => {
          const p = at(-90 + i * 60);
          return (
            <li
              key={s}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-forest px-2.5 py-1 text-[0.72rem] font-semibold text-cream shadow-card sm:text-[0.78rem]"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {s}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
