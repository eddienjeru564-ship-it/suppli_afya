"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { PackArt } from "@/components/check/ProductGlyph";
import { WhatsAppIcon } from "@/components/ui/icons";
import type { ProductFormat, ProductLine } from "@/engine";
import { KATE } from "./story";
import { Monogram, WaText } from "./Screens";

const ease = [0.22, 1, 0.36, 1] as const;

/** The visitor's enquiry as Kate's workspace shows it: who, what they want, what was suggested, how to reach them. */
export interface Enquiry {
  /** Before the first answer; while answering (nothing is sent until the end); on its way; arrived. */
  status: "waiting" | "answering" | "sending" | "new";
  title?: string;
  goals?: string;
  wants?: string;
  plan?: { name: string; format: ProductFormat; line: ProductLine }[];
  /** Instead of a plan, when there isn't one (for example, clinic first). */
  note?: string;
}

/**
 * Kate's side of the demo, built only from what the visitor does: the WhatsApp message she gets
 * when they send their plan, and the same enquiry saved in her workspace in a shape she can follow
 * up on. Until they send, it's marked as not sent: Kate sees nothing until the customer chooses to.
 */
export function KateSide({
  message,
  from,
  enquiry,
  highlight,
  received,
  saving,
}: {
  /** The opening of the WhatsApp message, once it's sent. */
  message: string | null;
  from: string;
  enquiry: Enquiry;
  /** The enquiry has just arrived. */
  highlight: boolean;
  /** The WhatsApp message has just come in. */
  received: boolean;
  /** The enquiry is on its way from WhatsApp into the workspace. */
  saving: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[0.8rem] font-semibold text-cream/65">
        <WhatsAppIcon className="h-3.5 w-3.5 text-wa" /> On {KATE.first}&apos;s WhatsApp
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {message ? (
          <motion.div
            key="message"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: received ? [1, 1.02, 1] : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="rounded-[1.25rem] bg-wa-bg p-3 text-[#111b21] shadow-card"
          >
            <div className="flex items-center gap-2 px-1 pb-2 text-[0.78rem]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#dfe5e7] text-[0.7rem] font-semibold text-wa-deep">
                {from.charAt(0).toUpperCase()}
              </span>
              <span className="font-semibold">{from}</span>
              <span className="ml-auto text-[#54656f]">now</span>
            </div>
            <p className="max-w-[94%] rounded-xl rounded-tl-none bg-white px-3 py-2 text-[0.82rem] leading-[1.45] shadow-sm">
              <WaText text={message} />
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-3 rounded-[1.25rem] border border-dashed border-cream/20 px-4 py-3.5"
          >
            <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-cream/40" />
            <span className="text-[0.85rem] leading-snug">
              <span className="block font-semibold text-cream/75">Nothing sent yet</span>
              <span className="mt-0.5 block text-cream/55">
                When you send your plan, {KATE.first} gets it here as a WhatsApp message.
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* From the chat into the workspace: the same enquiry, saved in a shape Kate can act on. */}
      <div aria-hidden className="relative ml-6 flex h-12 items-center">
        <span className="absolute inset-y-0 left-0 border-l border-dashed border-cream/25" />
        {saving && (
          <motion.span
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute -left-[4px] h-2 w-2 rounded-full bg-sage shadow-[0_0_0_4px_rgb(185_200_174/0.25)]"
          />
        )}
        <span className="pl-4 text-[0.78rem] text-cream/55">Saved in {KATE.first}&apos;s workspace, ready to follow up</span>
      </div>

      <div className="overflow-hidden rounded-[1.4rem] bg-paper text-ink shadow-float">
        <div className="flex items-center gap-2.5 border-b border-ink/10 px-4 py-3 sm:px-5">
          <Monogram className="h-8 w-8 text-[0.78rem]" />
          <span className="text-[0.92rem] font-semibold">{KATE.first}&apos;s workspace</span>
          <span className="ml-auto text-[0.8rem] text-ink-mute">Today</span>
        </div>
        <div className="p-2.5 sm:p-3">
          <EnquiryCard enquiry={enquiry} highlight={highlight} />
        </div>
      </div>
    </div>
  );
}

function EnquiryCard({ enquiry: e, highlight }: { enquiry: Enquiry; highlight: boolean }) {
  const status = {
    waiting: { label: "Waiting for your answers", dot: "bg-ink-mute/50", ping: false },
    answering: { label: "Not sent yet · fills in as you answer", dot: "bg-ochre", ping: true },
    sending: { label: "Sending on WhatsApp", dot: "bg-wa", ping: true },
    new: { label: "New enquiry", dot: "bg-moss", ping: false },
  }[e.status];

  return (
    <div
      className={clsx(
        "rounded-2xl border bg-cream/50 p-4 transition-[box-shadow,border-color] duration-700",
        highlight ? "border-moss/50 shadow-[0_0_0_4px_rgb(90_122_83/0.18)]" : "border-ink/10",
      )}
    >
      <div className="flex items-center justify-between gap-3 text-[0.75rem] font-semibold">
        <span className="inline-flex items-center gap-2 text-ink-soft">
          <span className="relative flex h-2 w-2">
            {status.ping && <span className={clsx("absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full opacity-60", status.dot)} />}
            <span className={clsx("relative inline-flex h-2 w-2 rounded-full", status.dot)} />
          </span>
          {status.label}
        </span>
        {e.status === "new" && <span className="font-normal text-ink-mute">Just now</span>}
      </div>
      <div className={clsx("mt-2 font-display text-[1.45rem] leading-tight", e.title ? "text-ink" : "text-ink-mute")}>
        {e.title || "Your enquiry"}
      </div>

      <dl className="mt-3 grid gap-2 text-[0.88rem] leading-snug">
        <Field label="Goals" value={e.goals} empty="What you're looking for" />
        <Field label="Wants" value={e.wants} empty="How much to start with" />
        {e.plan && e.plan.length > 0 ? (
          <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-2">
            <dt className="text-ink-mute">Suggested</dt>
            <dd className="grid gap-1.5">
              {e.plan.map((p) => (
                <span key={p.name} className="flex items-center gap-2 font-medium">
                  <span className="grid h-7 w-6 shrink-0 place-items-center rounded-md bg-sand/70 p-0.5">
                    <PackArt format={p.format} line={p.line} />
                  </span>
                  {p.name}
                </span>
              ))}
            </dd>
          </div>
        ) : (
          <Field label="Suggested" value={e.note} empty="Your personal recommendation" />
        )}
        <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-2">
          <dt className="text-ink-mute">Contact</dt>
          <dd className="flex items-center gap-1.5 font-medium">
            <WhatsAppIcon className="h-3.5 w-3.5 text-wa-deep" /> WhatsApp
          </dd>
        </div>
      </dl>

      <AnimatePresence initial={false}>
        {e.status === "new" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.45, ease }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
              <span aria-hidden className="inline-flex h-8 items-center gap-1.5 rounded-full bg-wa px-3 text-[0.78rem] font-semibold text-[#06331f]">
                <WhatsAppIcon className="h-3.5 w-3.5" /> Reply on WhatsApp
              </span>
              <span className="text-[0.75rem] text-ink-mute">From your page</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A row of the enquiry: the answer once there is one, and until then what will go there. */
function Field({ label, value, empty }: { label: string; value?: string; empty: string }) {
  return (
    <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-2">
      <dt className="text-ink-mute">{label}</dt>
      <AnimatePresence mode="wait" initial={false}>
        <motion.dd
          key={value ? `v:${value}` : "empty"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease }}
          className={value ? "font-medium text-ink" : "italic text-ink-mute"}
        >
          {value || empty}
        </motion.dd>
      </AnimatePresence>
    </div>
  );
}
