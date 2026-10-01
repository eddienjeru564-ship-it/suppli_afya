"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { WhatsAppIcon } from "@/components/ui/icons";
import {
  ChatScreen,
  EnquiryScreen,
  MockPhone,
  OrderScreen,
  PageScreen,
  QuestionScreen,
  StatusScreen,
  SuggestionsScreen,
  TodayBeforeScreen,
  TodayScreen,
} from "./Screens";
import { KATE, SARAH } from "./story";

const ease = [0.22, 1, 0.36, 1] as const;
const STEP_MS = 6000;

type Side = "sarah" | "kate";

interface Step {
  verb: string;
  title: string;
  body: string;
  /** Whose phone the step is about (the other is dimmed). */
  side: Side;
  /** A WhatsApp message crossing from one phone to the other. */
  travel?: "toKate" | "toSarah";
  sarah: (live: boolean) => ReactNode;
  kate: (live: boolean) => ReactNode;
}

/** The loop the whole product serves, one verb per step: attract, understand, recommend, connect, sell, follow up, reorder. */
const STEPS: Step[] = [
  {
    verb: "Attract",
    title: `${SARAH.name} opens ${KATE.first}'s page`,
    body: `She scanned the QR code on ${KATE.first}'s card. The same link is on ${KATE.first}'s WhatsApp status and in her bio. There's no app to install and no account to make.`,
    side: "sarah",
    sarah: () => <PageScreen />,
    kate: () => <StatusScreen />,
  },
  {
    verb: "Understand",
    title: "She answers a few questions",
    body: "What she'd like to improve, her routine, and anything to be careful with, like medicine or pregnancy. One question at a time, about three minutes.",
    side: "sarah",
    sarah: (live) => <QuestionScreen live={live} />,
    kate: () => <TodayBeforeScreen />,
  },
  {
    verb: "Recommend",
    title: "She sees what could suit her, and why",
    body: "Two products, each with the reason it came up. Anything that doesn't suit her is left out, and she's told why.",
    side: "sarah",
    sarah: (live) => <SuggestionsScreen live={live} highlight />,
    kate: () => <TodayBeforeScreen />,
  },
  {
    verb: "Connect",
    title: `She sends her plan to ${KATE.first}`,
    body: `One tap opens WhatsApp with her answers already written. At the same moment her enquiry is saved in ${KATE.first}'s workspace, with a first reply ready.`,
    side: "kate",
    travel: "toKate",
    sarah: (live) => <ChatScreen stage="sent" live={live} />,
    kate: (live) => <EnquiryScreen live={live} />,
  },
  {
    verb: "Sell",
    title: `${KATE.first} replies, and ${SARAH.name} buys`,
    body: `${KATE.first} already knows what ${SARAH.name} wants, so she answers with prices instead of questions. ${SARAH.name} pays by M-Pesa, and ${KATE.first} records the order in a couple of taps.`,
    side: "kate",
    sarah: (live) => <ChatScreen stage="sold" live={live} />,
    kate: (live) => <OrderScreen live={live} />,
  },
  {
    verb: "Follow up",
    title: `Two weeks later, ${KATE.first} checks in`,
    body: `${SARAH.name} is on ${KATE.first}'s list for the day, with a message ready to send. One tap sends it on WhatsApp.`,
    side: "kate",
    travel: "toSarah",
    sarah: (live) => <ChatScreen stage="checkin" live={live} />,
    kate: (live) => <TodayScreen kind="checkin" live={live} />,
  },
  {
    verb: "Reorder",
    title: `${KATE.first} knows when ${SARAH.name} is due`,
    body: `Suppli Afya knows how long each product lasts. Before ${SARAH.name} runs out she's on ${KATE.first}'s list again, and the next order starts with one message.`,
    side: "kate",
    travel: "toSarah",
    sarah: (live) => <ChatScreen stage="reorder" live={live} />,
    kate: (live) => <TodayScreen kind="reorder" live={live} />,
  },
];

/**
 * One customer's whole journey, step by step, with both phones side by side: what happens on
 * Sarah's shows up on Kate's. It plays on its own while it's on screen; choosing a step stops
 * that, and there's a pause button. With reduced motion nothing plays or animates.
 */
