# Open decisions and launch blockers

Things only the founder can supply or decide. Ordered by how much they block.

## Must have before sharing a real distributor link

1. **Official BF Suma Kenya catalogue.** Every product in `src/engine/catalogue.ts` is
   `verified: false`. We need, per product: exact name, pack size, full ingredients, label dose,
   manufacturer warnings, current retail price. Pay special attention to:
   - ArthroXtra: is the chondroitin from pork? Is the glucosamine from shellfish?
   - The 4 in 1 coffees: do they contain sugar and creamer? Is there a sugar-free version?
   - Relivin Tea: listings disagree on ingredients (herbal only, or green tea?). Caffeine matters.
   - ProstatRelax, XPower Man Plus, Novel Depile: full ingredient lists are missing.
   - Products we haven't included that should be (and any we included that are discontinued).
2. **Pharmacist review of `src/engine/safety.ts`.** The rules are conservative general guidance,
   not a clinical interaction database.
3. **Suppli Afya WhatsApp number.** Set `NEXT_PUBLIC_SUPPLI_WHATSAPP` (format `2547XXXXXXXX`). Until
   then the early-access form shows the message for copying instead of opening WhatsApp.
4. **Domain.** The site assumes `suppliafya.co.ke`. Set `NEXT_PUBLIC_SITE_URL` and
   `site.displayDomain` in `src/config/site.ts` to the real one. QR codes encode this URL.
5. **Legal review** of `/privacy`, the disclaimers in the footer and the health check, and ODPC
   registration before storing any customer's answers on a server.

## Decisions to make during the pilot

- **Pricing display.** Currently: "single monthly subscription, agreed before you commit". See
  pricing notes in `docs/BRAIN.md`.
- **Which distributors first.** Recommend 5–10 who already sell actively on WhatsApp, including
  at least one with a Till or Paybill and one without.
- **BF Suma relationship.** Whether to approach the company, and when. Check distributor policy
  on third-party tools, online price communication and use of product names.
- **Testimonials.** The site has none, on purpose. Add real quotes and real numbers from pilot
  distributors, with permission. Never invent them.
- **Swahili.** Whether the customer-facing health check should offer Swahili from day one.
- **Kids.** Whether to build a "for my child" flow for the Smart Kids range.

## Decisions already made (and why)

- **The website speaks to distributors; the health check speaks to customers.** The business is
  B2B. The check is the distributor's tool, and the best way to sell it is to let distributors try it.
- **WhatsApp handoff via `wa.me` links, no email capture.** Zero cost, works on every phone, matches
  how distributors already sell.
- **Pregnancy means no product plan.** Clinic first, even if it costs a sale.
- **No product photos or BF Suma branding.** Independence has to be visible.
- **Demo distributor has no WhatsApp number.** The demo never opens a chat to a real person.
