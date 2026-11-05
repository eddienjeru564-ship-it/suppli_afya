import { randomBytes } from "node:crypto";
import { site } from "@/config/site";
import { db } from "../db";
import { env, smsConfigured } from "../env";
import { normaliseKenyanPhone } from "../payments/mpesa";
import type { OrderItem } from "../portal";
import { sendSms } from "./africastalking";
import { paymentSms, reorderSms, type Rendered } from "./templates";

/**
 * Reminder texts to a distributor's customers. The morning job picks who to text: customers about
 * to run out (a few days before the date their last order runs out) and orders still unpaid a few
 * days on. Each reminder goes once, a customer gets at most one text a morning, and every text
 * carries a link that stops them.
 */

/** A reorder text goes this many days before the customer is likely to run out. */
export const REORDER_DAYS_AHEAD = 3;
/** A payment text goes this many days after an unpaid order. */
export const PAYMENT_AFTER_DAYS = 3;
/** Texts one workspace can send in a month: a guard against mistakes, far above real use. */
export const MONTHLY_CAP = 500;

export type SmsKind = "reorder" | "payment";

const TOKEN_CHARS = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newToken = () => [...randomBytes(7)].map((b) => TOKEN_CHARS[b % TOKEN_CHARS.length]).join("");

/** The short code in a customer's stop link, made the first time they're texted. */
export async function stopToken(customerId: string): Promise<string> {
  const d = await db();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const [r] = await d.query<{ sms_token: string }>(
        `update customers set sms_token = coalesce(sms_token, $2) where id = $1 returning sms_token`,
        [customerId, newToken()],
      );
      return r.sms_token;
    } catch (e) {
      // Another customer already has that code: try a fresh one.
      if (attempt === 2) throw e;
    }
  }
  throw new Error("unreachable");
}

export const stopUrl = (token: string) => `${site.displayDomain}/s/${token}`;

interface Candidate {
  kind: SmsKind;
  order_id: string;
  workspace_id: string;
  customer_id: string;
  customer_name: string;
  phone: string;
  items: OrderItem[];
  total: number;
  created_at: Date;
  reorder_due_at: Date | null;
  owner_name: string | null;
  whatsapp: string | null;
}

/** Shared conditions: a live workspace with this kind of text switched on, a customer who can be texted, not texted for this yet. */
const ELIGIBLE = (kind: SmsKind) => `
  c.phone is not null and c.sms_opt_out_at is null
  and w.onboarded_at is not null and w.sms_${kind}
  and s.status = 'active' and s.current_period_end > now() - interval '3 days'
  and not exists (select 1 from sms_log l where l.kind = '${kind}' and l.ref = o.id::text and l.status <> 'failed')`;

const SELECT = (kind: SmsKind) => `
  select '${kind}' as kind, o.id as order_id, o.workspace_id, c.id as customer_id, c.name as customer_name, c.phone,
         o.items, o.total, o.created_at, o.reorder_due_at, w.owner_name, w.whatsapp
    from orders o
    join customers c on c.id = o.customer_id
    join workspaces w on w.id = o.workspace_id
    join subscriptions s on s.workspace_id = w.id`;

async function candidates(): Promise<Candidate[]> {
  const d = await db();
  const [reorders, payments] = await Promise.all([
    // About to run out, and nothing ordered since. A day back too, in case a morning was missed.
    d.query<Candidate>(
      `${SELECT("reorder")}
        where o.status in ('paid', 'delivered')
          and o.reorder_due_at between now() - interval '1 day' and now() + interval '${REORDER_DAYS_AHEAD} days'
          and not exists (select 1 from orders n where n.customer_id = o.customer_id and n.created_at > o.created_at and n.status <> 'cancelled')
          and ${ELIGIBLE("reorder")}
        order by o.reorder_due_at asc`,
    ),
    // Unpaid a few days on. An order from the distributor's page only once they've confirmed it with the customer.
    d.query<Candidate>(
      `${SELECT("payment")}
        where o.status = 'unpaid' and o.total > 0
          and o.created_at between now() - interval '30 days' and now() - interval '${PAYMENT_AFTER_DAYS} days'
          and (o.source <> 'storefront' or exists (
            select 1 from interactions i where i.workspace_id = o.workspace_id and i.task_key = 'placed:' || o.id::text))
          and ${ELIGIBLE("payment")}
        order by o.created_at asc`,
    ),
  ]);
  return [...payments, ...reorders];
}

