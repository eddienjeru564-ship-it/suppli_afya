import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/** Search engines see the public site. The portal, checkout steps and APIs are private. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/portal", "/api/", "/start/pay", "/start/setup", "/start/welcome", "/card", "/login/reset", "/s/"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
