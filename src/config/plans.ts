/**
 * Suppli Afya pricing. The single source of truth for prices on the site, in checkout, in emails
 * and in the portal.
 *
 * One subscription with everything in it (founder decision, November 2026): a one-time setup fee
 * that covers building the distributor's shop, cards and workspace plus their first month, then a
 * monthly fee. A workspace that has paid before only ever pays the monthly fee again.
 *
 * Only list what the product actually does. Anything not yet built is marked `soon` and shows a
 * "Coming soon" tag wherever it's listed.
 */
export type PlanId = "suppli";

export interface PlanFeature {
  title: string;
  body: string;
  soon?: boolean;
}

export interface FeatureGroup {
  id: "sell" | "follow" | "setup";
  title: string;
  features: PlanFeature[];
}

export interface Plan {
  id: PlanId;
  name: string;
  /** KES, paid once: setup and the first month. */
  setupFee: number;
  /** KES per month, from the second month. */
  monthly: number;
  tagline: string;
  groups: FeatureGroup[];
  /** Enforced limits. null = unlimited. */
  customerLimit: number | null;
  canImport: boolean;
  monthlySummary: boolean;
}

export const PLAN: Plan = {
  id: "suppli",
  name: "Suppli Afya",
  setupFee: 6500,
  monthly: 2500,
  tagline: "Everything you need to sell, follow up and get reorders, set up for you.",
  customerLimit: null,
  canImport: true,
  monthlySummary: true,
  groups: [
    {
      id: "sell",
      title: "Sell",
      features: [
        {
          title: "Your own branded shop",
          body: "Your name and photo at yourname.suppliafya.co.ke, with every product and its price.",
        },
        {
          title: "WhatsApp checkout",
          body: "Customers fill a basket and send the order to your WhatsApp, with their details already written.",
        },
        {
          title: "Personal product recommendations",
          body: "A short assessment matches each customer to products, explains why, and sends them to you on WhatsApp.",
        },
        {
          title: "Personal QR business cards",
          body: "Designed with your name, link and WhatsApp number, ready to print and hand out.",
        },
      ],
    },
    {
      id: "follow",
      title: "Follow up",
      features: [
        {
          title: "Your customer app",
          body: "Every enquiry and order on your phone, with what each customer was looking for.",
        },
        {
          title: "A follow-up list every morning",
          body: "Who to message today, who still owes you and who is about to run out.",
        },
        {
          title: "Reorder tracking",
          body: "Each customer's pack is tracked, so you ask for the reorder before they buy elsewhere.",
        },
        // Listed ahead of the build, by founder decision (November 2026): it ships before it's relied on.
        {
          title: "SMS reminders to your customers",
          body: "Reorder and payment reminders sent by text, in your name.",
        },
      ],
    },
    {
      id: "setup",
      title: "Done for you",
      features: [
        {
          title: "Full setup by our team",
          body: "We build your shop, add your products and prices, and design your cards.",
        },
        {
          title: "Your existing customers moved in",
          body: "Send us your list in any form and we add every customer to your app.",
        },
        {
          title: "Unlimited customers and enquiries",
          body: "No caps and no upgrades. Your business grows, your price stays the same.",
        },
        {
          title: "Priority WhatsApp support",
          body: "A real person from the Suppli Afya team, on the app you already use.",
        },
      ],
    },
  ],
};

/** Old plan names (starter, growth, pro) and anything unknown all mean the one subscription. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function planFor(id?: string | null): Plan {
  return PLAN;
}

/** What a workspace pays next: the setup fee the first time, the monthly fee after that. */
export function amountDue(hasPaidBefore: boolean): number {
  return hasPaidBefore ? PLAN.monthly : PLAN.setupFee;
}

/** What a payment of this amount was for, for receipts and payment history. */
export function paymentLabel(amount: number): string {
  return amount === PLAN.setupFee ? "Setup and first month" : "Monthly subscription";
}

export const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;

/** "KES 2,500" with a non-breaking space, for "then … a month" lines. */
export const MONTHLY_PRICE = kes(PLAN.monthly).replace(" ", " ");
export const SETUP_PRICE = kes(PLAN.setupFee).replace(" ", " ");
