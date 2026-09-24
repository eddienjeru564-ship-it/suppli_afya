"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AddSquareIcon, AppIcon, DotsIcon, KebabIcon, ShareIcon } from "./icons";
import type { PwaState } from "./store";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Step-by-step help for browsers that can't show an install dialog: Safari
 * and Chrome on iPhone, in-app browsers, and Android browsers that didn't
 * offer one. Says what to tap, in the words the phone uses.
 */
export function InstallSheet({ open, onClose, pwa }: { open: boolean; onClose: () => void; pwa: PwaState }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease }}
            className="relative w-full max-w-md rounded-t-[1.75rem] bg-paper px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-float outline-none sm:rounded-[1.75rem] sm:pb-6"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink/15 sm:hidden" aria-hidden />
            <div className="flex items-center gap-3">
              <AppIcon className="h-12 w-12" />
              <div>
                <h2 id="install-title" className="font-display text-[1.45rem] leading-tight text-ink">
                  Add Suppli Afya to your home screen
                </h2>
              </div>
            </div>
            <InstallSteps pwa={pwa} />
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-12 w-full rounded-full bg-forest text-[0.95rem] font-semibold text-cream active:scale-[0.99]"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** The steps for this phone and browser. Also used inline on the Settings page. */
export function InstallSteps({ pwa }: { pwa: PwaState }) {
  if (pwa.inApp) return <OpenInBrowser ios={pwa.platform === "ios"} />;

  if (pwa.platform === "ios") {
    const chrome = pwa.iosBrowser === "chrome";
    if (pwa.iosBrowser === "other") return <OpenInBrowser ios />;
    return (
      <>
        <ol className="mt-6 grid gap-4">
          <Step n={1} icon={<ShareIcon className="h-5 w-5" />}>
            {chrome ? (
              <>
                Tap <b>Share</b> at the top of the screen, next to the address.
              </>
            ) : (
              <>
                Tap <b>Share</b> in Safari&apos;s toolbar.{" "}
                <span className="text-ink-mute">
                  If you don&apos;t see it, tap <DotsIcon className="inline h-4 w-4 align-[-3px]" /> first.
                </span>
              </>
            )}
          </Step>
          <Step n={2} icon={<AddSquareIcon className="h-5 w-5" />}>
            Scroll down and tap <b>Add to Home Screen</b>.
          </Step>
          <Step n={3} icon={<span className="text-[0.8rem] font-bold">Add</span>}>
            Tap <b>Add</b>. Suppli Afya appears with your other apps.
          </Step>
        </ol>
        <p className="mt-5 rounded-xl bg-cream px-4 py-3 text-[0.85rem] leading-relaxed text-ink-soft">
          The first time you open it from your home screen, log in once. It keeps you signed in after that.
        </p>
      </>
    );
  }

  // Android or desktop browsers that didn't offer their own dialog.
  return (
    <ol className="mt-6 grid gap-4">
      <Step n={1} icon={<KebabIcon className="h-5 w-5" />}>
        Open your browser&apos;s menu {pwa.platform === "android" ? <>(the <b>⋮</b> at the top right)</> : null}.
      </Step>
      <Step n={2} icon={<AddSquareIcon className="h-5 w-5" />}>
        Tap <b>Install app</b> or <b>Add to Home screen</b>.
      </Step>
      <Step n={3} icon={<span className="text-[0.8rem] font-bold">OK</span>}>
        Confirm. Suppli Afya appears with your other apps.
      </Step>
    </ol>
  );
}

function OpenInBrowser({ ios }: { ios: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/portal` : "/portal";
  return (
    <div className="mt-5">
      <p className="text-[0.95rem] leading-relaxed text-ink-soft">
        You&apos;ve opened this inside another app, which can&apos;t add apps to your home screen. Open it in{" "}
        {ios ? "Safari" : "Chrome"} first, then come back here.
      </p>
      <ol className="mt-5 grid gap-4">
        <Step n={1} icon={<KebabIcon className="h-5 w-5" />}>
          Tap the menu and choose <b>Open in {ios ? "Safari" : "Chrome"}</b>
          {ios ? " (or Open in browser)" : ""}.
        </Step>
        <Step n={2} icon={<span className="text-[0.8rem] font-bold">Link</span>}>
          Or copy the link and paste it into {ios ? "Safari" : "Chrome"}.
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
              } catch {
                /* clipboard blocked */
              }
            }}
            className="mt-2 block rounded-full border border-forest/25 px-3 py-1.5 text-[0.85rem] font-semibold text-forest"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </Step>
      </ol>
    </div>
  );
}

function Step({ n, icon, children }: { n: number; icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-forest" aria-hidden>
        {icon}
      </span>
      <span className="pt-0.5 text-[0.95rem] leading-snug text-ink">
        <span className="sr-only">Step {n}: </span>
        {children}
      </span>
    </li>
  );
}
