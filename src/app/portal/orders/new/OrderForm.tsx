"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createOrder } from "@/app/portal/actions";
import { CATALOGUE } from "@/engine";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { kesAmount } from "@/components/portal/ui";

interface Line {
  productId: string;
  qty: number;
  unitPrice: string;
}

export function OrderForm({
  customers,
  presetCustomerId,
  prospect,
  suggested,
  lastPrices,
}: {
  customers: { id: string; name: string; phone: string | null }[];
  presetCustomerId?: string;
  prospect?: { id: string; name: string };
  suggested: string[];
  lastPrices: Record<string, number>;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"existing" | "new">(presetCustomerId || customers.length ? "existing" : "new");
  const [customerId, setCustomerId] = useState(presetCustomerId ?? "");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [lines, setLines] = useState<Line[]>(
    suggested.length
      ? suggested.map((id) => ({ productId: id, qty: 1, unitPrice: lastPrices[id] ? String(lastPrices[id]) : "" }))
      : [{ productId: "", qty: 1, unitPrice: "" }],
  );
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState<"mpesa" | "cash" | "other">("mpesa");
  const [ref, setRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.unitPrice) || 0) * l.qty, 0), [lines]);
  const set = (i: number, patch: Partial<Line>) =>
    setLines((ls) =>
      ls.map((l, j) => {
        if (j !== i) return l;
        const next = { ...l, ...patch };
        if (patch.productId && !l.unitPrice && lastPrices[patch.productId]) next.unitPrice = String(lastPrices[patch.productId]);
        return next;
      }),
    );

  const lines_ = CATALOGUE.reduce<Record<string, typeof CATALOGUE>>((acc, p) => {
    (acc[p.line] ??= []).push(p);
    return acc;
  }, {});

  const submit = () =>
    start(async () => {
      setError(null);
      const r = await createOrder({
        customerId: !prospect && mode === "existing" ? customerId || undefined : undefined,
        prospectId: prospect?.id,
        newName: !prospect && mode === "new" ? newName : undefined,
        newPhone: !prospect && mode === "new" ? newPhone : undefined,
        items: lines.map((l) => ({ productId: l.productId, qty: l.qty, unitPrice: Number(l.unitPrice) || 0 })),
        paid: paid ? { method, ref } : null,
      });
      if (!r.ok) return setError(r.error);
      router.push(`/portal/orders/${r.id}`);
    });

  return (
    <div className="grid gap-6">
      <section className="rounded-[1.25rem] border border-ink/10 bg-paper p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">Customer</h2>
        {prospect ? (
          <p className="mt-2 text-[0.95rem] text-ink">
            {prospect.name} <span className="text-ink-mute">· from the health check. They&apos;ll become a customer when you save.</span>
          </p>
        ) : (
          <>
            <div className="mt-3 inline-flex rounded-full bg-cream p-1 text-[0.85rem] font-semibold">
              {(["existing", "new"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  disabled={m === "existing" && !customers.length}
                  className={clsx("rounded-full px-3.5 py-1.5 disabled:opacity-40", mode === m ? "bg-forest text-cream" : "text-ink-soft")}
                >
                  {m === "existing" ? "Existing customer" : "New customer"}
                </button>
              ))}
            </div>
            {mode === "existing" ? (
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputClass}>
                <option value="">Choose a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.phone ? ` · 0${c.phone.slice(3)}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className={inputClass} />
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone (optional)" inputMode="tel" className={inputClass} />
              </div>
            )}
          </>
        )}
      </section>

      <section className="rounded-[1.25rem] border border-ink/10 bg-paper p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">Products</h2>
        <div className="mt-3 grid gap-3">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[4.5rem_1fr] gap-2 rounded-xl bg-cream p-3 sm:grid-cols-[1fr_5rem_8rem_auto] sm:items-end">
              <label className="col-span-2 text-[0.75rem] font-semibold text-ink-mute sm:col-span-1">
                Product
                <select value={l.productId} onChange={(e) => set(i, { productId: e.target.value })} className={clsx(inputClass, "mt-1 py-2.5")}>
                  <option value="">Choose…</option>
                  {Object.entries(lines_).map(([line, ps]) => (
                    <optgroup key={line} label={line}>
                      {ps.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label className="text-[0.75rem] font-semibold text-ink-mute">
                Qty
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={l.qty}
                  onChange={(e) => set(i, { qty: Math.max(1, Number(e.target.value) || 1) })}
                  className={clsx(inputClass, "mt-1 py-2.5")}
                />
              </label>
              <label className="text-[0.75rem] font-semibold text-ink-mute">
                Price each (KES)
                <input
                  inputMode="numeric"
                  value={l.unitPrice}
                  onChange={(e) => set(i, { unitPrice: e.target.value.replace(/[^\d]/g, "") })}
                  placeholder="0"
                  className={clsx(inputClass, "mt-1 py-2.5")}
                />
              </label>
              <button
                type="button"
                onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))}
                className="col-span-2 justify-self-end text-[0.82rem] font-semibold text-ink-mute hover:text-clay sm:col-span-1 sm:self-center sm:pb-3"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLines((ls) => [...ls, { productId: "", qty: 1, unitPrice: "" }])}
          className="mt-3 text-[0.88rem] font-semibold text-forest"
        >
          + Add another product
        </button>
        <div className="mt-4 flex items-baseline justify-between border-t border-ink/10 pt-4">
          <span className="text-[0.9rem] text-ink-soft">Total</span>
          <span className="font-display text-[1.6rem] text-ink">{kesAmount(total)}</span>
        </div>
      </section>

      <section className="rounded-[1.25rem] border border-ink/10 bg-paper p-5">
        <div className="text-[0.95rem] font-semibold text-ink" id="paid-label">
          Has it been paid?
        </div>
        <div role="radiogroup" aria-labelledby="paid-label" className="mt-3 grid grid-cols-2 gap-2">
          {[
            { v: false, label: "Not yet", hint: "It stays on your list until it's paid" },
            { v: true, label: "Paid", hint: "M-Pesa, cash or other" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={paid === o.v}
              onClick={() => setPaid(o.v)}
              className={clsx(
                "rounded-2xl border px-4 py-3 text-left transition-colors",
                paid === o.v ? "border-forest bg-sage-soft/60 shadow-[0_0_0_1px_var(--color-forest)]" : "border-ink/15 bg-cream hover:border-ink/35",
              )}
            >
              <span className="block font-semibold text-ink">{o.label}</span>
              <span className="mt-0.5 block text-[0.78rem] leading-snug text-ink-mute">{o.hint}</span>
            </button>
          ))}
        </div>
        {paid && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className={inputClass}>
              <option value="mpesa">M-Pesa</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
            {method === "mpesa" && (
              <input
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="M-Pesa code (optional)"
                className={inputClass}
              />
            )}
          </div>
        )}
      </section>

      {error && (
        <p role="alert" className="rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]">
          {error}
        </p>
      )}
      <div className="sticky bottom-20 z-10 lg:bottom-4">
        <Button size="lg" className="w-full shadow-float sm:w-auto" onClick={submit} disabled={pending} arrow>
          {pending ? "Saving…" : `Save order · ${kesAmount(total)}`}
        </Button>
      </div>
    </div>
  );
}
