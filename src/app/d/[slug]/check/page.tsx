import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShop } from "@/server/shop";
import { ShopCheck } from "@/components/shop/ShopCheck";

export async function generateMetadata(props: PageProps<"/d/[slug]/check">): Promise<Metadata> {
  const { slug } = await props.params;
  const s = await getShop(slug);
  if (!s) return {};
  const title = `Health check with ${s.distributor.name}`;
  const description = `A few questions about your goals, routine and health, and a plan that explains what could help and why. ${s.distributor.firstName} takes it from there.`;
  return { title: { absolute: title }, description, openGraph: { title, description, siteName: s.distributor.name, type: "website" } };
}

export default async function ShopCheckPage(props: PageProps<"/d/[slug]/check">) {
  const { slug } = await props.params;
  if (!(await getShop(slug))) notFound();
  return <ShopCheck />;
}
