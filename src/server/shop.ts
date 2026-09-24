import { randomBytes } from "node:crypto";
import { cache } from "react";
import { DEMO_PRICE_LIST, DEMO_SHOP, type Distributor } from "@/config/distributors";
import { MAX_INTRO, type PriceList, type ShopDetails } from "@/config/shop";
import { CATALOGUE, PRODUCTS_BY_ID, type Answers } from "@/engine";
import { db, json } from "./db";
import { distributorBySlug } from "./distributors";
import { CHECK_REF, saveProspect } from "./leads";
import { normaliseKenyanPhone } from "./payments/mpesa";
import { supplyDaysFor, type OrderItem } from "./portal";

/** Everything the public shop page needs about one distributor. */
export interface Storefront {
  distributor: Distributor;
  details: ShopDetails;
  prices: PriceList;
  /** Products this shop lists, in catalogue order (out of stock ones included, marked). */
  productIds: string[];
}

export async function storefrontBySlug(slug: string): Promise<(Storefront & { workspaceId?: string }) | null> {
  const dist = await distributorBySlug(slug);
  if (!dist) return null;
  if (dist.demo) {
    return { distributor: dist, details: DEMO_SHOP, prices: DEMO_PRICE_LIST, productIds: CATALOGUE.map((p) => p.id) };
  }
  const d = await db();
  const [w] = await d.query<{ shop: ShopDetails }>(`select shop from workspaces where id = $1`, [dist.workspaceId]);
  const rows = await d.query<{ product_id: string; price: number | null; in_stock: boolean; featured: boolean }>(
    `select product_id, price, in_stock, featured from shop_products where workspace_id = $1`,
    [dist.workspaceId],
  );
  const prices: PriceList = Object.fromEntries(rows.map((r) => [r.product_id, { price: r.price, inStock: r.in_stock, featured: r.featured }]));
  const { workspaceId, ...distributor } = dist;
  return { distributor, details: w?.shop ?? {}, prices, productIds: CATALOGUE.map((p) => p.id), workspaceId };
}

/** The public view of a storefront: never includes the workspace id. */
export function publicStorefront(s: Storefront & { workspaceId?: string }): Storefront {
  return { distributor: s.distributor, details: s.details, prices: s.prices, productIds: s.productIds };
}

export async function saveShopDetails(workspaceId: string, details: ShopDetails) {
  const clean: ShopDetails = {
    intro: details.intro?.trim().slice(0, MAX_INTRO) || undefined,
    delivery: details.delivery?.trim().slice(0, 200) || undefined,
    deliveryFee: details.deliveryFee?.trim().slice(0, 120) || undefined,
    pickup: details.pickup?.trim().slice(0, 160) || undefined,
    hours: details.hours?.trim().slice(0, 80) || undefined,
    languages: details.languages?.trim().slice(0, 60) || undefined,
    cashOnDelivery: Boolean(details.cashOnDelivery),
    mpesa:
      details.mpesa && /^\d{5,12}$/.test(details.mpesa.number.replace(/\s/g, ""))
        ? {
            kind: details.mpesa.kind,
            number: details.mpesa.number.replace(/\s/g, ""),
            account: details.mpesa.account?.trim().slice(0, 30) || undefined,
            name: details.mpesa.name?.trim().slice(0, 60) || undefined,
          }
        : undefined,
  };
  const d = await db();
  await d.query(`update workspaces set shop = $2::jsonb where id = $1`, [workspaceId, json(clean)]);
  return clean;
}

export async function savePrices(workspaceId: string, prices: PriceList) {
  const d = await db();
  for (const [productId, p] of Object.entries(prices)) {
    if (!PRODUCTS_BY_ID[productId]) continue;
    const price = p.price === null || !Number.isFinite(p.price) ? null : Math.max(0, Math.min(1_000_000, Math.round(p.price)));
    await d.query(
      `insert into shop_products (workspace_id, product_id, price, in_stock, featured) values ($1, $2, $3, $4, $5)
       on conflict (workspace_id, product_id) do update set price = excluded.price, in_stock = excluded.in_stock,
         featured = excluded.featured, updated_at = now()`,
      [workspaceId, productId, price, Boolean(p.inStock), Boolean(p.featured)],
    );
  }
}

// ------------------------------------------------------------------ ordering

export interface ShopOrderInput {
  slug: string;
  name: string;
  phone: string;
  fulfilment: "delivery" | "pickup";
  address?: string;
  note?: string;
  pay: "mpesa" | "cash";
  items: { productId: string; qty: number }[];
  /** When the order comes from a health check plan, the answers go with it. */
  check?: { answers: Answers; ref: string };
}

export interface PlacedOrder {
  ok: true;
  ref: string;
  demo: boolean;
  lines: OrderItem[];
  /** Sum of priced lines. */
  total: number;
  /** Some products have no price yet; the distributor confirms the total. */
  unpriced: boolean;
  firstName: string;
}

export type OrderResult = PlacedOrder | { ok: false; error: string; field?: string };

const refCode = () =>
  `SO-${Array.from(randomBytes(4), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("")}`;

