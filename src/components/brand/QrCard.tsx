import clsx from "clsx";
import { LogoMark } from "./Logo";

/**
 * The distributor's printable card: their name, their link, a QR code to their page. `size="sm"`
 * draws it smaller, with fixed sizes, for places where it sits inside another card.
 */
export function QrCard({
  name,
  tagline,
  url,
  displayUrl,
  svg,
  className,
  size = "md",
}: {
  name: string;
  tagline: string;
  url: string;
  displayUrl: string;
  svg: string;
  className?: string;
  size?: "md" | "sm";
}) {
  const sm = size === "sm";
  return (
    <div className={clsx("relative mx-auto aspect-[1.6/1]", sm ? "w-[86%] max-w-[19rem]" : "w-[86%] max-w-[30rem] sm:w-full", className)}>
      <div
        className={clsx(
          "absolute inset-0 rotate-[5deg] bg-forest shadow-float",
          sm ? "translate-x-2 translate-y-3 rounded-[1rem]" : "translate-x-3 translate-y-4 rounded-[1.4rem] sm:translate-x-6 sm:translate-y-6",
        )}
      >
        <div className={clsx("flex h-full flex-col justify-between text-cream", sm ? "p-4" : "p-6 sm:p-8")}>
          <LogoMark tone="cream" className={sm ? "h-6 w-6" : "h-8 w-8"} />
          <div className={clsx("font-display italic leading-tight text-cream/90", sm ? "text-[1rem]" : "text-[1.35rem]")}>
            Afya yako, <br /> mpango wako.
          </div>
        </div>
      </div>
      <div className={clsx("absolute inset-0 -rotate-[3deg] border border-ink/10 bg-paper shadow-float", sm ? "rounded-[1rem]" : "rounded-[1.4rem]")}>
        <div className={clsx("grid h-full grid-cols-[1fr_auto]", sm ? "gap-3 p-3.5" : "gap-4 p-5 sm:gap-6 sm:p-7")}>
          <div className="flex min-w-0 flex-col">
            <div className={clsx("truncate font-display leading-tight text-ink", sm ? "text-[1.1rem]" : "text-[1.3rem] sm:text-[1.5rem]")}>{name}</div>
            <div className={clsx("truncate text-ink-mute", sm ? "text-[0.66rem]" : "text-[0.72rem] sm:text-[0.8rem]")}>{tagline}</div>
            <div className={clsx("mt-auto font-display leading-snug text-ink", sm ? "text-[0.85rem]" : "text-[1rem] sm:text-[1.2rem]")}>
              Not sure where to start? Take my short assessment.
            </div>
            <div className={clsx("mt-1.5 truncate font-mono text-forest", sm ? "text-[0.58rem]" : "text-[0.66rem] sm:text-[0.75rem]")}>{displayUrl}</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div
              className={clsx("rounded-lg bg-white [&>svg]:h-full [&>svg]:w-full", sm ? "h-[4.25rem] w-[4.25rem] p-1" : "h-24 w-24 p-2 sm:h-32 sm:w-32")}
              aria-label={`QR code linking to ${url}`}
              role="img"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className={clsx("mt-1.5 font-semibold text-ink-mute", sm ? "text-[0.56rem]" : "text-[0.62rem] sm:text-[0.7rem]")}>Scan to start</div>
          </div>
        </div>
      </div>
    </div>
  );
}
