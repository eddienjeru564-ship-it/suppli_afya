"use client";

import clsx from "clsx";

/** An on/off switch, labelled by an element on the page. */
export function Switch({
  on,
  onChange,
  labelledBy,
  disabled,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  labelledBy: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={clsx(
        "relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-60",
        on ? "bg-forest" : "bg-ink/20",
      )}
    >
      <span className={clsx("absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200", on && "translate-x-6")} />
    </button>
  );
}
