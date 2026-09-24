"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { applyUpdate, patchPwa, registerServiceWorker, usePwa } from "./store";

const ease = [0.22, 1, 0.36, 1] as const;

/** Registers the service worker and shows the two app-level messages: an update is ready, and the app was installed. */
export function PwaProvider({ children }: { children: ReactNode }) {
  const { updateReady, justInstalled } = usePwa();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // In development the worker would cache over hot reloads; it only runs on real builds.
    if (process.env.NODE_ENV !== "production") return;
    registerServiceWorker().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!justInstalled) return;
    const t = setTimeout(() => patchPwa({ justInstalled: false }), 6000);
    return () => clearTimeout(t);
  }, [justInstalled]);

  return (
    <>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6"
      >
        <AnimatePresence>
          {updateReady && (
            <Toast key="update">
              <span className="min-w-0 flex-1">A new version of Suppli Afya is ready.</span>
              <button
                type="button"
                onClick={() => {
                  setUpdating(true);
                  applyUpdate();
                }}
                disabled={updating}
                className="h-9 shrink-0 rounded-full bg-cream px-4 text-[0.85rem] font-semibold text-forest-deep disabled:opacity-60"
              >
                {updating ? "Updating…" : "Update"}
              </button>
            </Toast>
          )}
          {justInstalled && !updateReady && (
            <Toast key="installed">
              <span className="min-w-0 flex-1">Suppli Afya is on your home screen. Open it from there next time.</span>
              <button
                type="button"
                onClick={() => patchPwa({ justInstalled: false })}
                className="h-9 shrink-0 rounded-full px-3 text-[0.85rem] font-semibold text-cream/80 hover:text-cream"
              >
                OK
              </button>
            </Toast>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export function Toast({ children }: { children: ReactNode }) {
  return (
    <motion.div
      role="status"
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ duration: 0.35, ease }}
      className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-forest-deep py-2 pl-4 pr-2 text-[0.9rem] leading-snug text-cream shadow-float"
    >
      {children}
    </motion.div>
  );
}
