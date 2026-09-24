"use client";

import Link from "next/link";
import { useOffline } from "next/offline";
import { useEffect } from "react";
import { Button, buttonClass } from "@/components/ui/Button";

/** When a portal page can't load. Offline gets its own words; nothing here blames the user. */
export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const offline = useOffline();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Try again by itself when the connection comes back.
  useEffect(() => {
    const back = () => reset();
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, [reset]);

  return (
    <div role="alert" className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sand text-lg text-ink-soft">!</div>
      <h1 className="mt-5 font-display text-[1.9rem] leading-tight tracking-[-0.02em] text-ink">
        {offline ? "This page needs a connection" : "This page didn't load"}
      </h1>
      <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft">
        {offline
          ? "You're offline and this page isn't saved on your phone yet. It will load as soon as you're back online."
          : "Something went wrong on our side. Nothing you saved was lost. Try again in a moment."}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <Link href="/portal" className={buttonClass("secondary", "lg")}>
          Go to Today
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-[0.75rem] text-ink-mute">Reference: {error.digest}</p>}
    </div>
  );
}
