import { env } from "../env";

/**
 * Africa's Talking bulk SMS: one text to one number.
 * https://developers.africastalking.com/docs/sms/sending/bulk
 */

export type SendResult = { ok: true; id: string | null; cost: string | null } | { ok: false; error: string };

/** Status codes Africa's Talking gives an accepted message: processed, sent, queued. */
const ACCEPTED = new Set([100, 101, 102]);

export function baseUrl() {
  return env.sms.username === "sandbox" ? "https://api.sandbox.africastalking.com" : "https://api.africastalking.com";
}

export async function sendSms(to: string, message: string): Promise<SendResult> {
  const form = new URLSearchParams({ username: env.sms.username, to: `+${to.replace(/\D/g, "")}`, message });
  if (env.sms.senderId) form.set("from", env.sms.senderId);
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/version1/messaging`, {
      method: "POST",
      headers: { apiKey: env.sms.apiKey, Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Couldn't reach Africa's Talking." };
  }
  const text = await res.text();
  if (!res.ok) return { ok: false, error: `Africa's Talking answered ${res.status}: ${text.slice(0, 200)}` };
  let data: { SMSMessageData?: { Message?: string; Recipients?: { statusCode?: number; status?: string; cost?: string; messageId?: string }[] } };
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: `Africa's Talking sent something unexpected: ${text.slice(0, 200)}` };
  }
  const r = data.SMSMessageData?.Recipients?.[0];
  if (!r) return { ok: false, error: data.SMSMessageData?.Message || "No recipient in the response." };
  if (!ACCEPTED.has(Number(r.statusCode))) return { ok: false, error: r.status || `Status ${r.statusCode}` };
  return { ok: true, id: r.messageId ?? null, cost: r.cost ?? null };
}
