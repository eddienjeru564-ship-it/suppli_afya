import { beforeAll, describe, expect, it } from "vitest";

process.env.PGLITE_DIR = "memory://";
delete process.env.DATABASE_URL;

type Db = Awaited<ReturnType<typeof import("./db").db>>;
let d: Db;
let route: typeof import("@/app/api/leads/route");

beforeAll(async () => {
  d = await (await import("./db")).db();
  route = await import("@/app/api/leads/route");
});

let n = 0;
async function distributor() {
  const [u] = await d.query<{ id: string }>(`insert into users (email, password_hash) values ($1, 'x') returning id`, [`lead${++n}@example.com`]);
  const [w] = await d.query<{ id: string; slug: string }>(
    `insert into workspaces (owner_id, plan, owner_name, slug, onboarded_at) values ($1, 'growth', 'Grace Wambui', $2, now()) returning id, slug`,
    [u.id, `grace-${n}`],
  );
  await d.query(
    `insert into subscriptions (workspace_id, plan, status, current_period_start, current_period_end) values ($1, 'growth', 'active', now(), now() + interval '20 days')`,
    [w.id],
  );
  return w;
}

const answers = { first_name: "Achieng", sex: "female", age: 41, goals: ["joints"] };
// Each call gives a new reference in the check's format (SA- and four of these characters).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
let refs = 0;
const ref = () => {
  let x = ++refs;
  let s = "";
  for (let i = 0; i < 4; i++, x = Math.floor(x / 32)) s += ALPHABET[x % 32];
  return `SA-${s}`;
};

const post = (body: unknown) =>
  route.POST(new Request("http://app.test/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

describe("health check leads", () => {
  it("files the prospect with only the answers the check asked for", async () => {
    const w = await distributor();
    const r = ref();
    const res = await post({ slug: w.slug, ref: r, phone: "0722 111 222", answers: { ...answers, injected: "<script>", age: 1e12 } });
    expect(await res.json()).toEqual({ ok: true, stored: true });
    const [p] = await d.query<{ name: string; phone: string; age: number | null; answers: Record<string, unknown> }>(
      `select name, phone, age, answers from prospects where workspace_id = $1 and ref = $2`,
      [w.id, r],
    );
    expect(p).toMatchObject({ name: "Achieng", phone: "254722111222", age: null });
    expect(p.answers).not.toHaveProperty("injected");
    expect(p.answers.first_name).toBe("Achieng");
  });

  it("turns away requests that aren't a health check", async () => {
    const w = await distributor();
    expect((await post({ slug: w.slug, ref: ref(), answers: [answers] })).status).toBe(400);
    expect((await post({ slug: w.slug, ref: "nope", answers })).status).toBe(400);
    expect((await post({ slug: w.slug, ref: ref(), answers: { ...answers, first_name: "x".repeat(30_000) } })).status).toBe(413);
    // A phone that isn't text is ignored rather than breaking the request.
    expect((await post({ slug: w.slug, ref: ref(), answers, phone: { n: 1 } })).status).toBe(200);
  });

  it("stops one workspace being flooded", async () => {
    const w = await distributor();
    await d.query(
      `insert into prospects (workspace_id, ref, name) select $1, 'SA-' || lpad(g::text, 4, '0'), 'x' from generate_series(1, 300) g`,
      [w.id],
    );
    expect((await post({ slug: w.slug, ref: ref(), answers })).status).toBe(429);
  });
});
