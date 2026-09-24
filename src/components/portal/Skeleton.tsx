import clsx from "clsx";

/** A placeholder block. Pulses gently; still when reduced motion is on. */
export function Bone({ className }: { className?: string }) {
  return <div className={clsx("rounded-xl bg-ink/[0.07] motion-safe:animate-pulse", className)} aria-hidden />;
}

/** The shape of a portal page (title, a few actions, a list) while it loads. */
export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="grid gap-8">
      <div className="grid gap-3">
        <Bone className="h-4 w-28" />
        <Bone className="h-10 w-3/5 max-w-sm" />
        <Bone className="h-4 w-4/5 max-w-md" />
      </div>
      <div className="flex gap-2">
        <Bone className="h-10 w-28 rounded-full" />
        <Bone className="h-10 w-24 rounded-full" />
      </div>
      <div className="grid gap-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-paper p-4">
            <Bone className="h-10 w-10 shrink-0 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Bone className="h-4 w-2/5" />
              <Bone className="h-3.5 w-4/5" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
