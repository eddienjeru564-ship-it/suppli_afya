/**
 * Server-side configuration. Everything that differs between local, preview
 * and production lives here, read from environment variables.
 */
export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  pgliteDir: process.env.PGLITE_DIR ?? ".data/pglite",
  isProduction: process.env.NODE_ENV === "production",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),

  mpesa: {
    env: (process.env.MPESA_ENV ?? "sandbox") as "sandbox" | "production",
    consumerKey: process.env.MPESA_CONSUMER_KEY ?? "",
    consumerSecret: process.env.MPESA_CONSUMER_SECRET ?? "",
    shortcode: process.env.MPESA_SHORTCODE ?? "",
    passkey: process.env.MPESA_PASSKEY ?? "",
    /** "paybill" (CustomerPayBillOnline) or "till" (CustomerBuyGoodsOnline). */
    type: (process.env.MPESA_TYPE ?? "paybill") as "paybill" | "till",
    /** For tills, the till number differs from the store shortcode. */
    tillNumber: process.env.MPESA_TILL_NUMBER ?? "",
    /** Shared secret appended to the callback URL; Daraja doesn't sign callbacks. */
    callbackToken: process.env.MPESA_CALLBACK_TOKEN ?? "",
  },

  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY ?? "",
  },

  /**
   * Test payments let the whole journey run without live keys. They're allowed
   * automatically outside production, and in production only when explicitly
   * switched on (for previews). Never enable this on the live site.
   */
  allowTestPayments: process.env.PAYMENTS_ALLOW_TEST === "true" || process.env.NODE_ENV !== "production",
};

export function mpesaConfigured() {
  const m = env.mpesa;
  return Boolean(m.consumerKey && m.consumerSecret && m.shortcode && m.passkey && m.callbackToken);
}

export function paystackConfigured() {
  return Boolean(env.paystack.secretKey);
}
