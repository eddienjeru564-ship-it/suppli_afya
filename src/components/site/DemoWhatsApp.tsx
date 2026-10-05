"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { WaText } from "./Screens";
import { KATE } from "./story";

const ease = [0.22, 1, 0.36, 1] as const;

/** What the visitor has answered so far, for the message that's writing itself. */
export interface Draft {
  name?: string;
  age?: number;
  /** As the message words them: "1. Energy  2. Joints". */
  goals?: string;
  /** "a focused plan (2–3 products)". */
  size?: string;
}

/**
 * Kate's own WhatsApp, the end of the main story: the visitor's plan arrives here as a message
 * that already says who they are, what they want and what was suggested, and Kate starts the
 * conversation from her own phone. Until it's sent, the message shows as a draft with blanks that
 * fill in as the visitor answers, so the payoff is visible before anyone taps. Nothing is sent
 * until they choose to, as in real life. A phone on large screens; a plain chat card on small ones.
 */
export function KateWhatsApp({
  customer,
  message,
  reply,
  draft,
}: {
  /** The customer's first name, once they've sent their plan. */
  customer: string | null;
  /** The enquiry as WhatsApp shows it. */
  message: string | null;
  /** Kate's first reply. */
  reply: string | null;
  /** The message so far, while it isn't sent. */
  draft: Draft;
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
              <motion.div
                key="draft"
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="max-w-[90%] shrink-0"
              >
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.72rem] font-semibold text-[#54656f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-ochre" />
                  Not sent yet · fills in as you answer
                </span>
                <div className="rounded-lg rounded-tl-none border border-dashed border-[#54656f]/40 bg-white/75 px-3 py-2 text-[0.78rem] leading-[1.6]">
                  <p>Hi {KATE.first}, I&apos;ve just done the assessment on your page.</p>
                  <p className="mt-2">
                    <b>About me:</b>{" "}
                    {draft.name ? <Filled>{[draft.name, draft.age].filter(Boolean).join(", ")}</Filled> : <Blank>your name</Blank>}
                  </p>
                  <p>
                    <b>My goals:</b> {draft.goals ? <Filled>{draft.goals}</Filled> : <Blank>what you choose</Blank>}
                  </p>
                  <p>
                    <b>Suggested plan:</b> <Blank>your recommendation</Blank>
                  </p>
                  <p>
                    <b>I&apos;d like to start with:</b> {draft.size ? <Filled>{draft.size}</Filled> : <Blank>how much</Blank>}
                  </p>
                </div>
              </motion.div>
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

/** A part of the message the visitor hasn't answered yet. */
function Blank({ children }: { children: string }) {
  return <span className="rounded bg-sand px-1 py-px italic text-ink-soft">{children}</span>;
}

/** A part they have: it settles in as they answer. */
function Filled({ children }: { children: string }) {
  return (
    <motion.span key={children} initial={{ backgroundColor: "rgb(217 253 211)" }} animate={{ backgroundColor: "rgb(217 253 211 / 0)" }} transition={{ duration: 1.2 }} className="rounded px-0.5">
      {children}
    </motion.span>
  );
}