/** Checks an order against the shop's own price list. Pure apart from the price list passed in. */
export function priceOrder(items: ShopOrderInput["items"], prices: PriceList) {
  const merged = new Map<string, number>();
  for (const i of items ?? []) {
    const p = PRODUCTS_BY_ID[i?.productId];
    const qty = Math.floor(Number(i?.qty));
    if (!p || !Number.isFinite(qty) || qty < 1) continue;
    if (prices[p.id] && !prices[p.id].inStock) continue;
    merged.set(p.id, Math.min(20, (merged.get(p.id) ?? 0) + qty));
  }
  const lines: OrderItem[] = [...merged].slice(0, 20).map(([id, qty]) => ({
    productId: id,
    name: PRODUCTS_BY_ID[id].name,
    qty,
    unitPrice: prices[id]?.price ?? 0,
  }));
  return {
    lines,
    total: lines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
    unpriced: lines.some((l) => !prices[l.productId]?.price),
  };
}

export async function placeShopOrder(input: ShopOrderInput): Promise<OrderResult> {
  const shop = await storefrontBySlug(String(input?.slug ?? ""));
  if (!shop) return { ok: false, error: "This shop isn't available right now." };
  const name = String(input.name ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
  if (name.length < 2) return { ok: false, error: "Add your name so we know who the order is for.", field: "name" };
  const phone = normaliseKenyanPhone(String(input.phone ?? ""));
  if (!phone) return { ok: false, error: "Add a Kenyan mobile number, like 0712 345 678.", field: "phone" };
  const fulfilment = input.fulfilment === "pickup" ? "pickup" : "delivery";
  const address = String(input.address ?? "").trim().slice(0, 200);
  if (fulfilment === "delivery" && address.length < 3) return { ok: false, error: "Where should it be delivered?", field: "address" };
  const note = String(input.note ?? "").trim().slice(0, 400);
  const pay = input.pay === "cash" ? "cash" : "mpesa";
  const { lines, total, unpriced } = priceOrder(input.items, shop.prices);
  if (!lines.length) return { ok: false, error: "Your basket is empty." };

  const ref = refCode();
  const firstName = name.split(" ")[0];
  if (shop.distributor.demo || !shop.workspaceId) return { ok: true, ref, demo: true, lines, total, unpriced, firstName };

  const ws = shop.workspaceId;
  const d = await db();
  // Someone placing order after order in a burst is more likely a mistake (or abuse) than a customer.
  const [{ n }] = await d.query<{ n: number }>(
    `select count(*)::int as n from orders o join customers c on c.id = o.customer_id
      where o.workspace_id = $1 and o.source = 'shop' and c.phone = $2 and o.created_at > now() - interval '1 hour'`,
    [ws, phone],
  );
  if (n >= 5) return { ok: false, error: `You've placed several orders in the last hour. Message ${shop.distributor.firstName} if you need to change one.` };

  let [customer] = await d.query<{ id: string }>(`select id from customers where workspace_id = $1 and phone = $2 limit 1`, [ws, phone]);
  if (!customer) {
    [customer] = await d.query<{ id: string }>(
      `insert into customers (workspace_id, name, phone, source) values ($1, $2, $3, 'shop') returning id`,
      [ws, name, phone],
    );
  }

  if (input.check?.ref && CHECK_REF.test(input.check.ref) && input.check.answers && typeof input.check.answers === "object") {
    const prospectId = await saveProspect({ workspaceId: ws, answers: input.check.answers, ref: input.check.ref, phone, via: "ordered from your shop" });
    if (prospectId) {
      await d.query(`update prospects set status = 'converted', customer_id = $3 where workspace_id = $1 and id = $2`, [ws, prospectId, customer.id]);
      await d.query(`update customers set prospect_id = coalesce(prospect_id, $2) where id = $1`, [customer.id, prospectId]);
    }
  }

  await d.query(
    `insert into orders (workspace_id, customer_id, items, total, status, payment_method, source, ref, customer_note, delivery, reorder_due_at)
     values ($1, $2, $3::jsonb, $4, 'unpaid', $5, 'shop', $6, $7, $8::jsonb, now() + ($9 || ' days')::interval)`,
    [ws, customer.id, json(lines), total, pay, ref, note || null, json({ fulfilment, address: address || null }), String(supplyDaysFor(lines))],
  );
  await d.query(`insert into interactions (workspace_id, customer_id, kind, body) values ($1, $2, 'order', $3)`, [
    ws,
    customer.id,
    `Ordered from your shop (${ref}): ${lines.map((l) => `${l.qty} × ${l.name}`).join(", ")}. ${
      fulfilment === "delivery" ? `Deliver to ${address}.` : "Will collect."
    } Paying by ${pay === "mpesa" ? "M-Pesa" : "cash"}.${note ? ` Note: ${note}` : ""}`,
  ]);
  return { ok: true, ref, demo: false, lines, total, unpriced, firstName };
}

/** One lookup per request, shared by the shop layout, pages and metadata. */
export const getShop = cache(storefrontBySlug);
