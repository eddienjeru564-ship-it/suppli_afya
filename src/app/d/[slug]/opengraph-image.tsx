import { distributorBySlug } from "@/server/distributors";
import { brandCard, ogSize } from "@/lib/og";

export const alt = "Health check";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await distributorBySlug(slug);
  return brandCard({
    eyebrow: d ? `Health check with ${d.name}` : "A three-minute health check",
    title: "Let's find what",
    emphasis: "actually suits you.",
    footer: d ? `${d.name} · ${d.tagline || `BF Suma distributor · ${d.area}`}` : "Answer a few questions, get a plan that explains why",
  });
}
