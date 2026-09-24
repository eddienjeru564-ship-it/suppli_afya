"use client";

import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { deriveProfile, goalLabel, profileFlags, pruneAnswers, type Answers, type EngineResult } from "@/engine";
import { HealthCheck } from "@/components/check/HealthCheck";
import { LivePanel } from "@/components/check/LivePanel";
import { PhoneFrame } from "@/components/check/PhoneFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Button";

export function Demo() {
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<EngineResult | null>(null);
  const onAnswers = useCallback((a: Answers) => setAnswers(a), []);
  const onResult = useCallback((r: EngineResult | null) => setResult(r), []);
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { margin: "-30% 0px -30% 0px" });
  const panelInView = useInView(panelRef, { margin: "0px 0px -20% 0px" });

  // Phones: the panel sits below the check, so show a small live summary while answering.
  const live = useMemo(() => {
    const p = deriveProfile(pruneAnswers(answers));
    if (!p.name) return null;
    const flags = profileFlags(p).length;
    return {
      title: [p.name, p.age].filter(Boolean).join(", "),
      detail: [p.goals.map(goalLabel).join(", "), flags ? `${flags} thing${flags > 1 ? "s" : ""} to be careful about` : ""]
        .filter(Boolean)
        .join(" · "),
    };
  }, [answers]);
  const showChip = Boolean(live) && sectionInView && !panelInView;

  return (
    <section ref={sectionRef} id="check" className="relative overflow-clip bg-forest-deep py-24 text-cream sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(90_122_83/0.35),transparent)]" />
      </div>

      <div className="container-x relative">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <div className="eyebrow !text-ochre">The health check</div>
            <h2 className="display-lg mt-5 max-w-[14ch]">Try it the way your customers will</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[34rem] text-[1.1rem] leading-relaxed text-cream/75 lg:ml-auto">
              Go through it as a customer would, with your own answers or someone else&apos;s. As you answer, you&apos;ll
              see what reaches you: the lead filling in, then the WhatsApp message and the notes in your portal.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-24">
            <PhoneFrame className="mx-auto">
              <HealthCheck distributor={DEMO_DISTRIBUTOR} mode="embedded" onAnswersChange={onAnswers} onResult={onResult} />
            </PhoneFrame>
            <p className="mt-4 text-center text-[0.8rem] text-cream/55">Demo only. Nothing you enter is saved or sent.</p>
          </Reveal>

          <Reveal delay={0.1} className="lg:pt-6">
            <div ref={panelRef} className="max-w-[30rem] scroll-mt-24" id="what-reaches-you">
              <h3 className="font-display text-[1.7rem] leading-tight">What reaches you</h3>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-cream/70">
                {result
                  ? `${result.profile.name || "Your customer"} has finished. On a real link, one tap sends this to your WhatsApp, and the lead is already waiting in your portal.`
                  : "Your customer's details come together here as they answer. By the time they message you, you already know what they're looking for and what to be careful with."}
              </p>
              <div className="mt-7">
                <LivePanel answers={answers} result={result} distributor={DEMO_DISTRIBUTOR} />
              </div>
              <Link
                href={`/d/${DEMO_DISTRIBUTOR.slug}`}
                className="group mt-8 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-cream underline-offset-4 hover:underline"
              >
                See the whole shop your customers get <Arrow />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
      <AnimatePresence>
        {showChip && live && (
          <motion.button
            type="button"
            onClick={() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 top-[4.6rem] z-40 flex items-center gap-3 rounded-2xl bg-paper p-3 text-left text-ink shadow-float ring-1 ring-ink/10 lg:hidden"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {!result && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-60" />}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-moss" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.7rem] font-semibold text-moss">
                {result ? "Finished · see what reaches Kate" : "Live in Kate's portal"}
              </span>
              <span className="block truncate text-[0.9rem] font-semibold">{live.title}</span>
              {live.detail && <span className="block truncate text-[0.78rem] text-ink-soft">{live.detail}</span>}
            </span>
            <span className="shrink-0 rounded-full bg-forest px-3 py-1.5 text-[0.72rem] font-semibold text-cream">See it</span>
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}
