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
 * One story, seven sections, each titled for what it is: the hero → where WhatsApp sales get lost →
 * how Suppli Afya works → an example distributor page → your daily follow-up list → common
 * questions → choose what works for your business (the plans).
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
