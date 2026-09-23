"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveProspectPhone, setProspectStatus } from "@/app/portal/actions";
import { whatsappLink } from "@/engine";
import { Button, buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";

export function ProspectActions({
  id,
  status,
  phone,
  opener,
  customerId,
}: {
  id: string;
  status: string;
  phone: string | null;
  opener: string;
  customerId: string | null;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState(opener);
  const [num, setNum] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const wa = phone ? whatsappLink(phone, msg) : `https://wa.me/?text=${encodeURIComponent(msg)}`;

  return (
    <div className="grid gap-4">
      <label className="block text-[0.78rem] font-semibold text-ink-mute">
        Suggested first reply
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={4}
          className="mt-1.5 w-full resize-y rounded-xl bg-wa-bubble px-3 py-2.5 text-[0.93rem] font-normal leading-relaxed text-[#111b21] outline-none"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => status === "new" && start(() => setProspectStatus(id, "contacted"))}
          className={buttonClass("whatsapp", "md")}
        >
          <WhatsAppIcon className="h-4 w-4" /> Message on WhatsApp
        </a>
        {customerId ? (
          <Link href={`/portal/customers/${customerId}`} className={buttonClass("primary", "md")}>
            Open customer
          </Link>
        ) : (
          <Link href={`/portal/orders/new?prospect=${id}`} className={buttonClass("primary", "md")}>
            Create an order
          </Link>
        )}
        {status === "new" && (
          <Button variant="secondary" disabled={pending} onClick={() => start(() => setProspectStatus(id, "contacted"))}>
            Mark contacted
          </Button>
        )}
        {status !== "closed" && status !== "converted" && (
          <Button variant="ghost" disabled={pending} onClick={() => start(() => setProspectStatus(id, "closed"))}>
            Close
          </Button>
        )}
        {status === "closed" && (
          <Button variant="ghost" disabled={pending} onClick={() => start(() => setProspectStatus(id, "contacted"))}>
            Reopen
          </Button>
        )}
      </div>
      {!phone && (
        <div className="rounded-xl bg-cream p-3.5">
          <div className="text-[0.85rem] text-ink-soft">
            They didn&apos;t leave a number. Once they message you, save it here so everything stays in one place.
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={num}
              onChange={(e) => setNum(e.target.value)}
              inputMode="tel"
              placeholder="07XX XXX XXX"
              className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-paper px-3 py-2 text-[0.95rem] outline-none focus:border-forest"
            />
            <Button
              size="sm"
              className="h-auto"
              disabled={pending || !num}
              onClick={() =>
                start(async () => {
                  const r = await saveProspectPhone(id, num);
                  setErr(r.ok ? null : r.error);
                })
              }
            >
              Save
            </Button>
          </div>
          {err && <p className="mt-1.5 text-[0.8rem] text-clay">{err}</p>}
        </div>
      )}
    </div>
  );
}
