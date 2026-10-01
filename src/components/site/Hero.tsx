import { Fragment, type CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { FROM_PRICE } from "@/config/plans";
import { HeroPhone } from "./HeroPhone";

const HEADLINE = ["Your", "own", "page", "for", "turning", "curiosity", "into", "customers."];
const at = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * The first screen. Its entrances are CSS (globals.css: .rise, .rise-word), so the words are in
 * the HTML and readable before any JavaScript arrives, and look the same with reduced motion.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pt-32 lg:pb-28 lg:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(236_213_193/0.7),transparent)]" />
        <div className="absolute bottom-0 left-[-15%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(223_231_214/0.8),transparent)]" />
      </div>

      <div className="container-x grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div>
          <div className="eyebrow rise">For BF Suma distributors in Kenya</div>

          <h1 className="display-xl mt-6 max-w-[14ch] text-ink">
            {/* Each word rises inside its own clipping box; the spaces sit between the boxes, where they
                stay spaces (a space at the end of an inline-block is dropped). */}
            {HEADLINE.map((w, i) => (
              <Fragment key={i}>
                <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className={w === "curiosity" ? "rise-word italic text-forest" : "rise-word"} style={at(i)}>
                    {w}
                  </span>
                </span>
                {i < HEADLINE.length - 1 && " "}
              </Fragment>
            ))}
          </h1>

          <p className="lede rise mt-7 max-w-[34rem]" style={at(9)}>
            A page with your name on it, to share on WhatsApp, on QR cards and in your bio. Customers answer a few
            questions, see which products suit them, and message you with their answers already written.
          </p>

          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={at(11)}>
            <ButtonLink href="#try" size="lg" arrow>
              See it in action
            </ButtonLink>
            <ButtonLink href="#pricing" size="lg" variant="secondary">
              Get your page
            </ButtonLink>
          </div>
          <p className="rise mt-5 max-w-[32rem] text-[0.9rem] leading-relaxed text-ink-mute" style={at(13)}>
            You stay the seller. Every enquiry is saved in your own workspace, and each morning you see who to follow
            up with. From {FROM_PRICE} a month.
          </p>
        </div>

        <div className="rise" style={at(4)}>
          <HeroPhone />
        </div>
      </div>
    </section>
  );
}
