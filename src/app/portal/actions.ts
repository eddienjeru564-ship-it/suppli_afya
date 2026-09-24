"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BUSINESS_TYPES, CHANNELS, GOALS } from "@/config/onboarding";
import { PLANS_BY_ID } from "@/config/plans";
import { PRODUCTS_BY_ID } from "@/engine";
import { getAccount, subscriptionState, type Account } from "@/server/auth";
import { db, json } from "@/server/db";
import { pushConfigured } from "@/server/env";
import { removeSubscription, saveSubscription, sendTo, type PushSubscriptionJSON } from "@/server/push";
import { normaliseKenyanPhone } from "@/server/payments/mpesa";
import { customerCount, supplyDaysFor, type OrderItem } from "@/server/portal";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function requireAccount(): Promise<Account> {
  const a = await getAccount();
  if (!a || subscriptionState(a) === "inactive" || !a.workspace.onboarded_at) redirect("/login");
  return a;
}

const text = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const phoneOrNull = (v: FormDataEntryValue | null) => {
  const raw = text(v, 30);
  if (!raw) return { ok: true as const, phone: null };
  const p = normaliseKenyanPhone(raw);
  return p ? { ok: true as const, phone: p } : { ok: false as const };
};

async function withinCustomerLimit(a: Account) {
  const limit = PLANS_BY_ID[a.workspace.plan].customerLimit;
  if (limit === null) return true;
  return (await customerCount(a.workspace.id)) < limit;
}

const LIMIT_ERROR = "You've reached the 50 customers included in Starter. Move to Growth for unlimited customers.";

// ------------------------------------------------------------------ Today

export async function markDone(taskKey: string, note: string) {
  const a = await requireAccount();
  const d = await db();
  const [kind, id] = taskKey.split(":");
  const col = kind === "prospect" ? "prospect_id" : "customer_id";
  let refId: string | null = null;
  if (kind === "prospect") refId = id;
  else if (kind === "quiet") refId = id;
  else {
    const [o] = await d.query<{ customer_id: string }>(`select customer_id from orders where workspace_id = $1 and id = $2`, [a.workspace.id, id]);
    refId = o?.customer_id ?? null;
  }
  await d.query(
    `insert into interactions (workspace_id, ${col}, kind, body, task_key) values ($1, $2, 'followup', $3, $4)`,
    [a.workspace.id, refId, text(note, 300) || "Followed up.", taskKey],
  );
  if (kind === "prospect") {
    await d.query(`update prospects set status = 'contacted', contacted_at = now() where workspace_id = $1 and id = $2 and status = 'new'`, [
      a.workspace.id,
      id,
    ]);
  }
  revalidatePath("/portal", "layout");
}

export async function dismissCommunity() {
  const a = await requireAccount();
  const d = await db();
  await d.query(`update workspaces set community_dismissed_at = now() where id = $1`, [a.workspace.id]);
  revalidatePath("/portal");
}

// ------------------------------------------------------------------ Prospects

export async function setProspectStatus(id: string, status: "new" | "contacted" | "closed") {
  const a = await requireAccount();
  const d = await db();
  await d.query(
    `update prospects set status = $3, contacted_at = case when $3 = 'contacted' then coalesce(contacted_at, now()) else contacted_at end
      where workspace_id = $1 and id = $2 and status <> 'converted'`,
    [a.workspace.id, id, status],
  );
  if (status === "contacted")
    await d.query(`insert into interactions (workspace_id, prospect_id, kind, body, task_key) values ($1, $2, 'followup', 'Marked as contacted.', $3)`, [
      a.workspace.id,
      id,
      `prospect:${id}`,
    ]);
  revalidatePath("/portal", "layout");
}

