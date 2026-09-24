/**
 * What a distributor's shop page knows about them beyond name and number.
 * Every field is optional: the page reads well with none of it filled in, and
 * gets more specific (and more reassuring) as the distributor adds detail.
 */
export interface ShopDetails {
  /** A short note in their own words, first person. Shown in the hero and "About". */
  intro?: string;
  /** Where they deliver, and how. Free text, e.g. "Anywhere in Nairobi, usually the next day." */
  delivery?: string;
  /** Delivery cost in their words, e.g. "KES 200 within Nairobi, free over KES 5,000". */
  deliveryFee?: string;
  /** Where customers can collect, if they can. */
  pickup?: string;
  /** How to pay. Shown after an order is placed. */
  mpesa?: { kind: "till" | "paybill" | "phone"; number: string; account?: string; name?: string };
  cashOnDelivery?: boolean;
  /** When they reply, e.g. "8am to 8pm, Monday to Saturday". */
  hours?: string;
  languages?: string;
}

/** One product on their price list. No row means listed, price on request. */
export interface ShopPrice {
  price: number | null;
  inStock: boolean;
  featured: boolean;
}

export type PriceList = Record<string, ShopPrice>;

export const MAX_INTRO = 280;
