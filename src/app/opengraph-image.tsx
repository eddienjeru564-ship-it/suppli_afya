import { brandCard, ogSize } from "@/lib/og";

export const alt = "Suppli Afya: turn curiosity into customers";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return brandCard({
    eyebrow: "For BF Suma distributors in Kenya",
    title: "Turn curiosity",
    emphasis: "into customers.",
    footer: "Your page, a short assessment, WhatsApp to you, and follow-up after the sale",
  });
}
