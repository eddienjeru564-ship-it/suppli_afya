import { beforeAll, describe, expect, it, vi } from "vitest";

process.env.PGLITE_DIR = "memory://";
process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "BExamplePublicKey";
process.env.VAPID_PRIVATE_KEY = "examplePrivateKey";
delete process.env.DATABASE_URL;

const sent: { endpoint: string; payload: Record<string, unknown> }[] = [];
let failWith: number | null = null;
vi.mock("web-push", () => ({
  default: {
    setVapidDetails: () => undefined,
    sendNotification: async (sub: { endpoint: string }, body: string) => {
      if (failWith) throw Object.assign(new Error("push failed"), { statusCode: failWith });
      sent.push({ endpoint: sub.endpoint, payload: JSON.parse(body) });
    },
  },
}));

type Db = Awaited<ReturnType<typeof import("./db").db>>;
let d: Db;
let push: typeof import("./push");

beforeAll(async () => {
  d = await (await import("./db")).db();
  push = await import("./push");
});

let n = 0;
async function distributor(opts: { tasks: boolean; paid?: boolean }) {
  const [u] = await d.query<{ id: string }>(`insert into users (email, password_hash) values ($1, 'x') returning id`, [`p${++n}@example.com`]);
  const [w] = await d.query<{ id: string }>(
    `insert into workspaces (owner_id, plan, owner_name, slug, onboarded_at) values ($1, 'growth', 'Jane Wanjiku', $2, now()) returning id`,
    [u.id, `jane-${n}`],
  );
  await d.query(
    `insert into subscriptions (workspace_id, plan, status, current_period_start, current_period_end)
     values ($1, 'growth', 'active', now(), now() + interval ${opts.paid === false ? "'-10 days'" : "'20 days'"})`,
    [w.id],
  );
  if (opts.tasks) {
    await d.query(`insert into prospects (workspace_id, ref, name) values ($1, 'SA-1', 'Wanjiru')`, [w.id]);
    await d.query(`insert into prospects (workspace_id, ref, name) values ($1, 'SA-2', 'Otieno')`, [w.id]);
  }
  await push.saveSubscription(w.id, { endpoint: `https://push.example/${n}`, keys: { p256dh: "k", auth: "a" } }, "test");
  return { id: w.id, endpoint: `https://push.example/${n}` };
}

describe("morning reminder", () => {
  it("says who needs you first, and how many more", () => {
    const m = push.morningMessage("Jane Wanjiku", [
      { kind: "reorder", title: "Otieno Kamau" },
      { kind: "new", title: "Wanjiru, 34" },
      { kind: "payment", title: "Achieng" },
    ]);
    expect(m).toMatchObject({
      title: "Good morning, Jane. 3 people need you today",
      body: "Otieno is due for a reorder, and 2 more. Messages are ready to send.",
      count: 3,
      url: "/portal",
    });
    expect(push.morningMessage("Jane", [{ kind: "new", title: "Wanjiru, 34" }])?.body).toBe(
      "Wanjiru did your health check. The message is ready to send.",
    );
  });

  it("stays quiet when nobody needs you", () => {
    expect(push.morningMessage("Jane", [])).toBeNull();
  });

  it("sends once a morning, only to paying distributors with something to do", async () => {
    const busy = await distributor({ tasks: true });
    const quiet = await distributor({ tasks: false });
    const lapsed = await distributor({ tasks: true, paid: false });
    sent.length = 0;

    await push.sendMorningReminders();
    expect(sent.map((s) => s.endpoint)).toEqual([busy.endpoint]);
    expect(sent[0].payload).toMatchObject({ count: 2 });
    expect(sent.some((s) => s.endpoint === quiet.endpoint || s.endpoint === lapsed.endpoint)).toBe(false);

    // A second run the same morning sends nothing.
    await push.sendMorningReminders();
    expect(sent).toHaveLength(1);
  });

  it("forgets a device that no longer accepts notifications", async () => {
    const w = await distributor({ tasks: true });
    failWith = 410;
    await push.sendMorningReminders();
    failWith = null;
    const rows = await d.query(`select 1 from push_subscriptions where endpoint = $1`, [w.endpoint]);
    expect(rows).toHaveLength(0);
  });
});
