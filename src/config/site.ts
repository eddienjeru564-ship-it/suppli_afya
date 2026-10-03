/** Public URL, used for metadata and QR codes. Set NEXT_PUBLIC_SITE_URL in production; on Vercel it defaults to the deploy's own address (next.config.ts). */
const url = (process.env.NEXT_PUBLIC_SITE_URL || "https://suppliafya.co.ke").replace(/\/$/, "");

/**
 * Site-wide settings. Anything that must change before launch lives here.
 */
export const site = {
  name: "Suppli Afya",
  tagline: "Turn curiosity into customers.",
  description:
    "Give customers a simple way to find which BF Suma products suit them, then start a WhatsApp conversation with you. Suppli Afya keeps track of follow-ups and reorders.",
  url,
  /** The domain shown on cards and in mockups: always the one the QR codes and links go to. */
  displayDomain: new URL(url).host.replace(/^www\./, ""),
  /**
   * The Suppli Afya team's WhatsApp number in international format, e.g. 254712345678.
   * Early-access applications open WhatsApp to this number. Leave empty until it exists;
   * the form then shows the message for copying instead of opening a chat.
   */
  teamWhatsApp: process.env.NEXT_PUBLIC_SUPPLI_WHATSAPP ?? "",
} as const;

/** WhatsApp community invite link for distributors. Leave empty to hide the invitation. */
export const communityUrl = process.env.NEXT_PUBLIC_COMMUNITY_URL ?? "";
