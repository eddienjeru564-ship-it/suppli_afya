# Suppli Afya

Sell more. Follow up less.

Suppli Afya helps BF Suma distributors in Kenya turn enquiries into first orders, and first
orders into customers who keep coming back. This repository holds the website, the customer
health check and the recommendation engine behind it.

- `/`: the website for distributors, with a live demo of the health check
- `/check`: the health check as a customer sees it (demo distributor)
- `/d/<slug>`: a distributor's own shop: browse, product pages, the health check (`/check`), basket and ordering. The QR card points here. Example: `/d/kate-cromuel`
- `/start`: choose a plan, create an account, pay, set up
- `/portal`: the distributor portal (Today, Prospects, Orders, Customers, Settings)
- `/login`: returning distributors

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
| `CRON_SECRET` | Protects `/api/cron/morning`, which sends the reminders at 8am (see `vercel.json`) |
| `PAYMENTS_ALLOW_TEST` | `true` allows on-screen test payments in production builds. Never on the live site |

Without payment keys, checkout runs in test mode in development. The demo distributor lives in
`src/config/distributors.ts`; real distributors come from the database after they sign up.

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
- **Product photos:** official images go in `assets/products/` (see its README), then `node scripts/product-images.mjs`.
- **Icons:** regenerate with `node scripts/generate-icons.mjs`; app screenshots with
  `SCREENSHOTS=1 npx playwright test e2e/screenshots.spec.ts --project=mobile`.

## Docs

See `docs/` for strategy, voice, the engine and open decisions. Start with `docs/BRAIN.md`.
