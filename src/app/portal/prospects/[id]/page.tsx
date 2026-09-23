import Link from "next/link";
import { notFound } from "next/navigation";
import { goalLabel, type GoalId } from "@/engine";
import { requirePortalAccount } from "@/server/auth";
import { prospect, relative } from "@/server/portal";
import { Card, Pill, prettyPhone } from "@/components/portal/ui";
import { Alert, ChevronLeft } from "@/components/ui/icons";
import { ProspectActions } from "./ProspectActions";

export default async function ProspectPage(props: PageProps<"/portal/prospects/[id]">) {
  const { id } = await props.params;
  const a = await requirePortalAccount();
  const p = /^[0-9a-f-]{36}$/.test(id) ? await prospect(a.workspace.id, id) : null;
  if (!p) notFound();
  const r = p.result ?? {};

  return (
    <div className="grid gap-6">
      <Link href="/portal/prospects" className="inline-flex w-fit items-center gap-1 text-[0.88rem] font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="h-3.5 w-3.5" /> Prospects
      </Link>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-[2.2rem] leading-tight tracking-[-0.02em] text-ink">{[p.name, p.age].filter(Boolean).join(", ")}</h1>
          <Pill tone={p.status} />
        </div>
        <p className="mt-1 text-[0.93rem] text-ink-soft">
          Did the health check {relative(p.created_at)} · Ref <span className="font-mono">{p.ref}</span>
          {p.phone && <> · {prettyPhone(p.phone)}</>}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid content-start gap-4">
          <Card className="p-5">
            <h2 className="text-[0.95rem] font-semibold text-ink">What they told the health check</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.goals.map((g, i) => (
                <span key={g} className="rounded-full bg-sage-soft px-2.5 py-1 text-[0.78rem] font-semibold text-forest">
                  {i + 1}. {goalLabel(g as GoalId)}
                </span>
              ))}
            </div>
            {r.heard && r.heard.length > 0 && (
              <div className="mt-3 grid gap-1 text-[0.93rem] leading-relaxed text-ink-soft">
                {r.heard.map((h) => (
                  <p key={h}>{h}</p>
                ))}
              </div>
            )}
            {p.preference && <p className="mt-3 text-[0.93rem] text-ink"><span className="text-ink-mute">Wants:</span> {p.preference}</p>}
          </Card>

          {p.flags.length > 0 && (
            <Card className="border-clay/25 bg-clay-soft/30 p-5">
              <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold text-clay">
                <Alert /> Be careful with
              </h2>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {p.flags.map((f) => (
                  <li key={f} className="rounded-full bg-paper px-2.5 py-1 text-[0.8rem] font-medium text-clay">
                    {f}
                  </li>
                ))}
              </ul>
              {r.planNotes?.map((n) => (
                <p key={n} className="mt-3 text-[0.9rem] leading-relaxed text-ink">
                  {n}
                </p>
              ))}
            </Card>
          )}

          <Card className="p-5">
            <h2 className="text-[0.95rem] font-semibold text-ink">The plan they received</h2>
            {r.core && r.core.length > 0 ? (
              <ul className="mt-3 grid gap-3">
                {r.core.map((c) => (
                  <li key={c.product.id} className="rounded-xl bg-cream p-3.5">
                    <div className="font-display text-[1.15rem] text-ink">{c.product.name}</div>
                    {c.reasons[0] && <p className="mt-0.5 text-[0.88rem] leading-snug text-ink-soft">{c.reasons[0]}</p>}
                    {c.cautions.map((x) => (
                      <p key={x} className="mt-1.5 text-[0.82rem] leading-snug text-clay">
                        {x}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[0.93rem] text-ink-soft">No product plan: the health check asked them to speak to their clinic first.</p>
            )}
            {r.addons && r.addons.length > 0 && (
              <p className="mt-3 text-[0.88rem] text-ink-soft">Maybe later: {r.addons.map((x) => x.product.name).join(", ")}</p>
            )}
            {r.seeDoctor && r.seeDoctor.length > 0 && (
              <div className="mt-3 border-t border-ink/10 pt-3">
                <div className="text-[0.8rem] font-semibold text-ink-mute">They were also told</div>
                {r.seeDoctor.map((s) => (
                  <p key={s} className="mt-1 text-[0.88rem] leading-snug text-ink-soft">
                    {s}
                  </p>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card className="p-5">
            <ProspectActions
              id={p.id}
              status={p.status}
              phone={p.phone}
              opener={r.opener ?? `Hi ${p.name}, thanks for doing the health check.`}
              customerId={p.customer_id}
            />
          </Card>
          {r.tips && r.tips.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[0.95rem] font-semibold text-ink">Good to know before you reply</h2>
              <ul className="mt-2 grid gap-1.5 text-[0.9rem] leading-snug text-ink-soft">
                {r.tips.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-mute" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
