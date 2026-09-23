"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "/portal", label: "Today", icon: IconToday },
  { href: "/portal/prospects", label: "Prospects", icon: IconProspects },
  { href: "/portal/orders", label: "Orders", icon: IconOrders },
  { href: "/portal/customers", label: "Customers", icon: IconCustomers },
];

export function PortalShell({
  children,
  businessName,
  newProspects,
  banner,
}: {
  children: ReactNode;
  businessName: string;
  newProspects: number;
  banner?: ReactNode;
}) {
  const path = usePathname();
  const active = (href: string) => (href === "/portal" ? path === "/portal" : path.startsWith(href));

  return (
    <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[16rem_1fr]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ink/10 bg-paper/60 px-4 py-5 lg:flex">
        <Link href="/portal" className="px-2">
          <Logo />
        </Link>
        <div className="mt-2 truncate px-2 text-[0.8rem] text-ink-mute">{businessName}</div>
        <nav className="mt-8 grid gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium transition-colors",
                active(n.href) ? "bg-forest text-cream" : "text-ink-soft hover:bg-ink/5 hover:text-ink",
              )}
            >
              <n.icon className="h-[18px] w-[18px]" />
              {n.label}
              {n.href === "/portal/prospects" && newProspects > 0 && (
                <span
                  className={clsx(
                    "ml-auto rounded-full px-2 py-0.5 text-[0.7rem] font-semibold",
                    active(n.href) ? "bg-cream/20 text-cream" : "bg-clay text-cream",
                  )}
                >
                  {newProspects}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-1">
          <Link
            href="/portal/settings"
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium transition-colors",
              active("/portal/settings") ? "bg-forest text-cream" : "text-ink-soft hover:bg-ink/5 hover:text-ink",
            )}
          >
            <IconSettings className="h-[18px] w-[18px]" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        {/* phone header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink/10 bg-cream/90 px-4 backdrop-blur lg:hidden">
          <Link href="/portal">
            <Logo className="scale-90 origin-left" />
          </Link>
          <Link
            href="/portal/settings"
            aria-label="Settings"
            className={clsx("grid h-10 w-10 place-items-center rounded-full", active("/portal/settings") ? "bg-forest text-cream" : "text-ink")}
          >
            <IconSettings className="h-5 w-5" />
          </Link>
        </header>
        {banner}
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">{children}</main>
      </div>

      {/* phone tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-ink/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={clsx("relative flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-semibold", active(n.href) ? "text-forest" : "text-ink-mute")}
          >
            <n.icon className="h-5 w-5" />
            {n.label}
            {n.href === "/portal/prospects" && newProspects > 0 && (
              <span className="absolute right-[26%] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[0.6rem] text-cream">
                {newProspects}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}

type I = { className?: string };
function IconToday({ className }: I) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="4" width="14" height="13" rx="3" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3M7 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconProspects({ className }: I) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v6A2.5 2.5 0 0 1 14.5 14H9l-4 3v-3.2A2.5 2.5 0 0 1 3 11.5v-6Z" strokeLinejoin="round" />
      <path d="M7 7.5h6M7 10h4" strokeLinecap="round" />
    </svg>
  );
}
function IconOrders({ className }: I) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 6h12l-1 10.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 16.5L4 6Z" strokeLinejoin="round" />
      <path d="M7.5 6V5a2.5 2.5 0 0 1 5 0v1" />
    </svg>
  );
}
function IconCustomers({ className }: I) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 16.5c.8-2.8 3-4.5 5.5-4.5s4.7 1.7 5.5 4.5" strokeLinecap="round" />
      <path d="M13 4.2a3 3 0 0 1 0 5.6M15 12.3c1.2.7 2 2 2.5 4.2" strokeLinecap="round" />
    </svg>
  );
}
function IconSettings({ className }: I) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}
