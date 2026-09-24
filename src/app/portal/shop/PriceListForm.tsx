"use client";

import clsx from "clsx";
import { useMemo, useState, useTransition } from "react";
import { saveShopPrices } from "@/app/portal/actions";
import type { PriceList } from "@/config/shop";
import { CATALOGUE, type ProductLine } from "@/engine";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { Button } from "@/components/ui/Button";

type Row = { price: string; inStock: boolean; featured: boolean };

/** Every catalogue product with a price box, grouped by range. One save for the lot. */
export function PriceListForm({ initial }: { initial: PriceList }) {
  const [rows, setRows] = useState<Record<string, Row>>(() =>
    Object.fromEntries(
      CATALOGUE.map((p) => {
        const r = initial[p.id];
        return [p.id, { price: r?.price ? String(r.price) : "", inStock: r?.inStock ?? true, featured: r?.featured ?? false }];
      }),
    ),
  );
  const [saved, setSaved] = useState<"idle" | "saved" | "dirty">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const lines = useMemo(() => [...new Set(CATALOGUE.map((p) => p.line))] as ProductLine[], []);
  const featuredCount = Object.values(rows).filter((r) => r.featured).length;
  const priced = Object.values(rows).filter((r) => r.price).length;

  const set = (id: string, patch: Partial<Row>) => {
    setRows((rs) => ({ ...rs, [id]: { ...rs[id], ...patch } }));
    setSaved("dirty");
  };

  const save = () =>
    start(async () => {
      setError(null);
      const list: PriceList = Object.fromEntries(
        Object.entries(rows).map(([id, r]) => [id, { price: r.price ? Number(r.price) : null, inStock: r.inStock, featured: r.featured }]),
      );
      const res = await saveShopPrices(list);
      if (!res.ok) setError(res.error);
      else setSaved("saved");
    });

  return (
    <div className="grid grid-cols-1 gap-6">
      {lines.map((line) => (
        <div key={line}>
          <h3 className="mb-2 text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-ink-mute">{line}</h3>
          <ul className="divide-y divide-ink/10 overflow-hidden rounded-[1.25rem] border border-ink/10 bg-paper">
            {CATALOGUE.filter((p) => p.line === line).map((p) => {
              const r = rows[p.id];
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="w-11 shrink-0 overflow-hidden rounded-lg">
                    <ProductVisual product={p} size="thumb" />
                  </div>
                  <div className="min-w-0 flex-1 basis-40">
                    <div className="font-semibold leading-snug text-ink">{p.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        aria-pressed={r.inStock}
                        onClick={() => set(p.id, { inStock: !r.inStock })}
                        className={clsx("rounded-full px-2.5 py-1 text-[0.72rem] font-semibold", r.inStock ? "bg-sage-soft text-forest" : "bg-ink/10 text-ink-soft")}
                      >
                        {r.inStock ? "In stock" : "Out of stock"}
                      </button>
                      <button
                        type="button"
                        aria-pressed={r.featured}
                        disabled={!r.featured && featuredCount >= 4}
                        onClick={() => set(p.id, { featured: !r.featured })}
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-[0.72rem] font-semibold disabled:opacity-40",
                          r.featured ? "bg-forest text-cream" : "border border-ink/15 text-ink-soft",
                        )}
                      >
                        {r.featured ? "★ Most asked for" : "☆ Most asked for"}
                      </button>
                    </div>
                  </div>
                  <label className="relative w-32 shrink-0">
                    <span className="sr-only">Price of {p.name} in shillings</span>
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[0.8rem] font-semibold text-ink-mute">KES</span>
                    <input
                      inputMode="numeric"
                      value={r.price}
                      onChange={(e) => set(p.id, { price: e.target.value.replace(/[^\d]/g, "").slice(0, 7) })}
                      placeholder="On request"
                      className="h-11 w-full rounded-xl border border-ink/15 bg-cream pl-11 pr-3 text-right text-[0.95rem] tabular-nums text-ink outline-none placeholder:text-[0.8rem] placeholder:text-ink/35 focus:border-forest"
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-paper/95 p-3 shadow-float backdrop-blur lg:bottom-4">
        <Button onClick={save} disabled={pending || saved !== "dirty"}>
          {pending ? "Saving…" : saved === "saved" ? "Saved" : "Save prices"}
        </Button>
        <span className="text-[0.85rem] text-ink-soft">
          {error ?? `${priced} of ${CATALOGUE.length} priced · ${featuredCount} of 4 most asked for`}
        </span>
      </div>
    </div>
  );
}