export async function saveProspectPhone(id: string, raw: string): Promise<ActionResult> {
  const a = await requireAccount();
  const p = normaliseKenyanPhone(raw);
  if (!p) return { ok: false, error: "Use a Kenyan number, like 0712 345 678." };
  const d = await db();
  await d.query(`update prospects set phone = $3 where workspace_id = $1 and id = $2`, [a.workspace.id, id, p]);
  revalidatePath(`/portal/prospects/${id}`);
  return { ok: true };
}

// ------------------------------------------------------------------ Customers

export async function addCustomer(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const a = await requireAccount();
  const name = text(fd.get("name"), 60);
  const phone = phoneOrNull(fd.get("phone"));
  if (name.length < 2) return { ok: false, error: "Add the customer's name." };
  if (!phone.ok) return { ok: false, error: "Use a Kenyan number, like 0712 345 678, or leave it blank." };
  if (!(await withinCustomerLimit(a))) return { ok: false, error: LIMIT_ERROR };
  const d = await db();
  const [c] = await d.query<{ id: string }>(
    `insert into customers (workspace_id, name, phone, notes) values ($1, $2, $3, $4) returning id`,
    [a.workspace.id, name, phone.phone, text(fd.get("notes"), 500) || null],
  );
  revalidatePath("/portal", "layout");
  redirect(`/portal/customers/${c.id}`);
}

export async function addNote(customerId: string, note: string): Promise<ActionResult> {
  const a = await requireAccount();
  const body = note.trim().slice(0, 1000);
  if (!body) return { ok: false, error: "Write a note first." };
  const d = await db();
  await d.query(`insert into interactions (workspace_id, customer_id, kind, body) values ($1, $2, 'note', $3)`, [a.workspace.id, customerId, body]);
  revalidatePath(`/portal/customers/${customerId}`);
  return { ok: true };
}

/** Growth and Pro: paste rows of "name, phone" from a spreadsheet. */
export async function importCustomers(_prev: ActionResult | null, fd: FormData): Promise<ActionResult & { added?: number; skipped?: number }> {
  const a = await requireAccount();
  if (!PLANS_BY_ID[a.workspace.plan].canImport) return { ok: false, error: "Importing is included in Growth and Pro." };
  const rows = String(fd.get("rows") ?? "")
    .split(/\r?\n/)
    .map((l) => l.split(/[,\t;]/).map((x) => x.trim()))
    .filter((r) => r[0] && !/^name$/i.test(r[0]));
  if (!rows.length) return { ok: false, error: "Paste at least one line, like: Mary Njeri, 0712 345 678" };
  const d = await db();
  const existing = new Set(
    (await d.query<{ phone: string }>(`select phone from customers where workspace_id = $1 and phone is not null`, [a.workspace.id])).map((r) => r.phone),
  );
  let added = 0;
  let skipped = 0;
  for (const r of rows.slice(0, 2000)) {
    const name = r[0].slice(0, 60);
    const phone = r[1] ? normaliseKenyanPhone(r[1]) : null;
    if (name.length < 2 || (phone && existing.has(phone))) {
      skipped++;
      continue;
    }
    await d.query(`insert into customers (workspace_id, name, phone, source) values ($1, $2, $3, 'import')`, [a.workspace.id, name, phone]);
    if (phone) existing.add(phone);
    added++;
  }
  revalidatePath("/portal", "layout");
  return { ok: true, added, skipped };
}

// ------------------------------------------------------------------ Orders

export interface NewOrderInput {
  customerId?: string;
  prospectId?: string;
  newName?: string;
  newPhone?: string;
  items: { productId: string; qty: number; unitPrice: number }[];
  paid?: { method: "mpesa" | "cash" | "other"; ref?: string } | null;
}

