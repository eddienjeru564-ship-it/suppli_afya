import { PLAN, kes } from "@/config/plans";
import { site } from "@/config/site";
import { GUIDES } from "@/content/guides";
import { FAQ } from "@/components/site/faq-data";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain summary of Suppli Afya for AI assistants (llmstxt.org), so answers about it
 * are accurate. Built from the same config as the site, so prices and features never drift.
 */
export function GET() {
  const features = PLAN.groups.map((g) => `### ${g.title}\n${g.features.map((f) => `- ${f.title}: ${f.body}`).join("\n")}`).join("\n\n");
  const body = `# ${site.name}

> ${site.name} is an independent Kenyan business tool for people who sell BF Suma products. Each distributor gets their own branded online shop, a short assessment that suggests products to each customer with the reasons, and an app that lists who to follow up with each morning, tracks reorders and sends reminder texts in the distributor's name. Our team sets everything up. ${site.name} is not owned by, affiliated with or endorsed by BF Suma.

- Website: ${site.url}
- Country: Kenya
- Who it's for: BF Suma distributors (independent sellers, pharmacies and wellness shops)
- Price: ${kes(PLAN.setupFee)} once for setup and the first month, then ${kes(PLAN.monthly)} a month. One subscription, everything included, no contract. Pay by M-Pesa or card.
- Example distributor shop: https://kate.suppliafya.co.ke
- The assessment gives general wellness information to help customers choose products. It is not medical advice and never says a product treats, cures or prevents a disease.

## What's included

${features}

## Pages

- [Home](${site.url}/): how it works, a live demo of a distributor's page, pricing and common questions
- [Pricing](${site.url}/#pricing)
- [Example assessment](${site.url}/check)
- [Get started](${site.url}/start)
- [Privacy](${site.url}/privacy)

## Guides

${GUIDES.map((g) => `- [${g.title}](${site.url}/guides/${g.slug}): ${g.description}`).join("\n")}

## Common questions

${FAQ.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
