import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

/** The calm one-card layout shared by log in, forgotten password and new password. */
export function AuthCard({ title, lede, children }: { title: string; lede: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="container-x flex h-[calc(4rem+env(safe-area-inset-top))] items-center pt-[env(safe-area-inset-top)]">
        <Link href="/" aria-label="Suppli Afya home">
          <Logo />
        </Link>
      </header>
      <main className="container-x flex flex-1 items-start justify-center pb-[max(4rem,env(safe-area-inset-bottom))] pt-10 sm:items-center sm:pt-0">
        <div className="w-full max-w-md rounded-[2rem] border border-ink/10 bg-paper p-7 sm:p-10">
          <h1 className="font-display text-[2.3rem] leading-[1.05] tracking-[-0.02em] text-ink">{title}</h1>
          <p className="mt-2 text-[1rem] text-ink-soft">{lede}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
