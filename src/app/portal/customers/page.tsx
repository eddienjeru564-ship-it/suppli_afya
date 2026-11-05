import Link from "next/link";
import { requirePortalAccount } from "@/server/auth";
import { customers, daysUntil } from "@/server/portal";
import { buttonClass } from "@/components/ui/Button";
import { Avatar, Card, Empty, PageHeader, Row, Tabs, kesAmount, prettyPhone, shortDate } from "@/components/portal/ui";

export const metadata = { title: "Customers" };

export default async function CustomersPage(props: PageProps<"/portal/customers">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 40) : "";
  const a = await requirePortalAccount();
  const all = await customers(a.workspace.id, q || undefined);
  const dueSoon = (c: (typeof all)[number]) => Boolean(c.next_reorder_at && daysUntil(c.next_reorder_at) <= 5);
  const showDue = sp.due === "1";
  const due = all.filter(dueSoon);
  // Who needs more soonest leads the list; everyone else stays newest first.
  const list = showDue ? due : [...due.sort((x, y) => +new Date(x.next_reorder_at!) - +new Date(y.next_reorder_at!)), ...all.filter((c) => !dueSoon(c))];

  return (
    <div>
      <PageHeader
        title="Customers"
        sub="Everyone who buys from you, with what they bought and when they'll need more."
        action={
          <div className="flex gap-2">
            <Link href="/portal/customers/import" className={buttonClass("secondary", "md")}>
              Import
            </Link>
            <Link href="/portal/customers/new" className={buttonClass("primary", "md")}>
              Add customer
            </Link>
          </div>
        }
      />
      {due.length > 0 && !q && (
        <Tabs
          current={showDue ? "/portal/customers?due=1" : "/portal/customers"}
          items={[
            { href: "/portal/customers", label: "All", count: all.length },
            { href: "/portal/customers?due=1", label: "Reorder due", count: due.length },
          ]}
        />
      )}
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
          title={q ? "No one matches that" : showDue ? "No reorders due" : "No customers yet"}
          action={
            !q && !showDue && (
              <Link href="/portal/customers/new" className={buttonClass("primary", "md")}>
                Add your first customer
              </Link>
            )
          }
        >
          {!q && !showDue && "Enquiries become customers when you record their first order. You can also add the people who already buy from you."}
        </Empty>
      ) : (
        <Card className="divide-y divide-ink/10 overflow-hidden">
          {list.map((c) => {
            const next = c.next_reorder_at ? new Date(c.next_reorder_at) : null;
            const soon = dueSoon(c);
            return (
              <Row key={c.id} href={`/portal/customers/${c.id}`}>
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink">{c.name}</div>
                  <div className="truncate text-[0.86rem] text-ink-soft">
                    {[c.orders ? `${c.orders} order${c.orders > 1 ? "s" : ""}${c.spent ? ` · ${kesAmount(c.spent)}` : ""}` : "No orders yet", c.phone && prettyPhone(c.phone)]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                {next && (
                  <span className={soon ? "shrink-0 rounded-full bg-[#f3e3c3] px-2 py-0.5 text-[0.72rem] font-semibold text-[#7a5412]" : "shrink-0 text-[0.78rem] text-ink-mute"}>
                    {soon ? "Reorder due" : `Next ~${shortDate(next)}`}
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
