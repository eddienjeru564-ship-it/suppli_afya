import Link from "next/link";
import { site } from "@/config/site";
import { requirePortalAccount } from "@/server/auth";
import { db } from "@/server/db";
import type { PriceList, ShopDetails } from "@/config/shop";
import { PageHeader } from "@/components/portal/ui";
import { buttonClass } from "@/components/ui/Button";
import { PriceListForm } from "./PriceListForm";
import { ShopDetailsForm } from "./ShopDetailsForm";

export const metadata = { title: "Your shop" };

export default async function ShopSettingsPage() {
  const a = await requirePortalAccount();
  const w = a.workspace;
  const d = await db();
  const [[row], prices] = await Promise.all([
    d.query<{ shop: ShopDetails }>(`select shop from workspaces where id = $1`, [w.id]),
    d.query<{ product_id: string; price: number | null; in_stock: boolean; featured: boolean }>(
      `select product_id, price, in_stock, featured from shop_products where workspace_id = $1`,
      [w.id],
    ),
  ]);
  const list: PriceList = Object.fromEntries(prices.map((p) => [p.product_id, { price: p.price, inStock: p.in_stock, featured: p.featured }]));

  return (
    <div className="grid grid-cols-1 gap-10">
      <PageHeader
        title="Your shop"
        sub={`What customers see at ${site.displayDomain}/d/${w.slug}: your note, how ordering works, and your prices.`}
        action={
          <Link href={`/d/${w.slug}`} target="_blank" className={buttonClass("secondary", "md")}>
            View your shop
          </Link>
        }
      />
      <section>
        <h2 className="mb-1 font-display text-[1.5rem] text-ink">Prices</h2>
        <p className="mb-4 max-w-xl text-[0.93rem] leading-relaxed text-ink-soft">
          Products without a price show &ldquo;price on request&rdquo; and can still be ordered; you confirm the total. Mark up to four as
          most asked for: they lead your shop.
        </p>
        <PriceListForm initial={list} />
      </section>
      <section>
        <h2 className="mb-1 font-display text-[1.5rem] text-ink">How you work</h2>
        <p className="mb-4 max-w-xl text-[0.93rem] leading-relaxed text-ink-soft">
          Customers read this before they order. Specific details (where you deliver, how to pay) make buying from you feel safe.
        </p>
        <ShopDetailsForm initial={row?.shop ?? {}} />
      </section>
    </div>
  );
}
