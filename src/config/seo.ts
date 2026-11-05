import { PLAN } from "./plans";
import { site } from "./site";

/**
 * Search: the words people use to find a tool like this, and the structured data that describes
 * Suppli Afya to Google and to AI assistants. Plain facts only, the same ones the page states.
 */
export const KEYWORDS = [
  "BF Suma distributor Kenya",
  "BF Suma distributor tools",
  "sell BF Suma products online",
  "sell BF Suma on WhatsApp",
  "BF Suma online shop",
  "BF Suma product recommendations",
  "customer follow-up app Kenya",
  "reorder reminders",
  "WhatsApp business tool Kenya",
  "Suppli Afya",
];

export const ORG_ID = `${site.url}/#organization`;

export function organization() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    url: site.url,
    logo: `${site.url}/brand/logo-email.png`,
    image: `${site.url}/brand/mark.svg`,
    description:
      "Suppli Afya is an independent Kenyan business tool for BF Suma distributors: their own branded shop, personal product recommendations for customers, and an app for follow-ups, reorders and reminder texts. It is not owned by, affiliated with or endorsed by BF Suma.",
    areaServed: { "@type": "Country", name: "Kenya" },
    foundingLocation: { "@type": "Place", name: "Kenya" },
    slogan: site.tagline,
  };
}

export function website() {
  return {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: "en-KE",
    publisher: { "@id": ORG_ID },
  };
}

/** The product, with its real prices: the setup fee and the monthly subscription. */
export function software() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${site.url}/#app`,
    name: site.name,
    url: site.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    description: PLAN.tagline,
    publisher: { "@id": ORG_ID },
    audience: { "@type": "BusinessAudience", name: "BF Suma distributors in Kenya" },
    featureList: PLAN.groups.flatMap((g) => g.features.map((f) => f.title)),
    offers: [
      {
        "@type": "Offer",
        name: "Setup and first month",
        price: PLAN.setupFee,
        priceCurrency: "KES",
        url: `${site.url}/start`,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Monthly subscription, from the second month",
        price: PLAN.monthly,
        priceCurrency: "KES",
        url: `${site.url}/start`,
        availability: "https://schema.org/InStock",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: PLAN.monthly,
          priceCurrency: "KES",
          billingDuration: "P1M",
          unitCode: "MON",
        },
      },
    ],
  };
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${site.url}/#faq`,
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export const graph = (...nodes: Record<string, unknown>[]) => ({ "@context": "https://schema.org", "@graph": nodes });
