import { brandCard, ogSize } from "@/lib/og";

export const alt = "A three-minute health check";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return brandCard({
    eyebrow: "A three-minute health check",
    title: "Let's find what",
    emphasis: "actually suits you.",
    footer: "Answer a few questions, get a plan that explains why",
  });
}
