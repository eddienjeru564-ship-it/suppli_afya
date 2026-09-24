"use client";

import { AnimatePresence, motion } from "motion/react";
import { useOffline } from "next/offline";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { patchPwa, usePwa, warmPortalPages } from "./store";

const ease = [0.22, 1, 0.36, 1] as const;
const RESUME_AFTER = 2 * 60_000;
const WARM_EVERY = 10 * 60_000;

/**
 * Keeps the portal honest about its connection and fresh when you come back:
 * - a quiet bar when offline, or when the page came from the copy saved on the phone
 * - "Back online" for a moment, then the data refreshes
 * - reopening the app after a couple of minutes refreshes today's list
 * - the main pages are saved on the phone in the background for opening without signal
 */
export function PortalRuntime() {
  const router = useRouter();
  const offline = useOffline();
  const { savedCopyAt } = usePwa();
  const [backOnline, setBackOnline] = useState(false);
  const wasOffline = useRef(false);

  // Reconnected: refresh, and say so briefly.
  useEffect(() => {
    if (offline) {
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    router.refresh();
    patchPwa({ savedCopyAt: null });
    setBackOnline(true);
    const t = setTimeout(() => setBackOnline(false), 2500);
    return () => clearTimeout(t);
  }, [offline, router]);

  // Coming back to the app after a while: show today's list as it is now.
  useEffect(() => {
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > RESUME_AFTER) router.refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [router]);

  // Save the main pages on the phone, at most every ten minutes.
  useEffect(() => {
    if (offline) return;
    const t = setTimeout(() => {
      try {
        const last = Number(sessionStorage.getItem("sa-warmed-at") ?? 0);
        if (Date.now() - last < WARM_EVERY) return;
        sessionStorage.setItem("sa-warmed-at", String(Date.now()));
      } catch {
        /* no storage: warm anyway */
      }
      warmPortalPages();
    }, 3000);
    return () => clearTimeout(t);
  }, [offline]);

  const saved = savedCopyAt ? savedTime(savedCopyAt) : null;
  const message = offline
    ? saved
      ? `You're offline. Showing what was saved at ${saved}.`
      : "You're offline. Anything you save will go through when you're back."
    : saved
      ? `Showing what was saved at ${saved}.`
      : backOnline
        ? "Back online."
        : null;

  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key="bar"
          role="status"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease }}
          className="overflow-hidden"
        >
          <div
            className={
              offline
                ? "flex items-center gap-2 bg-sand px-4 py-2 text-[0.85rem] text-ink sm:px-6 lg:px-10"
                : "flex items-center gap-2 bg-sage-soft px-4 py-2 text-[0.85rem] text-forest sm:px-6 lg:px-10"
            }
          >
            <span className={offline ? "h-2 w-2 shrink-0 rounded-full bg-clay" : "h-2 w-2 shrink-0 rounded-full bg-moss"} aria-hidden />
            <span className="min-w-0 flex-1">{message}</span>
            {!offline && saved && (
              <button type="button" onClick={() => window.location.reload()} className="shrink-0 font-semibold underline underline-offset-2">
                Refresh
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function savedTime(at: string) {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return null;
  const sameDay = d.toDateString() === new Date().toDateString();
  return d.toLocaleString("en-KE", sameDay ? { hour: "numeric", minute: "2-digit" } : { weekday: "short", hour: "numeric", minute: "2-digit" });
}