export function Tour() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  // Phones show one phone at a time; this flips to the other side of the same step.
  const [flip, setFlip] = useState(false);

  const autoplay = playing && inView && !reduce;
  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => {
      setI((n) => (n + 1) % STEPS.length);
      setFlip(false);
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [autoplay, i]);

  const go = (n: number) => {
    setI((n + STEPS.length) % STEPS.length);
    setFlip(false);
    setPlaying(false);
  };

  const step = STEPS[i];
  const live = !reduce;
  const phoneSide: Side = flip ? (step.side === "sarah" ? "kate" : "sarah") : step.side;

  return (
    <section id="how" className="relative overflow-clip bg-forest-deep py-24 text-cream sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-10 h-[36rem] w-[50rem] rounded-full bg-[radial-gradient(closest-side,rgb(90_122_83/0.3),transparent)]" />
      </div>

      <div ref={ref} className="container-x relative">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <Header />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
          {/* The steps. On phones they're a row of numbers above the step's text. */}
          <div>
            <ol className="hidden gap-1.5 lg:grid">
              {STEPS.map((s, n) => {
                const on = n === i;
                return (
                  <li key={s.verb}>
                    <button
                      type="button"
                      onClick={() => go(n)}
                      aria-current={on ? "step" : undefined}
                      className={clsx(
                        "relative w-full overflow-hidden rounded-2xl px-4 py-3 text-left transition-colors duration-300",
                        on ? "bg-cream/[0.09] ring-1 ring-cream/15" : "hover:bg-cream/[0.04]",
                      )}
                    >
                      <span className="flex items-baseline gap-3">
                        <span className={clsx("w-5 shrink-0 text-[0.8rem] font-semibold tabular-nums", on ? "text-[#dba64e]" : "text-cream/45")}>
                          {n + 1}
                        </span>
                        <span className="min-w-0">
                          <span className={clsx("block text-[0.78rem] font-semibold", on ? "text-[#dba64e]" : "text-cream/55")}>{s.verb}</span>
                          <span className={clsx("block text-[1rem] font-medium leading-snug", on ? "text-cream" : "text-cream/70")}>{s.title}</span>
                          <span className={on ? "mt-1.5 block text-[0.92rem] leading-relaxed text-cream/70" : "sr-only"}>{s.body}</span>
                        </span>
                      </span>
                      {on && autoplay && (
                        <motion.span
                          key={`p${i}`}
                          aria-hidden
                          className="absolute bottom-0 left-0 h-[2px] bg-ochre/70"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="lg:hidden">
              <ol className="flex justify-between gap-1" aria-label="Steps">
                {STEPS.map((s, n) => (
                  <li key={s.verb} className="flex-1">
                    <button
                      type="button"
                      onClick={() => go(n)}
                      aria-current={n === i ? "step" : undefined}
                      aria-label={`Step ${n + 1}: ${s.verb}`}
                      className="grid h-11 w-full place-items-center"
                    >
                      <span
                        className={clsx(
                          "grid h-8 w-8 place-items-center rounded-full text-[0.82rem] font-semibold transition-colors",
                          n === i ? "bg-ochre text-forest-deep" : n < i ? "bg-cream/20 text-cream" : "bg-cream/[0.08] text-cream/60",
                        )}
                      >
                        {n + 1}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="mt-5 min-h-[10.5rem]" aria-live="polite">
                <div className="text-[0.8rem] font-semibold text-[#dba64e]">
                  {i + 1}. {step.verb}
                </div>
                <h3 className="mt-1 font-display text-[1.6rem] leading-tight text-cream">{step.title}</h3>
                <p className="mt-2 text-[1rem] leading-relaxed text-cream/75">{step.body}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(i - 1)}
                aria-label="Previous step"
                className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:bg-cream/10"
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                onClick={() => go(i + 1)}
                aria-label="Next step"
                className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:bg-cream/10"
              >
                <Chevron dir="right" />
              </button>
              {!reduce && (
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="ml-1 h-11 rounded-full px-4 text-[0.9rem] font-semibold text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  {playing ? "Pause" : "Play the steps"}
                </button>
              )}
            </div>
          </div>

          {/* Both phones on large screens; one at a time, with a switch, on smaller ones. */}
          <div className="relative">
            <div role="group" aria-label="Whose phone to show" className="mx-auto mb-4 flex w-fit rounded-full bg-cream/[0.08] p-1 lg:hidden">
              {(["sarah", "kate"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  aria-pressed={phoneSide === side}
                  onClick={() => {
                    setFlip(side !== step.side);
                    setPlaying(false);
                  }}
                  className={clsx(
                    "h-11 rounded-full px-4 text-[0.88rem] font-semibold transition-colors",
                    phoneSide === side ? "bg-cream text-forest-deep" : "text-cream/70 hover:text-cream",
                  )}
                >
                  {side === "sarah" ? `${SARAH.name}'s phone` : `${KATE.first}'s phone`}
                </button>
              ))}
            </div>
            <div aria-hidden>
              <div className="hidden items-start justify-center gap-6 lg:flex xl:gap-10">
                <PhoneColumn label={`${SARAH.name}'s phone`} sub="The customer" dim={step.side !== "sarah"}>
                  <Screen k={`s${i}`}>{step.sarah(live)}</Screen>
                </PhoneColumn>
                <PhoneColumn label={`${KATE.first}'s phone`} sub="The distributor" dim={step.side !== "kate"}>
                  <Screen k={`k${i}`}>{step.kate(live)}</Screen>
                </PhoneColumn>
                <Travel key={`t${i}`} dir={step.travel} reduce={reduce} />
              </div>

              <div className="lg:hidden">
                <MockPhone className="ring-1 ring-cream/10">
                  <Screen k={`m${i}${phoneSide}`}>{phoneSide === "sarah" ? step.sarah(live) : step.kate(live)}</Screen>
                </MockPhone>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <>
      <div>
        <div className="eyebrow !text-ochre">How it works</div>
        <h2 className="display-lg mt-5 max-w-[16ch]">From a question to a second order, in seven steps</h2>
      </div>
      <p className="max-w-[32rem] text-[1.1rem] leading-relaxed text-cream/75 lg:ml-auto">
        One customer, start to finish, from both sides: what happens on {SARAH.name}&apos;s phone shows up on{" "}
        {KATE.first}&apos;s.
      </p>
    </>
  );
}

function PhoneColumn({ label, sub, dim, children }: { label: string; sub: string; dim: boolean; children: ReactNode }) {
  return (
    <div className={clsx("transition-transform duration-500", dim && "scale-[0.97]")}>
      <div className={clsx("mb-4 text-center transition-opacity duration-500", dim && "opacity-60")}>
        <div className="text-[0.95rem] font-semibold text-cream">{label}</div>
        <div className="text-[0.78rem] text-cream/70">{sub}</div>
      </div>
      <div className="relative">
        <MockPhone size="sm" className="ring-1 ring-cream/10 xl:h-[34rem] xl:w-[17.5rem]">
          {children}
        </MockPhone>
        {/* The other side of the step sits back behind a scrim, rather than fading its own text. */}
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 rounded-[2.4rem] bg-forest-deep/55 transition-opacity duration-500",
            dim ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </div>
  );
}

function Screen({ k, children }: { k: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={k}
        className="absolute inset-0"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** A WhatsApp message crossing between the two phones. */
function Travel({ dir, reduce }: { dir?: "toKate" | "toSarah"; reduce: boolean }) {
  if (!dir || reduce) return null;
  const [from, to] = dir === "toKate" ? [-140, 140] : [140, -140];
  return (
    <motion.span
      className="pointer-events-none absolute left-1/2 top-[45%] z-30 -ml-[22px] grid h-11 w-11 place-items-center rounded-full bg-wa text-[#06331f] shadow-float"
      initial={{ x: from, opacity: 0, scale: 0.6 }}
      animate={{ x: [from, from, to, to], opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8] }}
      transition={{ duration: 1.4, delay: 0.2, ease, times: [0, 0.2, 0.8, 1] }}
    >
      <WhatsAppIcon className="h-5 w-5" />
    </motion.span>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4">
      <path d={dir === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
