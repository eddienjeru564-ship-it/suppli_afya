import clsx from "clsx";

/** Leaf mark: growth, and the vein runs through it like the loop from first order to reorder. */
export function LogoMark({ className, tone = "forest" }: { className?: string; tone?: "forest" | "cream" }) {
  const fill = tone === "forest" ? "var(--color-forest)" : "var(--color-cream)";
  const vein = tone === "forest" ? "var(--color-cream)" : "var(--color-forest-deep)";
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={clsx("shrink-0", className)}>
      <path d="M5 27C5 14.3 13.6 5 27 5c0 13.4-9.3 22-22 22Z" fill={fill} />
      <path d="M7.5 24.5C12 20 17 15 23.5 8.5" stroke={vein} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M12.5 19.5c2.6.2 4.8-.3 6.6-1.6M16.4 15.6c-.2-2.2.3-4.1 1.5-5.8" stroke={vein} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".8" />
    </svg>
  );
}

export function Logo({ className, tone = "forest" }: { className?: string; tone?: "forest" | "cream" }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <LogoMark className="h-7 w-7" tone={tone} />
      <span
        className={clsx(
          "font-display text-[1.35rem] leading-none tracking-[-0.02em]",
          tone === "forest" ? "text-forest" : "text-cream",
        )}
      >
        Suppli <em className="font-normal italic">Afya</em>
      </span>
    </span>
  );
}
