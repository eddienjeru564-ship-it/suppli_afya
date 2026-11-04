import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/** The public pages, for Google Search Console. Distributors' own pages are shared by link, not listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly") => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  });
  return [page("/", 1, "weekly"), page("/check", 0.8, "monthly"), page("/start", 0.7, "monthly"), page("/login", 0.3, "yearly"), page("/privacy", 0.3, "yearly")];
}
