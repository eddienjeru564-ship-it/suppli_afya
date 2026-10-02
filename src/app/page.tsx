import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Demo } from "@/components/site/Demo";
import { Workspace } from "@/components/site/Workspace";
import { Faq } from "@/components/site/Faq";
import { Pricing } from "@/components/site/Pricing";
import { Footer } from "@/components/site/Footer";
import { MobileCta } from "@/components/site/MobileCta";

/**
 * Seven sections, one decision. The promise (your own page) → the pain it removes → how it works,
 * in three steps → what keeps the customer after the sale (the workspace) → try the real thing,
 * with what you can trust → the questions that stop people → the offer, on one card.
 * Everything you'd pay for is shown before you're asked to try it or buy it.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Workspace />
        <Demo />
        <Faq />
        <Pricing />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
