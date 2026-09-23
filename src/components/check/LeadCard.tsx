"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { DistributorBrief } from "@/engine";
import { Alert, Check } from "@/components/ui/icons";

/** How a new lead appears in the distributor's portal. */
export function LeadCard({
  brief,
  refCode,
  className,
  live,
}: {
  brief: Partial<DistributorBrief> & { title: string };
  refCode?: string;
  className?: string;
  /** Still filling in while the customer answers. */
  live?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!brief.opener) return;
    try {
      await navigator.clipboard.writeText(brief.opener);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard can be blocked; nothing to do */
    }
  };

  return (
    <div className={clsx("rounded-[1.4rem] border border-ink/10 bg-paper p-5 text-ink shadow-card", className)}>
      <div className="flex items-center justify-between gap-3 text-[0.75rem] font-semibold">
        <span className="inline-flex items-center gap-2 text-moss">
          <span className="relative flex h-2 w-2">
            {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-60" />}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
          </span>
          {live ? "Doing the health check now" : "New lead · via your link"}
        </span>
        {refCode && <span className="font-mono text-ink-mute">{refCode}</span>}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-[1.6rem] leading-tight">{brief.title || "…"}</div>
          {brief.subtitle && <div className="mt-0.5 text-sm text-ink-soft">{brief.subtitle}</div>}
        </div>
        {brief.priority === "high" && (
          <span className="shrink-0 rounded-full bg-ochre/15 px-2.5 py-1 text-[0.72rem] font-semibold text-[#7a5412]">
            Ready to buy
          </span>
        )}
      </div>

      {live && !brief.subtitle && (
        <div className="mt-4 grid gap-2" aria-hidden>
          <div className="h-2.5 w-3/5 rounded-full bg-ink/[0.07]" />
          <div className="h-2.5 w-2/5 rounded-full bg-ink/[0.07]" />
          <p className="mt-2 text-[0.8rem] leading-snug text-ink-mute">
            Their goals, what they&apos;d like to start with and anything to be careful about will appear here.
          </p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {brief.flags && brief.flags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex flex-wrap gap-1.5"
          >
            {brief.flags.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full bg-clay-soft/70 px-2.5 py-1 text-[0.74rem] font-medium text-clay">
                <Alert className="h-3 w-3" />
                {f}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {(brief.planLine || brief.preference) && (
        <dl className="mt-4 grid gap-2 border-t border-ink/10 pt-4 text-sm">
          {brief.planLine && (
            <div className="grid grid-cols-[6.5rem_1fr] gap-2">
              <dt className="text-ink-mute">Their plan</dt>
              <dd className="font-medium">{brief.planLine}</dd>
            </div>
          )}
          {brief.preference && (
            <div className="grid grid-cols-[6.5rem_1fr] gap-2">
              <dt className="text-ink-mute">Wants</dt>
              <dd className="font-medium">{brief.preference}</dd>
            </div>
          )}
        </dl>
      )}

      {brief.opener && (
        <div className="mt-4 rounded-2xl bg-sand/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] font-semibold text-ink-soft">Suggested first reply</span>
            <button type="button" onClick={copy} className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-forest hover:underline">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                "Copy"
              )}
            </button>
          </div>
          <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink">{brief.opener}</p>
        </div>
      )}

      {brief.tips && brief.tips.length > 0 && (
        <ul className="mt-3 grid gap-1.5 text-[0.83rem] leading-snug text-ink-soft">
          {brief.tips.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-ink-mute" />
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
