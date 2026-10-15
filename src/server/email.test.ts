import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { Workspace } from "./auth";

// An in-memory database, test payments, and a Resend key so emails go through the (mocked) API.
process.env.PGLITE_DIR = "memory://";
process.env.PAYMENTS_ALLOW_TEST = "true";
process.env.RESEND_API_KEY = "re_test";
process.env.NEXT_PUBLIC_SITE_URL = "https://suppliafya.co.ke";
delete process.env.DATABASE_URL;

type Db = Awaited<ReturnType<typeof import("./db").db>>;
let d: Db;
let payments: typeof import("./payments");
let email: typeof import("./email");
let passwords: typeof import("./passwords");
let auth: typeof import("./auth");

interface Sent {
  to: string[];
  subject: string;
  html: string;
  text: string;
  tags: { name: string; value: string }[];
}
let sent: Sent[] = [];
let resendUp = true;

beforeAll(async () => {
  d = await (await import("./db")).db();
  payments = await import("./payments");
  email = await import("./email");
  passwords = await import("./passwords");
  auth = await import("./auth");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      if (url !== "https://api.resend.com/emails") throw new Error(`Unexpected fetch ${url}`);
      if (!resendUp) return new Response("down", { status: 503 });
      sent.push(JSON.parse(String(init.body)));
      return Response.json({ id: "em_1" });
    }),
  );
});

afterEach(() => {
  sent = [];
  resendUp = true;
});

const kinds = () => sent.map((s) => s.tags[0].value);

let n = 0;
async function workspace(extra: Partial<Workspace> = {}) {
  const addr = `dist${++n}@example.com`;
  const [u] = await d.query<{ id: string }>(`insert into users (email, password_hash) values ($1, $2) returning id`, [
    addr,
    await auth.hashPassword("old-password"),
  ]);
  const [w] = await d.query<Workspace>(`insert into workspaces (owner_id, plan, owner_name, slug) values ($1, 'growth', $2, $3) returning *`, [
    u.id,
    extra.owner_name ?? null,
    extra.slug ?? null,
  ]);
  return { w, userId: u.id, email: addr };
}

async function pay(workspaceId: string) {
  const r = await payments.startPayment({ workspaceId, email: "x@example.com", plan: "growth", method: "mpesa", phone: "0712345678" });
  if (!r.ok) throw new Error(r.error);
  await payments.markSucceeded(r.paymentId, "QWE123ABC");
  return r.paymentId;
}

describe("payment emails", () => {
  it("welcomes a distributor on their first payment, then sends a receipt for each renewal", async () => {
    const { w, email: to } = await workspace({ owner_name: "Mama Njeri Wambui" });
    const first = await pay(w.id);
    expect(kinds()).toEqual(["welcome"]);
    expect(sent[0].to).toEqual([to]);
    expect(sent[0].subject).toBe("Welcome to Suppli Afya");
    expect(sent[0].text).toContain("Hi Mama Njeri, thank you for joining. Your Growth subscription is active.");
    expect(sent[0].text).toContain("Set up your page: https://suppliafya.co.ke/start/setup");
    expect(sent[0].text).toContain("Amount: KES 3,500");
    expect(sent[0].text).toContain("Receipt: QWE123ABC");

    // A webhook reporting the same payment again sends nothing.
    await payments.markSucceeded(first, "QWE123ABC", { confirmed: true });
    expect(kinds()).toEqual(["welcome"]);

    await pay(w.id);
    expect(kinds()).toEqual(["welcome", "receipt"]);
    expect(sent[1].subject).toBe("Payment received: Growth subscription, KES 3,500");
  });

  it("never fails a payment because an email couldn't go out", async () => {
    resendUp = false;
    const { w } = await workspace();
    await expect(pay(w.id)).resolves.toBeTruthy();
    const [s] = await d.query<{ status: string }>(`select status from subscriptions where workspace_id = $1`, [w.id]);
    expect(s.status).toBe("active");
  });
});

describe("page live email", () => {
  it("sends the link and how to share it, once", async () => {
    const { w } = await workspace({ owner_name: "Kate Cromuel", slug: "kate-cromuel" });
    await email.notifyPageLive(w.id);
    await email.notifyPageLive(w.id);
    expect(kinds()).toEqual(["page_live"]);
    expect(sent[0].subject).toBe("Your page is live: suppliafya.co.ke/d/kate-cromuel");
    expect(sent[0].text).toContain("Open your page: https://suppliafya.co.ke/d/kate-cromuel");
  });
});

