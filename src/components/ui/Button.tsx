import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "light" | "whatsapp";
type Size = "md" | "lg" | "sm";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-soft)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-cream hover:bg-forest-deep shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]",
  secondary: "border border-forest/25 text-forest hover:border-forest/60 hover:bg-forest/[0.04]",
  ghost: "text-forest hover:bg-forest/[0.06]",
  light: "bg-cream text-forest-deep hover:bg-paper",
  whatsapp: "bg-wa text-[#06331f] hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(base, variants[variant], sizes[size], className);
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={clsx("h-4 w-4 transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5", className)}>
      <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  arrow,
  ...rest
}: { href: string; variant?: Variant; size?: Size; arrow?: boolean; children: ReactNode } & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  arrow,
  ...rest
}: { variant?: Variant; size?: Size; arrow?: boolean } & ComponentProps<"button">) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
