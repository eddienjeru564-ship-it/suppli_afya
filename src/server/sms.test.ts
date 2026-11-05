import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { paymentSms, productLine, reorderSms, segments, toGsm } from "./sms/templates";

// Live-mode Africa's Talking against a fake API, on an in-memory database.
process.env.PGLITE_DIR = "memory://";
process.env.AFRICASTALKING_USERNAME = "suppliafya";
process.env.AFRICASTALKING_API_KEY = "atsk_test";
process.env.AFRICASTALKING_SENDER_ID = "SUPPLIAFYA";
process.env.NEXT_PUBLIC_SITE_URL = "https://suppliafya.co.ke";
delete process.env.DATABASE_URL;

type Db = Awaited<ReturnType<typeof import("./db").db>>;
let d: Db;
let sms: typeof import("./sms");

const texts: { to: string; message: string; from: string | null; apiKey: string | null }[] = [];
let failNext = false;

beforeAll(async () => {
  vi.stubGlobal("fetch", async (input: string, init?: RequestInit) => {
    const url = String(input);
    if (!url.endsWith("/version1/messaging")) return new Response("not found", { status: 404 });
    const form = new URLSearchParams(String(init?.body));
    const headers = new Headers(init?.headers);
    texts.push({ to: form.get("to")!, message: form.get("message")!, from: form.get("from"), apiKey: headers.get("apiKey") });
    if (failNext) {
      failNext = false;
      return Response.json({ SMSMessageData: { Message: "Sent to 0/1", Recipients: [{ statusCode: 403, status: "InvalidPhoneNumber" }] } });
    }
    return Response.json({
      SMSMessageData: { Message: "Sent to 1/1", Recipients: [{ statusCode: 101, status: "Success", cost: "KES 0.8000", messageId: `ATX${texts.length}` }] },
    });
  });
  d = await (await import("./db")).db();
  sms = await import("./sms");
});

afterEach(() => {
  texts.length = 0;
});

let n = 0;
async function distributor(opts: { paid?: boolean; reorder?: boolean; payment?: boolean } = {}) {
  const [u] = await d.query<{ id: string }>(`insert into users (email, password_hash) values ($1, 'x') returning id`, [`s${++n}@example.com`]);
  const [w] = await d.query<{ id: string }>(
    `insert into workspaces (owner_id, plan, owner_name, whatsapp, slug, onboarded_at, sms_reorder, sms_payment)
     values ($1, 'suppli', 'Kate Cromuel', '254722750455', $2, now(), $3, $4) returning id`,
    [u.id, `kate-${n}`, opts.reorder ?? true, opts.payment ?? true],
  );
  await d.query(
    `insert into subscriptions (workspace_id, plan, status, current_period_start, current_period_end)
     values ($1, 'suppli', 'active', now(), now() + interval ${opts.paid === false ? "'-10 days'" : "'20 days'"})`,
    [w.id],
  );
  return w.id;
}

async function customer(ws: string, name = "Sarah Achieng", phone: string | null = "254712345678") {
  const [c] = await d.query<{ id: string }>(`insert into customers (workspace_id, name, phone) values ($1, $2, $3) returning id`, [ws, name, phone]);
  return c.id;
}

const ITEMS = JSON.stringify([{ productId: "immuno-guard", name: "Immuno Guard", qty: 1, price: 3900 }]);

async function order(ws: string, cust: string, o: { status: string; ageDays: number; dueInDays?: number; source?: string; total?: number }) {
  const [r] = await d.query<{ id: string }>(
    `insert into orders (workspace_id, customer_id, items, total, status, source, created_at, reorder_due_at)
     values ($1, $2, $3::jsonb, $4, $5, $6, now() - ($7 || ' days')::interval, ${o.dueInDays === undefined ? "null" : "now() + ($8 || ' days')::interval"})
     returning id`,
    o.dueInDays === undefined
      ? [ws, cust, ITEMS, o.total ?? 3900, o.status, o.source ?? "portal", String(o.ageDays)]
      : [ws, cust, ITEMS, o.total ?? 3900, o.status, o.source ?? "portal", String(o.ageDays), String(o.dueInDays)],
  );
  return r.id;
}

