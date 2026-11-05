import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { GUIDES } from "@/content/guides";

/** The public pages, for Google Search Console. Distributors' own pages are shared by link, not listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly", lastModified: Date = new Date()) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/guides", 0.8, "weekly"),
    ...GUIDES.map((g) => page(`/guides/${g.slug}`, 0.7, "monthly", new Date(g.updated))),
    page("/check", 0.6, "monthly"),
    page("/start", 0.6, "monthly"),
    page("/login", 0.3, "yearly"),
    page("/privacy", 0.3, "yearly"),
  ];
}
