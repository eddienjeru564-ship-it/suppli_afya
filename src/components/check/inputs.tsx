"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import type { Question, QuestionOption } from "@/engine";
import { Check } from "@/components/ui/icons";

const optionBase =
  "group relative flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow] duration-200 ease-[var(--ease-soft)] focus-visible:outline-2";

function optionState(selected: boolean) {
  return selected
    ? "border-forest bg-sage-soft/70 shadow-[0_0_0_1px_var(--color-forest)]"
    : "border-ink/12 bg-paper hover:border-ink/35 hover:bg-white";
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      className={clsx(
        "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
        selected ? "border-forest bg-forest" : "border-ink/30 bg-white",
      )}
    >
      {selected && <span className="h-1.5 w-1.5 rounded-full bg-cream" />}
    </span>
  );
}

function Box({ selected, rank }: { selected: boolean; rank?: number }) {
  return (
    <span
      className={clsx(
        "grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[0.7rem] font-bold transition-colors",
        selected ? "border-forest bg-forest text-cream" : "border-ink/30 bg-white",
      )}
    >
      {selected && (rank ? rank : <Check className="h-3.5 w-3.5" />)}
    </span>
  );
}

function Label({ o }: { o: QuestionOption }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-[0.98rem] font-medium leading-snug text-ink">{o.label}</span>
      {o.hint && <span className="mt-0.5 block text-[0.83rem] leading-snug text-ink-mute">{o.hint}</span>}
    </span>
  );
}

export function SingleChoice({
  options,
  value,
  onSelect,
}: {
  options: QuestionOption[];
  value: string | undefined;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="radiogroup" className="grid gap-2.5">
      {options.map((o, i) => {
        const selected = value === o.id;
        return (
          <motion.button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(o.id)}
            className={clsx(optionBase, optionState(selected))}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i + 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Radio selected={selected} />
            <Label o={o} />
          </motion.button>
        );
      })}
    </div>
  );
}

export function MultiChoice({
  q,
  options,
  value,
  onToggle,
  ranked,
}: {
  q: Question;
  options: QuestionOption[];
  value: string[];
  onToggle: (id: string) => void;
  ranked?: boolean;
}) {
  const full = q.max !== undefined && value.filter((v) => !options.find((o) => o.id === v)?.exclusive).length >= q.max;
  return (
    <div className={clsx("grid gap-2.5", ranked && "sm:grid-cols-2")}>
      {options.map((o, i) => {
        const idx = value.indexOf(o.id);
        const selected = idx >= 0;
        const disabled = !selected && full && !o.exclusive;
        return (
          <motion.button
            key={o.id}
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-disabled={disabled}
            onClick={() => !disabled && onToggle(o.id)}
            className={clsx(optionBase, optionState(selected), disabled && "cursor-not-allowed opacity-45")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i + 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box selected={selected} rank={ranked ? idx + 1 : undefined} />
            <Label o={o} />
          </motion.button>
        );
      })}
    </div>
  );
}

export function Scale({
  value,
  labels,
  onSelect,
}: {
  value: number | undefined;
  labels: [string, string];
  onSelect: (n: number) => void;
}) {
  return (
    <div>
      <div role="radiogroup" className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n, i) => {
          const selected = value === n;
          return (
            <motion.button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${n} of 5`}
              onClick={() => onSelect(n)}
              className={clsx(
                "flex aspect-square items-center justify-center rounded-2xl border font-display text-2xl transition-colors duration-200",
                selected ? "border-forest bg-forest text-cream" : "border-ink/12 bg-paper text-ink hover:border-ink/35",
              )}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i + 0.08, duration: 0.35 }}
            >
              {n}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-2.5 flex justify-between text-[0.8rem] font-medium text-ink-mute">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  );
}

export function TextField({
  value,
  onChange,
  onSubmit,
  placeholder,
  numeric,
  maxLength,
  autoFocus,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  numeric?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  invalid?: string | null;
}) {
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(numeric ? e.target.value.replace(/[^\d]/g, "").slice(0, 3) : e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        ref={(el) => {
          if (el && autoFocus) el.focus({ preventScroll: true });
        }}
        inputMode={numeric ? "numeric" : "text"}
        autoComplete={numeric ? "off" : "given-name"}
        enterKeyHint="next"
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(invalid)}
        className={clsx(
          "w-full border-b-2 bg-transparent pb-2 font-display text-[2rem] leading-tight text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-forest",
          invalid ? "border-clay" : "border-ink/20",
          numeric && "max-w-[8rem]",
        )}
      />
      {invalid && <p className="mt-2 text-sm text-clay">{invalid}</p>}
    </div>
  );
}
