import type { CSSProperties, ReactNode } from "react";

/**
 * Fades content up as it scrolls into view. Pure CSS (a scroll-driven animation), so the
 * content is in the HTML and visible without JavaScript, and browsers without support simply
 * show it. `delay` staggers siblings a little further into the scroll.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Comp = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "p" | "span";
}) {
  return (
    <Comp className={className ? `reveal ${className}` : "reveal"} style={delay ? ({ "--d": delay } as CSSProperties) : undefined}>
      {children}
    </Comp>
  );
}
