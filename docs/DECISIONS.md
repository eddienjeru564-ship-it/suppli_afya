# Open decisions and launch blockers

Things only the founder can supply or decide. Ordered by how much they block.

## Must have before sharing a real distributor link

1. **Official BF Suma Kenya catalogue.** Every product in `src/engine/catalogue.ts` is
   `verified: false`. We need, per product: exact name, pack size, full ingredients, label dose,
   manufacturer warnings, current retail price. Pay special attention to:
   - ArthroXtra: is the chondroitin from pork? Is the glucosamine from shellfish?
   - The 4 in 1 coffees: do they contain sugar and creamer? Is there a sugar-free version?
   - Novel Depile: the full ingredient list is missing.
   - Capsule shells: ProstatRelax's label lists gelatin, and most capsules probably use it. Is it
     from pork? That matters to customers who avoid pork, and no capsule is flagged for it today.
   - Probio3 and XPower Man Coffee: `supplyDays` assumes one sachet a day. Confirm the label dose.
   - Products we haven't included that should be (and any we included that are discontinued).

   Already read off the official pack photos (October 2026, 19 products): pack sizes, and these
   corrections. Relivin Tea is luobuma **and green tea**, so it has caffeine; its label says it's not
   for children, pregnancy or breastfeeding. It's no longer a sleep and stress pick: a caffeinated
   tea can't be the answer to poor sleep. YouthEver is a drink in 30 pouches, not capsules, and its
   label says it's not for pregnancy. Ez-Xlim is tablets. MicrO2 Cycle's dose is 3 tablets 3 times a
   day, so 100 tablets last about 11 days, not 30. ProstatRelax is epimedium extract; XPower Man
   Plus is epimedium and black ginger with maca, taurine and L-arginine; XPower Man Coffee adds
   ginseng, tongkat ali, maca and epimedium to a coffee latte.
2. **Pharmacist review of `src/engine/safety.ts`.** The rules are conservative general guidance,
   not a clinical interaction database. From the labels, ask specifically: ProstatRelax is the same
   herb (epimedium) as XPower Man Plus, which carries heart and blood pressure cautions; should it?
   Does the ginseng in XPower Man Coffee need a diabetes or blood thinner caution?
3. **A sleep and stress product.** With Relivin Tea out, nothing in the catalogue is a headline
   pick for "Sleep & stress": customers get habits and "your distributor can talk you through other
   options". Decide whether a BF Suma product genuinely fits, checked against its label.
4. **Suppli Afya support number.** Pro promises priority WhatsApp help. Decide the number and set
   `NEXT_PUBLIC_SUPPLI_WHATSAPP` (format `2547XXXXXXXX`); nothing on the site uses it yet.
5. **Domain.** Done: `suppliafya.co.ke` (and `www`) point at the main site, with DNS hosted on Vercel, and
   `NEXT_PUBLIC_SITE_URL` is `https://suppliafya.co.ke` in production. QR codes, cards and email links use it.
   Kate's storefront is `kate.suppliafya.co.ke`, on the storefront's own Vercel project.
6. **Legal review** of `/privacy`, the disclaimers in the footer and the health check, and ODPC
   registration. The portal now stores customers' health check answers when they choose to send
   them to a distributor, so this is required before real distributors sign up.
