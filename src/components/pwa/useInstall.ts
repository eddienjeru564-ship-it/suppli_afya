"use client";

import { useState } from "react";
import { promptInstall, usePwa } from "./store";

/**
 * What installing means on this device:
 * - "prompt": the browser's own dialog (Chrome, Edge, Samsung Internet on Android; Chrome/Edge on desktop)
 * - "steps":  we explain the taps (iPhone, in-app browsers, Android browsers without a dialog)
 * - "done":   already installed or running as the app
 */
export function useInstall() {
  const pwa = usePwa();
  const [sheetOpen, setSheetOpen] = useState(false);
  const kind: "prompt" | "steps" | "done" | "none" = !pwa.ready
    ? "none"
    : pwa.standalone || (pwa.installed && !pwa.canPrompt)
      ? "done"
      : pwa.canPrompt
        ? "prompt"
        : pwa.platform === "ios" || pwa.inApp || pwa.platform === "android"
          ? "steps"
          : "none";

  const install = async () => {
    if (kind === "prompt") {
      const ok = await promptInstall();
      if (!ok) return false;
      return true;
    }
    if (kind === "steps") setSheetOpen(true);
    return false;
  };

  return { pwa, kind, install, sheetOpen, closeSheet: () => setSheetOpen(false) };
}
