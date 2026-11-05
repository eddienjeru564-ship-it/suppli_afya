import { site } from "@/config/site";
import sitemap from "@/app/sitemap";
import { db } from "./db";
import { env } from "./env";

/**
 * IndexNow (indexnow.org): tells Bing, Yandex and the search engines that share it (ChatGPT search
 * reads Bing's index) that the site's pages are new or changed, so they're crawled within days
 * instead of weeks. Google doesn't use IndexNow; it finds the sitemap through robots.txt.
 *
 * The key is public by design: it's served at /3f749e0aeca27be66a75b20874593675.txt to prove we own the site.
 */
export const INDEXNOW_KEY = "3f749e0aeca27be66a75b20874593675";

/** Sends every page in the sitemap, once per deployed version of the site. */
export async function submitToIndexNow(): Promise<{ submitted: boolean; status?: number; reason?: string; urls?: number }> {
  if (!env.isProduction || !/^https:\/\/(www\.)?suppliafya\.co\.ke$/.test(site.url)) return { submitted: false, reason: "not the live site" };
  const version = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "unknown";
  const d = await db();
  const [claim] = await d.query<{ ref: string }>(
    `insert into site_events (kind, ref) values ('indexnow', $1) on conflict do nothing returning ref`,
    [version],
  );
  if (!claim) return { submitted: false, reason: "already sent for this version" };
  const urlList = sitemap().map((p) => p.url);
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(site.url).host, key: INDEXNOW_KEY, keyLocation: `${site.url}/${INDEXNOW_KEY}.txt`, urlList }),
      signal: AbortSignal.timeout(10_000),
    });
    await d.query(`update site_events set detail = $2 where kind = 'indexnow' and ref = $1`, [version, `HTTP ${res.status}, ${urlList.length} URLs`]);
    // 200 and 202 both mean accepted. Anything else: let the next call try again.
    if (res.status !== 200 && res.status !== 202) {
      await d.query(`delete from site_events where kind = 'indexnow' and ref = $1`, [version]);
      return { submitted: false, status: res.status, reason: "rejected" };
    }
    return { submitted: true, status: res.status, urls: urlList.length };
  } catch (e) {
    await d.query(`delete from site_events where kind = 'indexnow' and ref = $1`, [version]);
    return { submitted: false, reason: e instanceof Error ? e.message : "failed" };
  }
}