describe("subscription emails", () => {
  async function ending(inDays: number) {
    const ws = await workspace({ owner_name: "Wanjiru" });
    await d.query(
      `insert into subscriptions (workspace_id, plan, status, current_period_start, current_period_end)
       values ($1, 'growth', 'active', now() - interval '1 month', now() + ($2 || ' days')::interval)`,
      [ws.w.id, String(inDays)],
    );
    return ws;
  }

  it("reminds a few days before the end, says when it has ended, and sends each once", async () => {
    const soon = await ending(2);
    const ended = await ending(-1);
    const later = await ending(20);
    const gone = await ending(-10);

    await email.sendSubscriptionEmails();
    const to = (addr: string) => sent.filter((s) => s.to[0] === addr).map((s) => s.tags[0].value);
    expect(to(soon.email)).toEqual(["renewal_due"]);
    expect(to(ended.email)).toEqual(["subscription_ended"]);
    expect(to(later.email)).toEqual([]);
    expect(to(gone.email)).toEqual([]);
    expect(sent.find((s) => s.to[0] === soon.email)!.text).toContain("Renew now: https://suppliafya.co.ke/start/pay?renew=1&plan=growth");

    sent = [];
    await email.sendSubscriptionEmails();
    expect(to(soon.email)).toEqual([]);
    expect(to(ended.email)).toEqual([]);
  });

  it("tries again on the next run when Resend was down", async () => {
    const soon = await ending(1);
    resendUp = false;
    await email.sendSubscriptionEmails();
    resendUp = true;
    await email.sendSubscriptionEmails();
    expect(sent.filter((s) => s.to[0] === soon.email).map((s) => s.tags[0].value)).toEqual(["renewal_due"]);
  });
});

describe("password reset", () => {
  const tokenFrom = (s: Sent) => decodeURIComponent(/token=([^\s"&]+)/.exec(s.text)![1]);

  it("emails a one-time link, sets the new password, signs out everywhere and says so", async () => {
    const { userId, email: addr } = await workspace();
    await d.query(`insert into sessions (token_hash, user_id, expires_at) values ('old-session', $1, now() + interval '1 day')`, [userId]);

    await passwords.requestPasswordReset(` ${addr.toUpperCase()} `);
    expect(kinds()).toEqual(["password_reset"]);
    const token = tokenFrom(sent[0]);
    expect(sent[0].text).toContain("https://suppliafya.co.ke/login/reset?token=");
    expect(await passwords.resetTokenUser(token)).toEqual({ userId, email: addr });

    expect(await passwords.resetPassword(token, "short")).toMatchObject({ ok: false });
    expect(await passwords.resetPassword(token, "a-new-password")).toEqual({ ok: true, userId });
    expect(kinds()).toEqual(["password_reset", "password_changed"]);

    const [u] = await d.query<{ password_hash: string }>(`select password_hash from users where id = $1`, [userId]);
    expect(await auth.verifyPassword("a-new-password", u.password_hash)).toBe(true);
    expect(await d.query(`select 1 from sessions where user_id = $1`, [userId])).toEqual([]);

    // The link is used up.
    expect(await passwords.resetTokenUser(token)).toBeNull();
    expect(await passwords.resetPassword(token, "another-password")).toMatchObject({ ok: false, expired: true });
  });

  it("says nothing about emails without an account, and limits how many links one account gets", async () => {
    await passwords.requestPasswordReset("nobody@example.com");
    expect(sent).toEqual([]);

    const { email: addr } = await workspace();
    for (let i = 0; i < 5; i++) await passwords.requestPasswordReset(addr);
    expect(kinds()).toEqual(["password_reset", "password_reset", "password_reset"]);
  });

  it("refuses expired links", async () => {
    const { email: addr } = await workspace();
    await passwords.requestPasswordReset(addr);
    const token = tokenFrom(sent[0]);
    await d.query(`update password_resets set expires_at = now() - interval '1 minute'`);
    expect(await passwords.resetTokenUser(token)).toBeNull();
    expect(await passwords.resetPassword(token, "a-new-password")).toMatchObject({ ok: false, expired: true });
  });
});

describe("email templates", () => {
  it("escapes what people typed, in the HTML", async () => {
    const t = await import("./email/templates");
    const e = t.pageLiveEmail({ name: "<b>Kate</b>", pageUrl: "https://x/d/k", displayUrl: "x/d/k", cardUrl: "https://x/card", portalUrl: "https://x/portal" });
    expect(e.html).not.toContain("<b>Kate</b>");
    expect(e.html).toContain("&lt;b&gt;Kate&lt;/b&gt;");
  });

  it("keeps every sentence short and the banned words out", async () => {
    const t = await import("./email/templates");
    const p = { name: "Kate", plan: "Growth", amount: 3500, method: "M-Pesa", receipt: "QWE", paidUntil: new Date() };
    const all = [
      t.welcomeEmail({ ...p, setupUrl: "https://x" }),
      t.receiptEmail({ ...p, portalUrl: "https://x" }),
      t.pageLiveEmail({ name: "Kate", pageUrl: "https://x", displayUrl: "x", cardUrl: "https://x", portalUrl: "https://x" }),
      t.passwordResetEmail({ resetUrl: "https://x" }),
      t.passwordChangedEmail({ when: new Date(), forgotUrl: "https://x" }),
      t.renewalDueEmail({ name: "Kate", plan: "Growth", price: 3500, endsOn: new Date(), renewUrl: "https://x" }),
      t.subscriptionEndedEmail({ name: "Kate", plan: "Growth", endedOn: new Date(), pageClosesOn: new Date(), renewUrl: "https://x" }),
    ];
    for (const e of all) {
      expect(e.text).not.toMatch(/\b(AI|automation|seamless|effortless|unlock|empower|leads|CRM|quiz)\b/i);
      expect(e.text).not.toContain("—");
      for (const sentence of e.text.split(/(?<=[.!?:])\s+|\n/)) expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(25);
    }
  });
});
