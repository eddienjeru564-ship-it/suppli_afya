"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/portal/Switch";
import { setCustomerTexts } from "../../actions";

/** Reminder texts for one customer: on, off by the distributor, or stopped by the customer from the link. */
export function CustomerTexts({
  customerId,
  first,
  hasPhone,
  stoppedByCustomer,
  initialOn,
}: {
  customerId: string;
  first: string;
  hasPhone: boolean;
  stoppedByCustomer: boolean;
  initialOn: boolean;
}) {
  const [on, setOn] = useState(initialOn);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const note = !hasPhone
    ? `Add ${first}'s phone number to send reminder texts.`
    : stoppedByCustomer
      ? `${first} stopped the texts from the link in one of them. Only ${first} can turn them back on.`
      : on
        ? "A text when they're about to run out, and once if an order isn't paid."
        : `Off. ${first} won't get reminder texts.`;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 id="customer-texts" className="text-[0.95rem] font-semibold text-ink">
          Reminder texts
        </h2>
        <p className="mt-1 text-[0.88rem] leading-relaxed text-ink-soft">{note}</p>
        {error && (
          <p role="alert" className="mt-2 text-[0.85rem] text-clay">
            {error}
          </p>
        )}
      </div>
      {hasPhone && !stoppedByCustomer && (
        <Switch
          on={on}
          labelledBy="customer-texts"
          disabled={pending}
          onChange={(v) => {
            setOn(v);
            setError(null);
            start(async () => {
              const r = await setCustomerTexts(customerId, v);
              if (!r.ok) {
                setOn(!v);
                setError(r.error);
              }
            });
          }}
        />
      )}
    </div>
  );
}
