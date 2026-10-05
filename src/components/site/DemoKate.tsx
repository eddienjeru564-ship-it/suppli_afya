"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { PackArt } from "@/components/check/ProductGlyph";
import { WhatsAppIcon } from "@/components/ui/icons";
import type { ProductFormat, ProductLine } from "@/engine";
import { KATE } from "./story";
import { Monogram, WaText } from "./Screens";

const ease = [0.22, 1, 0.36, 1] as const;

/** One enquiry as Kate's workspace shows it: who, what they want, what was suggested, how to reach them. */
export interface Enquiry {
  id: string;
  /** "answering" while the customer is still going; "sending" between their last answer and arrival. */
  status: "answering" | "sending" | "new";
  title: string;
  when: string;
  goals?: string;
  wants?: string;
  plan?: { name: string; format: ProductFormat; line: ProductLine }[];
  /** Instead of a plan, when there isn't one (for example, clinic first). */
  note?: string;
  contact: string;
}

/** Earlier people on Kate's list, shown small: her workspace has a day in it, not one lonely card. */
const EARLIER = [
  { name: "Mama Njeri", what: "Check in · started ArthroXtra 2 weeks ago" },
  { name: "Kiprono", what: "Quiet · no order since 3 Jul" },
];

/**
 * Kate's side of the demo: the WhatsApp message she gets, and the structured enquiry saved in her
 * workspace at the same time. The point is the difference between the two: a chat message, and an
 * enquiry she can act on.
 */
export function KateSide({
  message,
  from,
  time,
  enquiries,
  highlight,
  received,
  saving,
}: {
  /** The opening of the customer's WhatsApp message (who they are, goals, plan). */
  message: string;
  from: string;
  /** When the message came in, as WhatsApp shows it. */
  time: string;
  /** Top first: the expanded one, then any collapsed. */
  enquiries: Enquiry[];
  /** The enquiry that just arrived. */
  highlight: string | null;
  /** The WhatsApp message has just come in. */
  received: boolean;
  /** The enquiry is on its way from WhatsApp into the workspace. */
  saving: boolean;
}) {
  const [main, ...rest] = enquiries;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[0.8rem] font-semibold text-cream/65">
        <WhatsAppIcon className="h-3.5 w-3.5 text-wa" /> On {KATE.first}&apos;s WhatsApp
      </div>
      <motion.div
        animate={received ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, ease }}
        className="rounded-[1.25rem] bg-wa-bg p-3 text-[#111b21] shadow-card"
      >
        <div className="flex items-center gap-2 px-1 pb-2 text-[0.78rem]">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#dfe5e7] text-[0.7rem] font-semibold text-wa-deep">
            {from.charAt(0).toUpperCase()}
          </span>
          <span className="font-semibold">{from}</span>
          <span className="ml-auto text-[#54656f]">{time}</span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="max-w-[94%] rounded-xl rounded-tl-none bg-white px-3 py-2 text-[0.82rem] leading-[1.45] shadow-sm"
          >
            <WaText text={message} />
          </motion.p>
        </AnimatePresence>
      </motion.div>

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
        <div className="grid gap-1 p-2.5 sm:p-3">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={main.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease }}>
              <EnquiryCard enquiry={main} highlight={highlight === main.id} />
            </motion.div>
            {rest.map((e) => (
              <motion.div key={e.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease }}>
                <Row name={e.title} what={[e.status === "new" ? "New enquiry" : null, e.goals].filter(Boolean).join(" · ")} fresh />
              </motion.div>
            ))}
          </AnimatePresence>
          {EARLIER.map((e) => (
            <Row key={e.name} name={e.name} what={e.what} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EnquiryCard({ enquiry: e, highlight }: { enquiry: Enquiry; highlight: boolean }) {
  const status = {
    answering: { label: "Answering now", dot: "bg-ochre", ping: true },
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
        <span className="font-normal text-ink-mute">{e.when}</span>
      </div>
      <div className="mt-2 font-display text-[1.45rem] leading-tight text-ink">{e.title}</div>

      <dl className="mt-3 grid gap-2 text-[0.88rem] leading-snug">
        <Field label="Goals" value={e.goals} />
        <Field label="Wants" value={e.wants} />
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
          <Field label="Suggested" value={e.note} />
        )}
        <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-2">
          <dt className="text-ink-mute">Contact</dt>
          <dd className="flex items-center gap-1.5 font-medium">
            <WhatsAppIcon className="h-3.5 w-3.5 text-wa-deep" /> {e.contact}
          </dd>
        </div>
      </dl>

      {e.status === "new" && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
          <span aria-hidden className="inline-flex h-8 items-center gap-1.5 rounded-full bg-wa px-3 text-[0.78rem] font-semibold text-[#06331f]">
            <WhatsAppIcon className="h-3.5 w-3.5" /> Reply on WhatsApp
          </span>
          <span className="text-[0.75rem] text-ink-mute">From your page</span>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-2">
      <dt className="text-ink-mute">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Row({ name, what, fresh }: { name: string; what: string; fresh?: boolean }) {
  return (
    // Earlier people step back with softer ink and a paler avatar, never with transparency: they stay readable.
    <div className="flex min-w-0 items-center gap-3 rounded-xl px-2.5 py-2">
      <span
        className={clsx(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[0.9rem]",
          fresh ? "bg-sand text-ink" : "bg-sand/50 text-ink-soft",
        )}
      >
        {name.charAt(0)}
      </span>
      <span className="min-w-0">
        <span className={clsx("block text-[0.88rem] font-semibold", fresh ? "text-ink" : "text-ink-soft")}>{name}</span>
        <span className={clsx("block truncate text-[0.8rem]", fresh ? "text-ink-soft" : "text-ink-mute")}>{what}</span>
      </span>
    </div>
  );
}
