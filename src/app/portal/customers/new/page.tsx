import Link from "next/link";
import { PageHeader } from "@/components/portal/ui";
import { ChevronLeft } from "@/components/ui/icons";
import { NewCustomerForm } from "./NewCustomerForm";

export const metadata = { title: "Add customer" };

export default function NewCustomerPage() {
  return (
    <div className="max-w-xl">
      <Link href="/portal/customers" className="mb-4 inline-flex items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="h-3.5 w-3.5" /> Customers
      </Link>
      <PageHeader title="Add a customer" sub="Someone who already buys from you. Record their orders next, and we'll remind you when they're due." />
      <NewCustomerForm />
    </div>
  );
}
