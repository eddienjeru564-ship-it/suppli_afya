"use client";

import { useEffect } from "react";

/** Shows how many people need you on the app icon (where the phone supports it). */
export function AppBadge({ count }: { count: number }) {
  useEffect(() => {
    const n = navigator as Navigator & { setAppBadge?: (c?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    if (!n.setAppBadge) return;
    (count > 0 ? n.setAppBadge(count) : n.clearAppBadge!()).catch(() => undefined);
  }, [count]);
  return null;
}
