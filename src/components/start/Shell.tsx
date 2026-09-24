import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

const STEPS = ["Account", "Payment", "Set up"];

/**
 * Account → Payment → Set up, as one journey. `detail` adds progress inside the
 * current step (e.g. "2 of 4" during set up).
 */
export function Stepper({ step, detail }: { step: 0 | 1 | 2; detail?: string }) {
  return (
    <>
      <ol className="hidden items-center gap-2 text-[0.8rem] font-semibold sm:flex" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2" aria-current={i === step ? "step" : undefined}>
            <span
              className={clsx(
                "grid h-6 w-6 place-items-center rounded-full text-[0.72rem]",
                i < step ? "bg-forest text-cream" : i === step ? "border border-forest text-forest" : "border border-ink/15 text-ink-mute",
              )}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={i === step ? "text-ink" : "text-ink-mute"}>
              {s}
              {i === step && detail && <span className="ml-1.5 font-normal text-ink-mute">{detail}</span>}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-ink/15" />}
          </li>
        ))}
      </ol>
      <span className="text-[0.8rem] font-semibold text-ink-mute sm:hidden">
        {STEPS[step]}
        {detail ? ` · ${detail}` : ` · Step ${step + 1} of ${STEPS.length}`}
      </span>
    </>
  );
}

/** The frame around every signup step, so checkout feels like the same product as the site. */
export function StartShell({ step, children, aside }: { step: 0 | 1 | 2; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream">
      <header className="container-x flex h-16 items-center justify-between">
        <Link href="/" aria-label="Suppli Afya home">
          <Logo />
        </Link>
        <Stepper step={step} />
      </header>
      <main className={clsx("container-x grid gap-8 pb-16 pt-4 lg:gap-16 lg:pt-10", aside && "lg:grid-cols-[1fr_24rem]")}>
        {aside && <div className="lg:order-2">{aside}</div>}
        <div className="lg:order-1">{children}</div>
      </main>
    </div>
  );
}
