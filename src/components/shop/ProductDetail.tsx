"use client";

import clsx from "clsx";
import { motion, useInView, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { GOALS_BY_ID, PRODUCTS_BY_ID } from "@/engine";
import { beforeYouTake } from "@/lib/product-notes";
import { kesPrice, productQuestion } from "@/lib/shop";
import { Alert, ChevronLeft } from "@/components/ui/icons";
import { Stepper, WaGlyph, WhatsAppAction, waButton } from "./bits";
import { ProductCard } from "./ProductCard";
import { FORMAT_LABEL, ProductVisual } from "./ProductVisual";
import { useShop } from "./ShopProvider";
import { shopX } from "./ShopHome";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductDetail({ productId }: { productId: string }) {
  const { shop, add, basket, openBasket, base } = useShop();
  const p = PRODUCTS_BY_ID[productId];
  const d = shop.distributor;
  const price = shop.prices[p.id];
  const out = price && !price.inStock;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const buyInView = useInView(buyRef, { margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const related = shop.productIds
    .map((id) => PRODUCTS_BY_ID[id])
    .filter((x) => x.id !== p.id && x.group !== p.group && x.goals.some((g) => p.goals.includes(g)))
    .slice(0, 4);

  const addToBasket = () => {
    add(p.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const inBasket = basket[p.id] ?? 0;

  return (
    <div className="pb-32 md:pb-16">
      <div className={clsx(shopX, "pt-4 sm:pt-6")}>
        <Link
          href={`${base}#products`}
          className="inline-flex items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> All products
        </Link>
      </div>
      <div className={clsx(shopX, "mt-4 grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16")}>
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease }}
          className="md:sticky md:top-24 md:self-start"
        >
          <ProductVisual product={p} size="hero" priority className="rounded-[1.75rem]" />
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
        >
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-ink-mute">
            {FORMAT_LABEL[p.format]} · {p.line}
          </p>
          <h1 className="mt-2 font-display text-[2.3rem] leading-[1.05] tracking-[-0.022em] text-ink sm:text-[3rem]">{p.name}</h1>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft">{p.summary}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.goals.map((g) => (
              <span key={g} className="rounded-full bg-sage-soft px-3 py-1 text-[0.8rem] font-semibold text-forest">
                {GOALS_BY_ID[g].label}
              </span>
            ))}
          </div>

          <div ref={buyRef} className="mt-7 rounded-[1.5rem] border border-ink/10 bg-paper p-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className={clsx(price?.price ? "font-display text-[2rem] text-ink" : "text-[1rem] text-ink-soft")}>
                {price?.price ? kesPrice(price.price) : `${d.firstName} will confirm the price`}
              </span>
              <span className={clsx("text-[0.82rem] font-semibold", out ? "text-clay" : "text-moss")}>
                {out ? "Out of stock" : "Available"}
              </span>
            </div>
            {!out && (
              <div className="mt-4 flex gap-2">
                <Stepper qty={qty} onChange={(q) => setQty(Math.max(1, q))} label={p.name} />
                <button
                  type="button"
                  onClick={addToBasket}
                  className={clsx(
                    "h-11 flex-1 rounded-full text-[0.95rem] font-semibold text-cream transition active:scale-[0.99]",
                    added ? "bg-moss" : "bg-forest hover:bg-forest-deep",
                  )}
                >
                  {added ? "Added to your basket" : "Add to basket"}
                </button>
              </div>
            )}
            {inBasket > 0 && (
              <button
                type="button"
                onClick={openBasket}
                className="mt-3 text-[0.85rem] font-semibold text-forest underline underline-offset-4"
              >
                {inBasket} in your basket · Review order
              </button>
            )}
            <WhatsAppAction
              message={productQuestion(d.firstName, p)}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-ink/12 text-[0.9rem] font-semibold text-ink transition hover:border-ink/30"
            >
              <WaGlyph className="h-4 w-4 text-[#1faa59]" /> Ask {d.firstName} about this
            </WhatsAppAction>
          </div>

          <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            <Row term="What to expect">{p.expectation}</Row>
            {p.keyIngredients.length > 0 && <Row term="Key ingredients">{p.keyIngredients.join(", ")}</Row>}
            <Row term="How to take it">Follow the dose on the pack, or as {d.firstName} advises.</Row>
          </dl>

          <section aria-labelledby="before-title" className="mt-8 rounded-[1.25rem] bg-clay-soft/35 p-5">
            <h2 id="before-title" className="flex items-center gap-2 text-[0.95rem] font-semibold text-[#6b3a1f]">
              <Alert className="h-4 w-4" /> Before you take it
            </h2>
            <ul className="mt-3 grid gap-2 text-[0.92rem] leading-relaxed text-ink">
              {beforeYouTake(p, d.firstName).map((n) => (
                <li key={n} className="flex gap-2.5">
                  <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-clay" />
                  {n}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-8 rounded-[1.25rem] border border-ink/10 p-5">
            <h2 className="font-display text-[1.35rem] leading-tight text-ink">Not sure it&apos;s right for you?</h2>
            <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-soft">
              The health check looks at your goals, medicines and routine, and tells you honestly whether this fits.
            </p>
            <Link
              href={`${base}/check`}
              className="mt-4 inline-flex h-11 items-center rounded-full bg-forest px-5 text-[0.92rem] font-semibold text-cream"
            >
              Take the three-minute check
            </Link>
          </div>

          <p className="mt-6 text-[0.78rem] leading-relaxed text-ink-mute">
            Product details come from BF Suma&apos;s published information. Always read the label on your pack. Supplements support a
            healthy routine; they don&apos;t diagnose, treat or cure disease.
          </p>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className={clsx(shopX, "mt-16 border-t border-ink/10 pt-10")}>
          <h2 id="related-title" className="font-display text-[1.7rem] text-ink">
            Also used for{" "}
            {p.goals
              .map((g) => GOALS_BY_ID[g].short.toLowerCase())
              .slice(0, 2)
              .join(" and ")}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4">
            {related.map((r) => (
              <li key={r.id}>
                <ProductCard product={r} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Phones: price and add, always in reach once the main button scrolls away. */}
      {!out && (
        <div
          className={clsx(
            "fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 md:hidden",
            buyInView ? "translate-y-full" : "translate-y-0",
          )}
          aria-hidden={buyInView}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[0.85rem] font-semibold text-ink">{p.name}</div>
              <div className="text-[0.82rem] text-ink-soft">{price?.price ? kesPrice(price.price) : "Price on request"}</div>
            </div>
            <WhatsAppAction
              message={productQuestion(d.firstName, p)}
              label={`Ask ${d.firstName}`}
              className={clsx(waButton, "h-12 w-12 shrink-0")}
            >
              <WaGlyph className="h-5 w-5" />
            </WhatsAppAction>
            <button
              type="button"
              tabIndex={buyInView ? -1 : 0}
              onClick={inBasket ? openBasket : addToBasket}
              className="h-12 shrink-0 rounded-full bg-forest px-5 text-[0.92rem] font-semibold text-cream active:scale-[0.99]"
            >
              {added ? "Added" : inBasket ? "View basket" : "Add to basket"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-[0.85rem] font-semibold text-ink">{term}</dt>
      <dd className="text-[0.95rem] leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}
