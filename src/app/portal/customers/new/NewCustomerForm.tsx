"use client";

import { useActionState } from "react";
import { addCustomer, type ActionResult } from "@/app/portal/actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";

export function NewCustomerForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addCustomer, null);
  return (
    <form action={action} className="grid gap-5 rounded-[1.25rem] border border-ink/10 bg-paper p-5">
      <Field label="Name" name="name" placeholder="e.g. Mary Njeri" required />
      <Field label="Phone" name="phone" inputMode="tel" placeholder="07XX XXX XXX" hint="Used to open WhatsApp when it's time to follow up." />
      <label className="block text-[0.9rem] font-semibold text-ink">
        Notes
        <textarea name="notes" rows={3} placeholder="Anything worth remembering: what they take, how they like to pay…" className={inputClass} />
      </label>
      {state && !state.ok && <p className="rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Add customer"}
      </Button>
    </form>
  );
}
