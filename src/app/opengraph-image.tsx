import { FROM_PRICE } from "@/config/plans";
import { brandCard, ogSize } from "@/lib/og";

export const alt = "Suppli Afya: helping BF Suma distributors turn product interest into actual customers";
export const size = ogSize;
export const contentType = "image/png";

/** The homepage's link preview: the hero headline, set in the same phrases, and the price line. */
export default async function Image() {
  return brandCard({
    headline: ["Helping BF Suma Distributors", "Turn Product Interest", "Into Actual Customers"],
    marked: "Product Interest",
    footer: `From ${FROM_PRICE} a month · No contract · Pay by M-Pesa`,
  });
}
