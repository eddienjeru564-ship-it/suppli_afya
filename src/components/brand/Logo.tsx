import { useId } from "react";
import clsx from "clsx";
import { BRAND, MARK, POWERED_BY, WORDMARK } from "./artwork";

type Tone = "forest" | "cream";

/** Gradient defs for one mark. Ids come from useId so marks never borrow a hidden copy's gradients. */
function MarkPaths({ tone, id }: { tone: Tone; id: string }) {
  const light = tone === "cream";
  const [c0, c1] = light ? BRAND.capLight : BRAND.cap;
  const [b0, b1] = light ? BRAND.bodyLight : BRAND.body;
  return (
    <>
      <defs>
        <linearGradient id={`${id}c`} x1="0.1" y1="0" x2="0.9" y2="0.35">
          <stop offset="0" stopColor={c0} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
        <radialGradient id={`${id}b`} cx="0.35" cy="0.45" r="0.75">
          <stop offset="0" stopColor={b0} />
          <stop offset="1" stopColor={b1} />
        </radialGradient>
      </defs>
      <path fill={`url(#${id}c)`} d={MARK.cap} />
      <path fill={`url(#${id}b)`} d={MARK.body} />
    </>
  );
}

/** The pill-and-leaf mark on its own: favicons, app chrome, small badges. Keeps its tall proportions. */
export function LogoMark({ className, tone = "forest" }: { className?: string; tone?: Tone }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox={MARK.viewBox} aria-hidden className={clsx("shrink-0", className)}>
      <MarkPaths tone={tone} id={id} />
    </svg>
  );
}

// Lockup geometry, in wordmark units: the mark stands 1.9x the cap height, centred on it.
const MARK_H = 156;
const MARK_W = (MARK.width / MARK.height) * MARK_H;
const GAP = 34;
const WORD_Y = (MARK_H - WORDMARK.height) / 2;
const LOCKUP_W = MARK_W + GAP + WORDMARK.width;

/** Mark + "SUPPLI AFYA". Height follows the className (default h-8); width follows the artwork. */
export function Logo({ className, tone = "forest" }: { className?: string; tone?: Tone }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox={`0 0 ${LOCKUP_W.toFixed(1)} ${MARK_H}`}
      role="img"
      aria-label="Suppli Afya"
      className={clsx("h-8 w-auto shrink-0", className)}
    >
      <svg x="0" y="0" width={MARK_W} height={MARK_H} viewBox={MARK.viewBox}>
        <MarkPaths tone={tone} id={id} />
      </svg>
      <svg x={MARK_W + GAP} y={WORD_Y} width={WORDMARK.width} height={WORDMARK.height} viewBox={WORDMARK.viewBox}>
        <path fillRule="evenodd" fill={tone === "forest" ? BRAND.ink : BRAND.cream} d={WORDMARK.d} />
      </svg>
    </svg>
  );
}

// Badge geometry, from the master "Powered by" file: mark 247 tall, two text lines beside it.
const PB = { markH: 247, gap: 44, poweredY: 39, wordX: 12, wordY: 108 };
const PB_MARK_W = (MARK.width / MARK.height) * PB.markH;
const PB_W = PB_MARK_W + PB.gap + PB.wordX + WORDMARK.width;

/** "Powered by Suppli Afya" badge for storefronts and previews of them. Height follows the className. */
export function PoweredBy({ className, tone = "forest" }: { className?: string; tone?: Tone }) {
  const id = useId().replace(/:/g, "");
  const ink = tone === "forest" ? BRAND.ink : BRAND.cream;
  const x = PB_MARK_W + PB.gap;
  return (
    <svg
      viewBox={`0 0 ${PB_W.toFixed(1)} ${PB.markH}`}
      role="img"
      aria-label="Powered by Suppli Afya"
      className={clsx("h-8 w-auto shrink-0", className)}
    >
      <svg x="0" y="0" width={PB_MARK_W} height={PB.markH} viewBox={MARK.viewBox}>
        <MarkPaths tone={tone} id={id} />
      </svg>
      <svg x={x} y={PB.poweredY} width={POWERED_BY.width} height={POWERED_BY.height} viewBox={POWERED_BY.viewBox}>
        <path fillRule="evenodd" fill={ink} d={POWERED_BY.d} />
      </svg>
      <svg x={x + PB.wordX} y={PB.wordY} width={WORDMARK.width} height={WORDMARK.height} viewBox={WORDMARK.viewBox}>
        <path fillRule="evenodd" fill={ink} d={WORDMARK.d} />
      </svg>
    </svg>
  );
}
