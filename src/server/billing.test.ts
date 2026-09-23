import { beforeAll, describe, expect, it } from "vitest";
import type { Workspace } from "./auth";

// An in-memory database per test file. Set before the server modules read their env.
process.env.PGLITE_DIR = "memory://";
process.env.PAYMENTS_ALLOW_TEST = "true";
delete process.env.DATABASE_URL;
delete process.env.MPESA_CONSUMER_KEY;
delete process.env.PAYSTACK_SECRET_KEY;

type Db = Awaited<ReturnType<typeof import("./db").db>>;
let d: Db;
let payments: typeof import("./payments");
let portal: typeof import("./portal");

beforeAll(async () => {
  d = await (await import("./db")).db();
  payments = await import("./payments");
  portal = await import("./portal");
});

let n = 0;
async function workspace(goals: string[] = []) {
  const [u] = await d.query<{ id: string }>(`insert into users (email, password_hash) values ($1, 'x') returning id`, [
    `t${++n}@example.com`,
  ]);
  const [w] = await d.query<Workspace>(
    `insert into workspaces (owner_id, plan, owner_name, goals) values ($1, 'growth', 'Jane Wanjiku', $2::jsonb) returning *`,
    [u.id, JSON.stringify(goals)],
  );
  return w;
}

const subscription = async (wsId: string) =>
  (
    await d.query<{ plan: string; status: string; current_period_end: Date }>(
      `select plan, status, current_period_end from subscriptions where workspace_id = $1`,
      [wsId],
    )
  )[0];

const days = (a: Date, b: Date) => Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400_000);

describe("billing", () => {
  it("uses test payments when no keys are configured", () => {
    expect(payments.methodModes()).toEqual({ mpesa: "test", card: "test" });
  });

  it("rejects an M-Pesa payment without a valid number", async () => {
    const w = await workspace();
    const r = await payments.startPayment({ workspaceId: w.id, email: "a@b.c", plan: "growth", method: "mpesa", phone: "123" });
    expect(r.ok).toBe(false);
  });

  it("activates a month of the chosen plan once, however many confirmations arrive", async () => {
    const w = await workspace();
    const r = await payments.startPayment({
      workspaceId: w.id,
      email: "a@b.c",
      plan: "pro",
      method: "mpesa",
      phone: "0712 345 678",
    });
    expect(r).toMatchObject({ ok: true, next: "test" });
    if (!r.ok) return;

    const p = await payments.getPayment(r.paymentId);
    expect(p).toMatchObject({ status: "pending", amount: 4900, phone: "254712345678", plan: "pro" });
    expect(await subscription(w.id)).toBeUndefined();

    expect(await payments.markSucceeded(r.paymentId, "TEST123")).toBe(true);
    const first = await subscription(w.id);
    expect(first).toMatchObject({ plan: "pro", status: "active" });
    expect(days(first.current_period_end, new Date())).toBeGreaterThanOrEqual(28);

    // A late callback or a second poll must not add another month.
    expect(await payments.markSucceeded(r.paymentId, "TEST123")).toBe(false);
    expect((await subscription(w.id)).current_period_end).toEqual(first.current_period_end);

    const [ws] = await d.query<{ plan: string }>(`select plan from workspaces where id = $1`, [w.id]);
    expect(ws.plan).toBe("pro");
  });

  it("keeps the account after a failed payment and lets the retry succeed", async () => {
    const w = await workspace();
    const a = await payments.startPayment({ workspaceId: w.id, email: "a@b.c", plan: "growth", method: "card" });
    if (!a.ok) throw new Error(a.error);
    await payments.markFailed(a.paymentId, "Cancelled on the phone.");
    expect(await payments.getPayment(a.paymentId)).toMatchObject({ status: "failed", failure_reason: "Cancelled on the phone." });
    // A failed payment can't later be marked paid.
    expect(await payments.markSucceeded(a.paymentId, null)).toBe(false);
    expect(await subscription(w.id)).toBeUndefined();

    const b = await payments.startPayment({ workspaceId: w.id, email: "a@b.c", plan: "growth", method: "card" });
    if (!b.ok) throw new Error(b.error);
    expect(await payments.markSucceeded(b.paymentId, null)).toBe(true);
    expect(await subscription(w.id)).toMatchObject({ plan: "growth", status: "active" });
  });

  it("extends a renewal from the end of the current period, not from today", async () => {
    const w = await workspace();
    const start = async () => {
      const r = await payments.startPayment({ workspaceId: w.id, email: "a@b.c", plan: "starter", method: "card" });
      if (!r.ok) throw new Error(r.error);
      await payments.markSucceeded(r.paymentId, null);
      return (await subscription(w.id)).current_period_end;
    };
    const firstEnd = await start();
    const secondEnd = await start();
    expect(days(secondEnd, firstEnd)).toBeGreaterThanOrEqual(28);
    expect(days(secondEnd, new Date())).toBeGreaterThanOrEqual(56);
  });

  it("starts a lapsed plan again from today", async () => {
    const w = await workspace();
    await d.query(
      `insert into subscriptions (workspace_id, plan, status, current_period_start, current_period_end)
       values ($1, 'growth', 'active', now() - interval '3 months', now() - interval '2 months')`,
      [w.id],
    );
    const r = await payments.startPayment({ workspaceId: w.id, email: "a@b.c", plan: "growth", method: "card" });
    if (!r.ok) throw new Error(r.error);
    await payments.markSucceeded(r.paymentId, null);
    const end = (await subscription(w.id)).current_period_end;
    expect(days(end, new Date())).toBeGreaterThanOrEqual(28);
    expect(days(end, new Date())).toBeLessThanOrEqual(31);
  });
});

