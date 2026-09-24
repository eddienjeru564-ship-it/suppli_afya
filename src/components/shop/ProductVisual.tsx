import clsx from "clsx";
import Image from "next/image";
import photos from "@/config/product-images.json";
import type { Product, ProductLine } from "@/engine";

/**
 * How a product appears anywhere in the shop.
 *
 * With an official photo (see assets/products/README.md), the photo stands on a
 * soft stage with a contact shadow. Every photo is pre-normalised to the same
 * canvas, height and floor, so products line up across the catalogue.
 *
 * Without one, the same stage holds a quiet illustration of the pack's format,
 * coloured by product line. It deliberately carries no name or logo, so it
 * can't be mistaken for (or misrepresent) real packaging.
 */

type Photo = { src: string; small: string; width: number; height: number; source: string };
const PHOTOS = photos as Record<string, Photo>;

export const LINE_TONE: Record<ProductLine, { body: string; band: string; stage: string }> = {
  "Immune Booster": { body: "#4f6e49", band: "#dfe7d6", stage: "#e6ecdf" },
  "Heart & Blood Fit": { body: "#8e4f2c", band: "#ecd5c1", stage: "#f1e3d6" },
  "Sport Fit": { body: "#b07b24", band: "#f3e3c3", stage: "#f3e9d6" },
  "Suma Fit": { body: "#1e3a2b", band: "#c9d6bf", stage: "#e3e9dc" },
  "Men's Power": { body: "#16241c", band: "#cdbfa5", stage: "#e9e1d2" },
  "Women's Beauty": { body: "#a9644d", band: "#f5e4d8", stage: "#f4e6dc" },
  "Suma Living": { body: "#6f7a72", band: "#e9dfce", stage: "#ece5d8" },
};

export function hasPhoto(id: string) {
  return Boolean(PHOTOS[id]);
}

export function ProductVisual({
  product,
  size = "card",
  priority,
  className,
  bare,
}: {
  product: Product;
  size?: "thumb" | "card" | "hero";
  priority?: boolean;
  className?: string;
  /** No stage of its own, for arrangements that share one (the hero shelf). */
  bare?: boolean;
}) {
  const tone = LINE_TONE[product.line];
  const photo = PHOTOS[product.id];
  return (
    <div
      className={clsx("relative isolate aspect-[4/5]", !bare && "overflow-hidden", className)}
      style={bare ? undefined : { background: `radial-gradient(120% 85% at 50% 18%, #fbf8f2 0%, ${tone.stage} 100%)` }}
    >
      {/* contact shadow on the floor every product stands on */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[86%] -z-10 h-[5%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(22_36_28/0.28),transparent)] blur-[2px]"
      />
      {photo ? (
        <Image
          src={size === "hero" ? photo.src : photo.small}
          alt={product.name}
          width={photo.width}
          height={photo.height}
          priority={priority}
          sizes={size === "hero" ? "(min-width: 1024px) 40vw, 90vw" : size === "card" ? "(min-width: 1024px) 22vw, 46vw" : "96px"}
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : (
        <Specimen format={product.format} tone={tone} />
      )}
    </div>
  );
}

/** The illustration, drawn on the same 4:5 canvas and floor as photos. */
function Specimen({ format, tone }: { format: Product["format"]; tone: { body: string; band: string } }) {
  const id = `g-${format}-${tone.body.slice(1)}`;
  const defs = (
    <defs>
      <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
        <stop offset="0.22" stopColor="#fff" stopOpacity="0.05" />
        <stop offset="0.7" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.14" />
      </linearGradient>
    </defs>
  );
  const shade = `url(#${id})`;
  const leaf = (x: number, y: number, s = 1) => (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M-9 9C-9 -1 -2 -9 9 -9c0 10-7 18-18 18Z" fill={tone.body} opacity="0.9" />
  );
  // Canvas 400 × 500; floor at y = 430 (86%).
  let body: React.ReactNode;
  switch (format) {
    case "capsules":
    case "tablets":
      body = (
        <g>
          <rect x="150" y="150" width="100" height="36" rx="8" fill={tone.body} />
          <rect x="150" y="150" width="100" height="36" rx="8" fill={shade} />
          <rect x="130" y="180" width="140" height="250" rx="26" fill={tone.body} />
          <rect x="130" y="250" width="140" height="104" fill={tone.band} />
          <rect x="130" y="180" width="140" height="250" rx="26" fill={shade} />
          {leaf(200, 302, 1.6)}
        </g>
      );
      break;
    case "coffee":
    case "drink":
      body = (
        <g>
          <rect x="138" y="140" width="124" height="290" rx="10" fill={tone.body} />
          <rect x="138" y="140" width="124" height="18" fill="#000" opacity="0.12" />
          <rect x="138" y="262" width="124" height="96" fill={tone.band} />
          <rect x="138" y="140" width="124" height="290" rx="10" fill={shade} />
          {format === "coffee" ? (
            <path
              d="M184 292h28v12a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12v-12Zm28 3h5a6 6 0 0 1 0 12h-5"
              fill="none"
              stroke={tone.body}
              strokeWidth="5"
              strokeLinejoin="round"
            />
          ) : (
            leaf(200, 310, 1.5)
          )}
        </g>
      );
      break;
    case "tea":
      body = (
        <g>
          <rect x="118" y="200" width="164" height="230" rx="12" fill={tone.body} />
          <rect x="118" y="270" width="164" height="90" fill={tone.band} />
          <rect x="118" y="200" width="164" height="230" rx="12" fill={shade} />
          {leaf(200, 315, 1.6)}
        </g>
      );
      break;
    case "wash":
      body = (
        <g>
          <path d="M186 120h40v16h-18v24" stroke={tone.body} strokeWidth="10" fill="none" strokeLinejoin="round" />
          <rect x="180" y="150" width="40" height="30" rx="6" fill={tone.body} />
          <rect x="144" y="176" width="112" height="254" rx="34" fill={tone.body} />
          <rect x="144" y="250" width="112" height="96" fill={tone.band} />
          <rect x="144" y="176" width="112" height="254" rx="34" fill={shade} />
          {leaf(200, 298, 1.4)}
        </g>
      );
      break;
    case "skincare":
      body = (
        <g>
          <rect x="128" y="300" width="144" height="36" rx="10" fill={tone.body} />
          <rect x="116" y="330" width="168" height="100" rx="22" fill={tone.body} />
          <rect x="116" y="356" width="168" height="44" fill={tone.band} />
          <rect x="116" y="330" width="168" height="100" rx="22" fill={shade} />
          {leaf(200, 378, 1.1)}
        </g>
      );
      break;
  }
  return (
    <svg viewBox="0 0 400 500" aria-hidden className="absolute inset-0 h-full w-full">
      {defs}
      {body}
    </svg>
  );
}

export const FORMAT_LABEL: Record<Product["format"], string> = {
  capsules: "Capsules",
  tablets: "Tablets",
  coffee: "Coffee sachets",
  tea: "Tea",
  drink: "Drink sachets",
  wash: "Feminine wash",
  skincare: "Skincare",
};
