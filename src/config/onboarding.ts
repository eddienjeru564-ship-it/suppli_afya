/**
 * Onboarding options. Each one is used somewhere: see the comments.
 */

/** Shown on the distributor's public health check ("Afya Bora Pharmacy · Thika"). */
export const BUSINESS_TYPES = [
  { id: "independent", label: "Independent distributor", hint: "I sell from home or on the go" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "wellness_shop", label: "Health & wellness shop" },
  { id: "clinic", label: "Clinic" },
  { id: "online", label: "Online seller" },
  { id: "other", label: "Other" },
] as const;

/** Decides which "share your link" suggestions the portal shows first. */
export const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "calls", label: "Phone calls" },
  { id: "shop", label: "Physical shop" },
  { id: "social", label: "Social media" },
  { id: "referrals", label: "Referrals" },
  { id: "other", label: "Other" },
] as const;

/** Orders the portal's Today list and home screen around what matters most to them. */
export const GOALS = [
  { id: "followup", label: "Follow up with customers", focus: "follow-ups" },
  { id: "repeat", label: "Get more repeat purchases", focus: "repeat orders" },
  { id: "orders", label: "Manage customer orders", focus: "open orders" },
  { id: "recommend", label: "Recommend the right products", focus: "new health checks" },
  { id: "payments", label: "Collect payments", focus: "unpaid orders" },
  { id: "track", label: "Keep track of customers", focus: "customers who've gone quiet" },
] as const;

/** "repeat orders and follow-ups" — how a set of goals reads inside a sentence. */
export function goalFocus(ids: string[], max = 2) {
  const words = ids.slice(0, max).map((id) => GOALS.find((g) => g.id === id)?.focus ?? id);
  return words.length <= 1 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

export type ChannelId = (typeof CHANNELS)[number]["id"];
export type GoalId = (typeof GOALS)[number]["id"];
export type BusinessTypeId = (typeof BUSINESS_TYPES)[number]["id"];

export const labelFor = <T extends { id: string; label: string }>(list: readonly T[], id: string) =>
  list.find((x) => x.id === id)?.label ?? id;
