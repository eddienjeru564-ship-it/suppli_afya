"use client";

import clsx from "clsx";
import { useId } from "react";
import type { Product, ProductFormat, ProductLine } from "@/engine";

/**
 * Pack renders by format: a bottle for capsules and tablets, a carton for coffee, tea and drink
 * sachets, a pump bottle for the wash and a jar for skincare. One light source (top left), a soft
 * shadow on the ground, no lettering. We deliberately don't use BF Suma's product photography or
 * packaging: the page shouldn't look like it's BF Suma's own site, and a render that only says
 * "a bottle of tablets" can't be mistaken for the real label.
 */
const LINE_TONE: Record<ProductLine, { body: string; band: string }> = {
  "Immune Booster": { body: "#5a7a53", band: "#e4ead9" },
  "Heart & Blood Fit": { body: "#98552f", band: "#f0dccb" },
  "Sport Fit": { body: "#c48b2c", band: "#f6ead2" },
  "Suma Fit": { body: "#1e3a2b", band: "#c8d5bd" },
  "Men's Power": { body: "#1b2a22", band: "#d8c9ac" },
  "Women's Beauty": { body: "#b9725a", band: "#f7e8de" },
  "Suma Living": { body: "#7c857e", band: "#ece4d6" },
};

export function ProductGlyph({ product, className }: { product: Product; className?: string }) {
  return <PackArt format={product.format} line={product.line} className={className} />;
}

