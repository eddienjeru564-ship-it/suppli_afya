import { timingSafeEqual } from "node:crypto";
import { env } from "@/server/env";
import { sendMorningReminders } from "@/server/push";

/** Called by the scheduler every morning (see vercel.json). Needs CRON_SECRET. */
export async function GET(req: Request) {
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${env.cronSecret}`);
  if (!env.cronSecret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json(await sendMorningReminders());
}
