"use server";

import { placeShopOrder, type OrderResult, type ShopOrderInput } from "@/server/shop";

/** Places a customer's order with the distributor. Prices come from the shop, never the browser. */
export async function placeOrder(input: ShopOrderInput): Promise<OrderResult> {
  return placeShopOrder(input);
}
