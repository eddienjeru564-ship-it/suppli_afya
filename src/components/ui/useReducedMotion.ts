"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

/**
 * Whether the person has asked their phone for less motion.
 *
 * Use this instead of motion's own hook. That one already knows the answer on the first render
 * in the browser but not on the server, so anything drawn differently for reduced motion didn't
 * match the HTML: React threw the page away and rebuilt it. This reads as "no" on the server and
 * during hydration, and switches to the real preference straight after.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
