import webpush from "web-push";
import type { Workspace } from "./auth";
import { db } from "./db";
import { env, pushConfigured } from "./env";
import { today, type Task } from "./portal";

/**
 * The morning reminder: one notification a day, only when someone needs the
 * distributor, saying who first. Nothing on quiet days.
 */

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

let configured = false;
function setup() {
  if (!configured) {
    webpush.setVapidDetails(env.push.subject, env.push.publicKey, env.push.privateKey);
    configured = true;
  }
}

export async function saveSubscription(workspaceId: string, sub: PushSubscriptionJSON, userAgent: string | null) {
  const d = await db();
  await d.query(
    `insert into push_subscriptions (workspace_id, endpoint, p256dh, auth, user_agent) values ($1, $2, $3, $4, $5)
     on conflict (endpoint) do update set workspace_id = excluded.workspace_id, p256dh = excluded.p256dh, auth = excluded.auth`,
    [workspaceId, sub.endpoint, sub.keys.p256dh, sub.keys.auth, userAgent?.slice(0, 300) ?? null],
  );
}

export async function removeSubscription(workspaceId: string, endpoint: string) {
  const d = await db();
  await d.query(`delete from push_subscriptions where workspace_id = $1 and endpoint = $2`, [workspaceId, endpoint]);
}

export interface Payload {
  title: string;
  body: string;
  url: string;
  count: number;
  tag: string;
}

const first = (n: string) => n.split(" ")[0].split(",")[0];

/** What the reminder says. Null means don't send one today. */
export function morningMessage(ownerName: string | null, tasks: Pick<Task, "kind" | "title">[]): Payload | null {
  if (tasks.length === 0) return null;
  const who = first(tasks[0].title);
  const lead: Record<Task["kind"], string> = {
    new: `${who} did your health check`,
    payment: `${who} hasn't paid yet`,
    reorder: `${who} is due for a reorder`,
    checkin: `${who} is due a check-in`,
    quiet: `${who} has gone quiet`,
  };
  const rest = tasks.length - 1;
  const name = ownerName ? `, ${first(ownerName)}` : "";
  return {
    title: tasks.length === 1 ? `Good morning${name}. One person needs you today` : `Good morning${name}. ${tasks.length} people need you today`,
    body: rest > 0 ? `${lead[tasks[0].kind]}, and ${rest} more. Messages are ready to send.` : `${lead[tasks[0].kind]}. The message is ready to send.`,
    url: "/portal",
    count: tasks.length,
    tag: "morning",
  };
}

export async function sendTo(sub: { id: string; endpoint: string; p256dh: string; auth: string }, payload: Payload | { title: string; body: string; url: string; tag: string }) {
  setup();
  const d = await db();
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), {
      TTL: 6 * 3600,
      urgency: "normal",
    });
    await d.query(`update push_subscriptions set last_sent_at = now() where id = $1`, [sub.id]);
    return true;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    // Gone: the app was removed or permission withdrawn. Forget the device.
    if (status === 404 || status === 410) await d.query(`delete from push_subscriptions where id = $1`, [sub.id]);
    return false;
  }
}

/** Runs once each morning. Safe to call twice: a device gets at most one reminder in 20 hours. */
export async function sendMorningReminders() {
  if (!pushConfigured()) return { workspaces: 0, sent: 0, skipped: "not configured" as const };
  const d = await db();
  const rows = await d.query<Workspace & { subs: { id: string; endpoint: string; p256dh: string; auth: string }[] }>(
    `select w.*, json_agg(json_build_object('id', p.id, 'endpoint', p.endpoint, 'p256dh', p.p256dh, 'auth', p.auth)) as subs
       from workspaces w
       join push_subscriptions p on p.workspace_id = w.id
       join subscriptions s on s.workspace_id = w.id
      where w.onboarded_at is not null
        and s.status = 'active' and s.current_period_end > now() - interval '3 days'
        and (p.last_sent_at is null or p.last_sent_at < now() - interval '20 hours')
      group by w.id`,
  );
  let sent = 0;
  for (const w of rows) {
    const payload = morningMessage(w.owner_name, await today(w));
    if (!payload) continue;
    for (const s of w.subs) if (await sendTo(s, payload)) sent++;
  }
  return { workspaces: rows.length, sent };
}
