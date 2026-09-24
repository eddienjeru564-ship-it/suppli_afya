import { timingSafeEqual } from "node:crypto";
import { PRODUCTS_BY_ID } from "@/engine";
import { db, json } from "@/server/db";
import { distributorBySlug } from "@/server/distributors";
import { env } from "@/server/env";
import { normaliseKenyanPhone } from "@/server/payments/mpesa";
import { supplyDaysFor, type OrderItem } from "@/server/portal";

/**
 * Orders placed on a distributor's storefront (suppli_afya-distributor_template). The
 * storefront's server has already priced the order from the distributor's own price list;
 * it authenticates with STOREFRONT_SECRET. The order lands in the portal as unpaid, with the
 * customer, their delivery details and note, and shows on Today for the distributor to confirm.
 * Sending the same reference twice files it once.
 */
export async function POST(req: Request) {
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${env.storefrontSecret}`);
  if (!env.storefrontSecret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || typeof b.suppliSlug !== "string") return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
  const dist = await distributorBySlug(b.suppliSlug);
  if (!dist?.workspaceId) return Response.json({ ok: false, error: "Unknown or inactive distributor" }, { status: 404 });

  const ref = typeof b.ref === "string" && /^[A-Z]{1,3}-[A-Z2-9]{4}$/.test(b.ref) ? b.ref : null;
  const customer = (b.customer ?? {}) as { name?: unknown; phone?: unknown };
  const name = typeof customer.name === "string" ? customer.name.replace(/\s+/g, " ").trim().slice(0, 60) : "";
  const phone = typeof customer.phone === "string" ? normaliseKenyanPhone(customer.phone) : null;
  const items: OrderItem[] = (Array.isArray(b.lines) ? b.lines : [])
    .map((l) => l as { id?: unknown; qty?: unknown; unitPrice?: unknown })
    .filter((l) => typeof l.id === "string" && PRODUCTS_BY_ID[l.id])
    .slice(0, 40)
    .map((l) => ({
      productId: l.id as string,
      name: PRODUCTS_BY_ID[l.id as string].name,
      qty: Math.max(1, Math.min(50, Math.floor(Number(l.qty) || 1))),
      unitPrice: Math.max(0, Math.round(Number(l.unitPrice) || 0)),
    }));
  if (!ref || name.length < 2 || !phone || !items.length) return Response.json({ ok: false, error: "Incomplete order" }, { status: 422 });

  const total = Math.max(0, Math.round(Number(b.total) || items.reduce((s, i) => s + i.qty * i.unitPrice, 0)));
  const payment = b.payment === "mpesa" || b.payment === "cash" ? b.payment : null;
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 400) : "";
  const deliverTo = (b.deliverTo ?? null) as { area?: unknown; address?: unknown } | null;
  const delivery =
    b.receive === "pickup"
      ? { fulfilment: "pickup", address: null }
      : {
          fulfilment: "delivery",
          address: [deliverTo?.area, deliverTo?.address].filter((x): x is string => typeof x === "string" && x.trim() !== "").join(", ").slice(0, 200) || null,
        };
  const selectorRef = typeof b.selectorRef === "string" && /^SA-[A-Z2-9]{4}$/.test(b.selectorRef) ? b.selectorRef : null;

  const ws = dist.workspaceId;
  const d = await db();
  let [c] = await d.query<{ id: string }>(`select id from customers where workspace_id = $1 and phone = $2 limit 1`, [ws, phone]);
  if (!c) {
    [c] = await d.query<{ id: string }>(`insert into customers (workspace_id, name, phone, source) values ($1, $2, $3, 'storefront') returning id`, [
      ws,
      name,
      phone,
    ]);
  }
  const rows = await d.query<{ id: string }>(
    `insert into orders (workspace_id, customer_id, items, total, status, payment_method, source, ref, customer_note, delivery, reorder_due_at)
     values ($1, $2, $3::jsonb, $4, 'unpaid', $5, 'storefront', $6, $7, $8::jsonb, now() + ($9 || ' days')::interval)
     on conflict (workspace_id, ref) where ref is not null do nothing
     returning id`,
    [ws, c.id, json(items), total, payment, ref, note || null, json(delivery), String(supplyDaysFor(items))],
  );
  if (!rows.length) return Response.json({ ok: true, duplicate: true });

  await d.query(`insert into interactions (workspace_id, customer_id, kind, body) values ($1, $2, 'order', $3)`, [
    ws,
    c.id,
    `Ordered from your page (${ref}): ${items.map((i) => `${i.qty} × ${i.name}`).join(", ")}. ${
      delivery.fulfilment === "pickup" ? "Will collect." : delivery.address ? `Deliver to ${delivery.address}.` : "Delivery to arrange."
    }${payment ? ` Paying by ${payment === "mpesa" ? "M-Pesa" : "cash"}.` : ""}${selectorRef ? ` From health check ${selectorRef}.` : ""}${note ? ` Note: ${note}` : ""}`,
  ]);
  return Response.json({ ok: true, orderId: rows[0].id });
}
