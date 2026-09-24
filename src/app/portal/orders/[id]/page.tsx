import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalAccount } from "@/server/auth";
import { confirmationMessage, deliveryWhere, order as getOrder, pageOrderConfirmed } from "@/server/portal";
import { Card, Pill, kesAmount, longDate, prettyPhone } from "@/components/portal/ui";
import { ChevronLeft } from "@/components/ui/icons";
import { ConfirmOrder } from "./ConfirmOrder";
import { OrderActions } from "./OrderActions";

export default async function OrderPage(props: PageProps<"/portal/orders/[id]">) {
  const { id } = await props.params;
  const a = await requirePortalAccount();
  const o = /^[0-9a-f-]{36}$/.test(id) ? await getOrder(a.workspace.id, id) : null;
  if (!o) notFound();
  const first = o.customer_name.split(" ")[0];
  // A page order is confirmed before anyone chases the payment.
  const toConfirm = o.source === "storefront" && o.status === "unpaid" && !(await pageOrderConfirmed(a.workspace.id, o.id));
  const reminder = `Hi ${first}, just a quick reminder about your order of ${kesAmount(o.total)} from ${longDate(o.created_at)}. Send it whenever you're ready and I'll sort out the delivery. Asante!`;

  return (
    <div className="grid max-w-2xl gap-6">
      <Link href="/portal/orders" className="inline-flex w-fit items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="h-3.5 w-3.5" /> Orders
      </Link>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-[2.2rem] leading-tight tracking-[-0.02em] text-ink">{kesAmount(o.total)}</h1>
          <Pill tone={o.status} />
          {o.source === "storefront" && (
            <span className="rounded-full bg-sage-soft px-2.5 py-0.5 text-[0.75rem] font-semibold text-forest">From your page{o.ref ? ` · ${o.ref}` : ""}</span>
          )}
        </div>
        <p className="mt-1 text-[0.95rem] text-ink-soft">
          <Link href={`/portal/customers/${o.customer_id}`} className="font-semibold text-forest underline underline-offset-2">
            {o.customer_name}
          </Link>
          {o.customer_phone && <> · {prettyPhone(o.customer_phone)}</>} · {longDate(o.created_at)}
        </p>
      </div>
      <Card className="divide-y divide-ink/10">
        {o.items.map((i, k) => (
          <div key={k} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <span className="text-ink">
              {i.qty} × {i.name}
            </span>
            <span className="text-ink-soft">{kesAmount(i.qty * i.unitPrice)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-5 py-3.5 font-semibold">
          <span>Total</span>
          <span>{kesAmount(o.total)}</span>
        </div>
      </Card>
      {o.source === "storefront" && (o.delivery || o.customer_note || o.payment_method) && (
        <Card className="grid gap-2 p-5 text-[0.93rem]">
          {o.delivery && (
            <p>
              <span className="font-semibold text-ink">{o.delivery.fulfilment === "pickup" ? "Collecting: " : "Delivery: "}</span>
              <span className="text-ink-soft">
                {o.delivery.fulfilment === "pickup" ? "they'll collect it from you" : (deliveryWhere(o.delivery) ?? "still to arrange")}
              </span>
            </p>
          )}
          {o.payment_method && o.status === "unpaid" && (
            <p>
              <span className="font-semibold text-ink">Paying by: </span>
              <span className="text-ink-soft">{o.payment_method === "mpesa" ? "M-Pesa" : "cash"}</span>
            </p>
          )}
          {o.customer_note && (
            <p>
              <span className="font-semibold text-ink">Their note: </span>
              <span className="text-ink-soft">{o.customer_note}</span>
            </p>
          )}
        </Card>
      )}
      <dl className="grid gap-1.5 text-[0.93rem]">
        {o.paid_at && (
          <div>
            <dt className="inline text-ink-mute">Paid: </dt>
            <dd className="inline text-ink">
              {longDate(o.paid_at)} by {o.payment_method === "mpesa" ? "M-Pesa" : o.payment_method}
              {o.payment_ref && <span className="font-mono"> ({o.payment_ref})</span>}
            </dd>
          </div>
        )}
        {o.delivered_at && (
          <div>
            <dt className="inline text-ink-mute">Delivered: </dt>
            <dd className="inline text-ink">{longDate(o.delivered_at)}</dd>
          </div>
        )}
        {o.reorder_due_at && o.status !== "cancelled" && (
          <div>
            <dt className="inline text-ink-mute">Likely to need more around: </dt>
            <dd className="inline text-ink">{longDate(o.reorder_due_at)}</dd>
          </div>
        )}
      </dl>
      {toConfirm && (
        <Card className="p-5">
          <ConfirmOrder
            orderId={o.id}
            first={first}
            phone={o.customer_phone}
            message={confirmationMessage(o, (a.workspace.owner_name ?? "").split(" ")[0])}
          />
        </Card>
      )}
      <Card className="p-5">
        <OrderActions id={o.id} status={o.status} phone={o.customer_phone} reminder={reminder} remind={!toConfirm} />
      </Card>
    </div>
  );
}
