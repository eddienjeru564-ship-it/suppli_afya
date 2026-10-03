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
import { Check } from "@/components/ui/icons";
import { TESTIMONIALS } from "@/config/testimonials";

/** Things a careful distributor checks before trusting a tool with their customers. Each is true today. */
const TRUST = [
  {
    title: "Independent of BF Suma",
    body: "Suppli Afya is an independent service, not part of BF Suma. Your BF Suma distributor account, upline and stock purchases stay exactly as they are.",
  },
  {
    title: "Your customers stay yours",
    body: "Suppli Afya never sells your customers' details, shares them with other distributors or contacts your customers.",
  },
  {
    title: "Careful with health information",
    body: "The assessment provides general wellness information. It does not diagnose or replace advice from a qualified health professional.",
  },
  {
    title: "No contract",
    body: "Pay monthly by M-Pesa or card. There is no long-term contract, and you can stop when you choose.",
  },
];

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
    <section ref={sectionRef} id="try" className="relative overflow-clip bg-forest-deep py-24 text-cream sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(90_122_83/0.35),transparent)]" />
      </div>

      <div className="container-x relative">
        <Reveal>
          <h2 className="display-lg max-w-[20ch]">Example Distributor Page</h2>
          <p className="mt-6 max-w-[34rem] text-[1.1rem] leading-relaxed text-cream/75">
            This is an example page for {DEMO_DISTRIBUTOR.name}, a BF Suma distributor. Yours would be set up the same way,
            with your name. Answer the questions as a customer would, and you&apos;ll see what {DEMO_DISTRIBUTOR.firstName}{" "}
            receives as you go.
          </p>
        </Reveal>

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-24">
            <PhoneFrame className="mx-auto">
              <HealthCheck distributor={DEMO_DISTRIBUTOR} mode="embedded" onAnswersChange={onAnswers} onResult={onResult} />
            </PhoneFrame>
            <p className="mt-4 text-center text-[0.8rem] text-cream/55">Demo only. Nothing you enter is saved or sent.</p>
          </Reveal>

          <Reveal delay={0.1} className="lg:pt-6">
            <div ref={panelRef} className="max-w-[30rem] scroll-mt-24" id="what-reaches-you">
              <h3 className="font-display text-[1.7rem] leading-tight">What {DEMO_DISTRIBUTOR.firstName} receives</h3>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-cream/70">
                {result
                  ? `${result.profile.name || "The customer"} has finished. On a real page, the customer would now send this to ${DEMO_DISTRIBUTOR.firstName} on WhatsApp, and the enquiry would already be saved in ${DEMO_DISTRIBUTOR.firstName}'s workspace.`
                  : `Each answer appears here as it's given. By the time a customer sends a message, ${DEMO_DISTRIBUTOR.firstName} can already see what they're looking for, which products were suggested and anything important they mentioned, such as medicine they take.`}
              </p>
              <div className="mt-7">
                <LivePanel answers={answers} result={result} distributor={DEMO_DISTRIBUTOR} />
              </div>
              <Link
                href="/check"
                className="group mt-8 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-cream underline-offset-4 hover:underline"
              >
                Open {DEMO_DISTRIBUTOR.firstName}&apos;s page on its own <Arrow />
              </Link>
            </div>

            <ul className="mt-12 grid max-w-[36rem] grid-cols-1 gap-x-8 gap-y-7 border-t border-cream/10 pt-10 sm:grid-cols-2">
              {TRUST.map((t) => (
                <li key={t.title}>
                  <h3 className="flex items-center gap-2 text-[1.02rem] font-semibold text-cream">
                    <Check className="h-4 w-4 shrink-0 text-sage" />
                    {t.title}
                  </h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-cream/70">{t.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
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
              {!result && <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-moss opacity-60" />}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-moss" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.7rem] font-semibold text-moss">
                {result ? `Finished · see what ${DEMO_DISTRIBUTOR.firstName} receives` : `Live in ${DEMO_DISTRIBUTOR.firstName}'s workspace`}
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