/** The text for one reminder. */
export function render(c: Pick<Candidate, "kind" | "customer_name" | "items" | "total" | "created_at" | "reorder_due_at" | "owner_name" | "whatsapp">, token: string): Rendered {
  const customer = { name: c.customer_name };
  const seller = { name: (c.owner_name ?? "").trim() || "Your distributor", whatsapp: c.whatsapp };
  const products = c.items.map((i) => i.name);
  return c.kind === "reorder"
    ? reorderSms({ customer, seller, products, dueAt: c.reorder_due_at ?? c.created_at, stopUrl: stopUrl(token) })
    : paymentSms({ customer, seller, products, amount: c.total, orderedAt: c.created_at, stopUrl: stopUrl(token) });
}

type Outcome = "sent" | "logged" | "failed" | "skipped";

async function sendOne(c: Candidate): Promise<Outcome> {
  const phone = normaliseKenyanPhone(c.phone);
  if (!phone) return "skipped";
  const d = await db();
  const token = await stopToken(c.customer_id);
  const text = render(c, token);
  // Claim the reminder first, so two runs at once can't both send it. A failed one may be tried again.
  const [claim] = await d.query<{ id: string }>(
    `insert into sms_log (workspace_id, customer_id, kind, ref, phone, body) values ($1, $2, $3, $4, $5, $6)
     on conflict (kind, ref) do update set status = 'pending', error = null, body = excluded.body, created_at = now()
       where sms_log.status = 'failed'
     returning id`,
    [c.workspace_id, c.customer_id, c.kind, c.order_id, phone, text.body],
  );
  if (!claim) return "skipped";

  let outcome: Outcome;
  if (smsConfigured()) {
    const r = await sendSms(phone, text.body);
    outcome = r.ok ? "sent" : "failed";
    await d.query(`update sms_log set status = $2, provider_id = $3, cost = $4, error = $5 where id = $1`, [
      claim.id,
      outcome,
      r.ok ? r.id : null,
      r.ok ? r.cost : null,
      r.ok ? null : r.error,
    ]);
    if (!r.ok) console.error(`Text to ${phone} failed: ${r.error}`);
  } else {
    // Local and preview runs: show the text instead of sending it.
    console.info(`Text not sent (Africa's Talking isn't set up), to +${phone}:\n${text.body}\n`);
    outcome = "logged";
    await d.query(`update sms_log set status = 'logged' where id = $1`, [claim.id]);
  }
  if (outcome !== "failed") {
    await d.query(`insert into interactions (workspace_id, customer_id, kind, body) values ($1, $2, 'sms', $3)`, [
      c.workspace_id,
      c.customer_id,
      text.body,
    ]);
  }
  return outcome;
}

/** Run by the morning job. Safe to run twice: each reminder is claimed before it's sent. */
export async function sendSmsReminders() {
  if (env.isProduction && !smsConfigured()) return { due: 0, sent: 0, skipped: "not configured" as const };
  const d = await db();
  const due = await candidates();
  const used = new Map(
    (
      await d.query<{ workspace_id: string; n: number }>(
        `select workspace_id, count(*)::int as n from sms_log
          where status in ('sent', 'logged') and created_at >= date_trunc('month', now()) group by workspace_id`,
      )
    ).map((r) => [r.workspace_id, r.n]),
  );
  const textedToday = new Set<string>();
  const counts: Record<Outcome, number> = { sent: 0, logged: 0, failed: 0, skipped: 0 };
  for (const c of due) {
    // One text per customer a morning: a payment reminder goes first, the reorder waits a day.
    if (textedToday.has(c.customer_id)) continue;
    if ((used.get(c.workspace_id) ?? 0) >= MONTHLY_CAP) continue;
    const outcome = await sendOne(c);
    counts[outcome]++;
    if (outcome === "sent" || outcome === "logged") {
      textedToday.add(c.customer_id);
      used.set(c.workspace_id, (used.get(c.workspace_id) ?? 0) + 1);
    }
  }
  return { due: due.length, ...counts };
}