export async function createOrder(input: NewOrderInput): Promise<ActionResult> {
  const a = await requireAccount();
  const ws = a.workspace.id;
  const d = await db();

  const items: OrderItem[] = input.items
    .filter((i) => PRODUCTS_BY_ID[i.productId] && i.qty > 0)
    .map((i) => ({
      productId: i.productId,
      name: PRODUCTS_BY_ID[i.productId].name,
      qty: Math.min(99, Math.round(i.qty)),
      unitPrice: Math.max(0, Math.round(i.unitPrice)),
    }));
  if (!items.length) return { ok: false, error: "Add at least one product." };
  const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  if (total <= 0) return { ok: false, error: "Add the price for each product." };

  let customerId = input.customerId ?? null;
  if (customerId) {
    const ok = await d.query(`select 1 from customers where workspace_id = $1 and id = $2`, [ws, customerId]);
    if (!ok.length) return { ok: false, error: "That customer wasn't found." };
  } else if (input.prospectId) {
    const [p] = await d.query<{ id: string; name: string; phone: string | null; customer_id: string | null }>(
      `select id, name, phone, customer_id from prospects where workspace_id = $1 and id = $2`,
      [ws, input.prospectId],
    );
    if (!p) return { ok: false, error: "That prospect wasn't found." };
    if (p.customer_id) customerId = p.customer_id;
    else {
      if (!(await withinCustomerLimit(a))) return { ok: false, error: LIMIT_ERROR };
      const [c] = await d.query<{ id: string }>(
        `insert into customers (workspace_id, name, phone, source, prospect_id) values ($1, $2, $3, 'health_check', $4) returning id`,
        [ws, p.name, p.phone, p.id],
      );
      customerId = c.id;
      await d.query(`update prospects set status = 'converted', customer_id = $3 where workspace_id = $1 and id = $2`, [ws, p.id, c.id]);
    }
  } else {
    const name = (input.newName ?? "").trim().slice(0, 60);
    if (name.length < 2) return { ok: false, error: "Choose a customer or add a new one." };
    const phone = input.newPhone ? normaliseKenyanPhone(input.newPhone) : null;
    if (input.newPhone && !phone) return { ok: false, error: "Use a Kenyan number, like 0712 345 678, or leave it blank." };
    if (!(await withinCustomerLimit(a))) return { ok: false, error: LIMIT_ERROR };
    const [c] = await d.query<{ id: string }>(`insert into customers (workspace_id, name, phone) values ($1, $2, $3) returning id`, [ws, name, phone]);
    customerId = c.id;
  }

  const days = supplyDaysFor(items);
  const paid = input.paid ?? null;
  const [o] = await d.query<{ id: string }>(
    `insert into orders (workspace_id, customer_id, items, total, status, payment_method, payment_ref, paid_at, reorder_due_at)
     values ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, now() + ($9 || ' days')::interval) returning id`,
    [ws, customerId, json(items), total, paid ? "paid" : "unpaid", paid?.method ?? null, paid?.ref?.slice(0, 30) || null, paid ? new Date() : null, String(days)],
  );
  await d.query(`insert into interactions (workspace_id, customer_id, kind, body) values ($1, $2, 'order', $3)`, [
    ws,
    customerId,
    `Order: ${items.map((i) => `${i.qty} × ${i.name}`).join(", ")} (KES ${total.toLocaleString("en-KE")})${paid ? ", paid" : ""}.`,
  ]);
  revalidatePath("/portal", "layout");
  return { ok: true, id: o.id };
}

export async function recordPayment(orderId: string, method: "mpesa" | "cash" | "other", ref: string): Promise<ActionResult> {
  const a = await requireAccount();
  const d = await db();
  const code = ref.trim().toUpperCase().slice(0, 30);
  if (method === "mpesa" && code && !/^[A-Z0-9]{8,12}$/.test(code))
    return { ok: false, error: "M-Pesa codes are 10 letters and numbers, like SJK4H7Q2XP." };
  const [o] = await d.query<{ customer_id: string; total: number }>(
    `update orders set status = 'paid', payment_method = $3, payment_ref = $4, paid_at = now()
      where workspace_id = $1 and id = $2 and status = 'unpaid' returning customer_id, total`,
    [a.workspace.id, orderId, method, code || null],
  );
  if (o)
    await d.query(`insert into interactions (workspace_id, customer_id, kind, body) values ($1, $2, 'payment', $3)`, [
      a.workspace.id,
      o.customer_id,
      `Paid KES ${o.total.toLocaleString("en-KE")} by ${method === "mpesa" ? "M-Pesa" : method}${code ? ` (${code})` : ""}.`,
    ]);
  revalidatePath("/portal", "layout");
  return { ok: true };
}

