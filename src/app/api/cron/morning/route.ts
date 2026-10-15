import { timingSafeEqual } from "node:crypto";
import { sendSubscriptionEmails } from "@/server/email";
import { env } from "@/server/env";
import { sendMorningReminders } from "@/server/push";

/**
 * Called by the scheduler every morning (see vercel.json). Needs CRON_SECRET. Sends the morning
 * reminder, and the emails about subscriptions that are about to end or just ended.
 */
export async function GET(req: Request) {
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${env.cronSecret}`);
  if (!env.cronSecret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [push, email] = await Promise.all([sendMorningReminders(), sendSubscriptionEmails()]);
  return Response.json({ push, email });
}
