import { MONTHLY_PRICE, SETUP_PRICE } from "@/config/plans";
import { brandCard, ogSize } from "@/lib/og";

export const alt = "Suppli Afya: helping BF Suma distributors turn product interest into actual customers";
export const size = ogSize;
export const contentType = "image/png";

/** The homepage's link preview: the hero headline, set in the same phrases, and the price line. */
export default async function Image() {
  return brandCard({
    headline: ["Helping BF Suma Distributors", "Turn Product Interest", "Into Actual Customers"],
    marked: "Product Interest",
    footer: `${SETUP_PRICE} setup, then ${MONTHLY_PRICE} a month · Pay by M-Pesa`,
  });
}
