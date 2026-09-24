import { PRODUCTS_BY_ID } from "@/engine";
import type { Workspace } from "./auth";
import { db } from "./db";

/** Data access for the distributor portal. Every query is scoped to one workspace. */

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Prospect {
  id: string;
  ref: string;
  name: string;
  phone: string | null;
  age: number | null;
  sex: string | null;
  goals: string[];
  products: string[];
  flags: string[];
  preference: string | null;
  status: "new" | "contacted" | "converted" | "closed";
  result: {
    status?: string;
    heard?: string[];
    opener?: string;
    tips?: string[];
    seeDoctor?: string[];
    planNotes?: string[];
    core?: { product: { id: string; name: string }; reasons: string[]; cautions: string[] }[];
    addons?: { product: { id: string; name: string } }[];
    habits?: { title: string }[];
  } | null;
  customer_id: string | null;
  contacted_at: Date | null;
  created_at: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  source: string;
  prospect_id: string | null;
  created_at: Date;
}

export interface CustomerRow extends Customer {
  orders: number;
  spent: number;
  last_order_at: Date | null;
  next_reorder_at: Date | null;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  items: OrderItem[];
  total: number;
  status: "unpaid" | "paid" | "delivered" | "cancelled";
  payment_method: string | null;
  payment_ref: string | null;
  paid_at: Date | null;
  delivered_at: Date | null;
  reorder_due_at: Date | null;
  created_at: Date;
  /** "storefront" when the customer placed it on the distributor's page. */
  source: "portal" | "storefront";
  ref: string | null;
  customer_note: string | null;
  /** Where it goes: the distributor's delivery area (e.g. "Within Nairobi") and the customer's own words. */
  delivery: { fulfilment: "delivery" | "pickup"; area?: string | null; address: string | null } | null;
}

export interface Interaction {
  id: string;
  kind: string;
  body: string | null;
  created_at: Date;
}

export async function prospects(wsId: string, status?: string) {
  const d = await db();
  return d.query<Prospect>(
    `select * from prospects where workspace_id = $1 ${status ? "and status = $2" : ""} order by created_at desc limit 300`,
    status ? [wsId, status] : [wsId],
  );
}

export async function prospect(wsId: string, id: string) {
  const d = await db();
  const [p] = await d.query<Prospect>(`select * from prospects where workspace_id = $1 and id = $2`, [wsId, id]);
  return p ?? null;
}

export async function customers(wsId: string, q?: string) {
  const d = await db();
  const params: unknown[] = [wsId];
  let filter = "";
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    filter = `and (lower(c.name) like $2 or coalesce(c.phone, '') like $2)`;
  }
  return d.query<CustomerRow>(
    `select c.*,
            count(o.id) filter (where o.status <> 'cancelled')::int as orders,
            coalesce(sum(o.total) filter (where o.status in ('paid', 'delivered')), 0)::int as spent,
            max(o.created_at) filter (where o.status <> 'cancelled') as last_order_at,
            (select o2.reorder_due_at from orders o2 where o2.customer_id = c.id and o2.status <> 'cancelled'
              order by o2.created_at desc limit 1) as next_reorder_at
       from customers c left join orders o on o.customer_id = c.id
      where c.workspace_id = $1 ${filter}
      group by c.id order by coalesce(max(o.created_at), c.created_at) desc limit 500`,
    params,
  );
}

export async function customerCount(wsId: string) {
  const d = await db();
  const [r] = await d.query<{ n: number }>(`select count(*)::int as n from customers where workspace_id = $1`, [wsId]);
  return r.n;
}

export async function customer(wsId: string, id: string) {
  const d = await db();
  const [c] = await d.query<Customer>(`select * from customers where workspace_id = $1 and id = $2`, [wsId, id]);
  if (!c) return null;
  const [o, i, p] = await Promise.all([
    d.query<Order>(
      `select o.*, c.name as customer_name, c.phone as customer_phone from orders o join customers c on c.id = o.customer_id
        where o.workspace_id = $1 and o.customer_id = $2 order by o.created_at desc`,
      [wsId, id],
    ),
    d.query<Interaction>(
      `select id, kind, body, created_at from interactions
        where workspace_id = $1 and (customer_id = $2 or ($3::uuid is not null and prospect_id = $3::uuid))
        order by created_at desc limit 100`,
      [wsId, id, c.prospect_id],
    ),
    c.prospect_id ? prospect(wsId, c.prospect_id) : Promise.resolve(null),
  ]);
  return { customer: c, orders: o, interactions: i, prospect: p };
}

