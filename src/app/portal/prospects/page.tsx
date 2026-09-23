import { site } from "@/config/site";
import { goalLabel, type GoalId } from "@/engine";
import { requirePortalAccount } from "@/server/auth";
import { prospects, relative } from "@/server/portal";
import { ShareLink } from "@/components/portal/ShareLink";
import { Avatar, Card, Empty, PageHeader, Pill, Row, Tabs } from "@/components/portal/ui";

export const metadata = { title: "Prospects" };

const FILTERS = [
  { id: "", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "converted", label: "Became customers" },
  { id: "closed", label: "Closed" },
];

export default async function ProspectsPage(props: PageProps<"/portal/prospects">) {
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" && FILTERS.some((f) => f.id === sp.status) ? sp.status : "";
  const a = await requirePortalAccount();
  const all = await prospects(a.workspace.id);
  const list = status ? all.filter((p) => p.status === status) : all;

  return (
    <div>
      <PageHeader
        title="Prospects"
        sub="People who did the health check through your link and sent you their plan."
      />
      <Tabs
        current={status ? `/portal/prospects?status=${status}` : "/portal/prospects"}
        items={FILTERS.map((f) => ({
          href: f.id ? `/portal/prospects?status=${f.id}` : "/portal/prospects",
          label: f.label,
          count: f.id ? all.filter((p) => p.status === f.id).length : all.length,
        }))}
      />
      {list.length === 0 ? (
        all.length === 0 ? (
          <Empty title="No prospects yet">
            <p>When someone does the health check through your link and taps send, they appear here with their answers and plan.</p>
            <div className="mx-auto mt-5 max-w-md text-left">
              <ShareLink url={`${site.url}/d/${a.workspace.slug}`} displayUrl={`${site.displayDomain}/d/${a.workspace.slug}`} channels={a.workspace.channels} compact />
            </div>
          </Empty>
        ) : (
          <Empty title="Nobody here" />
        )
      ) : (
        <Card className="divide-y divide-ink/10 overflow-hidden">
          {list.map((p) => (
            <Row key={p.id} href={`/portal/prospects/${p.id}`}>
              <Avatar name={p.name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-ink">{[p.name, p.age].filter(Boolean).join(", ")}</span>
                  <Pill tone={p.status} />
                  {p.flags.length > 0 && <span className="text-[0.72rem] font-semibold text-clay">{p.flags.length} to note</span>}
                </div>
                <div className="truncate text-[0.86rem] text-ink-soft">
                  {p.goals.map((g) => goalLabel(g as GoalId)).join(" · ") || "No goals recorded"}
                </div>
              </div>
              <span className="shrink-0 text-[0.8rem] text-ink-mute">{relative(p.created_at)}</span>
            </Row>
          ))}
        </Card>
      )}
    </div>
  );
}
