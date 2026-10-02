import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

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
            <Link href="/#after" className="hover:text-cream">After the sale</Link>
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
