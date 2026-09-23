import Link from "next/link";
import { PLANS_BY_ID } from "@/config/plans";
import { requirePortalAccount } from "@/server/auth";
import { buttonClass } from "@/components/ui/Button";
import { Empty, PageHeader } from "@/components/portal/ui";
import { ChevronLeft } from "@/components/ui/icons";
import { ImportForm } from "./ImportForm";

export const metadata = { title: "Import customers" };

export default async function ImportPage() {
  const a = await requirePortalAccount();
  const allowed = PLANS_BY_ID[a.workspace.plan].canImport;
  return (
    <div className="max-w-xl">
      <Link href="/portal/customers" className="mb-4 inline-flex items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="h-3.5 w-3.5" /> Customers
      </Link>
      <PageHeader title="Bring in your customers" sub="From a spreadsheet, a notebook you've typed up, or an export of your contacts." />
      {allowed ? (
        <ImportForm />
      ) : (
        <Empty
          title="Importing is part of Growth and Pro"
          action={
            <Link href="/start/pay?renew=1&plan=growth" className={buttonClass("primary", "md")}>
              Move to Growth
            </Link>
          }
        >
          On Starter you can add customers one at a time, up to 50.
        </Empty>
      )}
    </div>
  );
}
