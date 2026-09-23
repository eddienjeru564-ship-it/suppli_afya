import clsx from "clsx";
import type { ReactNode } from "react";

/** Renders WhatsApp-style *bold* markers. */
function formatLine(line: string, i: number): ReactNode {
  const parts = line.split(/(\*[^*]+\*)/g);
  return (
    <span key={i} className="block min-h-[1em]">
      {parts.map((p, j) =>
        p.startsWith("*") && p.endsWith("*") ? (
          <strong key={j} className="font-semibold">
            {p.slice(1, -1)}
          </strong>
        ) : (
          <span key={j}>{p}</span>
        ),
      )}
    </span>
  );
}

/**
 * The customer's message as it arrives on the distributor's phone.
 * `contactName` is who the chat is with (the customer).
 */
export function WhatsAppPreview({
  message,
  contactName,
  time = "9:14 pm",
  className,
  compact,
}: {
  message: string;
  contactName: string;
  time?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={clsx("overflow-hidden rounded-[1.4rem] bg-wa-bg text-[#111b21] shadow-card", className)}>
      <div className="flex items-center gap-3 bg-wa-deep px-4 py-3 text-white">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dfe5e7] text-sm font-semibold text-wa-deep">
          {contactName.charAt(0).toUpperCase() || "?"}
        </span>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[0.95rem] font-semibold">{contactName || "New customer"}</div>
          <div className="text-[0.72rem] text-white/75">online</div>
        </div>
      </div>
      <div
        className={clsx("px-3 py-4", compact ? "min-h-0" : "min-h-[12rem]")}
        style={{
          backgroundImage:
            "radial-gradient(rgb(0 0 0 / 0.035) 1px, transparent 1px), radial-gradient(rgb(0 0 0 / 0.025) 1px, transparent 1px)",
          backgroundSize: "18px 18px, 18px 18px",
          backgroundPosition: "0 0, 9px 9px",
        }}
      >
        <div className="mx-auto mb-3 w-fit rounded-md bg-white/80 px-2 py-0.5 text-[0.68rem] font-medium text-[#54656f] shadow-sm">
          TODAY
        </div>
        <div className="relative max-w-[92%] rounded-lg rounded-tl-none bg-white px-3 pb-5 pt-2 text-[0.84rem] leading-[1.42] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]">
          {message.split("\n").map(formatLine)}
          <span className="absolute bottom-1 right-2 text-[0.66rem] text-[#667781]">{time}</span>
        </div>
      </div>
    </div>
  );
}
