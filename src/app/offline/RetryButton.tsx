"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/** Tries again now, and on its own the moment the connection comes back. */
export function RetryButton() {
  useEffect(() => {
    const back = () => window.location.reload();
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, []);
  return (
    <div className="mt-8 grid gap-3">
      <Button size="lg" onClick={() => window.location.reload()}>
        Try again
      </Button>
      <a href="/portal" className="text-[0.9rem] font-semibold text-forest underline underline-offset-2">
        Open my portal
      </a>
    </div>
  );
}
