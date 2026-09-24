@AGENTS.md

# Suppli Afya

A sales and customer system for BF Suma distributors in Kenya. Positioning: **Sell more. Follow up less.**
Every feature must help a distributor through the loop: Lead → Follow-up → Customer → Order → Payment → Repeat order.

Read before working here:
- `docs/BRAIN.md`: what the company is, audiences, the three pillars (value, leverage, outcome), risks, roadmap
- `docs/VOICE.md`: copy rules. The site speaks to distributors like a sharp founder would; the health check speaks to customers calmly
- `docs/ENGINE.md`: how the health check builds a plan, and the safety rules
- `docs/DECISIONS.md`: launch blockers and open decisions
- `docs/UX-REVIEW.md`: the design principles for every screen, and why each screen looks the way it does

## Non-negotiables

- Never write health claims. Products are never said to treat, cure or prevent a disease.
- Safety rules win over sales. When unsure, leave a product out or send the customer to a doctor, and say why.
- Suppli Afya is independent of BF Suma. No BF Suma logos or product photos; keep the disclaimer.
- No fake testimonials, statistics or logos.
- No "AI", "automation" or SaaS buzzwords in user-facing copy.
- The catalogue (`src/engine/catalogue.ts`) is unverified until checked against the official BF Suma Kenya catalogue.

## Code map

- `src/engine/`: pure TypeScript health check engine (questions, catalogue, scoring, safety, WhatsApp handoff). Tested.
- `src/components/check/`: health check UI (used on the landing page demo and on `/check`, `/d/[slug]`)
- `src/components/site/`: landing page sections, in story order in `src/app/page.tsx`
- `src/config/`: site settings, plans and prices (`plans.ts`), onboarding options, the demo distributor
- `src/server/`: database (Postgres or embedded PGlite), schema migrations, auth and sessions, payments (M-Pesa through PayHero, cards through Paystack, test mode), portal queries including the Today list
- `src/app/start/`: checkout (account → payment → welcome) and onboarding (`setup/`)
- `src/app/portal/`: the distributor portal; every page guards itself with `requirePortalAccount()`
- `src/app/api/`: payment callbacks and webhooks, lead capture from the health check, the morning reminder cron
- `src/pwa/service-worker.ts` (served at `/sw.js`), `src/app/manifest.ts`, `src/components/pwa/`: the installable app (install offers, offline, updates, notifications). The service worker only runs in production builds
- `src/proxy.ts`: keeps portal sessions alive while they're used
- `e2e/`: Playwright tests: the health check, the distributor journey, and the installed app (`pwa.spec.ts`)

## Commands

- `npm run dev`: local dev server
- `npm test`: engine, billing and Today-list tests (Vitest; includes a safety fuzz test; the database runs in memory)
- `npm run typecheck` / `npm run lint`
- `npm run build && npx playwright test`: end-to-end tests (desktop and mobile), including the full distributor journey with test payments

Portal page grids use `grid-cols-1` so long content (links, names) can't widen the page past a small phone; `pwa.spec.ts` checks every portal page at 360px.

Design tokens live in `src/app/globals.css` (`@theme`). Fonts: Newsreader (display) and Hanken Grotesk (text).
