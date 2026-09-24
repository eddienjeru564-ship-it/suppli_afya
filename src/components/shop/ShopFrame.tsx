"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { WhatsAppPreview } from "@/components/check/WhatsAppPreview";
import { LogoMark } from "@/components/brand/Logo";
import { basketMessage, helloMessage, kesPrice, basketLines } from "@/lib/shop";
import { BagIcon, Monogram, Stepper, WaGlyph, WhatsAppAction, waButton } from "./bits";
import { ProductVisual } from "./ProductVisual";
import { useShop } from "./ShopProvider";

const ease = [0.22, 1, 0.36, 1] as const;

/** Header, footer, basket and the phone action bar around every shop page. */
export function ShopFrame({ children }: { children: ReactNode }) {
  const { shop } = useShop();
  const d = shop.distributor;
  return (
    <div className="min-h-dvh bg-cream">
      {d.demo && (
        <div className="bg-forest-deep px-4 py-2 text-center text-[0.78rem] leading-snug text-cream/80">
          Example shop: prices and details are illustrative, and nothing you send reaches anyone.{" "}
          <Link href="/" className="font-semibold text-cream underline underline-offset-2">
            About Suppli Afya
          </Link>
        </div>
      )}
      <ShopHeader />
      <main>{children}</main>
      <ShopFooter />
      <MobileBar />
      <BasketSheet />
      <PreviewSheet />
    </div>
  );
}