export function PackArt({ format, line, className }: { format: ProductFormat; line: ProductLine; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const tone = LINE_TONE[line];
  const ref = (name: string) => `url(#${id}${name})`;
  return (
    <svg viewBox="0 0 100 120" aria-hidden className={clsx("h-full w-full overflow-visible", className)}>
      <defs>
        <radialGradient id={`${id}shadow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#0b1711" stopOpacity="0.32" />
          <stop offset="0.6" stopColor="#0b1711" stopOpacity="0.12" />
          <stop offset="1" stopColor="#0b1711" stopOpacity="0" />
        </radialGradient>
        {/* A cylinder lit from the left: highlight, body colour, then falling into shadow. */}
        <linearGradient id={`${id}cyl`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={mix(tone.body, "#ffffff", 0.16)} />
          <stop offset="0.38" stopColor={tone.body} />
          <stop offset="0.78" stopColor={mix(tone.body, "#000000", 0.14)} />
          <stop offset="1" stopColor={mix(tone.body, "#000000", 0.34)} />
        </linearGradient>
        <linearGradient id={`${id}wrap`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000000" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={`${id}cap`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={mix(tone.body, "#000000", 0.12)} />
          <stop offset="0.4" stopColor={mix(tone.body, "#000000", 0.28)} />
          <stop offset="1" stopColor={mix(tone.body, "#000000", 0.5)} />
        </linearGradient>
        <linearGradient id={`${id}front`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={mix(tone.body, "#ffffff", 0.08)} />
          <stop offset="1" stopColor={mix(tone.body, "#000000", 0.08)} />
        </linearGradient>
      </defs>
      {shape(format, tone, ref)}
    </svg>
  );
}

type Tone = { body: string; band: string };

function shape(format: ProductFormat, t: Tone, ref: (name: string) => string) {
  switch (format) {
    case "capsules":
    case "tablets":
      return <Bottle t={t} ref_={ref} pill={format === "tablets" ? "round" : "capsule"} />;
    case "coffee":
    case "tea":
    case "drink":
      return <Carton t={t} ref_={ref} mark={format} />;
    case "wash":
      return <PumpBottle t={t} ref_={ref} />;
    case "skincare":
      return <Jar t={t} ref_={ref} />;
  }
}

function Bottle({ t, ref_, pill }: { t: Tone; ref_: (n: string) => string; pill: "round" | "capsule" }) {
  return (
    <g>
      <ellipse cx="50" cy="109" rx="31" ry="5" fill={ref_("shadow")} />
      <rect x="35" y="25" width="30" height="9" fill={mix(t.body, "#000000", 0.3)} />
      <rect x="31" y="9" width="38" height="19" rx="3.5" fill={ref_("cap")} />
      {[36, 41, 46, 51, 56, 61, 66].map((x) => (
        <line key={x} x1={x - 1} x2={x - 1} y1="11.5" y2="25.5" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
      ))}
      <path d="M24 46c0-8 5-13 13-14h26c8 1 13 6 13 14v56c0 4-3 7-7 7H31c-4 0-7-3-7-7Z" fill={ref_("cyl")} />
      <rect x="24" y="56" width="52" height="36" fill={t.band} />
      <rect x="24" y="56" width="52" height="36" fill={ref_("wrap")} />
      {pill === "capsule" ? (
        <g transform="rotate(-35 38 74)">
          <rect x="31" y="70.5" width="15" height="7" rx="3.5" fill={t.body} />
          <rect x="38.5" y="70.5" width="7.5" height="7" rx="0" fill={mix(t.body, "#ffffff", 0.45)} />
          <rect x="31" y="70.5" width="15" height="7" rx="3.5" fill="none" stroke={t.body} strokeWidth="0.8" />
        </g>
      ) : (
        <g>
          <circle cx="38" cy="74" r="6" fill={t.body} />
          <line x1="33.5" x2="42.5" y1="74" y2="74" stroke={mix(t.body, "#ffffff", 0.35)} strokeWidth="1" />
        </g>
      )}
      <rect x="49" y="69" width="20" height="2.6" rx="1.3" fill={t.body} opacity="0.55" />
      <rect x="49" y="75" width="13" height="2.2" rx="1.1" fill={t.body} opacity="0.32" />
      <rect x="29" y="37" width="4.5" height="66" rx="2.25" fill="#ffffff" opacity="0.22" />
    </g>
  );
}

function Carton({ t, ref_, mark }: { t: Tone; ref_: (n: string) => string; mark: "coffee" | "tea" | "drink" }) {
  const side = mix(t.body, "#000000", 0.28);
  return (
    <g>
      <ellipse cx="53" cy="107" rx="36" ry="5.5" fill={ref_("shadow")} />
      {/* Top, front and side faces of a carton, lit from the top left. */}
      <path d="M17 36 34 27h48L65 36Z" fill={mix(t.body, "#ffffff", 0.22)} />
      <path d="M27 31.5h46" stroke={mix(t.body, "#000000", 0.12)} strokeOpacity="0.5" strokeWidth="0.8" />
      <rect x="17" y="36" width="48" height="70" fill={ref_("front")} />
      <path d="M65 36 82 27v70l-17 9Z" fill={side} />
      <rect x="17" y="64" width="48" height="26" fill={t.band} />
      <path d="M65 64 82 55v26l-17 9Z" fill={mix(t.band, "#000000", 0.2)} />
      {mark === "coffee" ? (
        <g fill="none" stroke={t.body} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M34 71.5h11v5.5a4.5 4.5 0 0 1-4.5 4.5h-2a4.5 4.5 0 0 1-4.5-4.5Z" />
          <path d="M45 73h1.6a2.3 2.3 0 0 1 0 4.6H45" />
        </g>
      ) : mark === "tea" ? (
        <path d="M33 83c0-7 5-12.5 12-12.5 0 7-5 12.5-12 12.5Zm0 0 7-7" fill="none" stroke={t.body} strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M39.5 70.5c3 4 5.5 7 5.5 9.5a5.5 5.5 0 0 1-11 0c0-2.5 2.5-5.5 5.5-9.5Z" fill={t.body} />
      )}
      <rect x="51" y="73" width="10" height="2.4" rx="1.2" fill={t.body} opacity="0.5" />
      <rect x="51" y="78" width="7" height="2" rx="1" fill={t.body} opacity="0.3" />
      <rect x="17" y="36" width="3.5" height="70" fill="#ffffff" opacity="0.14" />
      <rect x="17" y="43" width="48" height="2.2" fill={t.band} opacity="0.45" />
    </g>
  );
}

function PumpBottle({ t, ref_ }: { t: Tone; ref_: (n: string) => string }) {
  return (
    <g>
      <ellipse cx="50" cy="109" rx="25" ry="4.5" fill={ref_("shadow")} />
      <path d="M44 6h17v5h-9v9" fill="none" stroke={mix(t.body, "#000000", 0.3)} strokeWidth="4" strokeLinejoin="round" />
      <rect x="40" y="18" width="20" height="12" rx="2.5" fill={ref_("cap")} />
      <path d="M30 42c0-7 4-12 11-12h18c7 0 11 5 11 12v60c0 4-3 7-7 7H37c-4 0-7-3-7-7Z" fill={ref_("cyl")} />
      <rect x="30" y="58" width="40" height="32" fill={t.band} />
      <rect x="30" y="58" width="40" height="32" fill={ref_("wrap")} />
      <path d="M45 66c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9Z" fill={t.body} opacity="0.85" />
      <rect x="40" y="82" width="20" height="2.2" rx="1.1" fill={t.body} opacity="0.4" />
      <rect x="34.5" y="36" width="4" height="68" rx="2" fill="#ffffff" opacity="0.22" />
    </g>
  );
}

function Jar({ t, ref_ }: { t: Tone; ref_: (n: string) => string }) {
  return (
    <g>
      <ellipse cx="50" cy="104" rx="36" ry="5" fill={ref_("shadow")} />
      <rect x="20" y="48" width="60" height="16" rx="4" fill={ref_("cap")} />
      <path d="M18 66c0-2 1.5-3.5 3.5-3.5h57c2 0 3.5 1.5 3.5 3.5v30c0 4-3 7-7 7H25c-4 0-7-3-7-7Z" fill={ref_("cyl")} />
      <rect x="18" y="72" width="64" height="20" fill={t.band} />
      <rect x="18" y="72" width="64" height="20" fill={ref_("wrap")} />
      <circle cx="34" cy="82" r="4.5" fill={t.body} opacity="0.85" />
      <rect x="44" y="79.5" width="24" height="2.4" rx="1.2" fill={t.body} opacity="0.45" />
      <rect x="44" y="84.5" width="15" height="2" rx="1" fill={t.body} opacity="0.3" />
      <rect x="23" y="66" width="4" height="34" rx="2" fill="#ffffff" opacity="0.2" />
    </g>
  );
}

/** Blend a hex colour towards another by `amount` (0 to 1). */
function mix(hex: string, to: string, amount: number) {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const ch = (n: number, s: number) => (n >> s) & 255;
  const out = [16, 8, 0].map((s) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * amount));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function FormatLabel({ product }: { product: Product }) {
  const map: Record<Product["format"], string> = {
    capsules: "Capsules",
    tablets: "Tablets",
    coffee: "Coffee sachets",
    tea: "Tea",
    drink: "Drink sachets",
    wash: "Feminine wash",
    skincare: "Skincare",
  };
  return <>{map[product.format]}</>;
}
