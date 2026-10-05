import { Fragment, type CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { FROM_PRICE } from "@/config/plans";
import { HeroPhone } from "./HeroPhone";

/**
 * The headline in phrases. Each starts a new line, so no line ends mid-thought ("…Turn" or "…Into"),
 * and "BF Suma" never splits. The two phrase lines fit a 360px phone at the smallest size (2.2rem).
 */
const HEADLINE = ["Helping BF\u00a0Suma Distributors", "Turn Product Interest", "Into Actual Customers"].map((l) => l.split(" "));
/** Where each phrase's words start in the entrance sequence. */
const START = HEADLINE.map((_, l) => HEADLINE.slice(0, l).flat().length);
/** Underlined in clay, like a pen stroke: the interest every sale starts from. The one mark in the headline. */
const MARKED = new Set(["Product", "Interest"]);
const at = (i: number) => ({ "--i": i }) as CSSProperties;

type Word = { w: string; i: number };

/** Words, each rising inside its own clipping box, with real spaces between the boxes. */
function Words({ items }: { items: Word[] }) {
  return items.map(({ w, i }, k) => (
    <Fragment key={i}>
      <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
        <span className="rise-word" style={at(i)}>
          {w}
        </span>
      </span>
      {k < items.length - 1 && " "}
    </Fragment>
  ));
}

/**
 * A brush stroke, the weight of the letters' stems: it tapers in from the left and ends in a small
 * upward flick past the last letter, the way a pen lifts. It fits in the gap above the next line,
 * and is drawn in from the left once the words above it have landed (globals.css: .draw-underline).
 */
function Underline({ i }: { i: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      className="draw-underline pointer-events-none absolute left-[-3%] top-[0.69em] h-[0.42em] w-[106%] overflow-visible text-clay"
      style={at(i)}
    >
      <path
        fill="currentColor"
        d="M4 16C90 11.2 220 8.7 352 8.9C372 8.9 386 6.2 396 2.4C397.4 1.8 398.7 3.3 398 4.4C390 11.3 376 15 352 15.6C220 15.8 96 18.1 7 20.7C4 21.6 1.6 16.9 4 16Z"
      />
    </svg>
  );
}

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
          <h1 className="display-xl max-w-[17ch] text-[clamp(2.2rem,4.7vw,4.4rem)] leading-[1.04] text-ink">
            {/* Each word rises inside its own clipping box; the spaces sit between the boxes, where they
                stay spaces (a space at the end of an inline-block is dropped). The marked words share
                one box for the underline, so it spans both and never splits across lines. */}
            {HEADLINE.map((line, l) => {
              const words = line.map((w, j) => ({ w, i: START[l] + j }));
              const from = words.findIndex((x) => MARKED.has(x.w));
              const to = from < 0 ? -1 : from + words.filter((x) => MARKED.has(x.w)).length;
              const marked = from < 0 ? [] : words.slice(from, to);
              const before = from < 0 ? words : words.slice(0, from);
              const after = from < 0 ? [] : words.slice(to);
              return (
                <Fragment key={l}>
                  <span className="block">
                    <Words items={before} />
                    {marked.length > 0 && (
                      <>
                        {before.length > 0 && " "}
                        <span className="relative inline-block whitespace-nowrap align-bottom">
                          <Words items={marked} />
                          <Underline i={marked[marked.length - 1].i} />
                        </span>
                        {after.length > 0 && " "}
                      </>
                    )}
                    <Words items={after} />
                  </span>
                  {l < HEADLINE.length - 1 && " "}
                </Fragment>
              );
            })}
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
