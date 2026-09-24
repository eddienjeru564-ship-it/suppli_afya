"use client";

import { useState, useTransition } from "react";
import { markDone } from "@/app/portal/actions";
import { whatsappLink } from "@/engine";
import { Button, buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";

/**
 * An order placed on the distributor's page is waiting to hear back: stock, delivery and the
 * total come first, the payment after. Sending the confirmation (or ticking it off) clears the
 * same item from Today.
 */
export function ConfirmOrder({ orderId, first, phone, message }: { orderId: string; first: string; phone: string | null; message: string }) {
  const [msg, setMsg] = useState(message);
  const [pending, start] = useTransition();
  const key = `placed:${orderId}`;
  const wa = phone ? whatsappLink(phone, msg) : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  return (
    <div className="grid gap-3">
      <div>
        <h2 className="text-[0.95rem] font-semibold text-ink">Confirm it with {first}</h2>
        <p className="mt-1 text-[0.9rem] leading-relaxed text-ink-soft">
          {first} ordered from your page and is waiting to hear from you: stock, delivery and the total. Record the payment
          once it arrives.
        </p>
      </div>
      <label className="block text-[0.75rem] font-semibold text-ink-mute">
        Message, ready to send
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={4}
          className="mt-1.5 max-h-72 w-full resize-y rounded-xl border border-transparent bg-wa-bubble px-3 py-2.5 text-[0.92rem] font-normal leading-relaxed text-[#111b21] outline-none [field-sizing:content] focus:border-moss"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setTimeout(() => start(() => markDone(key, "Sent the order confirmation on WhatsApp.")), 400)}
          className={buttonClass("whatsapp", "md")}
        >
          <WhatsAppIcon className="h-4 w-4" /> Send on WhatsApp
        </a>
        <Button variant="secondary" disabled={pending} onClick={() => start(() => markDone(key, "Confirmed the order."))}>
          I&apos;ve confirmed it
        </Button>
      </div>
    </div>
  );
}
