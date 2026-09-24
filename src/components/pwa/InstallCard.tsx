"use client";

import { AnimatePresence, motion } from "motion/react";
import { AppIcon } from "./icons";
import { InstallSheet } from "./InstallSheet";
import { dismissInstall } from "./store";
import { useInstall } from "./useInstall";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * A quiet offer on the Today page, on phones only, until it's installed or
 * waved away (then it stays away for three weeks; Settings always has it).
 */
export function InstallCard() {
  const { pwa, kind, install, sheetOpen, closeSheet } = useInstall();
  const show = pwa.ready && pwa.platform !== "desktop" && (kind === "prompt" || kind === "steps") && !pwa.installDismissed;

  return (
    <>
      <AnimatePresence initial={false}>
        {show && (
          <motion.section
            aria-label="Add Suppli Afya to your home screen"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden rounded-[1.25rem] border border-ink/10 bg-paper p-4"
          >
            <div className="flex items-start gap-3.5">
              <AppIcon className="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold leading-snug text-ink">Put Suppli Afya on your home screen</h2>
                <p className="mt-0.5 text-[0.88rem] leading-snug text-ink-soft">
                  Open today&apos;s list in one tap, even when the signal is weak.
                </p>
              </div>
            </div>
            <div className="mt-3.5 flex items-center gap-2 pl-[3.6rem]">
              <button
                type="button"
                onClick={install}
                className="h-10 rounded-full bg-forest px-4 text-[0.88rem] font-semibold text-cream active:scale-[0.98]"
              >
                {kind === "prompt" ? "Install" : "Show me how"}
              </button>
              <button
                type="button"
                onClick={dismissInstall}
                className="h-10 rounded-full px-3 text-[0.88rem] font-semibold text-ink-soft hover:text-ink"
              >
                Not now
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <InstallSheet open={sheetOpen} onClose={closeSheet} pwa={pwa} />
    </>
  );
}
