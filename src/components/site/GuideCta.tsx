import { MONTHLY_PRICE, SETUP_PRICE } from "@/config/plans";
import { LogoMark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

/** The end of every guide: what Suppli Afya sets up for you, and where to start. */
export function GuideCta() {
  return (
    <aside className="relative isolate overflow-hidden rounded-[2rem] bg-forest p-7 text-cream shadow-float sm:p-10">
      <div aria-hidden className="price-sheen pointer-events-none absolute inset-0 -z-10" />
      <LogoMark tone="cream" className="h-9 w-auto" />
      <h2 className="mt-5 max-w-[22ch] text-balance font-display text-[1.9rem] leading-[1.1] tracking-[-0.015em] sm:text-[2.2rem]">
        Your own shop, a morning follow-up list and reminder texts, set up for you.
      </h2>
      <p className="mt-4 max-w-[34rem] text-[1rem] leading-relaxed text-cream/80">
        Suppli Afya gives BF Suma distributors in Kenya their own page, personal product suggestions for every customer and an
        app that remembers who to follow up with. {SETUP_PRICE} once, then {MONTHLY_PRICE} a month.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/#try" variant="light" size="lg" arrow>
          See it in action
        </ButtonLink>
        <ButtonLink href="/#pricing" size="lg" className="border border-cream/25 bg-transparent text-cream hover:bg-cream/10">
          See pricing
        </ButtonLink>
      </div>
    </aside>
  );
}
