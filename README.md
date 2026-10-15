# Suppli Afya

Turn curiosity into customers.

Suppli Afya gives each BF Suma distributor in Kenya their own page. Customers reach it from a link
or a QR card, answer a short assessment, see which products fit what they're looking for, and
carry the conversation to the distributor on WhatsApp. Behind the page, a workspace remembers every
customer, so the distributor knows who to follow up with, who owes them and who's due to reorder.
This repository holds the website, the distributor's page and assessment, the recommendation engine
behind it, and the distributor's workspace.

- `/`: the website for distributors, with a live demo of Kate Cromuel's page
- `/check`: a distributor's page as a customer sees it (the demo distributor, Kate)
- `/d/<slug>`: a distributor's own page (the QR card points here)
- `/start`: choose a plan, create an account, pay, set up
- `/portal`: the distributor's workspace (Today, Prospects, Orders, Customers, Settings)
- `/login`: returning distributors

Customers read "the assessment"; the code still calls the engine the health check (`src/engine/`).

Distributors can install the portal on their phone as an app (see "The installed app" below).

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # engine, billing and daily-list tests
npm run build
npx playwright test  # end-to-end tests against a production build
npm run payhero:check -- 07XXXXXXXX  # once PayHero keys are in .env.local: a real KES 1 prompt
```

## Configuration

Every variable is listed in `.env.example`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public URL, used in link previews and QR codes |
| `NEXT_PUBLIC_SUPPLI_WHATSAPP` | Team WhatsApp number (`2547XXXXXXXX`) |
| `NEXT_PUBLIC_COMMUNITY_URL` | WhatsApp community invite shown in the portal (hidden if unset) |
| `DATABASE_URL` | Postgres connection string. Unset: embedded Postgres in `PGLITE_DIR` (default `.data/pglite`) |
| `PAYHERO_*` | M-Pesa prompts through PayHero, see `.env.example` and `docs/DECISIONS.md` |
| `PAYSTACK_SECRET_KEY` | Card payments through Paystack |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Morning reminder notifications (optional; hidden until set) |
| `STOREFRONT_SECRET` | Shared with the distributor storefronts. Signs orders they file through `/api/storefront/orders` |
| `CRON_SECRET` | Protects `/api/cron/morning`, which sends the reminders at 8am (see `vercel.json`) |
| `PAYMENTS_ALLOW_TEST` | `true` allows on-screen test payments in production builds. Never on the live site |

Without payment keys, checkout runs in test mode in development. The demo distributor lives in
`src/config/distributors.ts`; real distributors come from the database after they sign up.

## Deploying on Vercel

The Vercel project is `suppli-afya-main-site`, linked to `eddienjeru564-ship-it/suppli_afya`.
`vercel.json` runs functions in Dublin (`dub1`, next to the database) and schedules the morning reminder.

- **`DATABASE_URL` is required.** Vercel's disk is read-only, so the embedded database can't be used there.
  The database is the Supabase project **`suppli_afya-main_site`** (ref `qadvlemdfypklscmbngc`, Ireland,
  `eu-west-1`). The storefront has its own Supabase project; never point this app at it. See "The database" below.
- **`NEXT_PUBLIC_SITE_URL`** can wait: until it's set, links, QR codes and callbacks use the deploy's own
  address (the production domain, or the branch address on previews).
- **A test deploy without payment keys** needs `PAYMENTS_ALLOW_TEST=true`, because Vercel builds are
  production builds. Remove it before the site goes live.
- **Storefronts:** set the same `STOREFRONT_SECRET` here and on the storefront deploy, and point the
  storefront's `SUPPLI_AFYA_URL` at this site's production address. The storefront's server calls it,
  so that address must be public: limit Vercel Authentication (Deployment Protection) to previews.

## The database

The app talks to Postgres directly (`src/server/db.ts`) and creates its own tables on first connect from the
migrations in `src/server/schema.ts`. It never uses Supabase's Data API, Auth or Storage.

- **Its own database user.** The app connects as `suppli_app`, not as `postgres`. It owns the app's tables and
  can't bypass row level security, create roles or touch Supabase's own schemas. Use the transaction pooler
  (port 6543, IPv4, which Vercel needs). The host is the project's pooler cluster; copy it from Supabase → Connect →
  Transaction pooler rather than guessing (a region has more than one, and a wrong one gives "tenant/user not found"):
  `postgres://suppli_app.qadvlemdfypklscmbngc:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require`
  Don't add `?pgbouncer=true` (a Prisma setting; Postgres rejects it) and keep `sslmode=require`.
