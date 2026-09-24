import type { PriceList, ShopDetails } from "./shop";

/**
 * Distributor entry points. Real distributors come from the database (see
 * src/server/shop.ts); the demo distributor lives here and is the template
 * every shop page is designed around.
 *
 * `whatsapp: null` puts the page in demo mode: plans, messages and orders are
 * shown, but nothing opens a chat or reaches anyone. Never put a real number on a demo.
 */
export interface Distributor {
  slug: string;
  name: string;
  firstName: string;
  area: string;
  whatsapp: string | null;
  demo: boolean;
  /** Line under the name on the health check, e.g. "Afya Bora Pharmacy · Thika". */
  tagline?: string;
}

/**
 * Kate Cromuel: the canonical shop. Her area, note, delivery and payment
 * details below are placeholders written to show how a finished shop reads,
 * and Kate's prices are illustrative. Replace them with what Kate confirms.
 */
export const DEMO_DISTRIBUTOR: Distributor = {
  slug: "kate-cromuel",
  name: "Kate Cromuel",
  firstName: "Kate",
  area: "Nairobi",
  whatsapp: null,
  demo: true,
  tagline: "BF Suma distributor · Nairobi",
};

export const DEMO_SHOP: ShopDetails = {
  intro:
    "I'll help you choose what actually suits you, and I'll tell you honestly when something isn't worth it. Ask me anything before you buy.",
  delivery: "Across Nairobi, usually the next working day. Outside Nairobi by courier.",
  deliveryFee: "Agreed when I confirm your order, based on where you are.",
  pickup: "You can also collect in town on weekdays.",
  mpesa: { kind: "till", number: "000000", name: "Kate Cromuel" },
  cashOnDelivery: true,
  hours: "8am to 8pm, Monday to Saturday",
  languages: "English and Kiswahili",
};

/** Illustrative prices for the demo shop only. Real shops set their own in the portal. */
const DEMO_PRICES: Record<string, number> = {
  "refined-yunzhi": 6750,
  "ganoderma-spores": 8950,
  "quad-reishi": 4650,
  "cordyceps-coffee": 2400,
  "reishi-coffee": 2400,
  "nmn-coffee": 3950,
  "micro2-cycle": 4950,
  "relivin-tea": 2250,
  cerebrain: 4250,
  detoxilive: 3650,
  arthroxtra: 5250,
  "gluzojoint-f": 4850,
  "zaminocal-plus": 3850,
  "femicalcium-d3": 3450,
  "veggie-veggie": 4150,
  probio3: 3350,
  constirelax: 2950,
  "novel-depile": 3750,
  "ez-xlim": 4450,
  gymeffect: 4650,
  glugogone: 4550,
  "nmn-duo": 9850,
  "youth-ever": 5650,
  feminergy: 3950,
  femicare: 1950,
  "youth-essence": 6450,
  prostatrelax: 4850,
  "xpower-man-plus": 5450,
  "xpower-coffee": 2650,
};
const DEMO_FEATURED = ["ganoderma-spores", "arthroxtra", "veggie-veggie", "cordyceps-coffee"];

export const DEMO_PRICE_LIST: PriceList = Object.fromEntries(
  Object.entries(DEMO_PRICES).map(([id, price]) => [id, { price, inStock: true, featured: DEMO_FEATURED.includes(id) }]),
);

export const DISTRIBUTORS: Distributor[] = [DEMO_DISTRIBUTOR];

/** Slugs a real distributor can't take. */
export const RESERVED_SLUGS = ["kate-cromuel", "grace", "demo", "check", "shop"];

export function findDistributor(slug: string) {
  return DISTRIBUTORS.find((d) => d.slug === slug) ?? null;
}
