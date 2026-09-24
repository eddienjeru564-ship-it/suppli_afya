"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { placeOrder } from "@/app/d/[slug]/order/actions";
import { basketLines, kesPrice, orderMessage } from "@/lib/shop";
import type { PlacedOrder } from "@/server/shop";
import { Check, ChevronLeft } from "@/components/ui/icons";
import { Stepper, WaGlyph, WhatsAppAction, waButton } from "./bits";
import { ProductVisual } from "./ProductVisual";
import { useShop } from "./ShopProvider";
import { shopX } from "./ShopHome";

const ME_KEY = "sa-customer";

const field =
  "mt-1.5 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3.5 text-[1rem] text-ink outline-none transition placeholder:text-ink/35 focus:border-forest aria-[invalid=true]:border-clay";

export function Checkout() {
  const { shop, basket, setQty, total, unpriced, count, plan, setPlan, clear, base } = useShop();
  const d = shop.distributor;
  const s = shop.details;
  const lines = basketLines(basket, shop.prices);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [pay, setPay] = useState<"mpesa" | "cash">("mpesa");
  const [note, setNote] = useState("");
  const [shareCheck, setShareCheck] = useState(true);
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [done, setDone] = useState<
    (PlacedOrder & { fulfilment: "delivery" | "pickup"; address: string; pay: "mpesa" | "cash"; name: string }) | null
  >(null);
  const [pending, start] = useTransition();

  // Remember who's ordering on this phone, so a reorder is two taps.
  useEffect(() => {
    try {
      const me = JSON.parse(localStorage.getItem(ME_KEY) ?? "null") as { name?: string; phone?: string; address?: string } | null;
      if (me) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from device storage
        setName(me.name ?? "");
        setPhone(me.phone ?? "");
        setAddress(me.address ?? "");
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await placeOrder({
        slug: d.slug,
        name,
        phone,
        fulfilment,
        address,
        note,
        pay,
        items: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
        check: plan && shareCheck ? plan : undefined,
      });
      if (!r.ok) {
        setError({ text: r.error, field: r.field });
        return;
      }
      try {
        localStorage.setItem(ME_KEY, JSON.stringify({ name, phone, address }));
      } catch {
        /* storage unavailable */
      }
      setDone({ ...r, fulfilment, address, pay, name });
      clear();
      setPlan(null);
      window.scrollTo({ top: 0 });
    });
  };

  if (done) return <Confirmation order={done} />;

  if (lines.length === 0) {
    return (
      <div className={clsx(shopX, "py-20 text-center")}>
        <h1 className="font-display text-[2.2rem] text-ink">Your basket is empty</h1>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">
          Add products from {d.firstName}&apos;s shop, or let the health check suggest where to start.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link href={`${base}#products`} className="inline-flex h-12 items-center rounded-full bg-forest px-6 font-semibold text-cream">
            Browse products
          </Link>
          <Link
            href={`${base}/check`}
            className="inline-flex h-12 items-center rounded-full border border-forest/25 px-6 font-semibold text-forest"
          >
            Help me choose
          </Link>
        </div>
      </div>
    );
  }

  const invalid = (f: string) => error?.field === f;

  return (
    <div className={clsx(shopX, "pb-16 pt-5 sm:pt-8")}>
      <Link href={base} className="inline-flex items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="h-3.5 w-3.5" /> Keep shopping
      </Link>
      <h1 className="mt-3 font-display text-[2.3rem] leading-tight tracking-[-0.02em] text-ink sm:text-[2.8rem]">Your order</h1>
      <p className="mt-2 max-w-xl text-[1rem] leading-relaxed text-ink-soft">
        {d.firstName} will confirm the total and delivery with you before you pay anything.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-12" noValidate>
        <div className="grid gap-7">
          <fieldset className="grid gap-4">
            <legend className="text-[1.05rem] font-semibold text-ink">Your details</legend>
            <label className="block text-[0.9rem] font-semibold text-ink">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={field}
                aria-invalid={invalid("name")}
                placeholder="e.g. Achieng Otieno"
              />
            </label>
            <label className="block text-[0.9rem] font-semibold text-ink">
              Phone number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                className={field}
                aria-invalid={invalid("phone")}
                placeholder="07XX XXX XXX"
              />
              <span className="mt-1.5 block text-[0.8rem] font-normal text-ink-mute">
                {d.firstName} will call or WhatsApp you on this number.
              </span>
            </label>
          </fieldset>

          <fieldset>
            <legend className="text-[1.05rem] font-semibold text-ink">Getting it to you</legend>
            {s.pickup && (
              <Choice
                options={[
                  { v: "delivery", label: "Deliver to me", hint: s.delivery ?? "Arranged when your order is confirmed" },
                  { v: "pickup", label: "I'll collect", hint: s.pickup },
                ]}
                value={fulfilment}
                onChange={(v) => setFulfilment(v as "delivery" | "pickup")}
                label="Delivery or collection"
              />
            )}
            {fulfilment === "delivery" && (
              <label className="mt-4 block text-[0.9rem] font-semibold text-ink">
                Where should it go?
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                  className={field}
                  aria-invalid={invalid("address")}
                  placeholder="Estate, road or landmark, and town"
                />
                {!s.pickup && s.delivery && <span className="mt-1.5 block text-[0.8rem] font-normal text-ink-mute">{s.delivery}</span>}
              </label>
            )}
            {s.deliveryFee && fulfilment === "delivery" && (
              <p className="mt-2 text-[0.82rem] text-ink-mute">Delivery cost: {s.deliveryFee}</p>
            )}
          </fieldset>

          <fieldset>
            <legend className="text-[1.05rem] font-semibold text-ink">Paying</legend>
            <Choice
              options={[
                { v: "mpesa", label: "M-Pesa", hint: `After ${d.firstName} confirms the total` },
                ...(s.cashOnDelivery !== false
                  ? [
                      {
                        v: "cash",
                        label: fulfilment === "pickup" ? "Cash when I collect" : "Cash on delivery",
                        hint: "Pay when it reaches you",
                      },
                    ]
                  : []),
              ]}
              value={pay}
              onChange={(v) => setPay(v as "mpesa" | "cash")}
              label="How you'll pay"
            />
          </fieldset>

          <label className="block text-[0.9rem] font-semibold text-ink">
            Anything {d.firstName} should know? <span className="font-normal text-ink-mute">(optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className={field}
              placeholder="Best time to call, questions about a product…"
            />
          </label>

          {plan && (
            <label className="flex gap-3 rounded-2xl bg-sage-soft/60 p-4 text-[0.9rem] leading-relaxed text-ink">
              <input
                type="checkbox"
                checked={shareCheck}
                onChange={(e) => setShareCheck(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-forest)]"
              />
              <span>
                Share my health check answers ({plan.ref}) with {d.firstName}, so the advice fits what I told the check.
              </span>
            </label>
          )}
        </div>

        <aside className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 lg:sticky lg:top-24">
          <h2 className="font-semibold text-ink">
            {count} item{count > 1 ? "s" : ""}
          </h2>
          <ul className="mt-3 divide-y divide-ink/10">
            {lines.map((l) => (
              <li key={l.product.id} className="flex gap-3 py-3">
                <div className="w-14 shrink-0 overflow-hidden rounded-xl">
                  <ProductVisual product={l.product} size="thumb" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.92rem] font-semibold leading-snug text-ink">{l.product.name}</div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <Stepper qty={l.qty} onChange={(q) => setQty(l.product.id, q)} label={l.product.name} size="sm" />
                    <span className="text-[0.9rem] font-semibold tabular-nums text-ink">
                      {l.price ? kesPrice(l.price * l.qty) : "To confirm"}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-baseline justify-between border-t border-ink/10 pt-4">
            <span className="text-[0.92rem] text-ink-soft">{unpriced ? "Subtotal so far" : "Subtotal"}</span>
            <span className="font-display text-[1.6rem] text-ink">{kesPrice(total)}</span>
          </div>
          <p className="mt-1 text-[0.8rem] leading-snug text-ink-mute">
            Plus delivery, if any. {d.firstName} confirms the final total with you.
          </p>

          <AnimatePresence>
            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]"
              >
                {error.text}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={pending}
            className="mt-4 h-14 w-full rounded-full bg-forest text-[1rem] font-semibold text-cream transition hover:bg-forest-deep active:scale-[0.99] disabled:opacity-60"
          >
            {pending ? "Placing your order…" : `Place order${total ? ` · ${kesPrice(total)}` : ""}`}
          </button>
          <p className="mt-3 text-center text-[0.76rem] leading-snug text-ink-mute">
            Nothing is charged now. Your details go only to {d.firstName}, to arrange this order.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Choice({
  options,
  value,
  onChange,
  label,
}: {
  options: { v: string; label: string; hint?: string }[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="mt-3 grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={clsx(
            "rounded-2xl border p-4 text-left transition-colors",
            value === o.v
              ? "border-forest bg-sage-soft/60 shadow-[0_0_0_1px_var(--color-forest)]"
              : "border-ink/15 bg-paper hover:border-ink/35",
          )}
        >
          <span className="block font-semibold text-ink">{o.label}</span>
          {o.hint && <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-mute">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

function Confirmation({
  order,
}: {
  order: PlacedOrder & { fulfilment: "delivery" | "pickup"; address: string; pay: "mpesa" | "cash"; name: string };
}) {
  const { shop, base } = useShop();
  const d = shop.distributor;
  const s = shop.details;
  const reduce = useReducedMotion();
  const message = orderMessage({
    firstName: d.firstName,
    customer: order.name,
    ref: order.ref,
    lines: order.lines,
    total: order.total,
    unpriced: order.unpriced,
    fulfilment: order.fulfilment,
    address: order.address,
    pay: order.pay,
  });
  return (
    <div className={clsx(shopX, "max-w-2xl pb-20 pt-10 sm:pt-16")}>
      <motion.div
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="grid h-14 w-14 place-items-center rounded-full bg-forest text-cream"
      >
        <Check className="h-6 w-6" />
      </motion.div>
      <p className="mt-6 text-[0.85rem] font-semibold text-clay">Order {order.ref}</p>
      <h1 className="mt-1 font-display text-[2.4rem] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[3rem]">
        Thank you, {order.firstName}. {d.firstName} has your order.
      </h1>
      {order.demo && (
        <p className="mt-4 rounded-xl border border-dashed border-ochre/60 px-4 py-3 text-[0.85rem] text-[#7a5412]">
          This is an example shop, so the order wasn&apos;t sent anywhere.
        </p>
      )}

      <ol className="mt-8 grid gap-5">
        <Next n={1} title={`${d.firstName} confirms with you`}>
          A call or WhatsApp to confirm the total{order.fulfilment === "delivery" ? " and delivery" : " and when to collect"}.{" "}
          {s.hours ? `${d.firstName} replies ${s.hours}.` : ""}
        </Next>
        <Next n={2} title="You pay">
          {order.pay === "mpesa"
            ? s.mpesa
              ? `By M-Pesa to ${s.mpesa.kind === "till" ? `Till ${s.mpesa.number}` : s.mpesa.kind === "paybill" ? `Paybill ${s.mpesa.number}${s.mpesa.account ? `, account ${s.mpesa.account}` : ""}` : s.mpesa.number}${s.mpesa.name ? ` (${s.mpesa.name})` : ""}, once ${d.firstName} has confirmed the total.`
              : `By M-Pesa, once ${d.firstName} has confirmed the total and where to pay.`
            : `In cash when it ${order.fulfilment === "delivery" ? "arrives" : "is collected"}.`}
        </Next>
        <Next n={3} title={order.fulfilment === "delivery" ? "It's delivered" : "You collect it"}>
          {order.fulfilment === "delivery" ? `To ${order.address}.` : (s.pickup ?? `${d.firstName} will tell you where.`)}
        </Next>
      </ol>

      <div className="mt-8 rounded-[1.5rem] border border-ink/10 bg-paper p-5">
        <ul className="grid gap-1.5 text-[0.92rem] text-ink">
          {order.lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-3">
              <span>
                {l.qty} × {l.name}
              </span>
              <span className="tabular-nums text-ink-soft">{l.unitPrice ? kesPrice(l.unitPrice * l.qty) : "To confirm"}</span>
            </li>
          ))}
        </ul>
        {order.total > 0 && (
          <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 font-semibold text-ink">
            <span>{order.unpriced ? "Subtotal" : "Total before delivery"}</span>
            <span className="tabular-nums">{kesPrice(order.total)}</span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <WhatsAppAction message={message} className={clsx(waButton, "h-13 text-[0.95rem]")}>
          <WaGlyph className="h-5 w-5" /> Tell {d.firstName} on WhatsApp
        </WhatsAppAction>
        <Link
          href={base}
          className="inline-flex h-13 items-center justify-center rounded-full border border-forest/25 text-[0.95rem] font-semibold text-forest"
        >
          Back to the shop
        </Link>
      </div>
      <p className="mt-3 text-[0.8rem] text-ink-mute">
        Optional: {d.firstName} already has your order. WhatsApp just starts the conversation sooner.
      </p>
    </div>
  );
}

function Next({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 font-display text-[0.95rem] text-ink-soft">
        {n}
      </span>
      <div>
        <div className="font-semibold text-ink">{title}</div>
        <p className="mt-0.5 text-[0.95rem] leading-relaxed text-ink-soft">{children}</p>
      </div>
    </li>
  );
}
