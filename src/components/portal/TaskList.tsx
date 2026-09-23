"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { markDone } from "@/app/portal/actions";
import { whatsappLink } from "@/engine";
import type { Task } from "@/server/portal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Pill } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

/** Today's list. Each person opens a ready message; send it on WhatsApp, then tick it off. */
export function TaskList({ tasks }: { tasks: Task[] }) {
  const [open, setOpen] = useState<string | null>(tasks[0]?.key ?? null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [, start] = useTransition();
  const visible = tasks.filter((t) => !hidden.includes(t.key));

  const done = (t: Task, note: string) => {
    setHidden((h) => [...h, t.key]);
    start(() => markDone(t.key, note));
  };

  if (!visible.length)
    return (
      <div className="rounded-[1.25rem] border border-dashed border-ink/15 px-6 py-10 text-center">
        <div className="font-display text-[1.35rem] text-ink">Nothing waiting on you right now</div>
        <p className="mx-auto mt-2 max-w-sm text-[0.93rem] leading-relaxed text-ink-soft">
          New health checks, unpaid orders, reorders and check-ins appear here as soon as they&apos;re due.
        </p>
      </div>
    );

  return (
    <ul className="grid gap-2">
      <AnimatePresence initial={false}>
        {visible.map((t) => {
          const isOpen = open === t.key;
          const msg = drafts[t.key] ?? t.message;
          const wa = t.phone ? whatsappLink(t.phone, msg) : `https://wa.me/?text=${encodeURIComponent(msg)}`;
          return (
            <motion.li
              key={t.key}
              layout
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease }}
              className={clsx("overflow-hidden rounded-[1.25rem] border transition-colors", isOpen ? "border-ink/15 bg-paper" : "border-ink/10 bg-paper/60")}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : t.key)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 p-4 text-left sm:px-5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand font-display text-lg text-ink">
                  {t.title.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-ink">{t.title}</span>
                    <Pill tone={t.kind === "new" ? "new" : t.kind} />
                  </span>
                  <span className="mt-0.5 block text-[0.88rem] leading-snug text-ink-soft">{t.why}</span>
                </span>
                <svg viewBox="0 0 16 16" aria-hidden className={clsx("h-4 w-4 shrink-0 text-ink-mute transition-transform", isOpen && "rotate-180")}>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </svg>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 sm:px-5 sm:pl-[4.25rem]">
                      <label className="block text-[0.75rem] font-semibold text-ink-mute">
                        Message, ready to send
                        <textarea
                          value={msg}
                          onChange={(e) => setDrafts((d) => ({ ...d, [t.key]: e.target.value }))}
                          rows={3}
                          className="mt-1.5 w-full resize-y rounded-xl border border-transparent bg-wa-bubble px-3 py-2.5 text-[0.92rem] font-normal leading-relaxed text-[#111b21] outline-none focus:border-moss"
                        />
                      </label>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setTimeout(() => done(t, `Sent a WhatsApp message.`), 400)}
                          className="inline-flex h-10 items-center gap-2 rounded-full bg-wa px-4 text-[0.88rem] font-semibold text-[#06331f]"
                        >
                          <WhatsAppIcon className="h-4 w-4" /> Send on WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() => done(t, "Marked as done.")}
                          className="h-10 rounded-full border border-ink/15 px-4 text-[0.88rem] font-semibold text-ink hover:border-ink/35"
                        >
                          Mark done
                        </button>
                        <Link href={t.href} className="px-2 text-[0.88rem] font-semibold text-forest underline-offset-2 hover:underline">
                          Open
                        </Link>
                      </div>
                      {!t.phone && (
                        <p className="mt-2 text-[0.78rem] text-ink-mute">No number saved, so WhatsApp will ask you to pick the contact.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
