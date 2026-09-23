import Link from "next/link";
import { PLANS_BY_ID } from "@/config/plans";
import { requirePortalAccount } from "@/server/auth";
import { customers, daysUntil } from "@/server/portal";
import { buttonClass } from "@/components/ui/Button";
import { Avatar, Card, Empty, PageHeader, Row, kesAmount, prettyPhone, shortDate } from "@/components/portal/ui";

export const metadata = { title: "Customers" };

export default async function CustomersPage(props: PageProps<"/portal/customers">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 40) : "";
  const a = await requirePortalAccount();
  const plan = PLANS_BY_ID[a.workspace.plan];
  const list = await customers(a.workspace.id, q || undefined);
  const total = q ? null : list.length;

  return (
    <div>
      <PageHeader
        title="Customers"
        sub={
          plan.customerLimit !== null && total !== null
            ? `${total} of ${plan.customerLimit} customers on Starter.`
            : "Everyone who buys from you, with what they bought and when they'll need more."
        }
        action={
          <div className="flex gap-2">
            {plan.canImport && (
              <Link href="/portal/customers/import" className={buttonClass("secondary", "md")}>
                Import
              </Link>
            )}
            <Link href="/portal/customers/new" className={buttonClass("primary", "md")}>
              Add customer
            </Link>
          </div>
        }
      />
      <form className="mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or number"
          className="w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-[1rem] outline-none focus:border-forest sm:max-w-sm"
        />
      </form>
      {list.length === 0 ? (
        <Empty
          title={q ? "No one matches that" : "No customers yet"}
          action={
            !q && (
              <Link href="/portal/customers/new" className={buttonClass("primary", "md")}>
                Add your first customer
              </Link>
            )
          }
        >
          {!q && "Prospects become customers when you record their first order. You can also add the people who already buy from you."}
        </Empty>
      ) : (
        <Card className="divide-y divide-ink/10 overflow-hidden">
          {list.map((c) => {
            const due = c.next_reorder_at ? new Date(c.next_reorder_at) : null;
            const dueSoon = due && daysUntil(due) <= 5;
            return (
              <Row key={c.id} href={`/portal/customers/${c.id}`}>
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink">{c.name}</div>
                  <div className="truncate text-[0.86rem] text-ink-soft">
                    {[c.phone && prettyPhone(c.phone), c.orders ? `${c.orders} order${c.orders > 1 ? "s" : ""} · ${kesAmount(c.spent)}` : "No orders yet"]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                {due && (
                  <span className={dueSoon ? "shrink-0 rounded-full bg-[#f3e3c3] px-2 py-0.5 text-[0.72rem] font-semibold text-[#7a5412]" : "shrink-0 text-[0.78rem] text-ink-mute"}>
                    {dueSoon ? "Reorder due" : `Next ~${shortDate(due)}`}
                  </span>
                )}
              </Row>
            );
          })}
        </Card>
      )}
    </div>
  );
}
