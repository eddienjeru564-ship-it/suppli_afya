"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/portal/Switch";
import { SmsBubble } from "@/components/ui/SmsBubble";
import { setSmsKind } from "../actions";

type Kind = "reorder" | "payment";

const ROWS: { kind: Kind; title: string; when: string }[] = [
  { kind: "reorder", title: "Reorder reminders", when: "Three days before a customer's products are likely to run out." },
  { kind: "payment", title: "Payment reminders", when: "Once, three days after an order that isn't paid yet." },
];

/**
 * Reminder texts to customers: each kind on or off, with the exact text a customer receives.
 * Texts go out at 8 each morning, in the distributor's name.
 */
export function SmsSettings({
  initial,
  previews,
  sentThisMonth,
}: {
  initial: Record<Kind, boolean>;
  previews: Record<Kind, string>;
  sentThisMonth: number;
}) {
  const [on, setOn] = useState(initial);
  const [open, setOpen] = useState<Kind | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (kind: Kind, value: boolean) => {
    setOn((s) => ({ ...s, [kind]: value }));
    setError(null);
    start(async () => {
      const r = await setSmsKind(kind, value);
      if (!r.ok) {
        setOn((s) => ({ ...s, [kind]: !value }));
        setError(r.error);
      }
    });
  };

  return (
    <div className="rounded-[1.25rem] border border-ink/10 bg-paper">
      <div className="p-5 sm:p-6">
        <p className="text-[0.93rem] leading-relaxed text-ink-soft">
          At 8 each morning we text the customers who need a nudge, signed with your name. Each customer gets at most one text a
          day, and every text has a link to stop them.
        </p>
        <p className="mt-2 text-[0.85rem] text-ink-mute">
          {sentThisMonth === 0 ? "No texts sent yet this month." : `${sentThisMonth} ${sentThisMonth === 1 ? "text" : "texts"} sent this month.`}
        </p>
      </div>
      <ul className="divide-y divide-ink/10 border-t border-ink/10">
        {ROWS.map((r) => (
          <li key={r.kind} className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 id={`sms-${r.kind}`} className="font-semibold text-ink">
                  {r.title}
                </h3>
                <p className="mt-1 text-[0.9rem] leading-relaxed text-ink-soft">{r.when}</p>
                <button
                  type="button"
                  aria-expanded={open === r.kind}
                  onClick={() => setOpen(open === r.kind ? null : r.kind)}
                  className="mt-2 text-[0.85rem] font-semibold text-forest underline underline-offset-2"
                >
                  {open === r.kind ? "Hide the text" : "See the text"}
                </button>
              </div>
              <Switch on={on[r.kind]} onChange={(v) => toggle(r.kind, v)} labelledBy={`sms-${r.kind}`} disabled={pending} />
            </div>
            {open === r.kind && <SmsBubble body={previews[r.kind]} time="08:00" className="mt-4 max-w-[22rem]" />}
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="px-5 pb-5 text-[0.85rem] text-clay sm:px-6">
          {error}
        </p>
      )}
    </div>
  );
}
