import Link from "next/link";
import type { Distributor } from "@/config/distributors";
import { Logo } from "@/components/brand/Logo";
import { HealthCheck } from "./HealthCheck";

/** Full-page health check, as a customer sees it from a distributor's link or QR card. */
export function CheckShell({ distributor }: { distributor: Distributor }) {
  return (
    <div className="min-h-dvh bg-cream">
      {distributor.demo && (
        <div className="bg-forest px-4 py-2 text-center text-[0.8rem] text-cream/85">
          You&apos;re viewing a demo link.{" "}
          <Link href="/" className="font-semibold text-cream underline underline-offset-2">
            Back to Suppli Afya
          </Link>
        </div>
      )}
      <HealthCheck distributor={distributor} mode="page" />
      <footer className="mx-auto flex max-w-xl items-center justify-between px-5 pb-8 pt-4 text-[0.75rem] text-ink-mute sm:px-8">
        <span className="inline-flex items-center gap-1.5">
          Powered by <Logo className="scale-[0.72] origin-left" />
        </span>
        <Link href="/privacy" className="hover:text-ink">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
