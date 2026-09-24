import type { Metadata } from "next";
import { Checkout } from "@/components/shop/Checkout";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default function OrderPage() {
  return <Checkout />;
}
