"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { MONTHLY_PRICE, PLAN, SETUP_PRICE, amountDue, kes } from "@/config/plans";
import { Check } from "@/components/ui/icons";
import { MPesa } from "@/components/ui/KeepTogether";

/**
 * What you're buying, kept in view through checkout: what is paid today (setup and the first month,
 * or one month on a renewal), what follows, and everything included.
 */
export function PlanSummary({ renewing = false }: { renewing?: boolean }) {
  const [open, setOpen] = useState(false);
  const today = amountDue(renewing);

  return (
    <div className="rounded-[1.5rem] bg-forest text-cream shadow-float lg:sticky lg:top-8">
      {/* phones: a compact bar that expands */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-5 text-left lg:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="block text-[0.75rem] font-semibold text-cream/60">{renewing ? "Renewing" : "Today"}</span>
          <span className="block font-display text-[1.45rem] leading-tight">{kes(today)}</span>
          <span className="block text-[0.82rem] text-cream/65">{renewing ? "For one month" : `Then ${MONTHLY_PRICE} a month`}</span>
        </span>
        <span className="shrink-0 text-[0.8rem] font-semibold text-sage">{open ? "Hide" : "What's included"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden"
          >
            <Details renewing={renewing} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden p-7 lg:block">
        <div className="text-[0.8rem] font-semibold text-cream/60">Your subscription</div>
        <div className="mt-1 font-display text-[2rem] leading-none">{PLAN.name}</div>
        <dl className="mt-5 grid gap-2 rounded-2xl bg-cream/[0.07] p-4 text-[0.92rem] ring-1 ring-cream/10">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-cream/75">{renewing ? "One month" : "Setup and first month"}</dt>
            <dd className="font-display text-[1.45rem] leading-none">{kes(today)}</dd>
          </div>
          {!renewing && (
            <div className="flex items-baseline justify-between gap-3 border-t border-cream/10 pt-2">
              <dt className="text-cream/75">From month two</dt>
              <dd>
                {kes(PLAN.monthly)} <span className="text-cream/60">a month</span>
              </dd>
            </div>
          )}
        </dl>
        <Details renewing={renewing} desktop />
      </div>
    </div>
  );
}

function Details({ renewing, desktop }: { renewing: boolean; desktop?: boolean }) {
  return (
    <div className={clsx(desktop ? "mt-6" : "px-5 pb-5")}>
      {!desktop && !renewing && (
        <p className="mb-4 text-[0.88rem] leading-snug text-cream/75">
          {SETUP_PRICE} once covers setup and your first month. Then {MONTHLY_PRICE} a month.
        </p>
      )}
      <p className="mb-2.5 text-[0.85rem] font-semibold text-cream/70">Everything included:</p>
      <ul className="grid gap-2 text-[0.9rem] leading-snug">
        {PLAN.groups.flatMap((g) => g.features).map((f) => (
          <li key={f.title} className={clsx("flex gap-2.5", f.soon && "text-cream/60")}>
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
            <span>
              {f.title}
              {f.soon && <span className="ml-1 text-[0.72rem] font-semibold">(coming soon)</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-cream/10 pt-4 text-[0.8rem] leading-relaxed text-cream/60">
        Nothing is taken automatically. You renew each month by <MPesa /> or card, and you can stop anytime.
      </p>
    </div>
  );
}
