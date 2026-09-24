import Link from "next/link";
import { notFound } from "next/navigation";
import { whatsappLink } from "@/engine";
import { requirePortalAccount } from "@/server/auth";
import { customer as getCustomer } from "@/server/portal";
import { buttonClass } from "@/components/ui/Button";
import { Card, Pill, kesAmount, longDate, prettyPhone, shortDate } from "@/components/portal/ui";
import { ChevronLeft, WhatsAppIcon } from "@/components/ui/icons";
import { NoteForm } from "./NoteForm";

const KIND_LABEL: Record<string, string> = {
  health_check: "Health check",
  order: "Order",
  payment: "Payment",
  note: "Note",
  followup: "Follow-up",
};

export default async function CustomerPage(props: PageProps<"/portal/customers/[id]">) {
  const { id } = await props.params;
  const a = await requirePortalAccount();
  const data = /^[0-9a-f-]{36}$/.test(id) ? await getCustomer(a.workspace.id, id) : null;
  if (!data) notFound();
  const { customer: c, orders, interactions, prospect: p } = data;
  const live = orders.filter((o) => o.status !== "cancelled");
  const spent = live.filter((o) => o.status !== "unpaid").reduce((s, o) => s + o.total, 0);
  const next = live[0]?.reorder_due_at ?? null;
  const hello = `Hi ${c.name.split(" ")[0]}, `;

  return (
    <div className="grid gap-6">
      <Link href="/portal/customers" className="inline-flex w-fit items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="h-3.5 w-3.5" /> Customers
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[2.2rem] leading-tight tracking-[-0.02em] text-ink">{c.name}</h1>
          <p className="mt-1 text-[0.93rem] text-ink-soft">
            {[c.phone && prettyPhone(c.phone), `Customer since ${longDate(c.created_at)}`, c.source === "health_check" && "Came through your health check"]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={c.phone ? whatsappLink(c.phone, hello) : `https://wa.me/?text=${encodeURIComponent(hello)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("whatsapp", "md")}
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          {live.length > 0 && (
            <Link href={`/portal/orders/new?customer=${c.id}`} className={buttonClass("primary", "md")}>
              New order
            </Link>
          )}
        </div>
      </div>

      {live.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Mini label="Orders" value={String(live.length)} />
          <Mini label="Paid in total" value={kesAmount(spent)} />
          <Mini label="Likely to need more" value={next ? shortDate(next) : "—"} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid content-start gap-4">
          <Card className="overflow-hidden">
            <h2 className="px-5 pt-5 text-[0.95rem] font-semibold text-ink">Orders</h2>
            {live.length === 0 ? (
              <div className="px-5 pb-5 pt-2">
                <p className="text-[0.93rem] leading-relaxed text-ink-soft">
                  Record what {c.name.split(" ")[0]} buys and we&apos;ll remind you a few days before it runs out.
                </p>
                <Link href={`/portal/orders/new?customer=${c.id}`} className={`${buttonClass("primary", "md")} mt-4`}>
                  Record their first order
                </Link>
              </div>
            ) : (
              <ul className="mt-2 divide-y divide-ink/10">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/portal/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream/60">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[0.93rem] text-ink">{o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")}</div>
                        <div className="text-[0.8rem] text-ink-mute">{longDate(o.created_at)}</div>
                      </div>
                      <Pill tone={o.status} />
                      <span className="shrink-0 font-semibold text-ink">{kesAmount(o.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {p?.result?.core && p.result.core.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[0.95rem] font-semibold text-ink">From their health check</h2>
              <p className="mt-1 text-[0.85rem] text-ink-mute">
                {longDate(p.created_at)} ·{" "}
                <Link href={`/portal/prospects/${p.id}`} className="font-semibold text-forest underline underline-offset-2">
                  See their answers
                </Link>
              </p>
              <ul className="mt-3 grid gap-2">
                {p.result.core.map((x) => (
                  <li key={x.product.id} className="rounded-xl bg-cream px-3.5 py-2.5">
                    <div className="font-semibold text-ink">{x.product.name}</div>
                    {x.reasons[0] && <div className="text-[0.85rem] leading-snug text-ink-soft">{x.reasons[0]}</div>}
                  </li>
                ))}
              </ul>
              {p.flags.length > 0 && <p className="mt-3 text-[0.85rem] font-medium text-clay">Note: {p.flags.join("; ")}</p>}
            </Card>
          )}
        </div>

        <Card className="p-5">
          <h2 className="text-[0.95rem] font-semibold text-ink">History</h2>
          <div className="mt-3">
            <NoteForm customerId={c.id} />
          </div>
          {c.notes && <p className="mt-4 rounded-xl bg-cream px-3.5 py-2.5 text-[0.9rem] text-ink-soft">{c.notes}</p>}
          <ol className="mt-4 grid gap-3">
            {interactions.map((i) => (
              <li key={i.id} className="grid grid-cols-[4.5rem_1fr] gap-3 text-[0.9rem]">
                <span className="text-[0.78rem] text-ink-mute">{shortDate(i.created_at)}</span>
                <span>
                  <span className="text-[0.75rem] font-semibold text-ink-mute">{KIND_LABEL[i.kind] ?? i.kind}</span>
                  <span className="block leading-snug text-ink">{i.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-ink/10 bg-paper p-3.5">
      <div className="text-[0.75rem] font-semibold text-ink-mute">{label}</div>
      <div className="mt-0.5 font-display text-[1.25rem] leading-tight text-ink">{value}</div>
    </div>
  );
}
