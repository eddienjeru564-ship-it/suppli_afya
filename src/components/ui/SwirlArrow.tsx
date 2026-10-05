import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * The site's one arrow: a hand-drawn stroke with a single loop in it, the way you'd point at
 * something with a pen. Colour comes from `currentColor` (clay on light backgrounds, ochre on dark).
 */
const H = {
  viewBox: "0 0 156 50",
  line: "M4 44C28 46 52 44 70 34C86 25 92 10 80 7C68 4 62 18 72 30C84 44 118 46 150 36",
  head: "M138.2 33.8L150 36L141.6 44.5",
};
/** The same stroke, drawn top to bottom. */
const V = {
  viewBox: "0 0 50 156",
  line: "M44 4C46 28 44 52 34 70C25 86 10 92 7 80C4 68 18 62 30 72C44 84 46 118 36 150",
  head: "M33.8 138.2L36 150L44.5 141.6",
};

export const SWIRL_RIGHT = H.line;
export const SWIRL_DOWN = V.line;

export function SwirlArrow({
  direction,
  className,
  strokeWidth = 4,
  children,
}: {
  direction: "right" | "left" | "down" | "up";
  className?: string;
  strokeWidth?: number;
  /** Extra SVG drawn in the same space as the stroke, e.g. something travelling along it. */
  children?: ReactNode;
}) {
  const g = direction === "down" || direction === "up" ? V : H;
  return (
    <svg
      viewBox={g.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={clsx(direction === "left" && "-scale-x-100", direction === "up" && "-scale-y-100", className)}
    >
      <path d={g.line} />
      <path d={g.head} />
      {children}
    </svg>
  );
}
