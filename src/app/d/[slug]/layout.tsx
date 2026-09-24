import { notFound } from "next/navigation";
import { getShop, publicStorefront } from "@/server/shop";
import { ShopFrame } from "@/components/shop/ShopFrame";
import { ShopProvider } from "@/components/shop/ShopProvider";

/** Every page of a distributor's shop shares the basket, header and footer. */
export default async function ShopLayout({ children, params }: LayoutProps<"/d/[slug]">) {
  const { slug } = await params;
  const shop = await getShop(slug);
  if (!shop) notFound();
  return (
    <ShopProvider shop={publicStorefront(shop)}>
      <ShopFrame>{children}</ShopFrame>
    </ShopProvider>
  );
}
