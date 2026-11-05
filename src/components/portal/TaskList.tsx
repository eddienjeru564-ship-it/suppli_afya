"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { markDone, undoDone } from "@/app/portal/actions";
import { whatsappLink } from "@/engine";
import type { Task } from "@/server/portal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Pill } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

/** Says where the link goes, rather than a bare "Open". */
function openLabel(href: string) {
  if (href.startsWith("/portal/orders/")) return "See the order";
  if (href.startsWith("/portal/prospects/")) return "See their answers";
  return "See their record";
}

/** Today's list. Each person opens a ready message; send it on WhatsApp, then tick it off. */
export function TaskList({ tasks }: { tasks: Task[] }) {
  const [open, setOpen] = useState<string | null>(tasks[0]?.key ?? null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [undo, setUndo] = useState<{ task: Task; label: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [, start] = useTransition();
  const visible = tasks.filter((t) => !hidden.includes(t.key));

  useEffect(() => () => clearTimeout(timer.current), []);

  /** Ticks a task off, opens the next one so the round keeps moving, and offers a short Undo. */
  const done = (t: Task, note: string, label: string) => {
    const rest = visible.filter((v) => v.key !== t.key);
    const i = visible.findIndex((v) => v.key === t.key);
    setHidden((h) => [...h, t.key]);
    if (open === t.key)
      setOpen(rest[Math.min(i, rest.length - 1)]?.key ?? null);
    setUndo({ task: t, label });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setUndo(null), 6000);
    start(() => markDone(t.key, note));
  };

  const takeBack = () => {
    if (!undo) return;
    const t = undo.task;
    setUndo(null);
    setHidden((h) => h.filter((k) => k !== t.key));
    setOpen(t.key);
    start(() => undoDone(t.key));
  };

  const toast = (
    <AnimatePresence>
      {undo && (
        <motion.div
          key="undo"
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease }}
          className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-2 text-[0.9rem] text-cream shadow-float lg:bottom-8"
        >
          <span className="min-w-0 truncate">
            {undo.label} {undo.task.title.split(" ordered")[0]}.
          </span>
          <button
            type="button"
            onClick={takeBack}
            className="h-11 shrink-0 rounded-full px-3 font-semibold text-sage hover:bg-cream/10"
          >
            Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!visible.length)
    return (
      <div className="rounded-[1.25rem] border border-dashed border-ink/15 px-6 py-10 text-center">
        {toast}
        <div className="font-display text-[1.35rem] text-ink">
          Nothing waiting on you right now
        </div>
        <p className="mx-auto mt-2 max-w-sm text-[0.93rem] leading-relaxed text-ink-soft">
          {tasks.length
            ? "That's everyone for today. Nice work. New enquiries and orders will appear here as they come in."
            : "New enquiries from your page, unpaid orders, reorders and check-ins appear here as soon as they're due."}
        </p>
      </div>
    );

  return (
    <>
      {toast}
      <ul className="grid gap-2">
        <AnimatePresence initial={false}>
          {visible.map((t) => {
            const isOpen = open === t.key;
            const msg = drafts[t.key] ?? t.message;
            const wa = t.phone
              ? whatsappLink(t.phone, msg)
              : `https://wa.me/?text=${encodeURIComponent(msg)}`;
            return (
              <motion.li
                key={t.key}
                layout
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.35, ease }}
                className={clsx(
                  "overflow-hidden rounded-[1.25rem] border transition-colors",
                  isOpen
                    ? "border-ink/15 bg-paper"
                    : "border-ink/10 bg-paper/60",
                )}
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
                    <span className="mt-0.5 block text-[0.88rem] leading-snug text-ink-soft">
                      {t.why}
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden
                    className={clsx(
                      "h-4 w-4 shrink-0 text-ink-mute transition-transform",
                      isOpen && "rotate-180",
                    )}
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                    />
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
                            onChange={(e) =>
                              setDrafts((d) => ({
                                ...d,
                                [t.key]: e.target.value,
                              }))
                            }
                            rows={3}
                            // Grows to fit the whole message where the browser can, so nothing is cut off mid-sentence.
                            className="mt-1.5 max-h-72 w-full resize-y rounded-xl border border-transparent bg-wa-bubble px-3 py-2.5 text-[0.92rem] font-normal leading-relaxed text-[#111b21] outline-none [field-sizing:content] focus:border-moss"
                          />
                        </label>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              setTimeout(
                                () =>
                                  done(
                                    t,
                                    `Sent on WhatsApp: "${msg.trim()}"`,
                                    "Sent to",
                                  ),
                                400,
                              )
                            }
                            className="inline-flex h-11 items-center gap-2 rounded-full bg-wa px-4 text-[0.88rem] font-semibold text-[#06331f]"
                          >
                            <WhatsAppIcon className="h-4 w-4" /> Send on
                            WhatsApp
                          </a>
                          <button
                            type="button"
                            onClick={() => done(t, "Marked as done.", "Done:")}
                            className="h-11 rounded-full border border-ink/15 px-4 text-[0.88rem] font-semibold text-ink hover:border-ink/35"
                          >
                            Mark done
                          </button>
                          <Link
                            href={t.href}
                            className="inline-flex h-11 items-center rounded-full px-4 text-[0.88rem] font-semibold text-forest hover:bg-forest/[0.06]"
                          >
                            {openLabel(t.href)}
                          </Link>
                        </div>
                        {!t.phone && (
                          <p className="mt-2 text-[0.78rem] text-ink-mute">
                            No number saved, so WhatsApp will ask you to pick
                            the contact.
                          </p>
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
    </>
  );
}
