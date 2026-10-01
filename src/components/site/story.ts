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

/** Someone the homepage can put on a page in Kate's place ("try it with your name"). */
export type Owner = typeof KATE;

export function ownerFor(name: string): Owner {
  const clean = name.replace(/\s+/g, " ").trim().slice(0, 40);
  if (!clean) return KATE;
  const slug = clean
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/ +/g, "-")
    .slice(0, 24);
  return {
    name: clean,
    first: clean.split(" ")[0],
    title: "BF Suma distributor",
    initials: initials(clean),
    link: `${site.displayDomain}/d/${slug || "your-name"}`,
  };
}

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

/** The first reply Kate's workspace suggests for Sarah. */
export const KATE_OPENER =
  "Hi Sarah, thanks for doing the assessment. I saw you mentioned your energy has been low. That's one of the most common things I help people with. Can I ask you a couple of quick questions before we decide what to start with?";

export const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
export const ORDER_TOTAL = kes(SUGGESTED.reduce((s, p) => s + p.price, 0));

const BOTH = SUGGESTED.map((p) => p.name).join(" and ");

/** Kate's Today list writes these (src/server/portal.ts); they're shown here word for word. */
export const CHECKIN_MESSAGE = `Hi Sarah, it's been a couple of weeks on ${BOTH}. How are you finding it? You'll feel the coffee straight away. Any benefit from the cordyceps builds over a few weeks.`;
export const REORDER_MESSAGE = `Habari Sarah! It's about time for your next ${BOTH}. How has it been going? I can set aside another one for you, just let me know. ${KATE.first}`;

/** The dates the story happens on (October 2026). */
export const WHEN = {
  assessment: "Tuesday, 9:02 pm",
  bought: "7 Oct",
  checkinDay: "Tuesday 20 October",
  reorderDay: "Monday 26 October",
};

/** Kate's Today list on the day Sarah is due to reorder: one of each kind the real list shows. */
export type TodayKind = "new" | "payment" | "reorder" | "checkin" | "quiet";
export interface TodayPerson {
  id: string;
  name: string;
  kind: TodayKind;
  why: string;
  message: string;
  history: { when: string; what: string; detail?: string }[];
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
    history: [
      { when: "Last night", what: "Did the assessment on your page", detail: "Looking for immunity, then digestion" },
      { when: "Last night", what: "Messaged you on WhatsApp", detail: "With her answers and her plan" },
    ],
  },
  {
    id: "achieng",
    name: "Achieng",
    kind: "payment",
    why: "Order of KES 7,800 from 22 Oct isn't paid yet.",
    message:
      "Hi Achieng, just a quick reminder about your order of KES 7,800 from 22 Oct. Send it whenever you're ready and I'll sort out the delivery. Asante!",
    history: [
      { when: "Since March", what: "Five orders", detail: "Always paid within the week" },
      { when: "22 Oct", what: "Ordered KES 7,800", detail: "Not paid yet" },
    ],
  },
  {
    id: "sarah",
    name: "Sarah",
    kind: "reorder",
    why: `Bought ${BOTH} on ${WHEN.bought}. Probably running out this week.`,
    message: REORDER_MESSAGE,
    history: [
      { when: "6 Oct", what: "Did the assessment on your page", detail: "Looking for energy, then joints & bones" },
      { when: "6 Oct", what: "Messaged you on WhatsApp", detail: `With her answers and plan ${PLAN_REF}` },
      { when: "7 Oct", what: `Bought ${ORDER_TOTAL}`, detail: "Paid by M-Pesa" },
      { when: "20 Oct", what: "You checked in", detail: "“My afternoons are much better”" },
      { when: "Today", what: "Due to reorder", detail: "The coffee lasts about three weeks" },
    ],
  },
  {
    id: "njeri",
    name: "Mama Njeri",
    kind: "checkin",
    why: "Started ArthroXtra Tablets 2 weeks ago. A good time to ask how it's going.",
    message: `Hi Mama Njeri, it's been a couple of weeks on ArthroXtra Tablets. How are you finding it? ${ARTHROXTRA_EXPECTATION}`,
    history: [
      { when: "12 Oct", what: "Bought ArthroXtra Tablets", detail: "Paid by M-Pesa" },
      { when: "Today", what: "Two weeks in", detail: "Time to ask how it's going" },
    ],
  },
  {
    id: "kiprono",
    name: "Kiprono",
    kind: "quiet",
    why: "No order since 3 Jul.",
    message: "Hi Kiprono, it's been a while! Hope you're keeping well. Let me know if you need anything, I'm here.",
    history: [
      { when: "Feb to Jul", what: "Ordered every month", detail: "Reishi Coffee" },
      { when: "3 Jul", what: "Last order", detail: "Nothing since" },
    ],
  },
];
