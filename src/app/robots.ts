import type { MetadataRoute } from "next";
import { site } from "@/config/site";

const PRIVATE = ["/portal", "/api/", "/start/pay", "/start/setup", "/start/welcome", "/card", "/login/reset", "/s/"];

/**
 * Search engines and AI assistants see the public site, so people asking Google, ChatGPT, Claude,
 * Perplexity or Gemini about tools for BF Suma distributors can find it. The portal, checkout
 * steps, APIs and stop links stay private.
 */
export default function robots(): MetadataRoute.Robots {
  const ai = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot"];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }, ...ai.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE }))],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
