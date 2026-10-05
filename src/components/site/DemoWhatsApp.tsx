"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { WaText } from "./Screens";
import { KATE } from "./story";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Kate's own WhatsApp, the end of the main story: the visitor's plan arrives here as a message
 * that already says who they are, what they want and what was suggested, and Kate starts the
 * conversation from her own phone. Nothing appears until the visitor sends it, as in real life.
 * A phone on large screens; a plain chat card on small ones.
 */
export function KateWhatsApp({
  customer,
  message,
  reply,
}: {
  /** The customer's first name, once they've sent their plan. */
  customer: string | null;
  /** The enquiry as WhatsApp shows it. */
  message: string | null;
  /** Kate's first reply. */
  reply: string | null;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[26rem] overflow-hidden rounded-[1.5rem] bg-wa-bg text-[#111b21] shadow-float lg:h-[46rem] lg:w-[21rem] lg:rounded-[2.6rem] lg:border-[9px] lg:border-[#0b1711]">
      <div aria-hidden className="absolute left-1/2 top-2 z-20 hidden h-5 w-20 -translate-x-1/2 rounded-full bg-[#0b1711] lg:block" />
      <div className="flex h-full flex-col">
        {/* chat header: who Kate is talking to */}
        <div className="flex items-center gap-2.5 bg-wa-deep px-3.5 pb-3 pt-3.5 text-white lg:pt-9">
          <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 shrink-0 opacity-80">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#dfe5e7] text-[0.8rem] font-semibold text-wa-deep">
            {customer ? customer.charAt(0).toUpperCase() : "?"}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[0.92rem] font-semibold">{customer ?? "Your customer"}</span>
            <span className="block text-[0.7rem] text-white/75">{customer ? "online" : "from your page"}</span>
          </span>
        </div>

        {/* the conversation, anchored to the newest message the way a chat is */}
        <div className="flex min-h-[17rem] flex-1 flex-col justify-end gap-2 overflow-hidden px-3 pb-2 pt-4">
          <span className="mx-auto mb-auto shrink-0 rounded-md bg-white/80 px-2.5 py-0.5 text-[0.7rem] text-[#54656f] shadow-sm">Today</span>
          <AnimatePresence initial={false}>
            {!message && (
              <motion.p
                key="notice"
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-[17rem] rounded-lg bg-[#fff5c4] px-3 py-2 text-center text-[0.76rem] leading-snug text-[#54656f] shadow-sm"
              >
                When you send your plan, it arrives here on {KATE.first}&apos;s own WhatsApp.
              </motion.p>
            )}
            {message && (
              <motion.div
                key="message"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease }}
                style={{ transformOrigin: "bottom left" }}
                className="max-w-[88%] shrink-0 rounded-lg rounded-tl-none bg-white px-3 pb-1.5 pt-2 text-[0.78rem] leading-[1.45] shadow-sm"
              >
                <WaText text={message} />
                <span className="mt-0.5 block text-right text-[0.64rem] text-[#54656f]">now</span>
              </motion.div>
            )}
            {reply && (
              <motion.div
                key="reply"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease }}
                style={{ transformOrigin: "bottom right" }}
                className="ml-auto max-w-[88%] shrink-0 rounded-lg rounded-tr-none bg-wa-bubble px-3 pb-1.5 pt-2 text-[0.78rem] leading-[1.45] shadow-sm"
              >
                {reply}
                <span className="mt-0.5 block text-right text-[0.64rem] text-[#54656f]">now ✓✓</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Kate's composer, so it reads as her phone */}
        <div aria-hidden className="flex items-center gap-2 px-2.5 pb-3 pt-1">
          <span className={clsx("flex-1 rounded-full bg-white px-3.5 py-2 text-[0.8rem] text-[#54656f] shadow-sm")}>Message</span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wa-deep text-white">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
              <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" />
              <path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
