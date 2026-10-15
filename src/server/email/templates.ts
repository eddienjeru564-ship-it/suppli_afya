/**
 * Every email the app sends, as pure functions: data in, subject + HTML + plain text out.
 * The voice is docs/VOICE.md: plain, warm, one idea per paragraph, sentences under 25 words.
 * The distributor pays a "subscription"; a "plan" is a customer's product plan.
 */

export interface Rendered {
  subject: string;
  html: string;
  text: string;
}

/** A block of the email body. */
type Block =
  | { p: string }
  | { button: { label: string; url: string } }
  | { link: { label: string; url: string } }
  | { rows: [string, string][] }
  | { list: string[] }
  | { small: string };

const C = { cream: "#f4eee3", paper: "#ffffff", ink: "#16241c", soft: "#46534b", mute: "#5f6a62", forest: "#1e3a2b", line: "#e4dccd" };
const FONT = "'Hanken Grotesk', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function blockHtml(b: Block): string {
  if ("p" in b) return `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:${C.ink}">${escapeHtml(b.p)}</p>`;
  if ("small" in b) return `<p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:${C.mute}">${escapeHtml(b.small)}</p>`;
  if ("button" in b)
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:999px;background:${C.forest}">
<a href="${escapeHtml(b.button.url)}" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px">${escapeHtml(b.button.label)}</a>
</td></tr></table>`;
  if ("link" in b)
    return `<p style="margin:0 0 16px;font-size:15px"><a href="${escapeHtml(b.link.url)}" style="color:${C.forest};font-weight:600">${escapeHtml(b.link.label)}</a></p>`;
  if ("list" in b)
    return `<ul style="margin:0 0 16px;padding-left:20px;font-size:16px;line-height:1.55;color:${C.ink}">${b.list
      .map((i) => `<li style="margin:0 0 6px">${escapeHtml(i)}</li>`)
      .join("")}</ul>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 20px;border-top:1px solid ${C.line}">${b.rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:14px;color:${C.soft}">${escapeHtml(k)}</td><td align="right" style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:14px;font-weight:600;color:${C.ink}">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

function blockText(b: Block): string {
  if ("p" in b) return b.p;
  if ("small" in b) return b.small;
  if ("button" in b) return `${b.button.label}: ${b.button.url}`;
  if ("link" in b) return `${b.link.label}: ${b.link.url}`;
  if ("list" in b) return b.list.map((i) => `- ${i}`).join("\n");
  return b.rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}

const FOOTER = "Suppli Afya is independent of BF Suma. You're getting this because you have a Suppli Afya account.";

