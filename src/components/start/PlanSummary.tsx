"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PLANS, PLANS_BY_ID, kes, type PlanId } from "@/config/plans";
import { Check } from "@/components/ui/icons";

/**
 * What you're buying, kept in view through checkout. Switching plan here is
 * allowed at any point, so nobody has to go back to the homepage.
 */
export function PlanSummary({ plan, onChange }: { plan: PlanId; onChange: (p: PlanId) => void }) {
  const [open, setOpen] = useState(false);
  const p = PLANS_BY_ID[plan];

  return (
    <div className="rounded-[1.5rem] bg-forest text-cream shadow-float lg:sticky lg:top-8">
      {/* phones: a compact bar that expands */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-5 text-left lg:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>
          <span className="block text-[0.75rem] font-semibold text-cream/60">Your plan</span>
          <span className="font-display text-[1.35rem]">
            {p.name} · {kes(p.price)}
            <span className="text-[0.9rem] text-cream/60"> a month</span>
          </span>
        </span>
        <span className="text-[0.8rem] font-semibold text-sage">{open ? "Hide" : "Details"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden"
          >
            <Details plan={plan} onChange={onChange} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden p-7 lg:block">
        <div className="text-[0.8rem] font-semibold text-cream/60">Your plan</div>
        <div className="mt-1 font-display text-[2rem] leading-none">{p.name}</div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-display text-[1.6rem]">{kes(p.price)}</span>
          <span className="text-cream/60">a month</span>
        </div>
        <Details plan={plan} onChange={onChange} desktop />
      </div>
    </div>
  );
}

function Details({ plan, onChange, desktop }: { plan: PlanId; onChange: (p: PlanId) => void; desktop?: boolean }) {
  const p = PLANS_BY_ID[plan];
  return (
    <div className={clsx(desktop ? "mt-6" : "px-5 pb-5")}>
      <ul className="grid gap-2.5 text-[0.92rem] leading-snug">
        {p.features.map((f) => (
          <li key={f.text} className={clsx("flex gap-2.5", f.soon && "text-cream/60")}>
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
            <span>
              {f.text}
              {f.soon && <span className="ml-1 text-[0.72rem] font-semibold">(coming soon)</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-cream/10 pt-5">
        <div className="text-[0.78rem] font-semibold text-cream/60">Change plan</div>
        <div role="radiogroup" className="mt-2 grid grid-cols-3 gap-1.5 rounded-full bg-cream/10 p-1">
          {PLANS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={o.id === plan}
              onClick={() => onChange(o.id)}
              className={clsx(
                "rounded-full px-2 py-1.5 text-[0.8rem] font-semibold transition-colors",
                o.id === plan ? "bg-cream text-forest-deep" : "text-cream/75 hover:text-cream",
              )}
            >
              {o.name}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 text-[0.8rem] leading-relaxed text-cream/60">
        Paid monthly. Nothing is taken automatically; you renew each month by M-Pesa or card.
      </p>
    </div>
  );
}
