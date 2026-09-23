import clsx from "clsx";
import { LogoMark } from "./Logo";

/** The distributor's printable card: their name, their link, a QR code to the health check. */
export function QrCard({
  name,
  tagline,
  url,
  displayUrl,
  svg,
  className,
}: {
  name: string;
  tagline: string;
  url: string;
  displayUrl: string;
  svg: string;
  className?: string;
}) {
  return (
    <div className={clsx("relative mx-auto aspect-[1.6/1] w-[86%] max-w-[30rem] sm:w-full", className)}>
      <div className="absolute inset-0 translate-x-3 translate-y-4 rotate-[5deg] rounded-[1.4rem] bg-forest shadow-float sm:translate-x-6 sm:translate-y-6">
        <div className="flex h-full flex-col justify-between p-6 text-cream sm:p-8">
          <LogoMark tone="cream" className="h-8 w-8" />
          <div className="font-display text-[1.35rem] italic leading-tight text-cream/90">
            Afya yako, <br /> mpango wako.
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -rotate-[3deg] rounded-[1.4rem] border border-ink/10 bg-paper shadow-float">
        <div className="grid h-full grid-cols-[1fr_auto] gap-4 p-5 sm:gap-6 sm:p-7">
          <div className="flex min-w-0 flex-col">
            <div className="truncate font-display text-[1.3rem] leading-tight text-ink sm:text-[1.5rem]">{name}</div>
            <div className="truncate text-[0.72rem] text-ink-mute sm:text-[0.8rem]">{tagline}</div>
            <div className="mt-auto font-display text-[1rem] leading-snug text-ink sm:text-[1.2rem]">
              Not sure what you need? Take a three-minute health check.
            </div>
            <div className="mt-2 truncate font-mono text-[0.66rem] text-forest sm:text-[0.75rem]">{displayUrl}</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div
              className="h-24 w-24 rounded-lg bg-white p-2 sm:h-32 sm:w-32 [&>svg]:h-full [&>svg]:w-full"
              aria-label={`QR code linking to ${url}`}
              role="img"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className="mt-2 text-[0.62rem] font-semibold text-ink-mute sm:text-[0.7rem]">Scan to start</div>
          </div>
        </div>
      </div>
    </div>
  );
}
