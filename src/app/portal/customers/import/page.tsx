import Link from "next/link";
import { requirePortalAccount } from "@/server/auth";
import { PageHeader } from "@/components/portal/ui";
import { ChevronLeft } from "@/components/ui/icons";
import { ImportForm } from "./ImportForm";

export const metadata = { title: "Import customers" };

export default async function ImportPage() {
  await requirePortalAccount();
  return (
    <div className="max-w-xl">
      <Link href="/portal/customers" className="mb-4 inline-flex items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="h-3.5 w-3.5" /> Customers
      </Link>
      <PageHeader title="Bring in your customers" sub="From a spreadsheet, a notebook you've typed up, or an export of your contacts." />
      <ImportForm />
    </div>
  );
}
