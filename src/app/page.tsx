import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { Journey } from "@/components/site/Journey";
import { YourPage } from "@/components/site/YourPage";
import { Demo } from "@/components/site/Demo";
import { Trust } from "@/components/site/Trust";
import { Workspace } from "@/components/site/Workspace";
import { Share } from "@/components/site/Share";
import { FollowUp } from "@/components/site/FollowUp";
import { Calculator } from "@/components/site/Calculator";
import { Pricing } from "@/components/site/Pricing";
import { Faq } from "@/components/site/Faq";
import { FinalCta, Footer } from "@/components/site/Footer";
import { MobileCta } from "@/components/site/MobileCta";

/**
 * The story is the distributor's customer journey, front door first: your page → why interest
 * gets lost → the whole journey, one customer from scan to reorder → the page itself → try it →
 * why it's safe → what the workspace remembers → where to share the page → keeping customers
 * after the first sale → what it's worth → what it costs → questions.
 * Suppli Afya's customer is the distributor; the page is how it serves them.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Journey />
        <YourPage />
        <Demo />
        <Trust />
        <Workspace />
        <Share />
        <FollowUp />
        <Calculator />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
