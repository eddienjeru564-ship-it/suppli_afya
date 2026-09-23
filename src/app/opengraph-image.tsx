import { brandCard, ogSize } from "@/lib/og";

export const alt = "Suppli Afya: sell more, follow up less";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return brandCard({
    eyebrow: "For BF Suma distributors in Kenya",
    title: "Sell more.",
    emphasis: "Follow up less.",
    footer: "Health checks, follow-ups, M-Pesa and reorders in one place",
  });
}
