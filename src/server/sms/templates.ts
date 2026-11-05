import { greetingName } from "@/lib/names";

/**
 * Reminder texts to a distributor's customers, as pure functions. Written in the distributor's own
 * voice and signed with their name.
 *
 * The shape of every text: a short first line a phone shows in its notification ("Hey Sarah, …"),
 * then a blank line, then one or two plain lines of detail, a way to reply, the distributor's name
 * and the stop link. Plain GSM characters only (no emoji or curly quotes), so each text stays one or
 * two SMS segments rather than three or four.
 */

export interface SmsCustomer {
  name: string;
}

export interface SmsSeller {
  /** The distributor's name, as it ends the text. */
  name: string;
  /** Their WhatsApp number in 2547… form, for the reply line. */
  whatsapp: string | null;
}

export interface Rendered {
  /** What the phone shows first. */
  preview: string;
  body: string;
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Nairobi" });
const day = (d: Date | string) => DATE.format(new Date(d));
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;

/** "Immuno Guard", "Immuno Guard and Cordyceps", "Immuno Guard and 2 more". */
export function productLine(names: string[]): string {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (unique.length === 0) return "your order";
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
  return `${unique[0]} and ${unique.length - 1} more`;
}

function assemble(parts: { first: string; detail: string[]; seller: SmsSeller; replyLabel: string; stopUrl: string }): Rendered {
  const reply = parts.seller.whatsapp ? `${parts.replyLabel} wa.me/${parts.seller.whatsapp.replace(/\D/g, "")}` : null;
  const blocks = [parts.first, parts.detail.join("\n"), reply, `${parts.seller.name}\nStop texts: ${parts.stopUrl}`].filter(Boolean) as string[];
  const body = toGsm(blocks.join("\n\n"));
  return { preview: toGsm(parts.first), body };
}

/** A product name short enough to sit in the first line without crowding it. */
const SHORT_NAME = 24;

/**
 * A few days before a customer is likely to run out. One product with a short name goes in the
 * first line ("your Immuno Guard is almost finished"); anything longer moves to the next line, so
 * the first line stays a greeting.
 */
export function reorderSms(p: { customer: SmsCustomer; seller: SmsSeller; products: string[]; dueAt: Date | string; stopUrl: string }): Rendered {
  const who = greetingName(p.customer.name) || "there";
  const names = [...new Set(p.products.map((n) => n.trim()).filter(Boolean))];
  const one = names.length <= 1;
  const short = one && names.length === 1 && names[0].length <= SHORT_NAME;
  return assemble({
    first: short ? `Hey ${who}, your ${names[0]} is almost finished.` : `Hey ${who}, time for a top-up.`,
    detail: [
      short
        ? `By my count it runs out around ${day(p.dueAt)}. Shall I set the next one aside for you?`
        : `${names.length ? `Your ${productLine(names)}` : "Your order"} should run out around ${day(p.dueAt)}. Shall I set the next ${one ? "one" : "ones"} aside for you?`,
    ],
    seller: p.seller,
    replyLabel: "Reply on WhatsApp:",
    stopUrl: p.stopUrl,
  });
}

/** Once, a few days after an order that hasn't been paid. */
export function paymentSms(p: {
  customer: SmsCustomer;
  seller: SmsSeller;
  products: string[];
  amount: number;
  orderedAt: Date | string;
  stopUrl: string;
}): Rendered {
  const who = greetingName(p.customer.name) || "there";
  return assemble({
    first: `Hey ${who}, a quick reminder about your order.`,
    detail: [`${kes(p.amount)} for ${productLine(p.products)}, from ${day(p.orderedAt)}, is still to be paid.`],
    seller: p.seller,
    replyLabel: "Any questions?",
    stopUrl: p.stopUrl,
  });
}

// ---------------------------------------------------------------- GSM-7

/** The GSM 03.38 basic character set. Anything else forces the expensive UCS-2 encoding. */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Allowed too, but each counts as two characters. */
const GSM_EXTENDED = "^{}\\[~]|€";

const REPLACE: Record<string, string> = {
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "–": "-",
  "—": "-",
  "…": "...",
  " ": " ",
  "·": "-",
};

/** Text that sends as GSM-7: typographic punctuation made plain, accents kept where GSM has them, the rest dropped. */
export function toGsm(text: string): string {
  let out = "";
  for (const ch of text.normalize("NFC")) {
    if (GSM_BASIC.includes(ch) || GSM_EXTENDED.includes(ch)) out += ch;
    else if (REPLACE[ch] !== undefined) out += REPLACE[ch];
    else {
      // Strip the accent if GSM doesn't carry the accented letter ("ō" becomes "o"); drop emoji and the like.
      const base = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (base.length === 1 && GSM_BASIC.includes(base)) out += base;
    }
  }
  return out.replace(/[ \t]{2,}/g, " ").replace(/[ \t]+\n/g, "\n").trim();
}

/** How many SMS segments a GSM-7 text takes: 160 characters in one, 153 per part once split. */
export function segments(text: string): number {
  let units = 0;
  for (const ch of text) units += GSM_EXTENDED.includes(ch) ? 2 : 1;
  return units <= 160 ? 1 : Math.ceil(units / 153);
}
