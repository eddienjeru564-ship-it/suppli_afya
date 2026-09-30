import { brandCard, ogSize } from "@/lib/og";

export const alt = "Find where to start";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return brandCard({
    eyebrow: "A short assessment",
    title: "Let's find what",
    emphasis: "actually suits you.",
    footer: "Answer a few questions, see what could help and why",
  });
}
