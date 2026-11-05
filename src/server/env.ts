/**
 * Server-side configuration. Everything that differs between local, preview
 * and production lives here, read from environment variables. An empty variable
 * counts as unset (Vercel lets you save a blank value), so defaults use ||.
 */
export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  pgliteDir: process.env.PGLITE_DIR || ".data/pglite",
  isProduction: process.env.NODE_ENV === "production",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),

  /**
   * PayHero sends the M-Pesa STK Push. From the PayHero dashboard:
   * API Keys (username and password, or the ready-made "Basic …" token) and
   * Payment Channels → My Payment Channels (the channel id).
   */
  payhero: {
    username: process.env.PAYHERO_API_USERNAME ?? "",
    password: process.env.PAYHERO_API_PASSWORD ?? "",
    authToken: process.env.PAYHERO_AUTH_TOKEN ?? "",
    channelId: process.env.PAYHERO_CHANNEL_ID ?? "",
    /** Optional: the secret in the callback URL. Derived from the credentials if unset. */
    callbackToken: process.env.PAYHERO_CALLBACK_TOKEN ?? "",
    baseUrl: (process.env.PAYHERO_BASE_URL || "https://backend.payhero.co.ke/api/v2").replace(/\/$/, ""),
  },

  /** Web push for the morning reminder. Generate with: npx web-push generate-vapid-keys */
  push: {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
    privateKey: process.env.VAPID_PRIVATE_KEY ?? "",
    subject: process.env.VAPID_SUBJECT || "mailto:hello@suppliafya.co.ke",
  },
  /** Shared with the distributor storefronts (suppli_afya-distributor_template) so they can file orders. */
  storefrontSecret: process.env.STOREFRONT_SECRET ?? "",
  /** Shared secret the scheduler sends to /api/cron/* (Vercel Cron sends it as a Bearer token). */
  cronSecret: process.env.CRON_SECRET ?? "",

  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY ?? "",
  },

  /**
   * Email through Resend (resend.com), from the verified domain suppliafya.co.ke. Without a key,
   * emails aren't sent: outside production they're printed in the server log instead.
   */
  email: {
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM || "Suppli Afya <hello@suppliafya.co.ke>",
    /** Where replies go. Empty means replies go to the From address. */
    replyTo: process.env.EMAIL_REPLY_TO ?? "",
  },

  /**
   * Reminder texts through Africa's Talking (africastalking.com). From the dashboard: the app's
   * username and an API key (Settings → API Key), and the approved sender ID if there is one
   * (without it, texts come from Africa's Talking's shared number). Username "sandbox" uses the
   * sandbox. Without a key, texts aren't sent: outside production they're printed in the log.
   */
  sms: {
    username: process.env.AFRICASTALKING_USERNAME ?? "",
    apiKey: process.env.AFRICASTALKING_API_KEY ?? "",
    senderId: process.env.AFRICASTALKING_SENDER_ID ?? "",
  },

  /**
   * Test payments let the whole journey run without live keys. They're allowed
   * automatically outside production, and in production only when explicitly
   * switched on (for previews). Never enable this on the live site.
   */
  allowTestPayments: process.env.PAYMENTS_ALLOW_TEST === "true" || process.env.NODE_ENV !== "production",
};

export function mpesaConfigured() {
  const p = env.payhero;
  return Boolean((p.authToken || (p.username && p.password)) && /^\d+$/.test(p.channelId));
}

export function paystackConfigured() {
  return Boolean(env.paystack.secretKey);
}

export function smsConfigured() {
  return Boolean(env.sms.username && env.sms.apiKey);
}

export function pushConfigured() {
  return Boolean(env.push.publicKey && env.push.privateKey);
}
