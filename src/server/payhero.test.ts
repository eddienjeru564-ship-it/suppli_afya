import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { PaymentRow } from "./payments";

// Live-mode PayHero against a fake PayHero API, on an in-memory database.
process.env.PGLITE_DIR = "memory://";
process.env.PAYHERO_API_USERNAME = "user";
process.env.PAYHERO_API_PASSWORD = "pass";
process.env.PAYHERO_CHANNEL_ID = "911";
process.env.NEXT_PUBLIC_SITE_URL = "https://suppliafya.test";
delete process.env.DATABASE_URL;
delete process.env.PAYHERO_AUTH_TOKEN;
delete process.env.PAYHERO_CALLBACK_TOKEN;

type Db = Awaited<ReturnType<typeof import("./db").db>>;
let d: Db;
let payments: typeof import("./payments");
let payhero: typeof import("./payments/payhero");
let callback: typeof import("@/app/api/payments/payhero/callback/route");

/** What the fake PayHero API says about a transaction reference. */
let statusFor: Record<string, unknown> = {};
let refs = 0;
const sent: { url: string; body: Record<string, unknown> | null; auth: string | null }[] = [];

beforeAll(async () => {
  vi.stubGlobal("fetch", async (input: string, init?: RequestInit) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    sent.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null, auth: headers.get("Authorization") });
    if (url.endsWith("/payments")) {
      const ref = `PH${++refs}`;
      return Response.json({ success: true, status: "QUEUED", reference: ref, CheckoutRequestID: `ws_CO_${ref}` }, { status: 201 });
    }
    if (url.includes("/transaction-status")) {
      const ref = new URL(url).searchParams.get("reference")!;
      return Response.json(statusFor[ref] ?? { status: "QUEUED", reference: ref });
    }
    return new Response("not found", { status: 404 });
  });
  d = await (await import("./db")).db();
  payments = await import("./payments");
  payhero = await import("./payments/payhero");
  callback = await import("@/app/api/payments/payhero/callback/route");
});

afterEach(() => {
  statusFor = {};
  sent.length = 0;
});

let n = 0;
async function workspace() {
  const [u] = await d.query<{ id: string }>(`insert into users (email, password_hash) values ($1, 'x') returning id`, [`ph${++n}@example.com`]);
  const [w] = await d.query<{ id: string }>(`insert into workspaces (owner_id, plan) values ($1, 'growth') returning id`, [u.id]);
  return w.id;
}

async function push(wsId: string) {
  const r = await payments.startPayment({ workspaceId: wsId, email: "a@b.c", plan: "growth", method: "mpesa", phone: "+254 712 345 678", customerName: "Jane Wanjiku" });
  if (!r.ok) throw new Error(r.error);
  return (await payments.getPayment(r.paymentId))!;
}

