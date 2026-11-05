"use server";

import { redirect } from "next/navigation";
import { setStoppedByCustomer } from "@/server/sms";

/** A form post, never a plain link visit: link previews in WhatsApp or SMS apps open links on their own. */
export async function setTexts(fd: FormData) {
  const token = String(fd.get("token") ?? "");
  const stop = fd.get("stop") === "1";
  await setStoppedByCustomer(token, stop);
  redirect(`/s/${encodeURIComponent(token)}?done=${stop ? "stopped" : "restarted"}`);
}
