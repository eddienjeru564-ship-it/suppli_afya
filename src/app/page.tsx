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
 * in three steps → proof: try the real thing, and what you can trust → the second layer, kept
 * light: it remembers every customer → the questions that stop people → the offer, on one card.
 * The page leads with the simplest version of the offer and lets the depth show up when it's needed.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Demo />
        <Workspace />
        <Faq />
        <Pricing />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