const post = (body: unknown, token = payhero.callbackToken()) =>
  callback.POST(
    new Request(`https://suppliafya.test/api/payments/payhero/callback?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

const success = (p: PaymentRow, extra: Record<string, unknown> = {}) => ({
  forward_url: "",
  status: true,
  response: {
    Amount: p.amount,
    CheckoutRequestID: `ws_CO_${p.provider_ref}`,
    ExternalReference: p.id,
    MerchantRequestID: "m-1",
    MpesaReceiptNumber: "SIJ7K2L9QX",
    Phone: "+254712345678",
    ResultCode: 0,
    ResultDesc: "The service request is processed successfully.",
    Status: "Success",
    ...extra,
  },
});

const subscription = async (wsId: string) =>
  (await d.query<{ status: string }>(`select status from subscriptions where workspace_id = $1`, [wsId]))[0];

describe("PayHero STK Push", () => {
  it("is live once credentials and a channel are set", () => {
    expect(payments.methodModes().mpesa).toBe("live");
  });

  it("sends the prompt with our reference and a secret callback URL", async () => {
    const p = await push(await workspace());
    const req = sent.find((s) => s.url.endsWith("/payments"))!;
    expect(req.url).toBe("https://backend.payhero.co.ke/api/v2/payments");
    expect(req.auth).toBe(`Basic ${Buffer.from("user:pass").toString("base64")}`);
    expect(req.body).toMatchObject({
      amount: 2900,
      phone_number: "0712345678",
      channel_id: 911,
      provider: "m-pesa",
      external_reference: p.id,
      customer_name: "Jane Wanjiku",
    });
    expect(String(req.body!.callback_url)).toBe(`https://suppliafya.test/api/payments/payhero/callback?token=${payhero.callbackToken()}`);
    expect(p).toMatchObject({ provider: "payhero", status: "pending", provider_ref: expect.stringMatching(/^PH/) });
  });

  it("activates the plan when PayHero confirms, and only once", async () => {
    const ws = await workspace();
    const p = await push(ws);
    statusFor[p.provider_ref!] = { status: "SUCCESS", provider_reference: "SIJ7K2L9QX" };
    expect((await post(success(p))).status).toBe(200);
    expect(await payments.getPayment(p.id)).toMatchObject({ status: "succeeded", receipt: "SIJ7K2L9QX" });
    expect(await subscription(ws)).toMatchObject({ status: "active" });

    await post(success(p));
    const [{ n }] = await d.query<{ n: number }>(`select count(*)::int as n from payments where workspace_id = $1 and status = 'succeeded'`, [ws]);
    expect(n).toBe(1);
  });

  it("rejects callbacks without the secret", async () => {
    const p = await push(await workspace());
    expect((await post(success(p), "wrong")).status).toBe(401);
    expect((await payments.getPayment(p.id))!.status).toBe("pending");
  });

  it("doesn't trust a posted success that PayHero's own record contradicts", async () => {
    const p = await push(await workspace());
    statusFor[p.provider_ref!] = { status: "FAILED", ResultCode: "1032" };
    await post(success(p));
    expect(await payments.getPayment(p.id)).toMatchObject({ status: "failed", failure_reason: "The M-Pesa prompt was cancelled." });
  });

  it("refuses a payment smaller than the plan price", async () => {
    const p = await push(await workspace());
    await post(success(p, { Amount: 10 }));
    expect((await payments.getPayment(p.id))!.status).toBe("failed");
  });

  it("explains a cancelled prompt in plain words", async () => {
    const p = await push(await workspace());
    await post(success(p, { ResultCode: 1032, Status: "Failed", ResultDesc: "Request cancelled by user", MpesaReceiptNumber: "" }));
    expect(await payments.getPayment(p.id)).toMatchObject({ status: "failed", failure_reason: "The M-Pesa prompt was cancelled." });
  });

  it("honours a confirmation that arrives after we'd given up", async () => {
    const ws = await workspace();
    const p = await push(ws);
    await payments.markFailed(p.id, "We didn't hear back from M-Pesa.");
    statusFor[p.provider_ref!] = { status: "SUCCESS", provider_reference: "SLATE12345" };
    await post(success(p, { MpesaReceiptNumber: "SLATE12345" }));
    expect(await payments.getPayment(p.id)).toMatchObject({ status: "succeeded", receipt: "SLATE12345" });
    expect(await subscription(ws)).toMatchObject({ status: "active" });
  });

  it("asks PayHero directly when the callback is slow", async () => {
    const ws = await workspace();
    const p = await push(ws);
    await d.query(`update payments set created_at = now() - interval '20 seconds' where id = $1`, [p.id]);
    statusFor[p.provider_ref!] = { status: "SUCCESS", provider_reference: "SPOLL00001" };
    const fresh = await payments.refreshPending((await payments.getPayment(p.id))!);
    expect(fresh).toMatchObject({ status: "succeeded", receipt: "SPOLL00001" });
  });

  it("counts a paid first prompt when a second one was sent", async () => {
    const ws = await workspace();
    const first = await push(ws);
    const second = await push(ws);
    statusFor[first.provider_ref!] = { status: "SUCCESS" };
    await post(success(first));
    expect(await payments.siblingSucceeded(second)).toBe(true);
  });

  it("limits how many prompts one account can send", async () => {
    const ws = await workspace();
    for (let i = 0; i < 5; i++) await push(ws);
    const r = await payments.startPayment({ workspaceId: ws, email: "a@b.c", plan: "growth", method: "mpesa", phone: "0712345678" });
    expect(r).toMatchObject({ ok: false, error: expect.stringContaining("Wait ten minutes") });
  });
});
