/**
 * Suppli Afya plans. The single source of truth for pricing on the site,
 * in checkout and in the portal.
 *
 * Each plan adds one step of the distributor's work: Starter gets enquiries
 * (your page), Growth keeps the customers (the list and the follow-up), Pro
 * takes the payment (orders and M-Pesa). Prices set by the founder, October 2026.
 *
 * Only list what the product actually does. Anything not yet built is marked
 * `soon`. A card lists what its plan adds; the app may give a plan more than
 * its card lists, never less.
 */
export type PlanId = "starter" | "growth" | "pro";

export interface PlanFeature {
  text: string;
  soon?: boolean;
  /** Shown together on the pricing card, under one heading. */
  group?: "mpesa";
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // KES per month
  /** One line: what this plan is for. */
  tagline: string;
  /** The plan this one builds on ("Everything in Starter, plus:"). */
  includes?: PlanId;
  /** What this plan adds. */
  features: PlanFeature[];
  /** Enforced limits. null = unlimited. */
  customerLimit: number | null;
  canImport: boolean;
  monthlySummary: boolean;
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 1500,
    tagline: "Get your own page and start receiving enquiries.",
    customerLimit: 50,
    canImport: false,
    monthlySummary: false,
    features: [
      { text: "Your own branded page and link" },
      { text: "QR code cards to share" },
      { text: "Product assessment and recommendations" },
      { text: "Ready-to-send WhatsApp messages" },
      { text: "Keep up to 50 customers" },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 3500,
    tagline: "Keep track of your customers and follow up.",
    includes: "starter",
    customerLimit: null,
    canImport: true,
    monthlySummary: true,
    featured: true,
    features: [
      { text: "Customer list and enquiry history" },
      { text: "Daily follow-up and reorder reminders" },
      { text: "Unlimited customers" },
      { text: "We can add your existing customer list for you" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 6500,
    tagline: "Take orders and collect M-Pesa payments.",
    includes: "growth",
    customerLimit: null,
    canImport: true,
    monthlySummary: true,
    features: [
      // What the workspace does with customer payments today. M-Pesa prompts to a distributor's own
      // customers (STK push for orders) aren't built yet: they need a PayHero channel per distributor
      // (docs/BRAIN.md, Phase 3). Add them here once they work.
      { text: "Record orders and M-Pesa payments in a few taps", group: "mpesa" },
      { text: "See who still owes you, with a reminder ready to send", group: "mpesa" },
      { text: "Priority WhatsApp support" },
    ],
  },
];

export const PLANS_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p])) as Record<PlanId, Plan>;
const DEFAULT_PLAN: PlanId = "growth";

export function planOrDefault(id: string | null | undefined): Plan {
  return PLANS_BY_ID[(id ?? "") as PlanId] ?? PLANS_BY_ID[DEFAULT_PLAN];
}

export const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;

/** The cheapest plan, for "from KES …" lines. */
export const FROM_PRICE = kes(Math.min(...PLANS.map((p) => p.price))).replace(" ", "\u00a0");
