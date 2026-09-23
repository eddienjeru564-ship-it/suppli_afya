import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Reality } from "@/components/site/Reality";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Demo } from "@/components/site/Demo";
import { Portal } from "@/components/site/Portal";
import { Week } from "@/components/site/Week";
import { Trust } from "@/components/site/Trust";
import { CardSection } from "@/components/site/CardSection";
import { Calculator } from "@/components/site/Calculator";
import { EarlyAccess } from "@/components/site/EarlyAccess";
import { Faq } from "@/components/site/Faq";
import { FinalCta, Footer } from "@/components/site/Footer";
import { MobileCta } from "@/components/site/MobileCta";

/**
 * The story runs in order: the distributor's reality → where sales leak →
 * how Suppli Afya fits in → try it → what you see each day → before/after →
 * why customers trust it → your card → what it's worth → join → questions.
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
        <Week />
        <Trust />
        <CardSection />
        <Calculator />
        <EarlyAccess />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
