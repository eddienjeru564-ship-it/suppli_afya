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
3. **Suppli Afya support number.** Pro promises priority WhatsApp help. Decide the number and set
   `NEXT_PUBLIC_SUPPLI_WHATSAPP` (format `2547XXXXXXXX`); nothing on the site uses it yet.
4. **Domain.** The site assumes `suppliafya.co.ke`. Set `NEXT_PUBLIC_SITE_URL` and
   `site.displayDomain` in `src/config/site.ts` to the real one. QR codes encode this URL.
5. **Legal review** of `/privacy`, the disclaimers in the footer and the health check, and ODPC
   registration. The portal now stores customers' health check answers when they choose to send
   them to a distributor, so this is required before real distributors sign up.
6. **Prices.** The plans in `src/config/plans.ts` are a proposal (KES 1,500 / 2,900 / 4,900).
7. **Production database.** Set `DATABASE_URL` to a hosted Postgres. The embedded database is for
   local development only; on Vercel its files would not survive a deploy.
8. **Payment keys.** Without keys, checkout runs in test mode (approve or decline on screen), which
   is allowed only outside production or with `PAYMENTS_ALLOW_TEST=true`. **Never set that on the
   live site.** For live payments:
   - M-Pesa (Daraja STK Push): `MPESA_ENV=production`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`,
     `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_TYPE` (`paybill` or `till`), `MPESA_TILL_NUMBER` for
     tills, and a long random `MPESA_CALLBACK_TOKEN`. The callback URL is built automatically:
     `<site>/api/payments/mpesa/callback?token=<MPESA_CALLBACK_TOKEN>`.
   - Card (Paystack, KES): `PAYSTACK_SECRET_KEY`. In the Paystack dashboard set the webhook URL to
     `<site>/api/payments/paystack/webhook`.
9. **Community link.** Set `NEXT_PUBLIC_COMMUNITY_URL` to the WhatsApp community invite. Until then
   the portal doesn't show the invite.

## Decisions to make during the pilot

- **Automatic renewal.** Today every month is paid by hand (M-Pesa or card). Decide after the pilot
  whether card payers want automatic renewal.
- **Phone sign-in.** Accounts use email and password. Decide whether to add phone OTP.
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
- **Public pricing, pay before setup.** Asked for by the founder: pricing → account → payment → setup
  → portal. A failed payment keeps the account and offers a retry; returning users never see setup again.
- **No product-categories step in onboarding.** Every distributor can sell the full range, so the
  answer wouldn't change anything in the portal. Add it only when something uses it.
- **"Independent distributor" business type, and a WhatsApp number in onboarding.** Most
  distributors don't have a shop, and the health check link needs a number to send plans to.
- **Onboarding goals shape the Today list.** The goals a distributor picks decide which kind of
  follow-up comes first.