export async function setOrderStatus(orderId: string, status: "delivered" | "cancelled") {
  const a = await requireAccount();
  const d = await db();
  await d.query(
    `update orders set status = $3, delivered_at = case when $3 = 'delivered' then now() else delivered_at end
      where workspace_id = $1 and id = $2 and status <> 'cancelled'`,
    [a.workspace.id, orderId, status],
  );
  revalidatePath("/portal", "layout");
}

// ------------------------------------------------------------------ Settings

export async function saveProfile(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const a = await requireAccount();
  const name = text(fd.get("owner_name"), 60);
  const businessName = text(fd.get("business_name"), 80);
  const location = text(fd.get("location"), 60);
  const type = text(fd.get("business_type"), 30);
  const whatsapp = normaliseKenyanPhone(text(fd.get("whatsapp"), 30));
  const channels = fd.getAll("channels").map(String).filter((c) => CHANNELS.some((x) => x.id === c));
  const goals = fd.getAll("goals").map(String).filter((g) => GOALS.some((x) => x.id === g));
  if (name.length < 2 || businessName.length < 2 || location.length < 2) return { ok: false, error: "Name, business name and location are needed." };
  if (!BUSINESS_TYPES.some((t) => t.id === type)) return { ok: false, error: "Choose a business type." };
  if (!whatsapp) return { ok: false, error: "Use a Kenyan WhatsApp number, like 0712 345 678." };
  if (!channels.length || !goals.length) return { ok: false, error: "Choose at least one channel and one priority." };
  const d = await db();
  await d.query(
    `update workspaces set owner_name = $2, business_name = $3, location = $4, business_type = $5, whatsapp = $6,
       channels = $7::jsonb, goals = $8::jsonb where id = $1`,
    [a.workspace.id, name, businessName, location, type, whatsapp, json(channels), json(goals)],
  );
  revalidatePath("/portal", "layout");
  return { ok: true };
}

// ------------------------------------------------------------------ Morning reminder

export async function subscribePush(sub: PushSubscriptionJSON): Promise<ActionResult> {
  const a = await requireAccount();
  if (!pushConfigured()) return { ok: false, error: "Reminders aren't available yet." };
  const valid =
    typeof sub?.endpoint === "string" &&
    sub.endpoint.startsWith("https://") &&
    typeof sub.keys?.p256dh === "string" &&
    typeof sub.keys?.auth === "string";
  if (!valid) return { ok: false, error: "This browser didn't give us what's needed for reminders." };
  const ua = (await headers()).get("user-agent");
  await saveSubscription(a.workspace.id, { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, ua);
  // A first notification straight away, so they see what it looks like and know it works.
  const d = await db();
  const [row] = await d.query<{ id: string; endpoint: string; p256dh: string; auth: string }>(
    `select id, endpoint, p256dh, auth from push_subscriptions where endpoint = $1`,
    [sub.endpoint],
  );
  if (row) {
    const sent = await sendTo(row, {
      title: "Morning reminders are on",
      body: "Each morning at 8, we'll tell you who needs you that day. Nothing on quiet days.",
      url: "/portal",
      tag: "welcome",
    });
    // The welcome shouldn't count as today's reminder.
    if (sent) await d.query(`update push_subscriptions set last_sent_at = null where id = $1`, [row.id]);
  }
  return { ok: true };
}

export async function unsubscribePush(endpoint: string): Promise<ActionResult> {
  const a = await requireAccount();
  await removeSubscription(a.workspace.id, String(endpoint ?? ""));
  return { ok: true };
}
