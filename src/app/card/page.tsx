import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { getAccount, nextStepFor } from "@/server/auth";
import { businessTypeLabel } from "@/server/distributors";
import { LogoMark } from "@/components/brand/Logo";
import { qrSvg } from "@/lib/qr";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = { title: "Print your QR cards", robots: { index: false } };

/** An A4 sheet of business-card-sized QR cards, ready to print and cut. */
export default async function CardSheet() {
  const a = await getAccount();
  if (nextStepFor(a) !== "/portal") redirect("/login?next=/portal/settings");
  const w = a!.workspace;
  const url = `${site.url}/d/${w.slug}`;
  const svg = await qrSvg(url);
  const tagline = [w.business_name && w.business_name !== w.owner_name ? w.business_name : businessTypeLabel(w.business_type), w.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-dvh bg-white p-6 print:p-0">
      <div className="mx-auto mb-6 flex max-w-[190mm] items-center justify-between print:hidden">
        <p className="text-[0.95rem] text-ink-soft">Ten cards per A4 sheet. Print at 100% and cut along the edges.</p>
        <PrintButton />
      </div>
      <div className="mx-auto grid max-w-[190mm] grid-cols-2 gap-[4mm]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid h-[52mm] grid-cols-[1fr_auto] gap-3 rounded-[3mm] border border-ink/20 p-[5mm] [break-inside:avoid]">
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5">
                <LogoMark className="h-4 w-4" />
                <span className="truncate font-display text-[15pt] leading-tight text-ink">{w.owner_name}</span>
              </div>
              <div className="truncate text-[7.5pt] text-ink-mute">{tagline}</div>
              <div className="mt-auto font-display text-[10.5pt] leading-snug text-ink">Not sure what you need? Take a three-minute health check.</div>
              <div className="mt-1 truncate font-mono text-[7pt] text-forest">
                {site.displayDomain}/d/{w.slug}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="h-[30mm] w-[30mm] [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
              <div className="mt-1 text-[6.5pt] font-semibold text-ink-mute">Scan to start</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
