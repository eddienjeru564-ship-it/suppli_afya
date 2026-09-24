"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { HealthCheck } from "@/components/check/HealthCheck";
import type { ShopHooks } from "@/components/check/ResultPlan";
import { useShop } from "./ShopProvider";

/** The health check inside the shop: its plan can go straight into the basket. */
export function ShopCheck() {
  const { shop, basket, add, setPlan, base } = useShop();
  const router = useRouter();
  const hooks = useMemo<ShopHooks>(
    () => ({
      prices: shop.prices,
      productHref: (id) => `${base}/p/${id}`,
      orderPlan: (ids, context) => {
        for (const id of ids) if (!basket[id]) add(id);
        setPlan(context);
        router.push(`${base}/order`);
      },
    }),
    [shop.prices, base, basket, add, setPlan, router],
  );
  return (
    <div className="-mb-px">
      <HealthCheck distributor={shop.distributor} mode="page" shop={hooks} stickyTop="top-[calc(4rem+env(safe-area-inset-top))]" />
    </div>
  );
}
