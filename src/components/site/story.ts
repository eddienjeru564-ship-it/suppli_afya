import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { site } from "@/config/site";

/**
 * The one example the homepage tells, from first scan to reorder: Kate is the distributor (the
 * example page at /d/kate), Sarah has never bought from her. Every mock screen reads from here so
 * the story stays consistent. Products, reasons and prices mirror what the real page shows.
 */
export const KATE = {
  name: DEMO_DISTRIBUTOR.name,
  first: DEMO_DISTRIBUTOR.firstName,
  title: DEMO_DISTRIBUTOR.tagline ?? "BF Suma distributor",
  initials: "KC",
  /** Where her page lives: the same address her QR code opens. */
  link: `${site.displayDomain}/d/${DEMO_DISTRIBUTOR.slug}`,
};

export const SARAH = {
  name: "Sarah",
  age: 34,
  phone: "0712 345 678",
  goals: ["Energy", "Joints & bones"],
};

export const SUGGESTED = [
  {
    name: "4 in 1 Cordyceps Coffee",
    short: "Cordyceps Coffee",
    goal: "Energy",
    tone: "#5a7a53",
    price: 3200,
    why: "It replaces your morning cup, so it fits into a routine you already have.",
  },
  {
    name: "ArthroXtra Tablets",
    short: "ArthroXtra",
    goal: "Joints & bones",
    tone: "#c48b2c",
    price: 4700,
    why: "You've had joint trouble for a while, and this is the formula made for that.",
  },
];

export const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
export const ORDER_TOTAL = kes(SUGGESTED.reduce((s, p) => s + p.price, 0));
