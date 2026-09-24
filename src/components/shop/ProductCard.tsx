"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { GOALS_BY_ID, type Product } from "@/engine";
import { kesPrice, usedFor } from "@/lib/shop";
import { FORMAT_LABEL, ProductVisual } from "./ProductVisual";
import { useShop } from "./ShopProvider";

/** A product in the catalogue: what it is, what people use it for, the price, and one tap to add. */
export function ProductCard({ product: p }: { product: Product }) {
  const { shop, basket, add, base } = useShop();
  const price = shop.prices[p.id];
  const inBasket = basket[p.id] ?? 0;
  const out = price && !price.inStock;
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    add(p.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative flex h-full flex-col">
      <Link href={`${base}/p/${p.id}`} className="block overflow-hidden rounded-[1.25rem] focus-visible:outline-offset-4">
        <ProductVisual product={p} className="transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.035]" />
      </Link>
      {(price?.featured || out || inBasket > 0) && (
        <span
          className={clsx(
            "pointer-events-none absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold",
            out ? "bg-ink/75 text-cream" : inBasket ? "bg-forest text-cream" : "bg-paper/90 text-ink",
          )}
        >
          {out ? "Out of stock" : inBasket ? `${inBasket} in basket` : "Most asked for"}
        </span>
      )}
      <div className="mt-3 flex flex-1 flex-col px-0.5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-ink-mute">{FORMAT_LABEL[p.format]}</p>
        <h3 className="mt-1 text-[0.98rem] font-semibold leading-snug text-ink">
          <Link href={`${base}/p/${p.id}`} className="hover:underline hover:decoration-ink/30 hover:underline-offset-4">
            {p.name}
          </Link>
        </h3>
        <p className="mt-1 text-[0.84rem] leading-snug text-ink-soft">{usedFor(p, GOALS_BY_ID).join(" · ")}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className={clsx("tabular-nums", price?.price ? "text-[1rem] font-semibold text-ink" : "text-[0.84rem] text-ink-mute")}>
            {price?.price ? kesPrice(price.price) : "Price on request"}
          </span>
          {!out && (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Add ${p.name} to basket`}
              className={clsx(
                "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full transition-colors active:scale-95",
                added ? "bg-moss text-cream" : "bg-forest text-cream hover:bg-forest-deep",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.svg
                  key={added ? "done" : "add"}
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  aria-hidden
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {added ? (
                    <path
                      d="M3.5 8.5 6.5 11.5 12.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  )}
                </motion.svg>
              </AnimatePresence>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
