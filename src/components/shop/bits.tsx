"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { useShop } from "./ShopProvider";

/** The distributor's initials, the shop's small identity mark. */
export function Monogram({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span aria-hidden className={clsx("grid shrink-0 place-items-center rounded-full bg-forest font-display text-cream", className)}>
      {initials}
    </span>
  );
}

/**
 * Opens WhatsApp to the distributor with a message already written. On the
 * demo shop it shows the message instead, so the context is still visible.
 */
export function WhatsAppAction({
  message,
  children,
  className,
  onSent,
  label,
}: {
  message: string;
  children: ReactNode;
  className?: string;
  onSent?: () => void;
  label?: string;
}) {
  const { waLink, showPreview } = useShop();
  const href = waLink(message);
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onSent} className={className} aria-label={label}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={() => showPreview(message)} className={className} aria-label={label}>
      {children}
    </button>
  );
}

export const waButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-wa font-semibold text-[#06331f] transition hover:brightness-95 active:scale-[0.98]";

export function WaGlyph({ className }: { className?: string }) {
  return <WhatsAppIcon className={className} />;
}

/** − 2 + control, sized for thumbs. */
export function Stepper({
  qty,
  onChange,
  label,
  size = "md",
}: {
  qty: number;
  onChange: (q: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const btn = clsx(
    "grid place-items-center rounded-full text-forest transition hover:bg-forest/[0.07] active:scale-95 disabled:opacity-30",
    size === "sm" ? "h-8 w-8" : "h-10 w-10",
  );
  return (
    <div className={clsx("inline-flex items-center rounded-full border border-ink/15 bg-paper", size === "sm" ? "h-9" : "h-11")}>
      <button type="button" className={btn} onClick={() => onChange(qty - 1)} aria-label={`One less ${label}`}>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
          <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <span className="min-w-[1.6rem] text-center text-[0.95rem] font-semibold tabular-nums text-ink" aria-live="polite">
        {qty}
      </span>
      <button type="button" className={btn} onClick={() => onChange(qty + 1)} disabled={qty >= 20} aria-label={`One more ${label}`}>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
          <path d="M3.5 8h9M8 3.5v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5.5 8h13l-1 11.5a2 2 0 0 1-2 1.8h-7a2 2 0 0 1-2-1.8L5.5 8Z" />
      <path d="M9 10V6.8a3 3 0 0 1 6 0V10" />
    </svg>
  );
}
