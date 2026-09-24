import Link from "next/link";
import { requirePortalAccount } from "@/server/auth";
import { orders, relative } from "@/server/portal";
import { buttonClass } from "@/components/ui/Button";
import { Card, Empty, PageHeader, Pill, Row, Tabs, kesAmount } from "@/components/portal/ui";

export const metadata = { title: "Orders" };

const FILTERS = [
  { id: "", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "paid", label: "Paid" },
  { id: "delivered", label: "Delivered" },
];

export default async function OrdersPage(props: PageProps<"/portal/orders">) {
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" && FILTERS.some((f) => f.id === sp.status) ? sp.status : "";
  const a = await requirePortalAccount();
  const all = await orders(a.workspace.id);
  const list = status ? all.filter((o) => o.status === status) : all.filter((o) => o.status !== "cancelled");
  const owed = all.filter((o) => o.status === "unpaid").reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <PageHeader
        title="Orders"
        sub={owed > 0 ? `${kesAmount(owed)} still to be paid on open orders.` : "Every order, and whether it's been paid."}
        action={
          <Link href="/portal/orders/new" className={buttonClass("primary", "md")}>
            New order
          </Link>
        }
      />
      <Tabs
        current={status ? `/portal/orders?status=${status}` : "/portal/orders"}
        items={FILTERS.map((f) => ({
          href: f.id ? `/portal/orders?status=${f.id}` : "/portal/orders",
          label: f.label,
          count: f.id ? all.filter((o) => o.status === f.id).length : all.filter((o) => o.status !== "cancelled").length,
        }))}
      />
      {list.length === 0 ? (
        <Empty
          title={all.length ? "Nothing here" : "No orders yet"}
          action={
            !all.length && (
              <Link href="/portal/orders/new" className={buttonClass("primary", "md")}>
                Record your first order
              </Link>
            )
          }
        >
          {!all.length && "Record orders as they happen. We'll work out when each customer is likely to run out and put them on your list."}
        </Empty>
      ) : (
        <Card className="divide-y divide-ink/10 overflow-hidden">
          {list.map((o) => (
            <Row key={o.id} href={`/portal/orders/${o.id}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{o.customer_name}</span>
                  <Pill tone={o.status} />
                  {o.source === "shop" && <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[0.7rem] font-semibold text-forest">From your shop</span>}
                </div>
                <div className="truncate text-[0.86rem] text-ink-soft">
                  {o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-semibold text-ink">{kesAmount(o.total)}</div>
                <div className="text-[0.78rem] text-ink-mute">{relative(o.created_at)}</div>
              </div>
            </Row>
          ))}
        </Card>
      )}
    </div>
  );
}
