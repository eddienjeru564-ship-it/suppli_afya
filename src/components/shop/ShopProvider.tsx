"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Answers } from "@/engine";
import { whatsappLink } from "@/engine";
import { basketTotals, type Basket } from "@/lib/shop";
import type { Storefront } from "@/server/shop";

/** A health check result the customer may turn into an order. */
export interface PlanContext {
  answers: Answers;
  ref: string;
}

interface ShopState {
  shop: Storefront;
  basket: Basket;
  count: number;
  total: number;
  unpriced: boolean;
  /** Where the last add happened, so the basket button can react. */
  bump: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  basketOpen: boolean;
  openBasket: () => void;
  closeBasket: () => void;
  plan: PlanContext | null;
  setPlan: (p: PlanContext | null) => void;
  /** A wa.me link to the distributor with this text, or null on a demo shop. */
  waLink: (text: string) => string | null;
  /** On a demo shop, the message that would have opened in WhatsApp. */
  preview: string | null;
  showPreview: (text: string | null) => void;
  base: string;
}

const Ctx = createContext<ShopState | null>(null);

export function useShop() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useShop outside ShopProvider");
  return s;
}

export function ShopProvider({ shop, children }: { shop: Storefront; children: ReactNode }) {
  const slug = shop.distributor.slug;
  const key = `sa-basket:${slug}`;
  const planKey = `sa-plan:${slug}`;
  const [basket, setBasket] = useState<Basket>({});
  const [plan, setPlanState] = useState<PlanContext | null>(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [preview, showPreview] = useState<string | null>(null);

  // Restore the basket (kept on this phone) and any plan from this visit.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "{}") as Basket;
      const p = JSON.parse(sessionStorage.getItem(planKey) ?? "null") as PlanContext | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from device storage
      setBasket(saved && typeof saved === "object" ? saved : {});
      setPlanState(p);
    } catch {
      /* storage unavailable */
    }
  }, [key, planKey]);

  const persist = useCallback(
    (b: Basket) => {
      try {
        localStorage.setItem(key, JSON.stringify(b));
      } catch {
        /* storage unavailable */
      }
    },
    [key],
  );

  const setQty = useCallback(
    (id: string, qty: number) =>
      setBasket((b) => {
        const next = { ...b };
        if (qty <= 0) delete next[id];
        else next[id] = Math.min(20, qty);
        persist(next);
        return next;
      }),
    [persist],
  );

  const add = useCallback(
    (id: string, qty = 1) => {
      setBasket((b) => {
        const next = { ...b, [id]: Math.min(20, (b[id] ?? 0) + qty) };
        persist(next);
        return next;
      });
      setBump((n) => n + 1);
    },
    [persist],
  );

  const clear = useCallback(() => {
    setBasket({});
    persist({});
  }, [persist]);

  const setPlan = useCallback(
    (p: PlanContext | null) => {
      setPlanState(p);
      try {
        if (p) sessionStorage.setItem(planKey, JSON.stringify(p));
        else sessionStorage.removeItem(planKey);
      } catch {
        /* storage unavailable */
      }
    },
    [planKey],
  );

  const value = useMemo<ShopState>(() => {
    const t = basketTotals(basket, shop.prices);
    const wa = shop.distributor.whatsapp;
    return {
      shop,
      basket,
      count: t.count,
      total: t.total,
      unpriced: t.unpriced,
      bump,
      add,
      setQty,
      clear,
      basketOpen,
      openBasket: () => setBasketOpen(true),
      closeBasket: () => setBasketOpen(false),
      plan,
      setPlan,
      waLink: (text: string) => (wa && !shop.distributor.demo ? whatsappLink(wa, text) : null),
      preview,
      showPreview,
      base: `/d/${slug}`,
    };
  }, [shop, basket, bump, add, setQty, clear, basketOpen, plan, setPlan, slug, preview]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
