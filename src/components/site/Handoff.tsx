"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { WhatsAppIcon } from "@/components/ui/icons";
import { KATE, SARAH, SARAH_MESSAGE, SUGGESTED, kes } from "./story";

/** What each part of the message tells the distributor, keyed by how its line starts. */
const PARTS = [
  { starts: "*About me:*", title: "Who she is", body: "Her name and age, so you can greet her properly." },
  { starts: "*My goals:*", title: "What she wants most", body: "Her goals, in the order she ranked them." },
  { starts: "*Suggested plan:*", title: "What the assessment suggested", body: "The products, and anything worth considering later." },
  { starts: "*I'd like to start with:*", title: "How she'd like to start", body: "One product, a focused plan or everything at once." },
  { starts: "Ref:", title: "A reference", body: "The same code is on her record in your workspace." },
];
const markerFor = (line: string) => PARTS.findIndex((p) => line.startsWith(p.starts) || (p.starts === "*Suggested plan:*" && line.startsWith("*Maybe later:*")));

/**
 * The moment the customer reaches the distributor: the exact message WhatsApp opens with,
 * each part labelled. When it scrolls into view the plan is sent, then Kate starts typing.
 */
export function Handoff() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  // The finished conversation is in the HTML. Once scripts run, if it hasn't been seen yet, it
  // resets to just the button, then plays when it scrolls into view: sent, typing, Kate's reply.
  const [stage, setStage] = useState(3); // 0 button, 1 sent, 2 typing, 3 replied
  const armed = useRef(false);

  useEffect(() => {
    if (reduce) return;
    const frame = requestAnimationFrame(() => {
      const el = ref.current;
      if (el && el.getBoundingClientRect().top > window.innerHeight * 0.7) {
        armed.current = true;
        setStage(0);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  useEffect(() => {
    if (!inView || !armed.current) return;
    const timers = [setTimeout(() => setStage(1), 600), setTimeout(() => setStage(2), 2400), setTimeout(() => setStage(3), 4100)];
    return () => timers.forEach(clearTimeout);
  }, [inView]);
  const shown = reduce ? 3 : stage;

  const lines = SARAH_MESSAGE.split("\n");
  const [coffee, joints] = SUGGESTED;

  return (
    <section id="whatsapp" className="bg-paper py-24 sm:py-32">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <Reveal>
            <div className="eyebrow">The WhatsApp handoff</div>
            <h2 className="display-lg mt-5 max-w-[15ch] text-ink">She reaches you, with her answers already written</h2>
            <p className="lede mt-6 max-w-[34rem]">
              There&apos;s no checkout and no chatbot in between. When a customer taps “Send my plan”, WhatsApp opens on
              her phone with a message to you. You reply in your own words, from your own number.
            </p>
          </Reveal>
          <ol className="mt-10 hidden max-w-[32rem] gap-4 lg:grid">
            {PARTS.map((p, n) => (
              <Reveal as="li" key={p.title} delay={0.04 * n} className="grid grid-cols-[1.75rem_1fr] gap-3">
                <Num n={n + 1} />
                <p className="text-[0.98rem] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{p.title}.</span> {p.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>

        <div ref={ref}>
          <div aria-hidden className="relative mx-auto max-w-[29rem]">
            {/* The button on her plan that starts it. */}
            <div
              className={clsx(
                "relative z-10 mx-6 -mb-6 rounded-2xl bg-forest p-4 text-cream shadow-float transition-[opacity,transform] duration-500 sm:mx-10",
                shown >= 1 && "translate-y-1 opacity-90",
              )}
            >
              <div className="font-display text-[1.05rem] leading-tight">Want help deciding? Talk it through with {KATE.first}</div>
              <div
                className={clsx(
                  "mt-3 flex h-10 items-center justify-center gap-2 rounded-full bg-wa text-[0.88rem] font-semibold text-[#06331f] transition-transform duration-300",
                  shown === 0 && !reduce && inView && "scale-[1.03] ring-4 ring-wa/35",
                )}
              >
                <WhatsAppIcon className="h-4 w-4" /> Send my plan to {KATE.first}
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] bg-wa-bg shadow-float ring-1 ring-ink/10">
              <div className="flex items-center gap-2.5 bg-wa-deep px-4 pb-3 pt-9 text-white">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dfe5e7] text-[0.85rem] font-semibold text-wa-deep">
                  {KATE.first[0]}
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.95rem] font-semibold">{KATE.name}</span>
                  <span className="block text-[0.74rem] text-white/75">{shown === 2 ? "typing…" : "online"}</span>
                </span>
              </div>

              <div className="flex min-h-[25rem] flex-col justify-end gap-2 px-3 py-4 sm:px-4">
                <AnimatePresence initial={false}>
                  {shown >= 1 && (
                    <motion.div
                      key="mine"
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="ml-auto w-[92%] rounded-xl rounded-tr-none bg-wa-bubble px-3.5 pb-2 pt-3 text-[0.88rem] leading-[1.5] text-[#111b21] shadow-sm"
                    >
                      {lines.map((line, n) => {
                        const m = markerFor(line);
                        const first = m >= 0 && lines.findIndex((l) => markerFor(l) === m) === n;
                        return (
                          <div key={n} className="relative min-h-[0.75em] pr-7">
                            <WaLine text={line} />
                            {first && <Num n={m + 1} className="absolute right-0 top-0.5 scale-90" />}
                          </div>
                        );
                      })}
                      <div className="mt-1 text-right text-[0.7rem] text-[#54656f]">
                        9:14 pm <span className={shown >= 2 ? "text-[#34b7f1]" : undefined}>✓✓</span>
                      </div>
                    </motion.div>
                  )}
                  {shown >= 3 && (
                    <motion.div
                      key="reply"
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="w-[85%] rounded-xl rounded-tl-none bg-white px-3.5 pb-2 pt-2.5 text-[0.88rem] leading-[1.5] text-[#111b21] shadow-sm"
                    >
                      Hi {SARAH.name}! The coffee is {kes(coffee.price)} and {joints.short} is {kes(joints.price)}. I can deliver both
                      tomorrow. Shall I?
                      <div className="mt-1 text-right text-[0.7rem] text-[#54656f]">9:16 pm</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2.5">
                <div className="h-9 flex-1 rounded-full bg-white px-4 text-[0.82rem] leading-9 text-[#54656f]">Message</div>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-wa-deep text-white">➤</span>
              </div>
            </div>
          </div>

          <ol className="mt-8 grid gap-3 lg:hidden">
            {PARTS.map((p, n) => (
              <li key={p.title} className="grid grid-cols-[1.75rem_1fr] gap-3">
                <Num n={n + 1} />
                <p className="text-[0.95rem] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{p.title}.</span> {p.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Num({ n, className }: { n: number; className?: string }) {
  return (
    <span className={clsx("grid h-6 w-6 place-items-center rounded-full bg-clay text-[0.75rem] font-bold text-cream", className)}>{n}</span>
  );
}

/** One line of a WhatsApp message, with *bold* the way WhatsApp shows it. */
function WaLine({ text }: { text: string }) {
  if (!text) return <span>&nbsp;</span>;
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, j) =>
        part.startsWith("*") && part.endsWith("*") ? <b key={j}>{part.slice(1, -1)}</b> : <Fragment key={j}>{part}</Fragment>,
      )}
    </>
  );
}
