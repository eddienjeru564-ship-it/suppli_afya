import type { PriceList } from "@/config/shop";
import { PRODUCTS_BY_ID, type GoalId, type Product } from "@/engine";

/** Shared, pure helpers for the shop: money, messages, and what to show. */

export const kesPrice = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

export type Basket = Record<string, number>;

export function basketLines(basket: Basket, prices: PriceList) {
  return Object.entries(basket)
    .filter(([id, qty]) => PRODUCTS_BY_ID[id] && qty > 0)
    .map(([id, qty]) => ({ product: PRODUCTS_BY_ID[id], qty, price: prices[id]?.price ?? null }));
}

export function basketTotals(basket: Basket, prices: PriceList) {
  const lines = basketLines(basket, prices);
  return {
    lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    total: lines.reduce((s, l) => s + l.qty * (l.price ?? 0), 0),
    unpriced: lines.some((l) => l.price === null),
  };
}

/** The goals a product is most used for, as short readable labels. */
export function usedFor(p: Product, labels: Record<GoalId, { short: string }>, max = 2) {
  return p.goals.slice(0, max).map((g) => labels[g]?.short ?? g);
}

// ---------------------------------------------------------------- WhatsApp messages, in the customer's voice

export function helloMessage(firstName: string) {
  return `Hi ${firstName}, I found your shop on Suppli Afya and I'd like some help choosing.`;
}

export function productQuestion(firstName: string, p: Product) {
  return `Hi ${firstName}, I'm looking at ${p.name} on your shop. Is it right for me? A bit about me: `;
}

export function basketMessage(firstName: string, basket: Basket, prices: PriceList) {
  const { lines, total, unpriced } = basketTotals(basket, prices);
  const list = lines.map((l) => `• ${l.qty} × ${l.product.name}${l.price ? ` (${kesPrice(l.price * l.qty)})` : ""}`);
  return [
    `Hi ${firstName}, I'd like to order:`,
    ...list,
    total ? `${unpriced ? "Subtotal so far" : "Total"}: ${kesPrice(total)}` : "",
    "",
    "Could you confirm and let me know about delivery?",
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");
}

export function orderMessage(opts: {
  firstName: string;
  customer: string;
  ref: string;
  lines: { name: string; qty: number; unitPrice: number }[];
  total: number;
  unpriced: boolean;
  fulfilment: "delivery" | "pickup";
  address?: string;
  pay: "mpesa" | "cash";
}) {
  return [
    `Hi ${opts.firstName}, it's ${opts.customer}. I've just placed order ${opts.ref} on your shop:`,
    ...opts.lines.map((l) => `• ${l.qty} × ${l.name}`),
    opts.total ? `${opts.unpriced ? "Subtotal" : "Total"}: ${kesPrice(opts.total)}` : "",
    opts.fulfilment === "delivery" ? `Delivery to: ${opts.address}` : "I'll collect it.",
    `I'll pay by ${opts.pay === "mpesa" ? "M-Pesa" : "cash"}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
