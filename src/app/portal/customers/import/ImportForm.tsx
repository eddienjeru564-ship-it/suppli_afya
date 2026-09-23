"use client";

import Link from "next/link";
import { useActionState } from "react";
import { importCustomers } from "@/app/portal/actions";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";

export function ImportForm() {
  const [state, action, pending] = useActionState(importCustomers, null);
  return (
    <form action={action} className="grid gap-4 rounded-[1.25rem] border border-ink/10 bg-paper p-5">
      <label className="block text-[0.9rem] font-semibold text-ink">
        One customer per line: name, then phone
        <textarea
          name="rows"
          rows={10}
          placeholder={"Mary Njeri, 0712 345 678\nOtieno Ouma, 0722 111 222\nMama Wanjiru"}
          className={inputClass + " font-mono text-[0.9rem]"}
        />
      </label>
      <p className="text-[0.85rem] leading-relaxed text-ink-soft">
        Copy two columns straight from Excel or Google Sheets and paste them here. Numbers you already have are skipped,
        so it&apos;s safe to paste the same list twice.
      </p>
      {state && !state.ok && <p className="rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]">{state.error}</p>}
      {state?.ok && (
        <p className="rounded-xl bg-sage-soft px-4 py-3 text-[0.9rem] text-forest">
          Added {state.added} customer{state.added === 1 ? "" : "s"}
          {state.skipped ? `, skipped ${state.skipped}` : ""}.{" "}
          <Link href="/portal/customers" className="font-semibold underline">
            See your customers
          </Link>
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Importing…" : "Import customers"}
      </Button>
    </form>
  );
}
