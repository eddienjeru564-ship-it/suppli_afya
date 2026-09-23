# Suppli Afya

Sell more. Follow up less.

Suppli Afya helps BF Suma distributors in Kenya turn enquiries into first orders, and first
orders into customers who keep coming back. This repository holds the website, the customer
health check and the recommendation engine behind it.

- `/`: the website for distributors, with a live demo of the health check
- `/check`: the health check as a customer sees it (demo distributor)
- `/d/<slug>`: a distributor's own health check link (the QR card points here)

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # engine tests
npm run build
npx playwright test  # end-to-end tests against a production build
```

## Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public URL, used in link previews and QR codes |
| `NEXT_PUBLIC_SUPPLI_WHATSAPP` | Team WhatsApp number (`2547XXXXXXXX`) for early-access applications |

Distributors are configured in `src/config/distributors.ts` until the portal exists.

## Docs

See `docs/` for strategy, voice, the engine and open decisions. Start with `docs/BRAIN.md`.