export async function orders(wsId: string, status?: string) {
  const d = await db();
  return d.query<Order>(
    `select o.*, c.name as customer_name, c.phone as customer_phone from orders o join customers c on c.id = o.customer_id
      where o.workspace_id = $1 ${status ? "and o.status = $2" : ""} order by o.created_at desc limit 300`,
    status ? [wsId, status] : [wsId],
  );
}

export async function order(wsId: string, id: string) {
  const d = await db();
  const [o] = await d.query<Order>(
    `select o.*, c.name as customer_name, c.phone as customer_phone from orders o join customers c on c.id = o.customer_id
      where o.workspace_id = $1 and o.id = $2`,
    [wsId, id],
  );
  return o ?? null;
}

export interface MonthStats {
  prospects: number;
  orders: number;
  paid: number;
  unpaid: number;
  reordersDue: number;
  repeatOrders: number;
}

export async function monthStats(wsId: string): Promise<MonthStats> {
  const d = await db();
  const [r] = await d.query<MonthStats>(
    `select
       (select count(*)::int from prospects where workspace_id = $1 and created_at >= date_trunc('month', now())) as prospects,
       (select count(*)::int from orders where workspace_id = $1 and status <> 'cancelled' and created_at >= date_trunc('month', now())) as orders,
       (select coalesce(sum(total), 0)::int from orders where workspace_id = $1 and paid_at >= date_trunc('month', now())) as paid,
       (select coalesce(sum(total), 0)::int from orders where workspace_id = $1 and status = 'unpaid') as unpaid,
       (select count(*)::int from orders o where o.workspace_id = $1 and o.status in ('paid', 'delivered')
          and o.reorder_due_at <= now() + interval '5 days'
          and not exists (select 1 from orders n where n.customer_id = o.customer_id and n.created_at > o.created_at and n.status <> 'cancelled')) as "reordersDue",
       (select count(*)::int from orders o where o.workspace_id = $1 and o.status <> 'cancelled' and o.created_at >= date_trunc('month', now())
          and exists (select 1 from orders p where p.customer_id = o.customer_id and p.created_at < o.created_at and p.status <> 'cancelled')) as "repeatOrders"`,
    [wsId],
  );
  return r;
}

// ------------------------------------------------------------------ Today

export type TaskKind = "new" | "payment" | "reorder" | "checkin" | "quiet";

export interface Task {
  key: string;
  kind: TaskKind;
  title: string;
  why: string;
  message: string;
  phone: string | null;
  href: string;
  prospectId?: string;
  customerId?: string;
  at: Date;
}

/** Which goals put which kinds of work first. */
const GOAL_KINDS: Record<string, TaskKind[]> = {
  followup: ["new", "checkin"],
  repeat: ["reorder", "quiet"],
  payments: ["payment"],
  orders: ["payment", "new"],
  recommend: ["new"],
  track: ["quiet", "checkin"],
};
const DEFAULT_ORDER: TaskKind[] = ["new", "payment", "reorder", "checkin", "quiet"];

export function kindOrder(goals: string[]): TaskKind[] {
  const out: TaskKind[] = [];
  for (const g of goals) for (const k of GOAL_KINDS[g] ?? []) if (!out.includes(k)) out.push(k);
  for (const k of DEFAULT_ORDER) if (!out.includes(k)) out.push(k);
  return out;
}

const firstName = (n: string) => n.split(" ")[0];
const dayMonth = (d: Date) => new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "long" });
const kesFmt = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
const productNames = (items: OrderItem[]) => {
  const names = items.map((i) => i.name);
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
};

/** "2 × Probio3, 1 × Veggie Veggie": what's in an order, counts included. */
export const orderLines = (items: OrderItem[]) => items.map((i) => `${i.qty} × ${i.name}`).join(", ");

/** Where a delivery goes: the distributor's area, then the customer's own directions. */
export function deliveryWhere(delivery: Order["delivery"]): string | null {
  const where = [delivery?.area, delivery?.address].filter((x): x is string => Boolean(x && x.trim()));
  return where.length ? where.join(" · ") : null;
}

/** How an order from the distributor's page reaches the customer, in one line. */
export function deliveryLine(delivery: Order["delivery"]): string {
  if (delivery?.fulfilment === "pickup") return "They'll collect it from you";
  const where = deliveryWhere(delivery);
  return where ? `Delivery: ${where}` : "Delivery still to arrange";
}

