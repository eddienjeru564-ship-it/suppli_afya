import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { YourPage } from "@/components/site/YourPage";
import { Tour } from "@/components/site/Tour";
import { Handoff } from "@/components/site/Handoff";
import { Workspace } from "@/components/site/Workspace";
import { NotAStore } from "@/components/site/NotAStore";
import { Yours } from "@/components/site/Yours";
import { Demo } from "@/components/site/Demo";
import { Pricing } from "@/components/site/Pricing";
import { Faq } from "@/components/site/Faq";
import { FinalCta, Footer } from "@/components/site/Footer";
import { MobileCta } from "@/components/site/MobileCta";

/**
 * One business loop, front door first: the distributor's own page → how interest gets lost today
 * → the page itself, with your name on it → the whole journey in seven steps → the WhatsApp
 * handoff → what the workspace keeps after the sale → why it isn't a shop → what stays yours →
 * try the real thing → what it costs → questions.
 * Suppli Afya's customer is the distributor; the page is how it serves them.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <YourPage />
        <Tour />
        <Handoff />
        <Workspace />
        <NotAStore />
        <Yours />
        <Demo />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
