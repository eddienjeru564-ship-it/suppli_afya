import clsx from "clsx";
import type { Product, ProductLine } from "@/engine";

/**
 * Simple pack illustrations by format. We deliberately don't use BF Suma's
 * product photography: the page shouldn't look like it's BF Suma's own site.
 */
const LINE_TONE: Record<ProductLine, { body: string; band: string }> = {
  "Immune Booster": { body: "#5a7a53", band: "#dfe7d6" },
  "Heart & Blood Fit": { body: "#98552f", band: "#ecd5c1" },
  "Sport Fit": { body: "#c48b2c", band: "#f3e3c3" },
  "Suma Fit": { body: "#1e3a2b", band: "#b9c8ae" },
  "Men's Power": { body: "#11231a", band: "#c9b99d" },
  "Women's Beauty": { body: "#b9725a", band: "#f5e4d8" },
  "Suma Living": { body: "#7c857e", band: "#e9dfce" },
};

export function ProductGlyph({ product, className }: { product: Product; className?: string }) {
  const tone = LINE_TONE[product.line];
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={clsx("h-full w-full", className)}>
      {shape(product.format, tone)}
    </svg>
  );
}

function shape(format: Product["format"], t: { body: string; band: string }) {
  switch (format) {
    case "capsules":
    case "tablets":
      return (
        <g>
          <rect x="21" y="9" width="22" height="8" rx="2.5" fill={t.body} opacity=".85" />
          <rect x="17" y="16" width="30" height="40" rx="7" fill={t.body} />
          <rect x="17" y="27" width="30" height="16" fill={t.band} />
          <path d="M26 38c0-4 3-7 7-7 0 4-3 7-7 7Z" fill={t.body} opacity=".9" />
          <rect x="22" y="48" width="12" height="2" rx="1" fill={t.band} opacity=".5" />
        </g>
      );
    case "coffee":
    case "drink":
      return (
        <g>
          <path d="M18 12h28l-2 4 2 4-2 4 2 4v24a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V28l2-4-2-4 2-4-2-4Z" fill={t.body} />
          <path d="M18 12h28" stroke={t.band} strokeWidth="1.5" strokeDasharray="2 2" />
          <rect x="18" y="32" width="28" height="13" fill={t.band} />
          {format === "coffee" ? (
            <path d="M28 36.5h8v3.2a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-3.2Zm8 .8h1.3a1.6 1.6 0 0 1 0 3.2H36" fill="none" stroke={t.body} strokeWidth="1.4" />
          ) : (
            <path d="M28 43c0-4.5 3.5-8 8-8 0 4.5-3.5 8-8 8Z" fill={t.body} />
          )}
        </g>
      );
    case "tea":
      return (
        <g>
          <path d="M32 6v10" stroke={t.body} strokeWidth="1.4" />
          <rect x="27" y="4" width="10" height="7" rx="1.5" fill={t.band} stroke={t.body} strokeWidth="1.2" />
          <path d="M19 20h26l-2 34a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3l-2-34Z" fill={t.body} />
          <path d="M22 32h20" stroke={t.band} strokeWidth="9" />
          <path d="M28 40c0-4 3-7 7-7 0 4-3 7-7 7Z" fill={t.body} opacity=".9" />
        </g>
      );
    case "wash":
      return (
        <g>
          <path d="M29 6h9v4h-4v5" stroke={t.body} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          <rect x="28" y="14" width="10" height="6" rx="1.5" fill={t.body} opacity=".85" />
          <rect x="20" y="20" width="26" height="38" rx="8" fill={t.body} />
          <rect x="20" y="31" width="26" height="14" fill={t.band} />
        </g>
      );
    case "skincare":
      return (
        <g>
          <rect x="16" y="22" width="32" height="10" rx="3" fill={t.body} opacity=".85" />
          <rect x="14" y="30" width="36" height="24" rx="6" fill={t.body} />
          <rect x="14" y="37" width="36" height="10" fill={t.band} />
        </g>
      );
  }
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
