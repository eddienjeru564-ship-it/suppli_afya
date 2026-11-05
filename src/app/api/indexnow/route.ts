import { submitToIndexNow } from "@/server/indexnow";

export const dynamic = "force-dynamic";

/**
 * Sends the site's pages to IndexNow. Safe to leave public: it does nothing outside the live site,
 * and at most once per deployed version. Called by the morning job, and by hand after a deploy.
 */
export async function GET() {
  return Response.json(await submitToIndexNow());
}
