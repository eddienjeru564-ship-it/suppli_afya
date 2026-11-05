import type { Metadata } from "next";
import { faqPage, graph, organization, software, website } from "@/config/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/site/faq-data";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { Demo } from "@/components/site/Demo";
import { Workspace } from "@/components/site/Workspace";
import { YourPage } from "@/components/site/YourPage";
import { Faq } from "@/components/site/Faq";
import { Pricing } from "@/components/site/Pricing";
import { Footer } from "@/components/site/Footer";
import { MobileCta } from "@/components/site/MobileCta";

/**
 * One story, in order of what matters: the hero → where WhatsApp sales get lost → how it works,
 * by trying it (answers → recommendation → WhatsApp → the distributor gets the enquiry, and it
 * stops there) → and it doesn't stop at the enquiry (the daily follow-up list) → your name, your
 * page, your customers → common questions → pricing.
 */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <JsonLd data={graph(organization(), website(), software(), faqPage(FAQ))} />
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Demo />
        <Workspace />
        <YourPage />
        <Faq />
        <Pricing />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
