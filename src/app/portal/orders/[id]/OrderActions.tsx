"use client";

import { useState, useTransition } from "react";
import { recordPayment, setOrderStatus } from "@/app/portal/actions";
import { whatsappLink } from "@/engine";
import { Button, buttonClass } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { WhatsAppIcon } from "@/components/ui/icons";

export function OrderActions({
  id,
  status,
  phone,
  reminder,
  remind = true,
}: {
  id: string;
  status: string;
  phone: string | null;
  reminder: string;
  /** Off while a page order still needs confirming: nobody is late paying for an order nobody has confirmed. */
  remind?: boolean;
}) {
  const [pending, start] = useTransition();
  const [method, setMethod] = useState<"mpesa" | "cash" | "other">("mpesa");
  const [ref, setRef] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (status === "cancelled") return null;
  return (
    <div className="grid gap-4">
      {status === "unpaid" && (
        <>
          <div>
            <div className="text-[0.95rem] font-semibold text-ink">Record the payment</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-[9rem_1fr_auto]">
              <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className={inputClass + " mt-0"}>
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
              {method === "mpesa" ? (
                <input value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="M-Pesa code, e.g. SJK4H7Q2XP" className={inputClass + " mt-0"} />
              ) : (
                <span />
              )}
              <Button
                disabled={pending}
                className="h-auto py-3.5"
                onClick={() =>
                  start(async () => {
                    const r = await recordPayment(id, method, ref);
                    setErr(r.ok ? null : r.error);
                  })
                }
              >
                Mark as paid
              </Button>
            </div>
            {err && <p className="mt-1.5 text-[0.82rem] text-clay">{err}</p>}
          </div>
          {remind && (
            <a
              href={phone ? whatsappLink(phone, reminder) : `https://wa.me/?text=${encodeURIComponent(reminder)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("secondary", "md", "w-fit")}
            >
              <WhatsAppIcon className="h-4 w-4" /> Send a payment reminder
            </a>
          )}
        </>
      )}
      <div className="flex flex-wrap gap-2">
        {status === "paid" && (
          <Button disabled={pending} onClick={() => start(() => setOrderStatus(id, "delivered"))}>
            Mark as delivered
          </Button>
        )}
        {status !== "delivered" && (
          <Button variant="ghost" disabled={pending} onClick={() => confirm("Cancel this order?") && start(() => setOrderStatus(id, "cancelled"))}>
            Cancel order
          </Button>
        )}
      </div>
    </div>
  );
}