function ShopHeader() {
  const { shop, count, bump, openBasket, base } = useShop();
  const d = shop.distributor;
  const reduce = useReducedMotion();
  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.07] bg-cream/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href={base} className="flex min-w-0 items-center gap-2.5" aria-label={`${d.name}, shop home`}>
          <Monogram name={d.name} className="h-9 w-9 text-[0.95rem]" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-[1.15rem] text-ink">{d.name}</span>
            <span className="block truncate text-[0.72rem] font-medium text-ink-mute">
              {d.tagline || `BF Suma distributor${d.area ? ` · ${d.area}` : ""}`}
            </span>
          </span>
        </Link>
        <nav aria-label="Shop" className="ml-auto hidden items-center gap-1 text-[0.9rem] font-medium text-ink-soft md:flex">
          <Link href={`${base}#products`} className="rounded-full px-3 py-2 hover:text-ink">
            Products
          </Link>
          <Link href={`${base}/check`} className="rounded-full px-3 py-2 hover:text-ink">
            Help me choose
          </Link>
          <Link href={`${base}#ordering`} className="rounded-full px-3 py-2 hover:text-ink">
            How ordering works
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 md:ml-2">
          <WhatsAppAction
            message={helloMessage(d.firstName)}
            label={`Message ${d.firstName} on WhatsApp`}
            className="hidden h-10 items-center gap-2 rounded-full border border-ink/15 px-3.5 text-[0.88rem] font-semibold text-ink transition hover:border-ink/30 sm:inline-flex"
          >
            <WaGlyph className="h-4 w-4 text-[#1faa59]" /> Ask {d.firstName}
          </WhatsAppAction>
          <motion.button
            key={bump}
            type="button"
            onClick={openBasket}
            initial={reduce || bump === 0 ? false : { scale: 0.86 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-ink/5"
            aria-label={count ? `Basket, ${count} item${count > 1 ? "s" : ""}` : "Basket, empty"}
          >
            <BagIcon className="h-[22px] w-[22px]" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-forest px-1 text-[0.66rem] font-bold text-cream">
                {count}
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}

/** Phones: the next step within thumb reach. Basket when there's one, otherwise help. */
function MobileBar() {
  const { shop, count, total, unpriced, openBasket, base } = useShop();
  const path = usePathname();
  const d = shop.distributor;
  const hidden = path.endsWith("/order") || path.endsWith("/check") || /\/p\//.test(path);
  if (hidden) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8 md:hidden [background:linear-gradient(to_top,rgb(244_238_227/0.95)_40%,transparent)]">
      <AnimatePresence mode="wait" initial={false}>
        {count > 0 ? (
          <motion.button
            key="basket"
            type="button"
            onClick={openBasket}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="pointer-events-auto flex h-14 w-full items-center gap-3 rounded-full bg-forest pl-5 pr-2 text-cream shadow-float active:scale-[0.99]"
          >
            <BagIcon className="h-5 w-5" />
            <span className="text-[0.95rem] font-semibold">
              {count} item{count > 1 ? "s" : ""}
            </span>
            <span className="ml-auto rounded-full bg-cream px-4 py-2.5 text-[0.9rem] font-semibold text-forest-deep">
              {total ? `${kesPrice(total)}${unpriced ? "+" : ""}` : "Review"} →
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="help"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="pointer-events-auto flex gap-2"
          >
            <Link
              href={`${base}/check`}
              className="flex h-14 flex-1 items-center justify-center rounded-full bg-forest text-[0.95rem] font-semibold text-cream shadow-float active:scale-[0.99]"
            >
              Help me choose
            </Link>
            <WhatsAppAction
              message={helloMessage(d.firstName)}
              label={`Message ${d.firstName} on WhatsApp`}
              className={clsx(waButton, "h-14 w-14 shrink-0 shadow-float")}
            >
              <WaGlyph className="h-6 w-6" />
            </WhatsAppAction>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-end md:items-stretch">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink/35"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease }}
            className="relative flex max-h-[88dvh] w-full flex-col rounded-t-[1.75rem] bg-paper shadow-float outline-none md:max-h-none md:w-[26rem] md:rounded-none md:rounded-l-[1.75rem]"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function BasketSheet() {
  const { shop, basket, basketOpen, closeBasket, setQty, total, unpriced, count, base } = useShop();
  const d = shop.distributor;
  const lines = basketLines(basket, shop.prices);
  return (
    <Sheet open={basketOpen} onClose={closeBasket} label="Your basket">
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <div>
          <h2 className="font-display text-[1.6rem] leading-tight text-ink">Your basket</h2>
          <p className="text-[0.82rem] text-ink-mute">
            {count ? `${count} item${count > 1 ? "s" : ""} from ${d.firstName}` : "Nothing here yet"}
          </p>
        </div>
        <button
          type="button"
          onClick={closeBasket}
          className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-ink/5"
          aria-label="Close basket"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        {lines.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[0.95rem] leading-relaxed text-ink-soft">
              Add products as you browse, or let the health check suggest where to start.
            </p>
            <Link
              href={`${base}/check`}
              onClick={closeBasket}
              className="mt-5 inline-flex h-11 items-center rounded-full bg-forest px-5 text-[0.92rem] font-semibold text-cream"
            >
              Help me choose
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {lines.map((l) => (
              <li key={l.product.id} className="flex gap-3 py-3.5">
                <Link href={`${base}/p/${l.product.id}`} onClick={closeBasket} className="w-16 shrink-0 overflow-hidden rounded-xl">
                  <ProductVisual product={l.product} size="thumb" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold leading-snug text-ink">{l.product.name}</div>
                  <div className="text-[0.82rem] text-ink-mute">
                    {l.price ? `${kesPrice(l.price)} each` : `${d.firstName} will confirm the price`}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Stepper qty={l.qty} onChange={(q) => setQty(l.product.id, q)} label={l.product.name} size="sm" />
                    {l.price ? <span className="font-semibold tabular-nums text-ink">{kesPrice(l.price * l.qty)}</span> : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {lines.length > 0 && (
        <div className="border-t border-ink/10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[0.92rem] text-ink-soft">{unpriced ? "Subtotal so far" : "Subtotal"}</span>
            <span className="font-display text-[1.5rem] text-ink">{kesPrice(total)}</span>
          </div>
          <p className="mt-1 text-[0.8rem] leading-snug text-ink-mute">
            {unpriced ? `${d.firstName} will confirm any prices not listed yet. ` : ""}Delivery is arranged when {d.firstName} confirms your
            order.
          </p>
          <Link
            href={`${base}/order`}
            onClick={closeBasket}
            className="mt-4 flex h-13 items-center justify-center rounded-full bg-forest text-[1rem] font-semibold text-cream active:scale-[0.99]"
          >
            Continue to order
          </Link>
          <WhatsAppAction
            message={basketMessage(d.firstName, basket, shop.prices)}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[0.9rem] font-semibold text-forest hover:bg-forest/[0.05]"
          >
            <WaGlyph className="h-4 w-4 text-[#1faa59]" /> Or send this list to {d.firstName} on WhatsApp
          </WhatsAppAction>
        </div>
      )}
    </Sheet>
  );
}

/** Demo shop only: shows the WhatsApp message that would have been sent. */
function PreviewSheet() {
  const { shop, preview, showPreview } = useShop();
  const d = shop.distributor;
  return (
    <Sheet open={preview !== null} onClose={() => showPreview(null)} label="WhatsApp message preview">
      <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
        <h2 className="font-display text-[1.5rem] leading-tight text-ink">This opens WhatsApp with {d.firstName}</h2>
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
          On a real shop, the chat opens with this message already written, so you only have to press send. This is an example shop, so
          nothing is sent.
        </p>
        {preview && <WhatsAppPreview message={preview} contactName="You" className="mt-4" compact />}
        <button
          type="button"
          onClick={() => showPreview(null)}
          className="mt-5 h-12 w-full rounded-full bg-forest font-semibold text-cream"
        >
          Got it
        </button>
      </div>
    </Sheet>
  );
}

function ShopFooter() {
  const { shop, base } = useShop();
  const d = shop.distributor;
  return (
    <footer className="border-t border-ink/10 bg-paper/60 pb-28 pt-12 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Monogram name={d.name} className="h-9 w-9 text-[0.95rem]" />
            <span className="font-display text-[1.2rem] text-ink">{d.name}</span>
          </div>
          <p className="mt-4 max-w-md text-[0.8rem] leading-relaxed text-ink-mute">
            {d.firstName} is an independent BF Suma distributor. This shop isn&apos;t run by BF Suma. Product names belong to their owners.
            Supplements support a healthy routine; they don&apos;t diagnose, treat, cure or prevent disease. If you&apos;re pregnant,
            breastfeeding, on medicine or managing a condition, speak to a doctor before starting.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-[0.85rem] text-ink-soft md:items-end">
          <Link href={`${base}/check`} className="hover:text-ink">
            Help me choose
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/" className="mt-3 inline-flex items-center gap-1.5 text-[0.78rem] text-ink-mute hover:text-ink">
            <LogoMark className="h-4 w-4" /> Powered by Suppli Afya
          </Link>
        </div>
      </div>
    </footer>
  );
}