- **Nothing is readable through the Data API.** Supabase grants its public API roles (`anon`, `authenticated`) every
  table that `postgres` creates. Tables owned by `suppli_app` get no such grants, and migration 4 switches on row
  level security with no policies, so the API sees no rows even if a grant slips in later. A test
  (`schema.test.ts`) checks this against every table, so a new migration must enable RLS on its tables.
- **Rotating the password:** in the Supabase SQL editor, `alter role suppli_app password '…'`, then update
  `DATABASE_URL` in Vercel (Production and Preview) and redeploy.
- **Viewing data:** the dashboard's `postgres` role is a member of `suppli_app`, so the Table Editor and SQL
  editor can read and change the app's tables.

## Email

The app sends email through Resend (`src/server/email/`), from `hello@suppliafya.co.ke`. The domain's DNS
records (DKIM, SPF, DMARC) are on Vercel, which hosts the domain's DNS. Set `RESEND_API_KEY` in Vercel; without
it nothing is sent, and outside production each email is printed in the server log instead.

| Email | When |
|---|---|
| Welcome | The first payment goes through: the subscription is active, next set up your page, with the receipt |
| Payment received | Every later payment: a receipt |
| Your page is live | Onboarding finishes: the link, how to share it, the QR card |
| Reset your password | Someone asks on `/login/forgot` (at most 3 an hour per account; the link works once, for an hour) |
| Your password was changed | A reset goes through; every other session is signed out |
| Your subscription ends on… | The morning job, 3 days before the paid period ends (nothing renews automatically) |
| Your subscription has ended | The morning job, once the period has ended: the page stays open 3 more days |

Templates are pure functions in `templates.ts` (subject, HTML and plain text). Each event is recorded in
`email_log` before sending, so a retried webhook or a second cron run sends nothing twice; if Resend can't be
reached, the record is released and the next run tries again. An email never fails a payment or a sign-up.

## The installed app

The portal is a Progressive Web App. `src/app/manifest.ts` describes it, `src/pwa/service-worker.ts`
is the service worker (served from `/sw.js` with the deploy's version), and `src/components/pwa/`
holds the install offers, update prompt, connection bar and morning reminder.

- **Installing:** on Android and desktop Chrome/Edge, an Install button opens the browser's own dialog. On
  iPhone, clear Share → Add to Home Screen steps. Inside Instagram/Facebook, instructions to open the browser
  first. Offered on Today (phones, dismissable) and always in Settings.
- **Offline:** built files are cached; portal pages you've opened are kept on the phone and open without
  signal, with a bar saying when they were saved. Saves made while offline wait and go through when the
  connection returns. Saved pages are deleted on log out, or as soon as the server says you're signed out.
- **Updates:** each deploy is a new service worker; the app shows "A new version is ready" with an Update
  button, and never swaps versions underneath someone mid-task.
- **Sessions:** using the portal keeps the session alive (30 days from the last visit).
- **Icons:** regenerate with `node scripts/generate-icons.mjs`; app screenshots with
  `SCREENSHOTS=1 npx playwright test e2e/screenshots.spec.ts --project=mobile`.

## Docs

See `docs/` for strategy, voice, the engine and open decisions. Start with `docs/BRAIN.md`.
