import { beforeAll, describe, expect, it } from "vitest";
import type { Workspace } from "./auth";

process.env.PGLITE_DIR = "memory://";
process.env.STOREFRONT_SECRET = "s3cret-for-tests";
delete process.env.DATABASE_URL;

type Db = Awaited<ReturnType<typeof import("./db").db>>;
let d: Db;
let route: typeof import("@/app/api/storefront/orders/route");
let portal: typeof import("./portal");

beforeAll(async () => {
  d = await (await import("./db")).db();
  route = await import("@/app/api/storefront/orders/route");
  portal = await import("./portal");
});

let n = 0;
async function distributor() {
  const [u] = await d.query<{ id: string }>(`insert into users (email, password_hash) values ($1, 'x') returning id`, [`sf${++n}@example.com`]);
  const [w] = await d.query<Workspace>(
    `insert into workspaces (owner_id, plan, owner_name, slug, onboarded_at) values ($1, 'growth', 'Kate Cromuel', $2, now()) returning *`,
    [u.id, `kate-${n}`],
  );
  await d.query(
    `insert into subscriptions (workspace_id, plan, status, current_period_start, current_period_end) values ($1, 'growth', 'active', now(), now() + interval '20 days')`,
    [w.id],
  );
  return w;
}

const order = (slug: string, extra: Record<string, unknown> = {}) => ({
  suppliSlug: slug,
  ref: "KC-7QX2",
  customer: { name: "Achieng Otieno", phone: "254722111222" },
  receive: "delivery",
  deliverTo: { area: "Within Nairobi", address: "Kilimani, near Yaya" },
  payment: "mpesa",
  note: "Evenings are best",
  lines: [{ id: "arthroxtra", name: "ArthroXtra Tablets", qty: 2, unitPrice: 4700, total: 9400 }],
  total: 9400,
  totalConfirmed: false,
  selectorRef: "SA-AB2C",
  ...extra,
});

const post = (body: unknown, secret = "s3cret-for-tests") =>
  route.POST(
    new Request("http://app.test/api/storefront/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify(body),
    }),
  );

describe("orders from a distributor's storefront", () => {
  it("turns away anyone without the shared secret", async () => {
    const w = await distributor();
    expect((await post(order(w.slug!), "wrong")).status).toBe(401);
  });

  it("files the order, the customer and the history in the portal, once", async () => {
    const w = await distributor();
    const res = await post(order(w.slug!));
    expect(res.status).toBe(200);
    const [o] = await d.query<{ source: string; status: string; total: number; ref: string; customer_note: string; delivery: unknown; payment_method: string }>(
      `select * from orders where workspace_id = $1`,
      [w.id],
    );
    expect(o).toMatchObject({ source: "storefront", status: "unpaid", total: 9400, ref: "KC-7QX2", customer_note: "Evenings are best", payment_method: "mpesa" });
    expect(o.delivery).toEqual({ fulfilment: "delivery", area: "Within Nairobi", address: "Kilimani, near Yaya" });
    const [c] = await d.query<{ name: string; phone: string }>(`select name, phone from customers where workspace_id = $1`, [w.id]);
    expect(c).toEqual({ name: "Achieng Otieno", phone: "254722111222" });

    // The storefront retrying the same order doesn't file it twice.
    expect(await (await post(order(w.slug!))).json()).toMatchObject({ ok: true, duplicate: true });
    expect(await d.query(`select 1 from orders where workspace_id = $1`, [w.id])).toHaveLength(1);
  });

  it("puts it at the top of the day as something to confirm", async () => {
    const w = await distributor();
    await post(order(w.slug!, { ref: "KC-9ZZ3" }));
    const [task] = await portal.today(w);
    expect(task).toMatchObject({ key: expect.stringMatching(/^placed:/), title: "Achieng Otieno ordered from your page" });
    expect(task.why).toBe("2 × ArthroXtra Tablets, KES 9,400. Delivery: Within Nairobi · Kilimani, near Yaya. Confirm the total and when it will arrive.");
    expect(task.message).toContain("(KC-9ZZ3)");

    // Until it's confirmed, the order page leads with confirming it; afterwards, with the payment.
    const id = task.key.split(":")[1];
    expect(await portal.pageOrderConfirmed(w.id, id)).toBe(false);
    await d.query(`insert into interactions (workspace_id, kind, task_key) values ($1, 'followup', $2)`, [w.id, task.key]);
    expect(await portal.pageOrderConfirmed(w.id, id)).toBe(true);
    expect((await portal.today(w)).map((t) => t.key)).not.toContain(task.key);
  });

  it("won't file for an unknown distributor or an incomplete order", async () => {
    const w = await distributor();
    expect((await post(order("nobody-here"))).status).toBe(404);
    expect((await post(order(w.slug!, { customer: { name: "Achieng" } }))).status).toBe(422);
    expect((await post(order(w.slug!, { lines: [{ id: "not-a-product", qty: 1, unitPrice: 5 }] }))).status).toBe(422);
  });
});