7. **Prices.** Set by the founder, October 2026: KES 1,500 / 3,500 / 6,500 (`src/config/plans.ts`). Still open: whether the app should hold Starter back from the follow-up list and orders, which the homepage now presents as Growth and Pro features, and when M-Pesa prompts to a distributor's own customers ship.
8. **Production database.** Set up: the Supabase project `suppli_afya-main_site`
   (`qadvlemdfypklscmbngc`, Ireland), reached as the app's own user `suppli_app` through the
   transaction pooler (port 6543; Vercel can't reach the direct connection, which is IPv6 only). See
   README, "The database". Still to decide: the Supabase plan. Free projects pause after a week
   without traffic, and have no daily backups.
9. **Payment keys.** Without keys, checkout runs in test mode (approve or decline on screen), which
   is allowed only outside production or with `PAYMENTS_ALLOW_TEST=true`. **Never set that on the
   live site.** For live payments:
   - M-Pesa (STK Push through **PayHero**): from the PayHero dashboard, `PAYHERO_API_USERNAME` and
     `PAYHERO_API_PASSWORD` (API Keys; or the ready-made `PAYHERO_AUTH_TOKEN` instead) and
     `PAYHERO_CHANNEL_ID` (Payment Channels → My Payment Channels: the Till, Paybill or bank account
     the money goes to). Nothing to configure for the callback: each prompt carries
     `<site>/api/payments/payhero/callback?token=…`, with a secret derived from the credentials
     (override with `PAYHERO_CALLBACK_TOKEN`). `NEXT_PUBLIC_SITE_URL` must be the public https URL.
     Then run `npm run payhero:check -- 07XXXXXXXX` to send yourself a KES 1 prompt end to end.
   - Card (Paystack, KES): `PAYSTACK_SECRET_KEY`. In the Paystack dashboard set the webhook URL to
     `<site>/api/payments/paystack/webhook`.
10. **Community link.** Set `NEXT_PUBLIC_COMMUNITY_URL` to the WhatsApp community invite. Until then
   the portal doesn't show the invite.

11. **Morning reminder (optional).** Generate VAPID keys (`npx web-push generate-vapid-keys`), set
    `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` and a random `CRON_SECRET`.
    `vercel.json` runs `/api/cron/morning` at 05:00 UTC (08:00 in Nairobi). Until the keys are set, the
    reminder simply doesn't appear.

12. **Storefront orders (optional).** Set the same random `STOREFRONT_SECRET` here and in the
    distributor storefront (`suppli_afya-distributor_template`), with its `SUPPLI_AFYA_URL` pointing
    here. Orders customers place on a live storefront with a `suppliSlug` then arrive through
    `/api/storefront/orders` in that distributor's Orders and on Today. Until it's set, the endpoint
    refuses everything and customers order on WhatsApp. The storefront asks customers for their phone
    number for this; orders this app can't take right away wait in the storefront's own database (at
    most 7 days) and are sent again.
13. **Email.** Set `RESEND_API_KEY` in Vercel (a sending-only key for `suppliafya.co.ke`). Decide where
    replies go: `hello@suppliafya.co.ke` doesn't receive mail, so set `EMAIL_REPLY_TO` to a mailbox someone reads,
    or turn on receiving in Resend.
14. **Kate Cromuel on the homepage.** The homepage, `/check` and the demo use Kate Cromuel
    ("Wellness Consultant") as the example distributor, in `src/config/distributors.ts` and
    `src/components/site/story.ts`. Confirm with Kate that her name and title can appear there. The
    demo has no phone number, so nothing on it opens a chat to her. If she'd rather not, change those
    two files; every section reads from them.
15. **Pro's M-Pesa prompts.** The homepage lists "M-Pesa STK push to your customer's phone" and
    "Automatic payment confirmation" on Pro, ahead of the build (founder decision). Build them
    before anyone pays for Pro: each Pro distributor's Till or Paybill as a PayHero payment channel,
    a "Request payment" button on the order page, and the PayHero callback marking the order paid.

## Decisions to make during the pilot

- **Automatic renewal.** Today every month is paid by hand (M-Pesa or card). Decide after the pilot
  whether card payers want automatic renewal.
- **Phone sign-in.** Accounts use email and password. Decide whether to add phone OTP.
- **Which distributors first.** Recommend 5–10 who already sell actively on WhatsApp, including
  at least one with a Till or Paybill and one without.
- **BF Suma relationship.** Whether to approach the company, and when. Check distributor policy
  on third-party tools, online price communication and use of product names.
- **Testimonials.** The site has none, on purpose: no made-up quotes. Add real quotes from pilot
  distributors, with their permission, to `src/config/testimonials.ts`; they appear on the homepage
  right after the live demo ("How Suppli Afya Works"). Until then the demo is the proof.
- **Swahili.** Whether the customer-facing health check should offer Swahili from day one.
- **Kids.** Whether to build a "for my child" flow for the Smart Kids range.

## Decisions already made (and why)

- **The website speaks to distributors; the health check speaks to customers.** The business is
  B2B. The check is the distributor's tool, and the best way to sell it is to let distributors try it.
- **WhatsApp handoff via `wa.me` links, no email capture.** Zero cost, works on every phone, matches
  how distributors already sell.
- **Pregnancy means no product plan.** Clinic first, even if it costs a sale.
- **No product photos or BF Suma branding.** Independence has to be visible. Products are shown as
  neutral pack renders by format and product line (`src/components/check/ProductGlyph.tsx`): a bottle,
  a carton, a jar, with no lettering, so they can't be mistaken for the real label.
- **The homepage shows what the product really produces.** Sarah's plan, the reasons, the WhatsApp
  message and Kate's first reply come from the engine; `src/components/site/story.test.ts` fails if they drift.
- **Demo distributor has no WhatsApp number.** The demo never opens a chat to a real person.
- **Public pricing, pay before setup.** Asked for by the founder: pricing → account → payment → setup
  → portal. A failed payment keeps the account and offers a retry; returning users never see setup again.
- **No product-categories step in onboarding.** Every distributor can sell the full range, so the
  answer wouldn't change anything in the portal. Add it only when something uses it.
- **"Independent distributor" business type, and a WhatsApp number in onboarding.** Most
  distributors don't have a shop, and the health check link needs a number to send plans to.
- **PayHero for M-Pesa, not Daraja directly.** PayHero handles the Safaricom side and settles to
  any Till, Paybill or bank channel. Each M-Pesa confirmation is double-checked against PayHero's
  status API, polling covers a missing callback, a late confirmation still activates the plan, and one
  account can send at most 5 prompts in 15 minutes (PayHero pauses accounts with many failed prompts).
- **The portal is an installable app (PWA), not an app-store app.** No store approval, instant updates, one
  codebase. iPhones need Share → Add to Home Screen (Apple offers no install button), and the installed app
  keeps its own login on iPhone, so we tell people they'll log in once.
- **Offline is read-first.** Portal pages you've opened are kept on the phone and open without signal;
  saves wait and retry when the connection returns (while the app is open). We don't queue saves across app
  restarts: a half-synced order is worse than a clear "you're offline".
- **One notification a day, at most.** The morning reminder only fires when someone needs the distributor,
  says who first, and never asks for permission until they turn it on.
- **Onboarding goals shape the Today list.** The goals a distributor picks decide which kind of
  follow-up comes first.
