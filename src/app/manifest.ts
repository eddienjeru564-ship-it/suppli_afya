import type { MetadataRoute } from "next";

/**
 * The installed app. It opens straight into the portal; anyone signed out is
 * sent to log in and brought back. Colours match the portal so the launch
 * screen, status bar and first paint are one continuous surface.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/portal",
    name: "Suppli Afya",
    short_name: "Suppli Afya",
    description: "Your daily list of who to follow up with, your customers and your orders.",
    start_url: "/portal",
    scope: "/",
    display: "standalone",
    background_color: "#f4eee3",
    theme_color: "#f4eee3",
    lang: "en-KE",
    dir: "ltr",
    categories: ["business", "productivity"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Shown by Android in a fuller install dialog. Regenerate with e2e/screenshots.spec.ts.
    screenshots: [
      { src: "/screenshots/today-narrow.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Today: who needs you, and why" },
      { src: "/screenshots/customers-narrow.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Your customers and when they'll need more" },
      { src: "/screenshots/today-wide.png", sizes: "1280x800", type: "image/png", form_factor: "wide", label: "Today on a computer" },
    ],
    // Long-press the app icon (Android, desktop) to jump straight to these.
    shortcuts: [
      { name: "New order", url: "/portal/orders/new", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Add a customer", url: "/portal/customers/new", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Prospects", url: "/portal/prospects", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
