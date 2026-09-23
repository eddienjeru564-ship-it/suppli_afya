@AGENTS.md

# Suppli Afya

A sales and customer system for BF Suma distributors in Kenya. Positioning: **Sell more. Follow up less.**
Every feature must help a distributor through the loop: Lead → Follow-up → Customer → Order → Payment → Repeat order.

Read before working here:
- `docs/BRAIN.md`: what the company is, audiences, the three pillars (value, leverage, outcome), risks, roadmap
- `docs/VOICE.md`: copy rules. The site speaks to distributors like a sharp founder would; the health check speaks to customers calmly
- `docs/ENGINE.md`: how the health check builds a plan, and the safety rules
- `docs/DECISIONS.md`: launch blockers and open decisions

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
- `src/config/`: site settings and distributor entry points
- `e2e/`: Playwright tests that walk the health check

## Commands

- `npm run dev`: local dev server
- `npm test`: engine unit tests (Vitest, includes a safety fuzz test)
- `npm run typecheck` / `npm run lint`
- `npm run build && npx playwright test`: end-to-end tests (desktop and mobile)

Design tokens live in `src/app/globals.css` (`@theme`). Fonts: Newsreader (display) and Hanken Grotesk (text).