function render(subject: string, heading: string, blocks: Block[], preheader = ""): Rendered {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.cream};font-family:${FONT}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 4px 18px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${C.forest}">Suppli Afya</td></tr>
<tr><td style="background:${C.paper};border-radius:20px;padding:32px 28px;font-family:${FONT}">
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:28px;line-height:1.2;color:${C.ink}">${escapeHtml(heading)}</h1>
${blocks.map(blockHtml).join("\n")}
</td></tr>
<tr><td style="padding:18px 4px 0;font-size:12px;line-height:1.5;color:${C.mute};font-family:${FONT}">${escapeHtml(FOOTER)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [heading, "", ...blocks.map(blockText).flatMap((t) => [t, ""]), "--", FOOTER].join("\n");
  return { subject, html, text };
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" });
export const emailDate = (d: Date | string) => DATE.format(new Date(d));
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;
const hi = (name: string | null) => (name ? `Hi ${name},` : "Hi,");

export interface PaymentDetails {
  name: string | null;
  plan: string;
  amount: number;
  /** "M-Pesa", "Card" or "Test payment". */
  method: string;
  receipt: string | null;
  paidUntil: Date | string;
}

function paymentRows(p: PaymentDetails): [string, string][] {
  return [
    ["Subscription", `${p.plan}, one month`],
    ["Amount", kes(p.amount)],
    ["Paid by", p.method],
    ...(p.receipt ? ([["Receipt", p.receipt]] as [string, string][]) : []),
    ["Paid until", emailDate(p.paidUntil)],
  ];
}

/** After the first payment: the subscription is active, and the next step is the page. */
export function welcomeEmail(p: PaymentDetails & { setupUrl: string }): Rendered {
  return render(
    "Welcome to Suppli Afya",
    "Welcome to Suppli Afya",
    [
      { p: `${hi(p.name)} thank you for joining. Your ${p.plan} subscription is active.` },
      { p: "Next, set up your page. It takes about five minutes: your name, your WhatsApp number, and what your customers usually ask about." },
      { p: "You then get your own link and a QR card to share with customers." },
      { button: { label: "Set up your page", url: p.setupUrl } },
      { rows: paymentRows(p) },
      { small: "Nothing renews automatically. We'll email you a few days before your subscription ends." },
    ],
    "Your subscription is active. Next, set up your page.",
  );
}

/** Every later payment: a receipt. */
export function receiptEmail(p: PaymentDetails & { portalUrl: string }): Rendered {
  return render(
    `Payment received: ${p.plan} subscription, ${kes(p.amount)}`,
    "Payment received",
    [
      { p: `${hi(p.name)} thank you. Your ${p.plan} subscription is paid until ${emailDate(p.paidUntil)}.` },
      { rows: paymentRows(p) },
      { button: { label: "Open your workspace", url: p.portalUrl } },
      { small: "Keep this email as your receipt. Nothing renews automatically." },
    ],
    `Your ${p.plan} subscription is paid until ${emailDate(p.paidUntil)}.`,
  );
}

/** When onboarding finishes: the page is live, and how to share it. */
export function pageLiveEmail(p: { name: string | null; pageUrl: string; displayUrl: string; cardUrl: string; portalUrl: string }): Rendered {
  return render(
    `Your page is live: ${p.displayUrl}`,
    "Your page is live",
    [
      { p: `${hi(p.name)} your page is ready at ${p.displayUrl}.` },
      { p: "Customers open it, answer a few questions and see which products suit them. Then they message you on WhatsApp with their answers already written." },
      { button: { label: "Open your page", url: p.pageUrl } },
      { p: "Share it where your customers already are:" },
      { list: ["Your WhatsApp status", "Your bio on Facebook, Instagram or TikTok", "A printed QR card at your counter or in your bag"] },
      { link: { label: "Print your QR card", url: p.cardUrl } },
      { link: { label: "Open your workspace", url: p.portalUrl } },
    ],
    `Share ${p.displayUrl} with your customers.`,
  );
}

export function passwordResetEmail(p: { resetUrl: string }): Rendered {
  return render(
    "Reset your Suppli Afya password",
    "Reset your password",
    [
      { p: "Someone asked to reset the password for this email address. If that was you, choose a new password below." },
      { button: { label: "Choose a new password", url: p.resetUrl } },
      { small: "The link works once, within the next hour. If the button doesn't open, copy this link into your browser:" },
      { small: p.resetUrl },
      { p: "If you didn't ask for this, you can ignore this email. Your password stays the same." },
    ],
    "Choose a new password. The link works for one hour.",
  );
}

export function passwordChangedEmail(p: { when: Date; forgotUrl: string }): Rendered {
  return render(
    "Your Suppli Afya password was changed",
    "Your password was changed",
    [
      { p: `The password for your Suppli Afya account was changed on ${emailDate(p.when)} at ${TIME.format(p.when)}, Nairobi time.` },
      { p: "Any other phone or computer that was logged in has been logged out." },
      { p: "If you didn't do this, reset your password now to secure your account." },
      { button: { label: "Reset your password", url: p.forgotUrl } },
    ],
    "If this wasn't you, reset your password now.",
  );
}

/** A few days before the paid period ends. Nothing renews automatically. */
export function renewalDueEmail(p: { name: string | null; plan: string; price: number; endsOn: Date | string; renewUrl: string }): Rendered {
  const date = emailDate(p.endsOn);
  return render(
    `Your ${p.plan} subscription ends on ${date}`,
    `Your subscription ends on ${date}`,
    [
      { p: `${hi(p.name)} your ${p.plan} subscription is paid until ${date}. Nothing renews automatically.` },
      { p: "Renew before then to keep your page open to customers and your follow-up list running." },
      { p: `Renewing takes a minute by M-Pesa or card: ${kes(p.price)} for another month.` },
      { button: { label: "Renew now", url: p.renewUrl } },
    ],
    `Renew before ${date} to keep your page open.`,
  );
}

/** The day after the paid period ends: the page stays open for a few more days. */
export function subscriptionEndedEmail(p: { name: string | null; plan: string; endedOn: Date | string; pageClosesOn: Date | string; renewUrl: string }): Rendered {
  return render(
    "Your Suppli Afya subscription has ended",
    "Your subscription has ended",
    [
      { p: `${hi(p.name)} your ${p.plan} subscription ended on ${emailDate(p.endedOn)}.` },
      { p: `Your page stays open until ${emailDate(p.pageClosesOn)}. After that, customers who open your link won't see it.` },
      { p: "Your customers, orders and notes are kept. Renew to carry on where you left off." },
      { button: { label: "Renew now", url: p.renewUrl } },
    ],
    `Your page stays open until ${emailDate(p.pageClosesOn)}.`,
  );
}
