import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export const kesAmount = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;
export const shortDate = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short" }) : "";
export const longDate = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }) : "";
export const prettyPhone = (p: string | null) => {
  if (!p) return "";
  const l = p.startsWith("254") ? `0${p.slice(3)}` : p;
  return l.length === 10 ? `${l.slice(0, 4)} ${l.slice(4, 7)} ${l.slice(7)}` : l;
};

export function PageHeader({ title, sub, action }: { title: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[2rem] leading-[1.08] tracking-[-0.02em] text-ink sm:text-[2.4rem]">{title}</h1>
        {sub && <div className="mt-1.5 text-[0.98rem] text-ink-soft">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-[1.25rem] border border-ink/10 bg-paper", className)}>{children}</div>;
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-ink/15 px-6 py-12 text-center">
      <div className="font-display text-[1.4rem] text-ink">{title}</div>
      {children && <div className="mx-auto mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">{children}</div>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

const TONES = {
  new: "bg-sage-soft text-forest",
  contacted: "bg-sand text-ink-soft",
  converted: "bg-forest text-cream",
  closed: "bg-ink/[0.06] text-ink-mute",
  unpaid: "bg-clay-soft text-clay",
  paid: "bg-sage-soft text-forest",
  delivered: "bg-forest text-cream",
  cancelled: "bg-ink/[0.06] text-ink-mute",
  reorder: "bg-[#f3e3c3] text-[#7a5412]",
  payment: "bg-clay-soft text-clay",
  checkin: "bg-sand text-ink-soft",
  quiet: "bg-ink/[0.06] text-ink-soft",
} as const;

const LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Customer",
  closed: "Closed",
  unpaid: "Unpaid",
  paid: "Paid",
  delivered: "Delivered",
  cancelled: "Cancelled",
  reorder: "Reorder due",
  payment: "Unpaid",
  checkin: "Check in",
  quiet: "Gone quiet",
};

export function Pill({ tone }: { tone: keyof typeof TONES }) {
  return <span className={clsx("rounded-full px-2 py-0.5 text-[0.7rem] font-semibold", TONES[tone])}>{LABELS[tone]}</span>;
}

export function Tabs({ items, current }: { items: { href: string; label: string; count?: number }[]; current: string }) {
  return (
    <div className="no-scrollbar -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {items.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={clsx(
            "shrink-0 rounded-full px-3.5 py-1.5 text-[0.85rem] font-semibold transition-colors",
            t.href === current ? "bg-forest text-cream" : "bg-paper text-ink-soft hover:text-ink",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 opacity-60">{t.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export function Row({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={clsx("flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-cream/60 sm:px-5", className)}
    >
      {children}
    </Link>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand font-display text-lg text-ink">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