describe("today's list", () => {
  async function seed(goals: string[]) {
    const w = await workspace(goals);
    await d.query(
      `insert into prospects (workspace_id, ref, name, phone) values ($1, 'SA-0001', 'Wanjiru', '254700000001')`,
      [w.id],
    );
    const [c] = await d.query<{ id: string }>(
      `insert into customers (workspace_id, name, phone) values ($1, 'Achieng Otieno', '254700000002') returning id`,
      [w.id],
    );
    await d.query(
      `insert into orders (workspace_id, customer_id, items, total, status) values ($1, $2, $3::jsonb, 7800, 'unpaid')`,
      [w.id, c.id, JSON.stringify([{ productId: "x", name: "Veggie Veggie", qty: 1, price: 7800 }])],
    );
    const [c2] = await d.query<{ id: string }>(
      `insert into customers (workspace_id, name, phone) values ($1, 'Otieno', '254700000003') returning id`,
      [w.id],
    );
    await d.query(
      `insert into orders (workspace_id, customer_id, items, total, status, created_at, reorder_due_at)
       values ($1, $2, $3::jsonb, 3500, 'paid', now() - interval '28 days', now() + interval '2 days')`,
      [w.id, c2.id, JSON.stringify([{ productId: "x", name: "ArthroXtra", qty: 1, price: 3500 }])],
    );
    return w;
  }

  it("puts the work that matches the distributor's goals first", async () => {
    const repeat = await seed(["repeat"]);
    expect((await portal.today(repeat)).map((t) => t.kind)).toEqual(["reorder", "new", "payment"]);

    const payments = await seed(["payments"]);
    expect((await portal.today(payments)).map((t) => t.kind)).toEqual(["payment", "new", "reorder"]);
  });

  it("drops a task once it's marked done", async () => {
    const w = await seed([]);
    const [first] = await portal.today(w);
    await d.query(`insert into interactions (workspace_id, kind, task_key) values ($1, 'task_done', $2)`, [w.id, first.key]);
    expect((await portal.today(w)).map((t) => t.key)).not.toContain(first.key);
  });

  it("writes messages with the customer's first name", async () => {
    const w = await seed([]);
    const unpaid = (await portal.today(w)).find((t) => t.kind === "payment")!;
    expect(unpaid.message).toMatch(/^Hi Achieng,/);
    expect(unpaid.why).toContain("KES 7,800");
  });
});
