import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { RetryButton } from "./RetryButton";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };
export const dynamic = "force-static";

/** Shown by the service worker when a page isn't saved on this phone and there's no signal. */
export default function Offline() {
  return (
    <main className="flex min-h-dvh flex-col bg-cream px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <Logo />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
            <path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0" />
            <path d="M3 3l18 18" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-[2rem] leading-tight tracking-[-0.02em] text-ink">You&apos;re offline</h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft">
          This page isn&apos;t saved on your phone yet. Pages you&apos;ve opened in your portal still work without
          signal.
        </p>
        <RetryButton />
      </div>
    </main>
  );
}
