import Link from "next/link";
import { requirePortalAccount } from "@/server/auth";
import { db } from "@/server/db";
import { prospect as getProspect } from "@/server/portal";
import { PageHeader } from "@/components/portal/ui";
import { ChevronLeft } from "@/components/ui/icons";
import { OrderForm } from "./OrderForm";

export const metadata = { title: "New order" };

export default async function NewOrderPage(props: PageProps<"/portal/orders/new">) {
  const sp = await props.searchParams;
  const a = await requirePortalAccount();
  const d = await db();
  const uuid = (v: unknown) => (typeof v === "string" && /^[0-9a-f-]{36}$/.test(v) ? v : undefined);
  const prospectId = uuid(sp.prospect);
  const customerId = uuid(sp.customer);

  const [customers, priceRows, p, shopPrices] = await Promise.all([
    d.query<{ id: string; name: string; phone: string | null }>(`select id, name, phone from customers where workspace_id = $1 order by name`, [
      a.workspace.id,
    ]),
    d.query<{ items: { productId: string; unitPrice: number }[] }>(
      `select items from orders where workspace_id = $1 order by created_at desc limit 200`,
      [a.workspace.id],
    ),
    prospectId ? getProspect(a.workspace.id, prospectId) : Promise.resolve(null),
    d.query<{ product_id: string; price: number }>(`select product_id, price from shop_products where workspace_id = $1 and price is not null`, [a.workspace.id]),
  ]);

  // Remember the last price used for each product, so repeat orders are one tap.
  const lastPrices: Record<string, number> = {};
  for (const r of priceRows) for (const i of r.items) if (!(i.productId in lastPrices) && i.unitPrice > 0) lastPrices[i.productId] = i.unitPrice;
  // Otherwise, the price on their shop.
  for (const r of shopPrices) if (!(r.product_id in lastPrices)) lastPrices[r.product_id] = r.price;

  const usableProspect = p && !p.customer_id ? { id: p.id, name: p.name } : undefined;
  const suggested = p ? p.products : [];

  return (
    <div className="max-w-2xl">
      <Link href="/portal/orders" className="mb-4 inline-flex items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="h-3.5 w-3.5" /> Orders
      </Link>
      <PageHeader title="New order" sub={p ? `Their health check plan is filled in. Adjust it to what they actually ordered.` : undefined} />
      <OrderForm
        customers={customers}
        presetCustomerId={customerId ?? p?.customer_id ?? undefined}
        prospect={usableProspect}
        suggested={suggested}
        lastPrices={lastPrices}
      />
    </div>
  );
}
