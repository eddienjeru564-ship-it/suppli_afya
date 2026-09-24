import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { MPesa } from "@/components/ui/KeepTogether";

export const metadata: Metadata = { title: "Privacy" };

/*
 * DRAFT. Plain-language summary of how Suppli Afya intends to handle data.
 * Health answers are sensitive personal data under Kenya's Data Protection
 * Act, 2019. Have this reviewed by a lawyer and register with the ODPC
 * before collecting real customer data. See docs/DECISIONS.md.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-cream">
      <header className="container-x flex h-16 items-center">
        <Link href="/" aria-label="Suppli Afya home">
          <Logo />
        </Link>
      </header>
      <main className="container-x max-w-2xl py-16">
        <div className="eyebrow">Privacy</div>
        <h1 className="mt-4 font-display text-[2.6rem] leading-[1.05] tracking-[-0.02em] text-ink">How we handle your information</h1>
        <div className="mt-8 grid gap-6 text-[1.02rem] leading-relaxed text-ink-soft">
          <p>
            Health answers are personal, so we keep this simple. This page explains, in plain words, what happens to the
            information you give us.
          </p>
          <section>
            <h2 className="font-display text-[1.5rem] text-ink">The health check</h2>
            <p className="mt-2">
              Your answers are used to build your plan. They are shared with the distributor whose link you used only
              when you choose to send them by tapping the WhatsApp button at the end. Sending also saves your answers and
              plan, and the number you give (if any), in that distributor&apos;s Suppli Afya workspace so they can help you. The demo on this
              website runs entirely in your browser and doesn&apos;t save or send anything.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[1.5rem] text-ink">Distributors and their customers</h2>
            <p className="mt-2">
              A distributor&apos;s customer records belong to that distributor. We don&apos;t sell them, share them with
              other distributors, or contact customers ourselves.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[1.5rem] text-ink">Distributor accounts and payments</h2>
            <p className="mt-2">
              For distributors, we keep your email, a securely hashed password, the business details you give us during
              setup, and a record of your subscription payments. <MPesa /> payments are processed by PayHero and Safaricom, and card
              payments by Paystack; we never see or store card numbers.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[1.5rem] text-ink">Your rights</h2>
            <p className="mt-2">
              Under Kenya&apos;s Data Protection Act, you can ask to see, correct or delete information we hold about
              you. Contact the Suppli Afya team and we&apos;ll deal with it promptly.
            </p>
          </section>
          <p className="text-[0.85rem] text-ink-mute">Last updated September 2026.</p>
        </div>
      </main>
    </div>
  );
}
