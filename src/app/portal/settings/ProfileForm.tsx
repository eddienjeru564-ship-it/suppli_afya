"use client";

import { useActionState } from "react";
import { saveProfile, type ActionResult } from "@/app/portal/actions";
import { BUSINESS_TYPES, CHANNELS, GOALS } from "@/config/onboarding";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";

export function ProfileForm({
  initial,
}: {
  initial: { owner_name: string; business_name: string; location: string; business_type: string; whatsapp: string; channels: string[]; goals: string[] };
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveProfile, null);
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="owner_name" defaultValue={initial.owner_name} />
        <Field label="Business name" name="business_name" defaultValue={initial.business_name} />
        <Field label="Location" name="location" defaultValue={initial.location} />
        <label className="block text-[0.9rem] font-semibold text-ink">
          Type of business
          <select name="business_type" defaultValue={initial.business_type} className={inputClass}>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="WhatsApp number"
          name="whatsapp"
          inputMode="tel"
          defaultValue={initial.whatsapp ? `0${initial.whatsapp.slice(3)}` : ""}
          hint="Your health check sends customers here."
        />
      </div>
      <fieldset>
        <legend className="text-[0.9rem] font-semibold text-ink">How customers reach you</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CHANNELS.map((c) => (
            <label key={c.id} className="flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-[0.88rem] has-[:checked]:border-forest has-[:checked]:bg-sage-soft">
              <input type="checkbox" name="channels" value={c.id} defaultChecked={initial.channels.includes(c.id)} className="accent-[var(--color-forest)]" />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-[0.9rem] font-semibold text-ink">What matters most (shown first in your portal)</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {GOALS.map((g) => (
            <label key={g.id} className="flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-[0.88rem] has-[:checked]:border-forest has-[:checked]:bg-sage-soft">
              <input type="checkbox" name="goals" value={g.id} defaultChecked={initial.goals.includes(g.id)} className="accent-[var(--color-forest)]" />
              {g.label}
            </label>
          ))}
        </div>
      </fieldset>
      {state && (
        <p className={state.ok ? "text-[0.9rem] font-semibold text-forest" : "rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]"}>
          {state.ok ? "Saved." : state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
