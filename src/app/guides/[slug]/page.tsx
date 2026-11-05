import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, GUIDES_BY_SLUG } from "@/content/guides";
import { site } from "@/config/site";
import { ORG_ID } from "@/config/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { GuideCta } from "@/components/site/GuideCta";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Button";
import { Check, ChevronLeft } from "@/components/ui/icons";
import { keepTogether } from "@/components/ui/KeepTogether";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const g = GUIDES_BY_SLUG[slug];
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: {
      title: g.title,
      description: g.description,
      url: `/guides/${g.slug}`,
      type: "article",
      publishedTime: g.published,
      modifiedTime: g.updated,
      authors: [site.name],
    },
  };
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function GuidePage(props: PageProps<"/guides/[slug]">) {
  const { slug } = await props.params;
  const g = GUIDES_BY_SLUG[slug];
  if (!g) notFound();
  const others = GUIDES.filter((o) => o.slug !== g.slug);
  const url = `${site.url}/guides/${g.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: g.title,
              description: g.description,
              url,
              mainEntityOfPage: url,
              datePublished: g.published,
              dateModified: g.updated,
              inLanguage: "en-KE",
              author: { "@id": ORG_ID },
              publisher: { "@id": ORG_ID },
              image: `${site.url}/opengraph-image`,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Suppli Afya", item: site.url },
                { "@type": "ListItem", position: 2, name: "Guides", item: `${site.url}/guides` },
                { "@type": "ListItem", position: 3, name: g.title, item: url },
              ],
            },
          ],
        }}
      />
      <Nav />
      <main className="pb-20 pt-28 sm:pb-28 sm:pt-36">
        <article className="container-x">
          <Reveal className="mx-auto max-w-[42rem]">
            <Link href="/guides" className="inline-flex items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink">
              <ChevronLeft className="h-3.5 w-3.5" /> Guides
            </Link>
            <h1 className="mt-5 text-balance font-display text-[2.3rem] leading-[1.06] tracking-[-0.02em] text-ink sm:text-[3.2rem]">{g.title}</h1>
            <p className="mt-5 text-[1.12rem] leading-relaxed text-ink-soft">{keepTogether(g.summary)}</p>
            <p className="mt-5 text-[0.85rem] text-ink-mute">
              {g.readMinutes} minute read · Updated <time dateTime={g.updated}>{DATE.format(new Date(g.updated))}</time>
            </p>
          </Reveal>

          <div className="mx-auto mt-10 max-w-[42rem] border-t border-ink/10 pt-4">
            {g.sections.map((s) => (
              <Reveal as="section" key={s.heading} className="mt-10">
                <h2 className="font-display text-[1.65rem] leading-tight tracking-[-0.01em] text-ink sm:text-[1.9rem]">{s.heading}</h2>
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="mt-4 text-[1.04rem] leading-[1.75] text-ink-soft">
                    {keepTogether(p)}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-5 grid gap-3 rounded-[1.4rem] bg-paper p-5 ring-1 ring-ink/[0.06] sm:p-6">
                    {s.list.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[1rem] leading-relaxed text-ink">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-moss" />
                        <span>{keepTogether(item)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))}
            <p className="mt-12 rounded-2xl bg-sand/50 px-5 py-4 text-[0.88rem] leading-relaxed text-ink-mute">
              Suppli Afya is an independent business tool for distributors. It is not owned by, affiliated with or endorsed by BF
              Suma. Nothing here is medical advice.
            </p>
          </div>

          <Reveal className="mx-auto mt-14 max-w-[56rem]">
            <GuideCta />
          </Reveal>

          <div className="mx-auto mt-16 max-w-[56rem]">
            <h2 className="font-display text-[1.6rem] text-ink">More guides</h2>
            <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/guides/${o.slug}`}
                    className="group flex h-full flex-col rounded-[1.4rem] bg-paper p-5 ring-1 ring-ink/[0.07] transition-[box-shadow,transform] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-card"
                  >
                    <span className="font-display text-[1.3rem] leading-snug text-ink">{o.title}</span>
                    <span className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">{o.summary}</span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-forest">
                      Read <Arrow className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
