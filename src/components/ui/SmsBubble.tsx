import clsx from "clsx";
import type { ReactNode } from "react";

/** Links in a text, underlined the way a phone shows them. */
function linkify(text: string): ReactNode[] {
  return text.split(/((?:wa\.me|suppliafya\.co\.ke)\/\S+)/g).map((part, i) =>
    i % 2 ? (
      <span key={i} className="underline decoration-[0.06em] underline-offset-2">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * A reminder text as it arrives on a customer's phone: the sender at the top, the message in a
 * grey bubble with its blank lines kept. Used for previews in Settings and on the homepage.
 */
export function SmsBubble({ body, sender = "SUPPLIAFYA", time, className }: { body: string; sender?: string; time?: string; className?: string }) {
  return (
    <div className={clsx("rounded-[1.4rem] bg-[#f2f2f4] p-4 text-left font-sans ring-1 ring-black/5", className)}>
      <div className="flex items-center justify-between gap-3 text-[0.72rem] text-[#6b6b70]">
        <span className="font-semibold tracking-[0.04em]">{sender}</span>
        {time && <span>{time}</span>}
      </div>
      <p className="mt-2 w-fit max-w-full whitespace-pre-line break-words rounded-[1.1rem] rounded-tl-md bg-[#e5e5ea] px-3.5 py-2.5 text-[0.86rem] leading-[1.4] text-[#1c1c1e]">
        {linkify(body)}
      </p>
    </div>
  );
}
