/**
 * Suppli Afya plans. The single source of truth for pricing on the site,
 * in checkout and in the portal.
 *
 * Prices are a founder decision to confirm (see docs/DECISIONS.md). The logic
 * behind them: at an average order of about KES 6,500, one extra reorder a
 * month more than covers Growth.
 *
 * Only list what the product actually does. Anything not yet built is marked `soon`.
 */
export type PlanId = "starter" | "growth" | "pro";

export interface PlanFeature {
  text: string;
  soon?: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // KES per month
  tagline: string;
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
    tagline: "For distributors getting started with a small, loyal group of customers.",
    customerLimit: 50,
    canImport: false,
    monthlySummary: false,
    features: [
      { text: "Your own health check link and QR card" },
      { text: "Prospects, customers and orders in one place" },
      { text: "A daily list of follow-ups, unpaid orders and reorders" },
      { text: "Up to 50 customers" },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 2900,
    tagline: "For distributors with a growing customer base to keep coming back.",
    customerLimit: null,
    canImport: true,
    monthlySummary: true,
    featured: true,
    features: [
      { text: "Everything in Starter" },
      { text: "Unlimited customers" },
      { text: "Bring in your existing customers from a spreadsheet" },
      { text: "A monthly summary of sales, payments and reorders" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 4900,
    tagline: "For established distributors who want it set up and supported for them.",
    customerLimit: null,
    canImport: true,
    monthlySummary: true,
    features: [
      { text: "Everything in Growth" },
      { text: "We set up your workspace and move your customers in for you" },
      { text: "Priority help from the Suppli Afya team on WhatsApp" },
      { text: "M-Pesa payment requests to customers (with your own Till or Paybill)", soon: true },
    ],
  },
];

export const PLANS_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p])) as Record<PlanId, Plan>;
export const DEFAULT_PLAN: PlanId = "growth";

export function planOrDefault(id: string | null | undefined): Plan {
  return PLANS_BY_ID[(id ?? "") as PlanId] ?? PLANS_BY_ID[DEFAULT_PLAN];
}

export const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;
