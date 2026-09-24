import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS_BY_ID } from "@/engine";
import { getShop } from "@/server/shop";
import { ProductDetail } from "@/components/shop/ProductDetail";

export async function generateMetadata(props: PageProps<"/d/[slug]/p/[id]">): Promise<Metadata> {
  const { slug, id } = await props.params;
  const s = await getShop(slug);
  const p = PRODUCTS_BY_ID[id];
  if (!s || !p) return {};
  return {
    title: { absolute: `${p.name} · ${s.distributor.name}` },
    description: p.summary,
    openGraph: { title: `${p.name} from ${s.distributor.name}`, description: p.summary, siteName: s.distributor.name, type: "website" },
  };
}

export default async function ProductPage(props: PageProps<"/d/[slug]/p/[id]">) {
  const { slug, id } = await props.params;
  const s = await getShop(slug);
  const p = PRODUCTS_BY_ID[id];
  if (!s || !p || !s.productIds.includes(id)) notFound();
  return <ProductDetail productId={id} />;
}
