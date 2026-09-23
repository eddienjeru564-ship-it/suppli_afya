import clsx from "clsx";
import type { ReactNode } from "react";

/** A phone bezel on large screens; on small screens the content renders as a plain card. */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[1.75rem] bg-cream lg:h-[46rem] lg:w-[24.5rem] lg:rounded-[3.2rem] lg:border-[11px] lg:border-[#0b1711] lg:shadow-[0_50px_100px_-30px_rgb(0_0_0/0.6),0_0_0_1px_rgb(255_255_255/0.06)]",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-2.5 z-20 hidden h-[1.6rem] w-[6.5rem] -translate-x-1/2 rounded-full bg-[#0b1711] lg:block" />
      <div className="h-full lg:pt-7">{children}</div>
    </div>
  );
}