/** When each order was last texted about, for the Today list: "texted a reminder on 5 Nov". */
export async function textedOrders(workspaceId: string): Promise<Map<string, Date>> {
  const d = await db();
  const rows = await d.query<{ kind: string; ref: string; created_at: Date }>(
    `select kind, ref, created_at from sms_log
      where workspace_id = $1 and status in ('sent', 'logged') and created_at > now() - interval '30 days'`,
    [workspaceId],
  );
  return new Map(rows.map((r) => [`${r.kind}:${r.ref}`, new Date(r.created_at)]));
}

/** Texts this workspace sent this month. */
export async function textsThisMonth(workspaceId: string): Promise<number> {
  const d = await db();
  const [r] = await d.query<{ n: number }>(
    `select count(*)::int as n from sms_log where workspace_id = $1 and status in ('sent', 'logged') and created_at >= date_trunc('month', now())`,
    [workspaceId],
  );
  return r.n;
}

// ---------------------------------------------------------------- stop link

export interface StopTarget {
  customerName: string;
  sellerName: string;
  stopped: boolean;
  byCustomer: boolean;
}

export async function stopTarget(token: string): Promise<StopTarget | null> {
  if (!/^[A-Za-z0-9]{4,16}$/.test(token)) return null;
  const d = await db();
  const [r] = await d.query<{ name: string; owner_name: string | null; sms_opt_out_at: Date | null; sms_opt_out_source: string | null }>(
    `select c.name, w.owner_name, c.sms_opt_out_at, c.sms_opt_out_source from customers c join workspaces w on w.id = c.workspace_id where c.sms_token = $1`,
    [token],
  );
  if (!r) return null;
  return {
    customerName: r.name,
    sellerName: (r.owner_name ?? "").trim() || "your distributor",
    stopped: Boolean(r.sms_opt_out_at),
    byCustomer: r.sms_opt_out_source === "customer",
  };
}

/** From the stop link: the customer stops (or restarts) the texts themselves. */
export async function setStoppedByCustomer(token: string, stop: boolean) {
  if (!/^[A-Za-z0-9]{4,16}$/.test(token)) return false;
  const d = await db();
  const rows = stop
    ? await d.query(`update customers set sms_opt_out_at = now(), sms_opt_out_source = 'customer' where sms_token = $1 returning id`, [token])
    : await d.query(`update customers set sms_opt_out_at = null, sms_opt_out_source = null where sms_token = $1 returning id`, [token]);
  return rows.length > 0;
}

/**
 * From the portal: the distributor stops or restarts texts for one customer. They can't restart
 * texts the customer stopped themselves.
 */
export async function setStoppedByDistributor(workspaceId: string, customerId: string, stop: boolean) {
  const d = await db();
  const rows = stop
    ? await d.query(
        `update customers set sms_opt_out_at = now(), sms_opt_out_source = 'distributor'
          where workspace_id = $1 and id = $2 and sms_opt_out_at is null returning id`,
        [workspaceId, customerId],
      )
    : await d.query(
        `update customers set sms_opt_out_at = null, sms_opt_out_source = null
          where workspace_id = $1 and id = $2 and sms_opt_out_source = 'distributor' returning id`,
        [workspaceId, customerId],
      );
  return rows.length > 0;
}
