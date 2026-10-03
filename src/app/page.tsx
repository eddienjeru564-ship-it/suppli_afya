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
 * One story, seven sections: turn curiosity into customers → where sales get lost → share a link,
 * they get a plan, you close the sale → see it in action → know who needs you next → what
 * distributors usually ask → your page can be live this afternoon.
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
