import { distributorBySlug } from "@/server/distributors";
import { brandCard, ogSize } from "@/lib/og";

export const alt = "Find where to start";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await distributorBySlug(slug);
  return brandCard({
    eyebrow: d ? `${d.name}` : "A short assessment",
    title: "Let's find what",
    emphasis: "actually suits you.",
    footer: d ? d.tagline || ["BF Suma distributor", d.area].filter(Boolean).join(" · ") : "Answer a few questions, see what could help and why",
  });
}
