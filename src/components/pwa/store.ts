"use client";

import { useSyncExternalStore } from "react";

/**
 * What this device and browser can do with the installed app, shared by
 * every component that talks about it. Listens from the moment the bundle
 * loads, so the browser's install offer is never missed.
 */

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type Platform = "ios" | "android" | "desktop";
export type IosBrowser = "safari" | "chrome" | "other" | "inapp";

export interface PwaState {
  /** False until we've looked at the device (always false on the server). */
  ready: boolean;
  /** Opened from the home screen / as an installed app. */
  standalone: boolean;
  platform: Platform;
  iosBrowser: IosBrowser;
  /** Opened inside another app (Facebook, Instagram, TikTok…), which can't install. */
  inApp: boolean;
  /** The browser offered installation and we can show its dialog. */
  canPrompt: boolean;
  /** Installed during this visit, or remembered from before. */
  installed: boolean;
  /** A new version is downloaded and waiting. */
  updateReady: boolean;
  /** This page was opened from the copy saved on the phone; when it was saved. */
  savedCopyAt: string | null;
  justInstalled: boolean;
  /** "Not now" on the install card, within the last three weeks. */
  installDismissed: boolean;
}

const SERVER: PwaState = {
  ready: false,
  standalone: false,
  platform: "desktop",
  iosBrowser: "safari",
  inApp: false,
  canPrompt: false,
  installed: false,
  updateReady: false,
  savedCopyAt: null,
  justInstalled: false,
  installDismissed: true,
};

let state: PwaState = SERVER;
let installEvent: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const INSTALLED_KEY = "sa-installed";
const DISMISS_KEY = "sa-install-dismissed-at";
const DISMISS_DAYS = 21;
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode */
    }
  },
};

function detect(): Partial<PwaState> {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|Snapchat|TikTok|musical_ly|BytedanceWebview|; wv\)/i.test(ua);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const iosBrowser: IosBrowser = inApp ? "inapp" : /CriOS/.test(ua) ? "chrome" : /FxiOS|EdgiOS|OPiOS/.test(ua) ? "other" : "safari";
  if (standalone) store.set(INSTALLED_KEY, "1");
  return {
    ready: true,
    standalone,
    platform: ios ? "ios" : android ? "android" : "desktop",
    iosBrowser,
    inApp,
    installed: standalone || store.get(INSTALLED_KEY) === "1",
    installDismissed: installDismissed(),
  };
}

if (typeof window !== "undefined") {
  state = { ...SERVER, ...detect() };
  window.addEventListener("beforeinstallprompt", (e) => {
    // Keep the browser's own mini-bar quiet; we offer installation where it fits.
    e.preventDefault();
    installEvent = e as InstallPromptEvent;
    // If the browser offers it, it isn't installed (or was removed since).
    store.set(INSTALLED_KEY, "0");
    set({ canPrompt: true, installed: false });
  });
  window.addEventListener("appinstalled", () => {
    installEvent = null;
    store.set(INSTALLED_KEY, "1");
    set({ canPrompt: false, installed: true, justInstalled: true });
  });
  window.matchMedia("(display-mode: standalone)").addEventListener("change", () => set(detect()));
}

export function usePwa(): PwaState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => SERVER,
  );
}

export function patchPwa(patch: Partial<PwaState>) {
  set(patch);
}

/** Shows the browser's install dialog. Resolves true if they said yes. */
export async function promptInstall(): Promise<boolean> {
  if (!installEvent) return false;
  const e = installEvent;
  installEvent = null;
  set({ canPrompt: false });
  await e.prompt();
  const { outcome } = await e.userChoice;
  return outcome === "accepted";
}

// ---------------------------------------------------------------- install card dismissal

export function installDismissed() {
  const at = Number(store.get(DISMISS_KEY) ?? 0);
  return at > 0 && Date.now() - at < DISMISS_DAYS * 86400_000;
}

export function dismissInstall() {
  store.set(DISMISS_KEY, String(Date.now()));
  set({ installDismissed: true });
}

// ---------------------------------------------------------------- service worker

let waiting: ServiceWorker | null = null;
let reloading = false;

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });

  const watch = (w: ServiceWorker | null) => {
    if (!w) return;
    const check = () => {
      // "installed" with an existing controller means an update, not a first install.
      if (w.state === "installed" && navigator.serviceWorker.controller) {
        waiting = w;
        set({ updateReady: true });
      }
    };
    check();
    w.addEventListener("statechange", check);
  };
  watch(reg.waiting);
  reg.addEventListener("updatefound", () => watch(reg.installing));

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!reloading) return;
    window.location.reload();
  });

  // Look for a new version when the app comes back to the foreground, at most every 30 minutes.
  let last = Date.now();
  const maybeUpdate = () => {
    if (document.visibilityState === "visible" && Date.now() - last > 30 * 60_000) {
      last = Date.now();
      reg.update().catch(() => undefined);
    }
  };
  document.addEventListener("visibilitychange", maybeUpdate);
  setInterval(maybeUpdate, 60 * 60_000);

  // Was this page answered from the copy saved on the phone?
  navigator.serviceWorker.addEventListener("message", (e) => {
    if (e.data?.type === "CACHED_COPY" && e.data.url === window.location.href && e.data.savedAt !== null) {
      set({ savedCopyAt: e.data.savedAt || new Date().toUTCString() });
    }
  });
  navigator.serviceWorker.controller?.postMessage({ type: "WAS_CACHED", url: window.location.href });
}

/** Switches to the waiting version and reloads once it's in control. */
export function applyUpdate() {
  if (!waiting) return window.location.reload();
  reloading = true;
  waiting.postMessage({ type: "SKIP_WAITING" });
}

/** Keep fresh copies of the main portal pages for opening without signal. */
export function warmPortalPages() {
  navigator.serviceWorker?.controller?.postMessage({
    type: "WARM",
    urls: ["/portal", "/portal/customers", "/portal/orders", "/portal/prospects"],
  });
}

/** Removes every saved portal page from this phone. Called on log out. */
export async function clearPrivateData() {
  try {
    navigator.serviceWorker?.controller?.postMessage({ type: "CLEAR_PRIVATE" });
    if ("caches" in window) await caches.delete("sa-pages-v1");
    if ("clearAppBadge" in navigator) await (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge();
  } catch {
    /* nothing to clear */
  }
}
