import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

export const inputClass =
  "mt-2 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3.5 text-[1rem] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-forest";

export function Field({
  label,
  hint,
  error,
  className,
  ...props
}: { label: ReactNode; hint?: ReactNode; error?: string | null } & ComponentProps<"input">) {
  return (
    <label className={clsx("block text-[0.9rem] font-semibold text-ink", className)}>
      {label}
      <input className={clsx(inputClass, error && "border-clay")} aria-invalid={Boolean(error)} {...props} />
      {error ? (
        <span className="mt-1.5 block text-[0.8rem] font-medium text-clay">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[0.8rem] font-normal text-ink-mute">{hint}</span>
      ) : null}
    </label>
  );
}
