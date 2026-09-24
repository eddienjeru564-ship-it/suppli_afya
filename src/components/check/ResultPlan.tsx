"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import type { Distributor } from "@/config/distributors";
import { goalLabel, whatsappLink, whatsappMessage, type Answers, type EngineResult, type Recommendation } from "@/engine";
import { Alert, Check, Minus, Plus, Shield, WhatsAppIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { FormatLabel, ProductGlyph } from "./ProductGlyph";
import { WhatsAppPreview } from "./WhatsAppPreview";

const ease = [0.22, 1, 0.36, 1] as const;

function Appear({ children, i = 0, className }: { children: React.ReactNode; i?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.08 * i, ease }}
    >
      {children}
    </motion.div>
  );
}

function ProductCard({ rec, i }: { rec: Recommendation; i: number }) {
  const [open, setOpen] = useState(false);
  const p = rec.product;
  return (
    <Appear i={i + 2}>
      <article className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-paper">
        <div className="flex gap-4 p-5">
          <div className="grid h-20 w-16 shrink-0 place-items-center rounded-2xl bg-sand/70 p-2">
            <ProductGlyph product={p} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[0.75rem] font-semibold text-ink-mute">
              <FormatLabel product={p} /> · {p.line}
            </div>
            <h3 className="font-display text-[1.45rem] leading-[1.15] text-ink">{p.name}</h3>
            {rec.covers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rec.covers.map((g) => (
                  <span key={g} className="rounded-full bg-sage-soft px-2.5 py-0.5 text-[0.72rem] font-semibold text-forest">
                    {goalLabel(g)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="text-[0.78rem] font-semibold text-clay">Why it&apos;s in your plan</div>
          <ul className="mt-1.5 grid gap-1.5">
            {rec.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-[0.93rem] leading-relaxed text-ink">
                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-moss" />
                {r}
              </li>
            ))}
          </ul>

          {rec.cautions.length > 0 && (
            <div className="mt-3 grid gap-1.5 rounded-xl bg-clay-soft/50 p-3">
              {rec.cautions.map((c) => (
                <p key={c} className="flex gap-2 text-[0.85rem] leading-snug text-[#6b3a1f]">
                  <Alert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {c}
                </p>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-forest"
          >
            {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            What it is and what to expect
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 pt-3 text-[0.9rem] leading-relaxed text-ink-soft">
                  <p>{p.summary}</p>
                  <p>
                    <span className="font-semibold text-ink">What to expect. </span>
                    {p.expectation}
                  </p>
                  {p.keyIngredients.length > 0 && (
                    <p>
                      <span className="font-semibold text-ink">Key ingredients. </span>
                      {p.keyIngredients.join(", ")}.
                    </p>
                  )}
                  {p.note && (
                    <p>
                      <span className="font-semibold text-ink">Good to know. </span>
                      {p.note}
                    </p>
                  )}
                  <p className="text-[0.8rem] text-ink-mute">Follow the dose on the label, or as your distributor advises.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </article>
    </Appear>
  );
}

export function ResultPlan({
  result,
  answers,
  distributor,
  onRestart,
  onEdit,
  embedded,
}: {
  result: EngineResult;
  answers: Answers;
  distributor: Distributor;
  onRestart: () => void;
  onEdit: () => void;
  embedded?: boolean;
}) {
  const [showMessage, setShowMessage] = useState(false);
  const [shared, setShared] = useState(false);
  const [phone, setPhone] = useState("");

  /** Save the lead to the distributor's workspace, then open WhatsApp. */
  const send = () => {
    try {
      fetch("/api/leads", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: distributor.slug, answers, ref: result.ref, phone: phone || undefined }),
      }).catch(() => {});
    } catch {
      /* never block the WhatsApp handoff */
    }
    window.location.assign(whatsappLink(distributor.whatsapp!, message));
  };
  const handoffRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const handoffInView = useInView(handoffRef, { margin: "0px 0px -10% 0px" });
  const topInView = useInView(topRef);
  const showBar = !embedded && !handoffInView && !topInView;
  const p = result.profile;
  const ctx = { distributorName: distributor.name, distributorFirstName: distributor.firstName };
  const message = whatsappMessage(result, ctx);
  const canSend = Boolean(distributor.whatsapp) && !distributor.demo;
  const name = p.name || "Here";

  const sharePlan = async () => {
    const lines = [
      `My health check plan (${result.ref})`,
      ...result.core.map((c) => `• ${c.product.name}: ${c.reasons[0] ?? ""}`),
      ...(result.habits.length ? ["", "Habits:", ...result.habits.map((h) => `• ${h.title}`)] : []),
      "",
      `From ${distributor.name}, BF Suma distributor`,
    ];
    const text = lines.join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "My health check plan", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      /* cancelled or blocked */
    }
  };

  const title =
    result.status === "clinic-first" ? `${name}, let's start with your clinic.` : `${name}, here's your plan.`;

  return (
    <div className="pb-4">
      <Appear>
        <div ref={topRef} className="text-[0.8rem] font-semibold text-clay">Your plan · {result.ref}</div>
        <h2 className={clsx("mt-2 font-display leading-[1.05] tracking-[-0.02em] text-ink", embedded ? "text-[2rem]" : "text-[2.4rem] sm:text-[2.9rem]")}>
          {title}
        </h2>
        <div className="mt-3 grid gap-1 text-[1rem] leading-relaxed text-ink-soft">
          {result.heard.map((h) => (
            <p key={h}>{h}</p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 text-[0.75rem] font-semibold">
          {result.core.length > 0 && (
            <span className="rounded-full bg-forest px-2.5 py-1 text-cream">
              {result.core.length} product{result.core.length > 1 ? "s" : ""}
            </span>
          )}
          {result.habits.length > 0 && (
            <span className="rounded-full bg-sand px-2.5 py-1 text-ink-soft">
              {result.habits.length} free habit{result.habits.length > 1 ? "s" : ""}
            </span>
          )}
          {result.excluded.length > 0 && (
            <span className="rounded-full bg-sand px-2.5 py-1 text-ink-soft">{result.excluded.length} left out for safety</span>
          )}
          {result.seeDoctor.length + (result.status !== "ready" ? 1 : 0) > 0 && (
            <span className="rounded-full bg-clay-soft px-2.5 py-1 text-clay">
              {result.seeDoctor.length + (result.status !== "ready" ? 1 : 0)} to check with a doctor
            </span>
          )}
        </div>
      </Appear>

      {result.planNotes.length > 0 && (
        <Appear i={1} className="mt-6">
          <div
            className={clsx(
              "rounded-[1.25rem] border p-4",
              result.status === "ready" ? "border-ink/10 bg-paper" : "border-clay/25 bg-clay-soft/40",
            )}
          >
            <div className="flex items-center gap-2 text-[0.85rem] font-semibold text-clay">
              <Shield />
              {result.status === "clinic-first"
                ? "Speak to your clinic first"
                : result.status === "review"
                  ? "Check with your doctor or pharmacist first"
                  : "Good to know"}
            </div>
            <div className="mt-2 grid gap-2 text-[0.92rem] leading-relaxed text-ink">
              {result.planNotes.map((n) => (
                <p key={n}>{n}</p>
              ))}
            </div>
          </div>
        </Appear>
      )}

      {result.core.length > 0 && (
        <section className="mt-8">
          <Appear i={1}>
            <h3 className="text-[0.95rem] font-semibold text-ink">
              {result.core.length === 1 ? "Where to start" : `Your plan: ${result.core.length} products`}
            </h3>
          </Appear>
          <div className="mt-3 grid gap-3">
            {result.core.map((rec, i) => (
              <ProductCard key={rec.product.id} rec={rec} i={i} />
            ))}
          </div>
        </section>
      )}

      {result.addons.length > 0 && (
        <Appear i={result.core.length + 2} className="mt-8">
          <h3 className="text-[0.95rem] font-semibold text-ink">Worth considering later</h3>
          <div className="mt-3 grid gap-2">
            {result.addons.map((rec) => (
              <div key={rec.product.id} className="flex gap-3 rounded-2xl border border-ink/10 bg-paper/60 p-3.5">
                <div className="h-12 w-10 shrink-0">
                  <ProductGlyph product={rec.product} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-ink">{rec.product.name}</div>
                  <p className="text-[0.86rem] leading-snug text-ink-soft">{rec.reasons[0]}</p>
                  {rec.cautions[0] && <p className="mt-1 text-[0.8rem] leading-snug text-clay">{rec.cautions[0]}</p>}
                </div>
              </div>
            ))}
          </div>
        </Appear>
      )}

      {result.excluded.length > 0 && (
        <Appear i={result.core.length + 3} className="mt-8">
          <h3 className="text-[0.95rem] font-semibold text-ink">What we left out, and why</h3>
          <div className="mt-3 divide-y divide-ink/10 rounded-2xl border border-ink/10">
            {result.excluded.map((e) => (
              <div key={e.product.id} className="p-3.5">
                <div className="text-[0.92rem] font-semibold text-ink line-through decoration-ink/30">{e.product.name}</div>
                <p className="text-[0.86rem] leading-snug text-ink-soft">{e.reason}</p>
              </div>
            ))}
          </div>
        </Appear>
      )}

      {result.habits.length > 0 && (
        <Appear i={result.core.length + 4} className="mt-8">
          <h3 className="text-[0.95rem] font-semibold text-ink">Small changes that will help</h3>
          <p className="mt-1 text-[0.88rem] text-ink-soft">No products needed. These make everything else work better.</p>
          <ol className={clsx("mt-3 grid gap-2.5", !embedded && "sm:grid-cols-2")}>
            {result.habits.map((h, i) => (
              <li key={h.id} className="rounded-2xl bg-sand/55 p-4">
                <div className="font-display text-[0.95rem] text-clay">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-1 font-semibold leading-snug text-ink">{h.title}</div>
                <p className="mt-1 text-[0.86rem] leading-relaxed text-ink-soft">{h.detail}</p>
              </li>
            ))}
          </ol>
        </Appear>
      )}

      {result.seeDoctor.length > 0 && (
        <Appear i={result.core.length + 5} className="mt-8">
          <h3 className="text-[0.95rem] font-semibold text-ink">Worth checking with a doctor</h3>
          <ul className="mt-3 grid gap-2">
            {result.seeDoctor.map((s) => (
              <li key={s} className="flex gap-2.5 text-[0.92rem] leading-relaxed text-ink">
                <Shield className="mt-1 h-4 w-4 shrink-0 text-clay" />
                {s}
              </li>
            ))}
          </ul>
        </Appear>
      )}

      <Appear i={result.core.length + 6} className="mt-10">
        <div ref={handoffRef} className="scroll-mt-24 rounded-[1.5rem] bg-forest p-5 text-cream">
          <div className="font-display text-[1.5rem] leading-tight">Send your plan to {distributor.firstName}</div>
          <p className="mt-1.5 text-[0.92rem] leading-relaxed text-cream/75">
            {distributor.firstName} will confirm prices, answer your questions and help you get started. Your answers go
            only to {distributor.firstName}, and only when you send them.
          </p>
          {canSend ? (
            <>
              <label className="mt-4 block text-[0.82rem] font-medium text-cream/80">
                Your WhatsApp number <span className="text-cream/50">(optional)</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="07XX XXX XXX"
                  className="mt-1.5 w-full rounded-xl border border-cream/20 bg-cream/10 px-3.5 py-3 text-[1rem] text-cream outline-none placeholder:text-cream/35 focus:border-cream/60"
                />
              </label>
              <Button variant="whatsapp" size="lg" className="mt-3 w-full" onClick={send}>
                <WhatsAppIcon /> Send on WhatsApp
              </Button>
              <p className="mt-2 text-center text-[0.76rem] leading-snug text-cream/60">
                Sending shares your answers and plan with {distributor.firstName}, in WhatsApp and in their Suppli Afya
                workspace.
              </p>
            </>
          ) : (
            <>
              <Button variant="whatsapp" size="lg" className="mt-4 w-full" onClick={() => setShowMessage((s) => !s)}>
                <WhatsAppIcon /> {showMessage ? "Hide the message" : `See the message ${distributor.firstName} gets`}
              </Button>
              <p className="mt-2 text-center text-[0.78rem] text-cream/60">
                This is a demo, so nothing is sent. On a real link this opens WhatsApp with the message ready.
              </p>
            </>
          )}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease }}
                className="overflow-hidden"
              >
                <WhatsAppPreview message={message} contactName={p.name || "Customer"} className="mt-4" compact />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Appear>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={sharePlan}>
          {shared ? "Copied" : "Share or save my plan"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Change my answers
        </Button>
        <Button variant="ghost" size="sm" onClick={onRestart}>
          Start again
        </Button>
      </div>

      {/* Full-page check: keep the next step one tap away while reading the plan. */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-6 [background:linear-gradient(to_top,var(--color-cream)_55%,transparent)]"
          >
            <div className="mx-auto max-w-xl">
              {canSend ? (
                <Button
                  variant="whatsapp"
                  size="lg"
                  className="w-full shadow-float"
                  onClick={() => handoffRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  <WhatsAppIcon /> Send my plan to {distributor.firstName}
                </Button>
              ) : (
                <Button
                  variant="whatsapp"
                  size="lg"
                  className="w-full shadow-float"
                  onClick={() => {
                    setShowMessage(true);
                    handoffRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <WhatsAppIcon /> Send my plan to {distributor.firstName}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-[0.75rem] leading-relaxed text-ink-mute">
        General wellness guidance only, not medical advice. Supplements don&apos;t replace a varied diet or any medicine
        you&apos;ve been prescribed. Read the label before use.
      </p>
    </div>
  );
}
