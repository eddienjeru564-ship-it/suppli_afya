import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Reality } from "@/components/site/Reality";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Demo } from "@/components/site/Demo";
import { Portal } from "@/components/site/Portal";
import { Trust } from "@/components/site/Trust";
import { Calculator } from "@/components/site/Calculator";
import { Pricing } from "@/components/site/Pricing";
import { Setup } from "@/components/site/Setup";
import { Faq } from "@/components/site/Faq";
import { FinalCta, Footer } from "@/components/site/Footer";
import { MobileCta } from "@/components/site/MobileCta";

/**
 * The story runs in order: the distributor's reality → where sales leak →
 * how Suppli Afya fits in → try it → what you see each day →
 * why customers trust it → what it's worth → what it costs → how setup works → questions.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Reality />
        <HowItWorks />
        <Demo />
        <Portal />
        <Trust />
        <Calculator />
        <Pricing />
        <Setup />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