/** The message that confirms an order placed on the distributor's page, ready to send. */
export function confirmationMessage(o: Pick<Order, "customer_name" | "ref" | "items" | "total" | "delivery">, me: string): string {
  const pickup = o.delivery?.fulfilment === "pickup";
  return `Hi ${firstName(o.customer_name)}, thank you for your order${o.ref ? ` (${o.ref})` : ""} of ${productNames(o.items)}.${
    o.total ? ` The total is ${kesFmt(o.total)}${pickup ? "" : " plus delivery"}.` : ""
  } ${pickup ? "When would you like to collect?" : "When is a good time to deliver?"}${me ? ` ${me}` : ""}`;
}

/** Whether the distributor has confirmed an order placed on their page (sent the confirmation, or ticked it off). */
export async function pageOrderConfirmed(workspaceId: string, orderId: string): Promise<boolean> {
  const d = await db();
  const rows = await d.query(`select 1 from interactions where workspace_id = $1 and task_key = $2 limit 1`, [workspaceId, `placed:${orderId}`]);
  return rows.length > 0;
}

/** The daily list: who to talk to, why, and a message ready to send. */
export async function today(ws: Workspace): Promise<Task[]> {
  const d = await db();
  const id = ws.id;
  const [newP, unpaid, due, checkins, quiet, done] = await Promise.all([
    d.query<Prospect>(`select * from prospects where workspace_id = $1 and status = 'new' order by created_at desc limit 30`, [id]),
    d.query<Order>(
      `select o.*, c.name as customer_name, c.phone as customer_phone from orders o join customers c on c.id = o.customer_id
        where o.workspace_id = $1 and o.status = 'unpaid' order by o.created_at asc limit 30`,
      [id],
    ),
    d.query<Order>(
      `select o.*, c.name as customer_name, c.phone as customer_phone from orders o join customers c on c.id = o.customer_id
        where o.workspace_id = $1 and o.status in ('paid', 'delivered') and o.reorder_due_at <= now() + interval '5 days'
          and not exists (select 1 from orders n where n.customer_id = o.customer_id and n.created_at > o.created_at and n.status <> 'cancelled')
        order by o.reorder_due_at asc limit 30`,
      [id],
    ),
    d.query<Order>(
      `select o.*, c.name as customer_name, c.phone as customer_phone from orders o join customers c on c.id = o.customer_id
        where o.workspace_id = $1 and o.status in ('paid', 'delivered')
          and o.created_at between now() - interval '24 days' and now() - interval '14 days'
          and (o.reorder_due_at is null or o.reorder_due_at > now() + interval '5 days')
        order by o.created_at asc limit 20`,
      [id],
    ),
    d.query<CustomerRow>(
      `select c.*, max(o.created_at) as last_order_at from customers c join orders o on o.customer_id = c.id and o.status <> 'cancelled'
        where c.workspace_id = $1 group by c.id having max(o.created_at) < now() - interval '75 days'
        order by max(o.created_at) desc limit 20`,
      [id],
    ),
    d.query<{ task_key: string; created_at: Date }>(
      `select task_key, max(created_at) as created_at from interactions
        where workspace_id = $1 and task_key is not null group by task_key`,
      [id],
    ),
  ]);

  const doneAt = new Map(done.map((r) => [r.task_key, new Date(r.created_at).getTime()]));
  const recentlyDone = (key: string, days: number) => {
    const t = doneAt.get(key);
    return t !== undefined && Date.now() - t < days * 86400_000;
  };
  const me = firstName(ws.owner_name ?? "");
  const tasks: Task[] = [];

  for (const p of newP) {
    const key = `prospect:${p.id}`;
    if (recentlyDone(key, 3650)) continue;
    const goals = (p.result?.core ?? []).map((c) => c.product.name);
    tasks.push({
      key,
      kind: "new",
      title: [p.name, p.age].filter(Boolean).join(", "),
      why: `Did the health check ${relative(p.created_at)}.${goals.length ? ` Plan: ${goals.slice(0, 2).join(", ")}${goals.length > 2 ? "…" : ""}.` : ""}${p.preference ? ` ${p.preference}.` : ""}`,
      message: p.result?.opener ?? `Hi ${p.name}, thanks for doing the health check. Can I ask you a couple of quick questions?`,
      phone: p.phone,
      href: `/portal/prospects/${p.id}`,
      prospectId: p.id,
      at: p.created_at,
    });
  }
  for (const o of unpaid) {
    const key = `unpaid:${o.id}`;
    // Just confirmed a page order: give them a few days to pay before a reminder.
    if (recentlyDone(key, 3) || recentlyDone(`placed:${o.id}`, 3)) continue;
    // A fresh order from the distributor's page needs confirming, not chasing.
    if (o.source === "storefront" && !doneAt.has(`placed:${o.id}`) && Date.now() - new Date(o.created_at).getTime() < 7 * 86400_000) {
      tasks.push({
        key: `placed:${o.id}`,
        kind: "payment",
        title: `${o.customer_name} ordered from your page`,
        why: `${orderLines(o.items)}${o.total ? `, ${kesFmt(o.total)}` : ""}. ${deliveryLine(o.delivery)}. Confirm the total and when it will arrive.`,
        message: confirmationMessage(o, me),
        phone: o.customer_phone,
        href: `/portal/orders/${o.id}`,
        customerId: o.customer_id,
        at: o.created_at,
      });
      continue;
    }
    tasks.push({
      key,
      kind: "payment",
      title: o.customer_name,
      why: `Order of ${kesFmt(o.total)} from ${dayMonth(o.created_at)} isn't paid yet.`,
      message: `Hi ${firstName(o.customer_name)}, just a quick reminder about your order of ${kesFmt(o.total)} from ${dayMonth(o.created_at)}. Send it whenever you're ready and I'll sort out the delivery. Asante!`,
      phone: o.customer_phone,
      href: `/portal/orders/${o.id}`,
      customerId: o.customer_id,
      at: o.created_at,
    });
  }
  for (const o of due) {
    const key = `reorder:${o.id}`;
    if (recentlyDone(key, 7)) continue;
    const overdue = o.reorder_due_at && new Date(o.reorder_due_at).getTime() < Date.now();
    tasks.push({
      key,
      kind: "reorder",
      title: o.customer_name,
      why: `Bought ${productNames(o.items)} on ${dayMonth(o.created_at)}. ${overdue ? "Probably finished by now." : "Probably running out this week."}`,
      message: `Habari ${firstName(o.customer_name)}! It's about time for your next ${productNames(o.items)}. How has it been going? I can set aside another one for you, just let me know.${me ? ` ${me}` : ""}`,
      phone: o.customer_phone,
      href: `/portal/customers/${o.customer_id}`,
      customerId: o.customer_id,
      at: o.reorder_due_at ?? o.created_at,
    });
  }
  for (const o of checkins) {
    const key = `checkin:${o.id}`;
    if (doneAt.has(key)) continue;
    const first = PRODUCTS_BY_ID[o.items[0]?.productId];
    tasks.push({
      key,
      kind: "checkin",
      title: o.customer_name,
      why: `Started ${productNames(o.items)} ${relative(o.created_at)}. A good time to ask how it's going.`,
      message: `Hi ${firstName(o.customer_name)}, it's been a couple of weeks on ${productNames(o.items)}. How are you finding it?${first ? ` ${first.expectation}` : ""}`,
      phone: o.customer_phone,
      href: `/portal/customers/${o.customer_id}`,
      customerId: o.customer_id,
      at: o.created_at,
    });
  }
  for (const c of quiet) {
    const key = `quiet:${c.id}`;
    if (recentlyDone(key, 30)) continue;
    tasks.push({
      key,
      kind: "quiet",
      title: c.name,
      why: `No order since ${dayMonth(c.last_order_at!)}.`,
      message: `Hi ${firstName(c.name)}, it's been a while! Hope you're keeping well. Let me know if you need anything, I'm here.`,
      phone: c.phone,
      href: `/portal/customers/${c.id}`,
      customerId: c.id,
      at: c.last_order_at!,
    });
  }

  const order = kindOrder(ws.goals);
  return tasks.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || +new Date(a.at) - +new Date(b.at));
}

/** Whole days from now until a date (negative if it's passed). */
export function daysUntil(d: Date | string | null) {
  return d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400_000) : 0;
}

export function relative(d: Date) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

/** Days until the first item in an order runs out, at the usual label dose. */
export function supplyDaysFor(items: OrderItem[]) {
  const days = items
    .map((i) => (PRODUCTS_BY_ID[i.productId]?.supplyDays ?? 30) * Math.max(1, i.qty))
    .filter((n) => n > 0);
  return days.length ? Math.min(...days) : 30;
}
