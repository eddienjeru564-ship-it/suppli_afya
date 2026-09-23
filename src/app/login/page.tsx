import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Distributor login" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="container-x flex h-16 items-center">
        <Link href="/" aria-label="Suppli Afya home">
          <Logo />
        </Link>
      </header>
      <main className="container-x flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-md rounded-[2rem] border border-ink/10 bg-paper p-8 sm:p-10">
          <div className="eyebrow">Distributor portal</div>
          <h1 className="mt-4 font-display text-[2.2rem] leading-[1.08] tracking-[-0.02em] text-ink">
            The portal is open to early-access distributors
          </h1>
          <p className="mt-4 text-[1rem] leading-relaxed text-ink-soft">
            If you&apos;re one of them, use the sign-in link we sent you on WhatsApp. If you&apos;re not yet, you can
            apply below and we&apos;ll set you up.
          </p>
          <div className="mt-8 grid gap-3">
            <ButtonLink href="/#early-access" size="lg" arrow>
              Apply for early access
            </ButtonLink>
            <ButtonLink href="/check" size="lg" variant="secondary">
              Try the health check
            </ButtonLink>
          </div>
        </div>
      </main>
    </div>
  );
}
