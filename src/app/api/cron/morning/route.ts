import { timingSafeEqual } from "node:crypto";
import { sendSubscriptionEmails } from "@/server/email";
import { env } from "@/server/env";
import { sendMorningReminders } from "@/server/push";
import { sendSmsReminders } from "@/server/sms";
import { submitToIndexNow } from "@/server/indexnow";

/**
 * Called by the scheduler every morning (see vercel.json). Needs CRON_SECRET. Sends the morning
 * reminder, the emails about subscriptions that are about to end or just ended, and the reminder texts
 * to distributors' customers. 05:00 UTC is 08:00 in Nairobi, a fine time for a text to arrive.
 */
export async function GET(req: Request) {
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${env.cronSecret}`);
  if (!env.cronSecret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [push, email, sms, indexnow] = await Promise.all([sendMorningReminders(), sendSubscriptionEmails(), sendSmsReminders(), submitToIndexNow()]);
  return Response.json({ push, email, sms, indexnow });
}
