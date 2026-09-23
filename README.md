# Suppli Afya

Sell more. Follow up less.

Suppli Afya helps BF Suma distributors in Kenya turn enquiries into first orders, and first
orders into customers who keep coming back. This repository holds the website, the customer
health check and the recommendation engine behind it.

- `/`: the website for distributors, with a live demo of the health check
- `/check`: the health check as a customer sees it (demo distributor)
- `/d/<slug>`: a distributor's own health check link (the QR card points here)
- `/start`: choose a plan, create an account, pay, set up
- `/portal`: the distributor portal (Today, Prospects, Orders, Customers, Settings)
- `/login`: returning distributors

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # engine, billing and daily-list tests
npm run build
npx playwright test  # end-to-end tests against a production build
```

## Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public URL, used in link previews and QR codes |
| `NEXT_PUBLIC_SUPPLI_WHATSAPP` | Team WhatsApp number (`2547XXXXXXXX`) |
| `NEXT_PUBLIC_COMMUNITY_URL` | WhatsApp community invite shown in the portal (hidden if unset) |
| `DATABASE_URL` | Postgres connection string. Unset: embedded Postgres in `PGLITE_DIR` (default `.data/pglite`) |
| `MPESA_*` | Daraja STK Push keys, see `docs/DECISIONS.md` |
| `PAYSTACK_SECRET_KEY` | Card payments through Paystack |
| `PAYMENTS_ALLOW_TEST` | `true` allows on-screen test payments in production builds. Never on the live site |

Without payment keys, checkout runs in test mode in development. The demo distributor lives in
`src/config/distributors.ts`; real distributors come from the database after they sign up.

## Docs

See `docs/` for strategy, voice, the engine and open decisions. Start with `docs/BRAIN.md`.
