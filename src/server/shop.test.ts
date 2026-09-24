import { beforeAll, describe, expect, it } from "vitest";

process.env.PGLITE_DIR = "memory://";
delete process.env.DATABASE_URL;

type Db = Awaited<ReturnType<typeof import("./db").db>>;
let d: Db;
let shop: typeof import("./shop");

beforeAll(async () => {
  d = await (await import("./db")).db();
  shop = await import("./shop");
});

let n = 0;
/** A paying, set-up distributor with a few prices on their shop. */
async function distributor() {
  const [u] = await d.query<{ id: string }>(`insert into users (email, password_hash) values ($1, 'x') returning id`, [`s${++n}@example.com`]);
  const slug = `shop-test-${n}`;
  const [w] = await d.query<{ id: string }>(
    `insert into workspaces (owner_id, plan, owner_name, slug, whatsapp, onboarded_at) values ($1, 'growth', 'Kate Cromuel', $2, '254712345678', now()) returning id`,
    [u.id, slug],
  );
  await d.query(
    `insert into subscriptions (workspace_id, plan, status, current_period_start, current_period_end) values ($1, 'growth', 'active', now(), now() + interval '20 days')`,
    [w.id],
  );
  await shop.savePrices(w.id, {
    arthroxtra: { price: 5250, inStock: true, featured: true },
    "veggie-veggie": { price: 4150, inStock: true, featured: false },
    probio3: { price: 3350, inStock: false, featured: false },
  });
  return { id: w.id, slug };
}

const order = (slug: string, extra: Partial<Parameters<typeof import("./shop").placeShopOrder>[0]> = {}) =>
  shop.placeShopOrder({
    slug,
    name: "Achieng Otieno",
    phone: "0722 111 222",
    fulfilment: "delivery",
    address: "Kilimani, Nairobi",
    pay: "mpesa",
    items: [{ productId: "arthroxtra", qty: 2 }],
    ...extra,
  });

describe("shop orders", () => {
  it("prices from the shop's list, never the browser, and skips what's out of stock", () => {
    const priced = shop.priceOrder(
      [
        { productId: "arthroxtra", qty: 1 },
        { productId: "arthroxtra", qty: 1 },
        { productId: "probio3", qty: 1 },
        { productId: "not-a-product", qty: 3 },
        { productId: "veggie-veggie", qty: -2 },
        { productId: "cerebrain", qty: 1 },
      ],
      { arthroxtra: { price: 5250, inStock: true, featured: false }, probio3: { price: 3350, inStock: false, featured: false } },
    );
    expect(priced.lines).toEqual([
      { productId: "arthroxtra", name: "ArthroXtra Tablets", qty: 2, unitPrice: 5250 },
      { productId: "cerebrain", name: "CereBrain Tablets", qty: 1, unitPrice: 0 },
    ]);
    expect(priced.total).toBe(10500);
    // CereBrain has no price yet, so the distributor confirms the total.
    expect(priced.unpriced).toBe(true);
  });

  it("puts the order, the customer and the history in the distributor's portal", async () => {
    const w = await distributor();
    const r = await order(w.slug, { note: "Evenings are best" });
    expect(r).toMatchObject({ ok: true, demo: false, total: 10500, unpriced: false, firstName: "Achieng" });
    if (!r.ok) return;
    expect(r.ref).toMatch(/^SO-[A-Z2-9]{4}$/);

    const [o] = await d.query<{ status: string; source: string; total: number; customer_note: string; delivery: { fulfilment: string; address: string }; payment_method: string }>(
      `select * from orders where workspace_id = $1`,
      [w.id],
    );
    expect(o).toMatchObject({ status: "unpaid", source: "shop", total: 10500, customer_note: "Evenings are best", payment_method: "mpesa" });
    expect(o.delivery).toEqual({ fulfilment: "delivery", address: "Kilimani, Nairobi" });
    const [c] = await d.query<{ name: string; phone: string; source: string }>(`select * from customers where workspace_id = $1`, [w.id]);
    expect(c).toMatchObject({ name: "Achieng Otieno", phone: "254722111222", source: "shop" });

    // The same phone ordering again is the same customer.
    await order(w.slug);
    const customers = await d.query(`select 1 from customers where workspace_id = $1`, [w.id]);
    expect(customers).toHaveLength(1);
  });

  it("asks for what's missing, one thing at a time", async () => {
    const w = await distributor();
    expect(await order(w.slug, { name: "" })).toMatchObject({ ok: false, field: "name" });
    expect(await order(w.slug, { phone: "12" })).toMatchObject({ ok: false, field: "phone" });
    expect(await order(w.slug, { address: "" })).toMatchObject({ ok: false, field: "address" });
    expect(await order(w.slug, { address: "", fulfilment: "pickup" })).toMatchObject({ ok: true });
    expect(await order(w.slug, { items: [{ productId: "probio3", qty: 1 }] })).toMatchObject({ ok: false, error: "Your basket is empty." });
  });

  it("links a health check plan to the new customer when they choose to share it", async () => {
    const w = await distributor();
    const answers = {
      first_name: "Achieng",
      sex: "female",
      age: 41,
      pregnancy: "none",
      experience: "never",
      goals: ["joints", "energy"],
      conditions: ["none"],
      medications: ["none"],
      restrictions: ["none"],
      plan_size: "focused",
    };
    const r = await order(w.slug, { check: { answers, ref: "SA-AB2C" } });
    expect(r.ok).toBe(true);
    const [p] = await d.query<{ status: string; customer_id: string | null }>(`select status, customer_id from prospects where workspace_id = $1 and ref = 'SA-AB2C'`, [w.id]);
    expect(p.status).toBe("converted");
    expect(p.customer_id).not.toBeNull();
  });

  it("slows down a burst of orders from one number", async () => {
    const w = await distributor();
    for (let i = 0; i < 5; i++) expect((await order(w.slug)).ok).toBe(true);
    expect(await order(w.slug)).toMatchObject({ ok: false });
  });

  it("the example shop confirms without storing anything", async () => {
    const r = await order("kate-cromuel");
    expect(r).toMatchObject({ ok: true, demo: true });
  });
});
