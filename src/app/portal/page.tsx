import Link from "next/link";
import { goalFocus } from "@/config/onboarding";
import { PLANS_BY_ID } from "@/config/plans";
import { communityUrl, site } from "@/config/site";
import { requirePortalAccount } from "@/server/auth";
import { db } from "@/server/db";
import { monthStats, today } from "@/server/portal";
import { CommunityInvite } from "@/components/portal/Community";
import { ShareLink } from "@/components/portal/ShareLink";
import { TaskList } from "@/components/portal/TaskList";
import { Card, kesAmount } from "@/components/portal/ui";
import { Check } from "@/components/ui/icons";

export const metadata = { title: "Today" };

function greeting() {
  const h = Number(new Date().toLocaleString("en-KE", { hour: "numeric", hour12: false, timeZone: "Africa/Nairobi" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function Dashboard() {
  const a = await requirePortalAccount();
  const w = a.workspace;
  const d = await db();
  const [tasks, stats, counts] = await Promise.all([
    today(w),
    monthStats(w.id),
    d.query<{ customers: number; orders: number; prospects: number }>(
      `select (select count(*)::int from customers where workspace_id = $1) as customers,
              (select count(*)::int from orders where workspace_id = $1) as orders,
              (select count(*)::int from prospects where workspace_id = $1) as prospects`,
      [w.id],
    ),
  ]);
  const c = counts[0];
  const first = (w.owner_name ?? "").split(" ")[0];
  const url = `${site.url}/d/${w.slug}`;
  const displayUrl = `${site.displayDomain}/d/${w.slug}`;
  const plan = PLANS_BY_ID[w.plan];
  const isNew = c.customers + c.orders + c.prospects === 0;
  const steps = [
    // Already true: starting the checklist part-done makes the rest feel close.
    { done: true, title: "Set up your workspace", body: "" },
    { done: c.prospects > 0, title: "Share your health check link", body: "Your first prospect appears here as soon as someone sends their plan." },
    { done: c.customers > 0, title: "Add a customer you already have", body: "Start with the people who order from you regularly.", href: "/portal/customers/new" },
    { done: c.orders > 0, title: "Record an order", body: "We'll work out when they're likely to run out and remind you.", href: "/portal/orders/new" },
  ];
  const setupDone = steps.every((s) => s.done);
  const hasActivity = c.orders + c.prospects > 0;
  const date = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Nairobi" });

  return (
    <div className="grid gap-10">
      <div>
        <div className="text-[0.85rem] font-semibold text-clay">{date}</div>
        <h1 className="mt-1 font-display text-[2.3rem] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[2.8rem]">
          {isNew ? `Welcome, ${first}.` : `${greeting()}, ${first}.`}
        </h1>
        <p className="mt-2 max-w-xl text-[1rem] leading-relaxed text-ink-soft">
          {isNew
            ? `We've set up your workspace around ${goalFocus(w.goals)}. Here's the quickest way to get going.`
            : tasks.length
              ? `${tasks.length} ${tasks.length === 1 ? "person needs" : "people need"} you today, with ${goalFocus(w.goals, 1)} first.`
              : setupDone
                ? "Nobody needs you right now. Here's how the month is going."
                : "Nothing needs you yet. Finish getting started and your list will fill up."}
        </p>
      </div>

      {!setupDone && (
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[1.35rem] text-ink">Getting started</h2>
            <span className="text-[0.8rem] font-semibold text-ink-mute">
              {steps.filter((s) => s.done).length} of {steps.length}
            </span>
          </div>
          <ol className="mt-4 grid gap-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span
                  className={
                    s.done
                      ? "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest text-cream"
                      : "grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/20 text-[0.8rem] font-semibold text-ink-soft"
                  }
                >
                  {s.done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={s.done ? "font-semibold text-ink-mute line-through" : "font-semibold text-ink"}>
                    {s.href && !s.done ? (
                      <Link href={s.href} className="underline decoration-ink/20 underline-offset-4 hover:decoration-forest">
                        {s.title}
                      </Link>
                    ) : (
                      s.title
                    )}
                  </div>
                  {!s.done && <p className="text-[0.88rem] leading-snug text-ink-soft">{s.body}</p>}
                  {i === 1 && !s.done && (
                    <div className="mt-3">
                      <ShareLink url={url} displayUrl={displayUrl} channels={w.channels} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[1.6rem] text-ink">Today</h2>
          {tasks.length > 0 && <span className="text-[0.85rem] font-semibold text-ink-mute">{tasks.length} to do</span>}
        </div>
        <TaskList tasks={tasks} />
      </section>

      {hasActivity && (
        <section>
          <h2 className="mb-3 font-display text-[1.6rem] text-ink">This month</h2>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="New prospects" value={String(stats.prospects)} href="/portal/prospects" />
            <Stat label="Orders" value={String(stats.orders)} href="/portal/orders" />
            <Stat label="Paid" value={kesAmount(stats.paid)} href="/portal/orders?status=paid" />
            <Stat label="Reorders due soon" value={String(stats.reordersDue)} href="/portal/customers" />
          </div>
          {plan.monthlySummary ? (
            <p className="mt-3 text-[0.93rem] leading-relaxed text-ink-soft">
              {stats.repeatOrders} of this month&apos;s orders came from returning customers.{" "}
              {stats.unpaid > 0 ? `${kesAmount(stats.unpaid)} is still owed on unpaid orders.` : "Nothing is owed on open orders."}
            </p>
          ) : (
            <p className="mt-3 text-[0.85rem] text-ink-mute">
              The monthly summary of repeat orders and money owed is part of{" "}
              <Link href="/start/pay?renew=1&plan=growth" className="font-semibold text-forest underline underline-offset-2">
                Growth
              </Link>
              .
            </p>
          )}
        </section>
      )}

      {setupDone && (
        <section>
          <h2 className="mb-3 font-display text-[1.6rem] text-ink">Your health check link</h2>
          <Card className="p-5">
            <ShareLink url={url} displayUrl={displayUrl} channels={w.channels} />
          </Card>
        </section>
      )}

      {communityUrl && !w.community_dismissed_at && <CommunityInvite url={communityUrl} />}
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-[1.1rem] border border-ink/10 bg-paper p-4 transition-colors hover:border-ink/25">
      <div className="text-[0.8rem] font-semibold text-ink-mute">{label}</div>
      <div className="mt-1 font-display text-[1.6rem] leading-tight text-ink">{value}</div>
    </Link>
  );
}
