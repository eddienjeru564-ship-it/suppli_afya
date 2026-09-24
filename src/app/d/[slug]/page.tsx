import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShop } from "@/server/shop";
import { ShopHome } from "@/components/shop/ShopHome";

export async function generateMetadata(props: PageProps<"/d/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const s = await getShop(slug);
  if (!s) return {};
  const d = s.distributor;
  const title = `${d.name} · BF Suma products${d.area ? ` in ${d.area}` : ""}`;
  const description = `Find what suits you with a three-minute check, or browse and order from ${d.firstName}. Questions go straight to ${d.firstName} on WhatsApp.`;
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, siteName: d.name, locale: "en_KE", type: "website" },
  };
}

export default async function ShopPage(props: PageProps<"/d/[slug]">) {
  const { slug } = await props.params;
  if (!(await getShop(slug))) notFound();
  return <ShopHome />;
}
