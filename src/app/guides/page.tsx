import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { site } from "@/config/site";
import { ORG_ID } from "@/config/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { GuideCta } from "@/components/site/GuideCta";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Guides for BF Suma distributors",
  description:
    "Practical guides for BF Suma distributors in Kenya: selling on WhatsApp, following up with customers and getting more repeat orders.",
  alternates: { canonical: "/guides" },
  openGraph: { title: "Guides for BF Suma distributors · Suppli Afya", url: "/guides", type: "website" },
};

export default function GuidesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Guides for BF Suma distributors",
          url: `${site.url}/guides`,
          publisher: { "@id": ORG_ID },
          hasPart: GUIDES.map((g) => ({ "@type": "Article", headline: g.title, url: `${site.url}/guides/${g.slug}` })),
        }}
      />
      <Nav />
      <main className="pb-20 pt-28 sm:pb-28 sm:pt-36">
        <div className="container-x">
          <Reveal className="max-w-[44rem]">
            <h1 className="display-lg text-ink">Guides for BF Suma Distributors</h1>
            <p className="lede mt-5 max-w-[36rem]">
              Plain, practical advice on the parts of the work that decide your income: answering &quot;which one should I
              take?&quot;, following up, and getting the reorder.
            </p>
          </Reveal>
          <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 md:grid-cols-3 md:gap-5">
            {GUIDES.map((g, i) => (
              <Reveal as="li" key={g.slug} delay={0.05 * i} className="min-w-0">
                <Link
                  href={`/guides/${g.slug}`}
                  className="group flex h-full flex-col rounded-[1.6rem] bg-paper p-6 ring-1 ring-ink/[0.07] transition-[box-shadow,transform] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-card"
                >
                  <span className="text-[0.8rem] font-semibold text-moss">{g.readMinutes} minute read</span>
                  <h2 className="mt-3 font-display text-[1.55rem] leading-[1.15] text-ink">{g.title}</h2>
                  <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">{g.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[0.92rem] font-semibold text-forest">
                    Read the guide <Arrow className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-16 sm:mt-20">
            <GuideCta />
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
