import type { NextConfig } from "next";

/** Identifies a deploy. The service worker embeds it, so each deploy is a new version to install. */
const APP_VERSION = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.APP_VERSION || Date.now().toString(36)).slice(0, 12);

/**
 * The public address QR codes, share links, link previews and payment callbacks use.
 * NEXT_PUBLIC_SITE_URL wins. On Vercel without it, the deploy's own address: the production
 * domain (a custom domain once one is added) or, for previews, the branch address.
 */
function publicUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const host =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  return host ? `https://${host}` : undefined;
}
const SITE_URL = publicUrl();

const nextConfig: NextConfig = {
  // Database drivers load native/WASM assets at runtime; keep them out of the bundle.
  serverExternalPackages: ["@electric-sql/pglite", "postgres", "web-push"],
  env: { NEXT_PUBLIC_APP_VERSION: APP_VERSION, ...(SITE_URL ? { NEXT_PUBLIC_SITE_URL: SITE_URL } : {}) },
  experimental: {
    // Navigations and saves that fail on a dropped connection wait and retry when it's back.
    useOffline: true,
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
