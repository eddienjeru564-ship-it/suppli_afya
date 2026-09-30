import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { KATE } from "./story";

export function FinalCta() {
  return (
    <section id="start" className="relative overflow-hidden bg-forest-deep pb-16 pt-28 text-cream sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(90_122_83/0.4),transparent)]" />
      <div className="container-x relative text-center">
        <Reveal>
          <h2 className="display-xl mx-auto max-w-[15ch]">
            Give your customers a better way to <span className="italic text-sage">find you.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-7 max-w-[34rem] text-[1.15rem] leading-relaxed text-cream/75">
            Your own page, the assessment that goes with it, and a workspace that remembers every customer. Try {KATE.first}&apos;s
            page first: if you can picture sending yours to the next person who asks what&apos;s good for energy,
            you&apos;re an afternoon away from having it.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="#pricing" variant="light" size="lg" arrow>
              Get your page
            </ButtonLink>
            <ButtonLink href="#try" size="lg" className="border border-cream/25 !bg-transparent hover:!bg-cream/10">
              Try {KATE.first}&apos;s page
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer id="site-footer" className="bg-forest-deep pb-10 text-cream/70">
      <div className="container-x">
        <div className="flex flex-col gap-10 border-t border-cream/10 pt-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo tone="cream" />
            <p className="mt-4 text-[0.95rem] leading-relaxed">Made in Kenya, for people who sell BF Suma products.</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-[0.95rem]">
            <Link href="/#how" className="hover:text-cream">How it works</Link>
            <Link href="/check" className="hover:text-cream">An example page</Link>
            <Link href="/#workspace" className="hover:text-cream">Your workspace</Link>
            <Link href="/#pricing" className="hover:text-cream">Pricing</Link>
            <Link href="/login" className="hover:text-cream">Log in</Link>
            <Link href="/privacy" className="hover:text-cream">Privacy</Link>
          </nav>
        </div>
        <div className="mt-12 grid gap-3 border-t border-cream/10 pt-8 text-[0.8rem] leading-relaxed text-cream/50">
          <p>
            Suppli Afya is an independent business tool for distributors. It is not owned by, affiliated with or
            endorsed by BF Suma. Product names belong to their owners.
          </p>
          <p>
            The assessment gives general wellness information to help people choose products. It is not medical advice
            and does not diagnose, treat, cure or prevent any disease. Anyone who is pregnant, taking medicine or managing a health condition should
            speak to a health professional before taking supplements.
          </p>
          <p>© {new Date().getFullYear()} Suppli Afya</p>
        </div>
      </div>
    </footer>
  );
}
