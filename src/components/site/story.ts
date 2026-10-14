import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { site } from "@/config/site";
import type { Answers, ProductFormat, ProductLine } from "@/engine";

/**
 * The one example the homepage tells, from first scan to reorder: Kate is the distributor (the
 * example page at /d/kate), Sarah has never bought from her. Every mock screen reads from here so
 * the story stays consistent, and `story.test.ts` runs Sarah's answers through the real engine to
 * check that the products, reasons and WhatsApp message shown here are exactly what it produces.
 * Prices are Kate's to set; they only appear in her own replies.
 */
export const KATE = {
  name: DEMO_DISTRIBUTOR.name,
  first: DEMO_DISTRIBUTOR.firstName,
  title: DEMO_DISTRIBUTOR.tagline ?? "BF Suma distributor",
  initials: initials(DEMO_DISTRIBUTOR.name),
  /** Where her page lives: the same address her QR code opens. */
  link: `${site.displayDomain}/d/${DEMO_DISTRIBUTOR.slug}`,
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export const SARAH = {
  name: "Sarah",
  age: 34,
  phone: "0712 345 678",
  goals: ["Energy", "Joints & bones"],
};

/** What Sarah answers on Kate's page. */
export const SARAH_ANSWERS: Answers = {
  first_name: "sarah",
  sex: "female",
  age: 34,
  pregnancy: "none",
  experience: "never",
  goals: ["energy", "joints"],
  energy_level: 2,
  energy_dips: ["afternoon"],
  joint_issues: ["pain"],
  joint_duration: "years",
  bone_risk: "no",
  meals: "home",
  veg: "few",
  sugary: "daily",
  water: "low",
  active: "few",
  sleep_hours: "5to6",
  alcohol: "none",
  smoke: "no",
  conditions: ["none"],
  medications: ["none"],
  restrictions: ["none"],
  plan_size: "focused",
};

export interface StoryProduct {
  id: string;
  name: string;
  short: string;
  goal: string;
  format: ProductFormat;
  line: ProductLine;
  /** Kate's price, as she quotes it on WhatsApp. */
  price: number;
  why: string;
  /** What Sarah said that led to it, in plain words. */
  because: string;
}

/** The plan the engine builds from Sarah's answers. */
export const SUGGESTED: StoryProduct[] = [
  {
    id: "cordyceps-coffee",
    name: "4 in 1 Cordyceps Coffee",
    short: "Cordyceps Coffee",
    goal: "Energy",
    format: "coffee",
    line: "Immune Booster",
    price: 3200,
    why: "Cordyceps is traditionally used for energy and stamina, and it comes in a form that's easy to keep up.",
    because: "you said your energy is low and dips mid-afternoon",
  },
  {
    id: "arthroxtra",
    name: "ArthroXtra Tablets",
    short: "ArthroXtra",
    goal: "Joints & bones",
    format: "tablets",
    line: "Sport Fit",
    price: 4700,
    why: "You've had joint trouble for a while, and this is the formula BF Suma makes for long-standing problems.",
    because: "you've had joint pain for more than a year",
  },
];

export const PLAN_REF = "SA-FK27";

/** The message that opens in WhatsApp when Sarah taps "Send my plan to Kate", word for word. */
export const SARAH_MESSAGE = `Hi ${KATE.first}, I've just done the assessment on your page.

*About me:* Sarah, 34
*My goals:* 1. Energy  2. Joints
*Suggested plan:* 4 in 1 Cordyceps Coffee, ArthroXtra Tablets
*Maybe later:* NMN Duo Release
*I'd like to start with:* a focused plan (2–3 products)

Could you tell me the prices and how to get started?
Ref: ${PLAN_REF}`;

export const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
export const ORDER_TOTAL = kes(SUGGESTED.reduce((s, p) => s + p.price, 0));

const BOTH = SUGGESTED.map((p) => p.name).join(" and ");

/** Kate's Today list writes this (src/server/portal.ts); it's shown here word for word. */
export const REORDER_MESSAGE = `Habari Sarah! It's about time for your next ${BOTH}. How has it been going? I can set aside another one for you, just let me know. ${KATE.first}`;

/** The dates the story happens on (October 2026). */
export const WHEN = { bought: "7 Oct", today: "Monday 26 October" };

/** Kate's Today list on the day Sarah is due to reorder: one of each kind the real list shows. */
export type TodayKind = "new" | "payment" | "reorder" | "checkin" | "quiet";
export interface TodayPerson {
  id: string;
  name: string;
  kind: TodayKind;
  why: string;
  message: string;
}

export const ARTHROXTRA_EXPECTATION =
  "Joint products are slow. Most people need six to eight weeks of daily use before they notice a difference.";

export const TODAY: TodayPerson[] = [
  {
    id: "wanjiru",
    name: "Wanjiru, 41",
    kind: "new",
    why: "Did the assessment on your page last night. Plan: Pure & Broken Ganoderma Spores, Probio3. Focused plan (2–3).",
    message:
      "Hi Wanjiru, thanks for doing the assessment. I saw you mentioned you've been getting sick more often than you'd like. Can I ask you a couple of quick questions before we decide what to start with?",
  },
  {
    id: "achieng",
    name: "Achieng",
    kind: "payment",
    why: "Order of KES 7,800 from 22 Oct isn't paid yet.",
    message:
      "Hi Achieng, just a quick reminder about your order of KES 7,800 from 22 Oct. Send it whenever you're ready and I'll sort out the delivery. Asante!",
  },
  {
    id: "sarah",
    name: "Sarah",
    kind: "reorder",
    why: `Bought ${BOTH} on ${WHEN.bought}. Probably running out this week.`,
    message: REORDER_MESSAGE,
  },
  {
    id: "njeri",
    name: "Mama Njeri",
    kind: "checkin",
    why: "Started ArthroXtra Tablets 2 weeks ago. A good time to ask how it's going.",
    message: `Hi Mama Njeri, it's been a couple of weeks on ArthroXtra Tablets. How are you finding it? ${ARTHROXTRA_EXPECTATION}`,
  },
  {
    id: "kiprono",
    name: "Kiprono",
    kind: "quiet",
    why: "No order since 3 Jul.",
    message: "Hi Kiprono, it's been a while! Hope you're keeping well. Let me know if you need anything, I'm here.",
  },
];
