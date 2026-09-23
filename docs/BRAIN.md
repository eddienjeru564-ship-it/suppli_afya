# Suppli Afya: the brain

This is the working definition of the company. Read it before making product, copy or
engineering decisions. It builds on the founder's baseline context (September 2026) and on
what we learned while building the first version.

## What Suppli Afya is

A sales and customer system for BF Suma distributors in Kenya. It helps a distributor turn
the people who ask about products into customers who order, pay and come back.

The loop it serves, and the test every feature must pass:

```
Lead → Follow-up → Customer → Order → Payment → Repeat order
```

If a feature doesn't help a distributor acquire, convert, retain or reorder, it probably
doesn't belong in the core product.

Public line: **Sell more. Follow up less.**

It is not a supplement shop, a chatbot, a generic CRM, a payment gateway or a health app.
The health check is the entry point into the distributor's pipeline, not the product itself.

## Two audiences, two voices

| | Distributor | Customer |
|---|---|---|
| Where they meet us | The website, the portal | The health check, via a distributor's link or QR card |
| What they want | More orders, less chasing, getting paid, repeat business | Advice that's about them, from someone they can trust |
| Voice | A sharp founder talking to another distributor | A calm, warm, careful guide |
| Pays? | Yes, a monthly subscription | Never pays Suppli Afya |

The marketing site speaks to distributors. The health check speaks to customers. Don't mix
the two: no sales talk in the check, no wellness fluff on the site.

## What we took from Vitable, and what we changed

Vitable (Australia) proved that a short, personal quiz followed by a plan that explains *why*
turns browsers into buyers. We copied the mechanics that make that work:

- Sections with calm interstitial screens, one question per screen, auto-advance on taps.
- A ranked goal picker that opens goal-specific follow-ups (multiple goals, not exclusive paths).
- Helper text and "why we ask" lines that build trust and keep people going.
- A results page that feels like a consultation: "because you said…", honest expectations.

What we changed for BF Suma and Kenya:

- **The plan hands off to a person, not a cart.** The last step is WhatsApp to the distributor,
  with answers and plan pre-written and a reference code. The distributor closes.
- **A real safety check.** Pregnancy, medicines (including ARVs and blood thinners),
  conditions, shellfish/soy allergies, pork avoidance (halal), caffeine. Products are left out
  and the customer is told why. Pregnancy means no product plan: clinic first.
- **"How would you like to start?"** BF Suma products cost roughly KES 3,000–25,000 each. Customers pick
  one product, a focused plan or a complete plan; the distributor sees that appetite.
- **Local detail.** Chai with sugar counts as a sugary drink; sukuma and managu are vegetables;
  uji for breakfast; chama meetings and WhatsApp status as distribution channels.
- **Habits that cost nothing.** Every plan includes practical, product-free changes. This is
  the value pillar: people get something useful before anyone asks them to buy.
- **No email capture.** The WhatsApp message *is* the lead. Less friction, more trust.

Vitable questions we dropped: CoQ10 prescription, sperm health, Ayurveda beliefs, cold sores,
paleo, email. They don't map to BF Suma's range or to how people buy here.

## The three pillars, made concrete

**Value.** The customer gets a genuinely useful assessment, plain explanations, honest
timelines, and habits that help without buying anything. The distributor gets a customer who
arrives informed. Value comes first; the sale follows.

**Leverage.** One link or QR card does the first conversation for the distributor, at 9pm, for
fifty people at a chama meeting, while they're busy. The portal turns memory into a list: who
to talk to today, and why. The distributor's effort goes into closing, not chasing.

**Outcome.** We talk about orders, payments and reorders, not features. The site's calculator
uses the distributor's own numbers. Internally we measure outcomes (below). Pricing should be
anchored to outcomes too (see "Pricing").

Trust and longevity come from all three: careful advice protects the customer and the
distributor's name, and a customer who trusted the advice is the one who reorders and refers.

## Metrics that matter

For the product, in funnel order:

1. Health check starts per distributor link (is the link being shared?)
2. Completion rate (set a target once the pilot gives us a baseline; watch where people drop off)
3. Completed → WhatsApp sent
4. WhatsApp sent → first order (reported by the distributor in the portal)
5. First order → reorder within 60 days
6. Distributor retention after 90 days, and whether they'd be upset to lose it

Vanity metrics to ignore: page views, number of questions answered, "engagement".

## Pricing (not settled)

Current public position: a single monthly subscription, price agreed with early-access
distributors before they commit. Recommendation for the pilot:

- Price so that **two extra reorders a month clearly cover it**. With an average order around
  KES 6,500, that makes roughly KES 1,500–2,500 a month an easy yes. Test it; don't guess.
- Consider a **founding rate** locked for the first cohort, in exchange for honest feedback and a case study.
- Consider an **outcome guarantee** for the pilot ("if you don't see X reorders in 60 days, you
  don't pay for month three"). Only offer it once the portal can measure reorders reliably.
- Don't show tiers publicly until the pilot tells us what distributors actually value.

## Honest risks

- **Catalogue accuracy.** The product data was compiled from public listings, not the official
  catalogue. Every recommendation depends on it. See `docs/DECISIONS.md`.
- **Health claims.** Resellers online routinely claim BF Suma products "cure" diabetes, cancer or
  erectile dysfunction. We never do. Kenya's Pharmacy and Poisons Board regulates health
  claims, and one bad claim can end a distributor's business. The engine's copy rules exist for this.
- **Sensitive data.** Health answers are sensitive personal data under Kenya's Data Protection Act,
  2019. Before storing real customer data: register with the ODPC, get legal review of the
  privacy notice, collect explicit consent, and keep data minimal.
- **BF Suma's position.** We're independent and must look it: no BF Suma logos or product photos,
  clear disclaimer, no impersonation. Check BF Suma's distributor policy on online tools and
  price communication before scaling. A good relationship with the company would help; a bad one could hurt.
- **M-Pesa reality.** STK Push only works for Till/Paybill holders with Daraja credentials. Many
  distributors are probably paid on personal lines (confirm in the pilot). Manual payment recording must be first-class.
  Collecting money on behalf of distributors would raise licensing questions; avoid it.
- **WhatsApp dependency.** The handoff is a `wa.me` link, which is free and robust. The WhatsApp
  Business API (for templated reminders) costs money per conversation and needs approval; don't
  build the core loop on it.
- **Willingness to pay.** The biggest unknown. The pilot's job is to answer it.

## Roadmap (smallest thing that proves distributors will pay)

**Phase 1: done in this repo.** Marketing site, working health check engine, distributor links
(`/d/<slug>`), QR card, WhatsApp handoff, demo portal views, link previews.

**Phase 2: portal MVP for 5–10 pilot distributors.**
- Auth by phone number (OTP via SMS or WhatsApp link).
- Lead inbox fed by completed checks (store the result server-side, matched by reference code).
- Customer records: add manually, import from phone contacts/CSV.
- Orders with manual payment recording (M-Pesa code, amount, date).
- Reorder reminders from `supplyDays` per product; "gone quiet" list.
- The "Today" list. This is the product.

**Phase 3: payments and reminders.**
- Daraja STK Push for distributors with a Till/Paybill.
- Pre-written reminder messages opened via `wa.me` (no API cost).
- Printable QR cards generated per distributor.

**Phase 4: only if the pilot asks for it.**
- Upline/team views, analytics, subdomains, kids' health check (BF Suma's Smart Kids range),
  Swahili version of the health check.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS v4, Motion. Static pages today; deploy on Vercel.
For Phase 2: Supabase (Postgres, auth, row-level security per distributor) is the pragmatic choice.