describe("reminder texts", () => {
  it("start with a short greeting line, then spaced-out detail, the reply line, the name and the stop link", () => {
    const r = reorderSms({
      customer: { name: "Sarah Achieng" },
      seller: { name: "Kate Cromuel", whatsapp: "254722750455" },
      products: ["Immuno Guard"],
      dueAt: new Date("2026-11-12T09:00:00Z"),
      stopUrl: "suppliafya.co.ke/s/Ab3xK9q",
    });
    expect(r.preview).toBe("Hey Sarah, your Immuno Guard is almost finished.");
    expect(r.body).toBe(
      [
        "Hey Sarah, your Immuno Guard is almost finished.",
        "",
        "By my count it runs out around 12 Nov. Shall I set the next one aside for you?",
        "",
        "Reply on WhatsApp: wa.me/254722750455",
        "",
        "Kate Cromuel",
        "Stop texts: suppliafya.co.ke/s/Ab3xK9q",
      ].join("\n"),
    );
    expect(segments(r.body)).toBeLessThanOrEqual(2);
  });

  it("keep a payment reminder to two segments even with long names and several products", () => {
    const r = paymentSms({
      customer: { name: "Mama Njeri Wambui-Kariuki" },
      seller: { name: "Wanjiku Wellness Consultants Thika", whatsapp: "254712345678" },
      products: ["Ganoderma Coffee 4 in 1", "ArthroXtra Tablets", "Immuno Guard"],
      amount: 12750,
      orderedAt: new Date("2026-10-14T09:00:00Z"),
      stopUrl: "suppliafya.co.ke/s/Ab3xK9q",
    });
    expect(r.preview).toBe("Hey Mama Njeri, a quick reminder about your order.");
    expect(r.body).toContain("KES 12,750 for Ganoderma Coffee 4 in 1 and 2 more, from 14 Oct, is still to be paid.");
    expect(segments(r.body)).toBeLessThanOrEqual(2);
  });

  it("send as plain GSM text: curly quotes and dashes made plain, emoji dropped, accents kept where GSM has them", () => {
    expect(toGsm("Kate’s “best” – now 🌿 café Zoë")).toBe(`Kate's "best" - now café Zoe`);
    expect(segments("a".repeat(160))).toBe(1);
    expect(segments("a".repeat(161))).toBe(2);
    expect(productLine(["A", "A", "B"])).toBe("A and B");
    const two = reorderSms({ customer: { name: "Sarah" }, seller: { name: "Kate", whatsapp: null }, products: ["A", "B"], dueAt: new Date(), stopUrl: "x" });
    expect(two.preview).toBe("Hey Sarah, time for a top-up.");
    expect(two.body).toContain("Your A and B should run out around");
    expect(two.body).toContain("set the next ones aside");
    const long = reorderSms({ customer: { name: "Sarah" }, seller: { name: "Kate", whatsapp: null }, products: ["Pure & Broken Ganoderma Spores"], dueAt: new Date(), stopUrl: "x" });
    expect(long.preview).toBe("Hey Sarah, time for a top-up.");
    expect(long.body).toContain("set the next one aside");
    expect(two.body).not.toContain("wa.me");
  });

  it("go once each: a payment reminder after a few days, a reorder before the customer runs out", async () => {
    const ws = await distributor();
    const sarah = await customer(ws, "Sarah Achieng", "254712345678");
    const john = await customer(ws, "John Otieno", "254733111222");
    await order(ws, sarah, { status: "unpaid", ageDays: 4, total: 7800 });
    await order(ws, john, { status: "paid", ageDays: 28, dueInDays: 2 });
    // Not yet: an unpaid order from yesterday, and a reorder two weeks away.
    const fresh = await customer(ws, "Amina", "254700000001");
    await order(ws, fresh, { status: "unpaid", ageDays: 1 });
    const later = await customer(ws, "Brian", "254700000002");
    await order(ws, later, { status: "paid", ageDays: 5, dueInDays: 14 });

    const r = await sms.sendSmsReminders();
    expect(r.sent).toBeGreaterThanOrEqual(2);
    const mine = texts.filter((t) => ["+254712345678", "+254733111222", "+254700000001", "+254700000002"].includes(t.to));
    expect(mine.map((t) => t.to).sort()).toEqual(["+254712345678", "+254733111222"]);
    expect(mine.find((t) => t.to === "+254712345678")!.message).toMatch(/^Hey Sarah, a quick reminder about your order\.\n\nKES 7,800 for Immuno Guard/);
    expect(mine.find((t) => t.to === "+254733111222")!.message).toMatch(/^Hey John, your Immuno Guard is almost finished\./);
    expect(mine.every((t) => t.from === "SUPPLIAFYA" && t.apiKey === "atsk_test")).toBe(true);

    // In the customer's history, and never sent again.
    const [h] = await d.query<{ n: number }>(`select count(*)::int as n from interactions where customer_id = $1 and kind = 'sms'`, [sarah]);
    expect(h.n).toBe(1);
    texts.length = 0;
    await sms.sendSmsReminders();
    expect(texts.filter((t) => t.to === "+254712345678" || t.to === "+254733111222")).toHaveLength(0);
  });

  it("text a customer at most once a morning", async () => {
    const ws = await distributor();
    const c = await customer(ws, "Grace Wambui", "254744555666");
    await order(ws, c, { status: "paid", ageDays: 30, dueInDays: 1 });
    await order(ws, c, { status: "unpaid", ageDays: 5 });
    await sms.sendSmsReminders();
    // The newer unpaid order means no reorder is due; the payment reminder goes.
    const mine = texts.filter((t) => t.to === "+254744555666");
    expect(mine).toHaveLength(1);
    expect(mine[0].message).toContain("quick reminder about your order");
  });

  it("skip customers who stopped them, kinds the distributor switched off, ended subscriptions and unconfirmed page orders", async () => {
    const ws = await distributor();
    const stopped = await customer(ws, "Stopped", "254711000001");
    await order(ws, stopped, { status: "unpaid", ageDays: 4 });
    await d.query(`update customers set sms_opt_out_at = now(), sms_opt_out_source = 'customer' where id = $1`, [stopped]);
    const page = await customer(ws, "Page order", "254711000002");
    await order(ws, page, { status: "unpaid", ageDays: 4, source: "storefront" });

    const off = await distributor({ payment: false });
    await order(off, await customer(off, "Off", "254711000003"), { status: "unpaid", ageDays: 4 });
    const ended = await distributor({ paid: false });
    await order(ended, await customer(ended, "Ended", "254711000004"), { status: "paid", ageDays: 28, dueInDays: 1 });

    await sms.sendSmsReminders();
    expect(texts.filter((t) => t.to.startsWith("+25471100000"))).toHaveLength(0);
  });

  it("try a failed text again the next morning", async () => {
    const ws = await distributor();
    const c = await customer(ws, "Retry", "254722000111");
    await order(ws, c, { status: "unpaid", ageDays: 4 });
    // Earlier customers in this database are all texted already, so the first text of this run is ours.
    failNext = true;
    await sms.sendSmsReminders();
    const [log] = await d.query<{ status: string; error: string }>(`select status, error from sms_log where customer_id = $1`, [c]);
    expect(log).toMatchObject({ status: "failed", error: "InvalidPhoneNumber" });
    await sms.sendSmsReminders();
    const [again] = await d.query<{ status: string }>(`select status from sms_log where customer_id = $1`, [c]);
    expect(again.status).toBe("sent");
  });

  it("carry a stop link the customer can use, and the distributor can't override", async () => {
    const ws = await distributor();
    const c = await customer(ws, "Linda", "254799888777");
    await order(ws, c, { status: "unpaid", ageDays: 4 });
    await sms.sendSmsReminders();
    const text = texts.find((t) => t.to === "+254799888777")!;
    const token = text.message.match(/suppliafya\.co\.ke\/s\/([A-Za-z0-9]+)$/)![1];
    expect(await sms.stopTarget(token)).toMatchObject({ customerName: "Linda", sellerName: "Kate Cromuel", stopped: false });

    expect(await sms.setStoppedByCustomer(token, true)).toBe(true);
    expect(await sms.stopTarget(token)).toMatchObject({ stopped: true, byCustomer: true });
    expect(await sms.setStoppedByDistributor(ws, c, false)).toBe(false);
    expect(await sms.stopTarget(token)).toMatchObject({ stopped: true });
    expect(await sms.stopTarget("nope")).toBeNull();
  });
});
