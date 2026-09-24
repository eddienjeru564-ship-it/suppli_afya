"use client";

import { useState, useTransition } from "react";
import { saveShop } from "@/app/portal/actions";
import { MAX_INTRO, type ShopDetails } from "@/config/shop";
import { Card } from "@/components/portal/ui";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";

/** The details that make a shop feel like a real person's: their note, delivery, payment, hours. */
export function ShopDetailsForm({ initial }: { initial: ShopDetails }) {
  const [v, setV] = useState<ShopDetails>(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (patch: Partial<ShopDetails>) => {
    setV((x) => ({ ...x, ...patch }));
    setMsg(null);
  };
  const mpesa = v.mpesa ?? { kind: "till" as const, number: "" };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await saveShop({ ...v, mpesa: mpesa.number ? mpesa : undefined });
      setMsg(r.ok ? "Saved. Your shop shows this now." : r.error);
    });
  };

  const text = (key: keyof ShopDetails, label: string, placeholder: string, hint?: string) => (
    <label className="block text-[0.9rem] font-semibold text-ink">
      {label}
      <input value={(v[key] as string) ?? ""} onChange={(e) => set({ [key]: e.target.value })} placeholder={placeholder} className={inputClass} />
      {hint && <span className="mt-1.5 block text-[0.8rem] font-normal text-ink-mute">{hint}</span>}
    </label>
  );

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={save} className="grid gap-5">
        <label className="block text-[0.9rem] font-semibold text-ink">
          A note to your customers
          <textarea
            value={v.intro ?? ""}
            onChange={(e) => set({ intro: e.target.value.slice(0, MAX_INTRO) })}
            rows={3}
            placeholder="I'll help you choose what suits you, and tell you honestly when something isn't worth it."
            className={inputClass}
          />
          <span className="mt-1.5 flex justify-between text-[0.8rem] font-normal text-ink-mute">
            <span>In your own words. It sits next to your products at the top of your shop.</span>
            <span className="tabular-nums">
              {(v.intro ?? "").length}/{MAX_INTRO}
            </span>
          </span>
        </label>
        {text("delivery", "Where you deliver", "Across Nairobi, usually the next day. Elsewhere by courier.")}
        {text("deliveryFee", "What delivery costs", "KES 200 in Nairobi, free over KES 5,000")}
        {text("pickup", "Can customers collect? Where and when", "Collect in Thika town on weekdays", "Leave empty if you only deliver.")}
        <fieldset>
          <legend className="text-[0.9rem] font-semibold text-ink">M-Pesa for your customers</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-[10rem_1fr]">
            <select
              value={mpesa.kind}
              onChange={(e) => set({ mpesa: { ...mpesa, kind: e.target.value as "till" | "paybill" | "phone" } })}
              className={inputClass}
              aria-label="M-Pesa type"
            >
              <option value="till">Till number</option>
              <option value="paybill">Paybill</option>
              <option value="phone">Phone number</option>
            </select>
            <input
              value={mpesa.number}
              onChange={(e) => set({ mpesa: { ...mpesa, number: e.target.value.replace(/[^\d]/g, "") } })}
              inputMode="numeric"
              placeholder={mpesa.kind === "phone" ? "0712345678" : "123456"}
              className={inputClass}
              aria-label="M-Pesa number"
            />
            {mpesa.kind === "paybill" && (
              <input
                value={mpesa.account ?? ""}
                onChange={(e) => set({ mpesa: { ...mpesa, account: e.target.value } })}
                placeholder="Account number customers should use"
                className={`${inputClass} sm:col-span-2`}
                aria-label="Paybill account"
              />
            )}
            <input
              value={mpesa.name ?? ""}
              onChange={(e) => set({ mpesa: { ...mpesa, name: e.target.value } })}
              placeholder="Name customers will see on M-Pesa"
              className={`${inputClass} sm:col-span-2`}
              aria-label="Name on M-Pesa"
            />
          </div>
          <span className="mt-1.5 block text-[0.8rem] text-ink-mute">Shown after someone orders, with a note to wait for your confirmation before paying.</span>
        </fieldset>
        <label className="flex items-center gap-3 text-[0.95rem] font-semibold text-ink">
          <input type="checkbox" checked={v.cashOnDelivery !== false} onChange={(e) => set({ cashOnDelivery: e.target.checked })} className="h-5 w-5 accent-[var(--color-forest)]" />
          Customers can pay cash on delivery
        </label>
        {text("hours", "When you reply", "8am to 8pm, Monday to Saturday")}
        {text("languages", "Languages", "English and Kiswahili")}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
          {msg && <span className="text-[0.88rem] text-ink-soft">{msg}</span>}
        </div>
      </form>
    </Card>
  );
}
