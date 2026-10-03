import { Fragment, type CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { FROM_PRICE } from "@/config/plans";
import { HeroPhone } from "./HeroPhone";

const HEADLINE = ["Helping", "BF", "Suma", "Distributors", "in", "Kenya", "Turn", "Curiosity", "Into", "Customers"];
const at = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * The first screen. Its entrances are CSS (globals.css: .rise, .rise-word), so the words are in
 * the HTML and readable before any JavaScript arrives, and look the same with reduced motion.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pt-32 lg:pb-24 lg:pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(236_213_193/0.7),transparent)]" />
        <div className="absolute bottom-0 left-[-15%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(223_231_214/0.8),transparent)]" />
      </div>

      <div className="container-x grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div>
          {/* One headline: who it's for and what it does. Smaller than display-xl, since it's a sentence. */}
          <h1 className="display-xl max-w-[17ch] text-[clamp(2.3rem,4.7vw,4.4rem)] leading-[1.04] text-ink">
            {/* Each word rises inside its own clipping box; the spaces sit between the boxes, where they
                stay spaces (a space at the end of an inline-block is dropped). */}
            {HEADLINE.map((w, i) => (
              <Fragment key={i}>
                <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className={w === "Curiosity" ? "rise-word italic text-forest" : "rise-word"} style={at(i)}>
                    {w}
                  </span>
                </span>
                {i < HEADLINE.length - 1 && " "}
              </Fragment>
            ))}
          </h1>

          <p className="lede rise mt-7 max-w-[30rem]" style={at(9)}>
            Your own page asks potential customers a few short questions and shows them what products suit them. When
            they&apos;re ready, they message you on WhatsApp.
          </p>

          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={at(11)}>
            <ButtonLink href="#try" size="lg" arrow>
              See it in action
            </ButtonLink>
            <ButtonLink href="#pricing" size="lg" variant="secondary">
              Claim your page
            </ButtonLink>
          </div>
          {/* Two tidy lines on a phone, one line on wider screens: never a separator left hanging. */}
          <p className="rise mt-5 text-[0.85rem] leading-relaxed text-ink-mute" style={at(13)}>
            <span className="block sm:inline">From {FROM_PRICE} a month</span>
            <span className="hidden sm:inline"> · </span>
            <span>No contract · Pay by M-Pesa</span>
          </p>
        </div>

        {/* Phones and small tablets would stack the phone below the buttons; there the demo further down shows it. */}
        <div className="rise hidden lg:block" style={at(4)}>
          <HeroPhone />
        </div>
      </div>
    </section>
  );
}
