"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, useTransition } from "react";
import { BUSINESS_TYPES, CHANNELS, GOALS, goalFocus, labelFor } from "@/config/onboarding";
import { Logo } from "@/components/brand/Logo";
import { QrCard } from "@/components/brand/QrCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Check, ChevronLeft } from "@/components/ui/icons";
import { Field } from "@/components/ui/Field";
import { finishOnboarding, saveStep, type FinishResult } from "./actions";

export interface OnboardingInitial {
  step: number;
  name: string;
  businessName: string;
  location: string;
  businessType: string;
  whatsapp: string;
  channels: string[];
  goals: string[];
}

const TOTAL = 4; // questions after the welcome screen
const ease = [0.22, 1, 0.36, 1] as const;

/** 2547XXXXXXXX → 07XX XXX XXX for display and editing. */
const localPhone = (p: string) => (p.startsWith("254") ? `0${p.slice(3)}` : p);
const prettyPhone = (p: string) => {
  const l = localPhone(p);
  return l.length === 10 ? `${l.slice(0, 4)} ${l.slice(4, 7)} ${l.slice(7)}` : l;
};

export function Onboarding({ initial }: { initial: OnboardingInitial }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(Math.min(initial.step === 0 ? 0 : initial.step + 1, TOTAL));
  const [dir, setDir] = useState(1);
  const [v, setV] = useState({ ...initial, whatsapp: localPhone(initial.whatsapp) });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Extract<FinishResult, { ok: true }> | null>(null);
  const [pending, start] = useTransition();

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setError(null);
    setStep(to);
    window.scrollTo({ top: 0 });
  };

  const save = (n: number, data: Record<string, unknown>) =>
    start(async () => {
      const r = await saveStep(n, data);
      if (!r.ok) return setError(r.error);
      if (n < TOTAL) return go(n + 1);
      const f = await finishOnboarding();
      if (!f.ok) return setError(f.error);
      setDir(1);
      setDone(f);
      window.scrollTo({ top: 0 });
    });

  const toggle = (key: "channels" | "goals", id: string) =>
    setV((s) => ({ ...s, [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id] }));

  const firstName = v.name.split(" ")[0] || "there";
  const screenKey = done ? "done" : String(step);

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="container-x flex h-16 items-center justify-between">
        <Link href="/" aria-label="Suppli Afya home">
          <Logo />
        </Link>
        {!done && step > 0 && (
          <span className="text-[0.8rem] font-semibold text-ink-mute">
            {step} of {TOTAL}
          </span>
        )}
      </header>
      {!done && step > 0 && (
        <div className="container-x">
          <div className="mx-auto h-1 max-w-lg overflow-hidden rounded-full bg-ink/10">
            <motion.div
              className="h-full rounded-full bg-forest"
              initial={false}
              animate={{ width: `${(step / TOTAL) * 100}%` }}
              transition={{ duration: 0.5, ease }}
            />
          </div>
        </div>
      )}

      <main className="container-x flex flex-1 flex-col pb-10 pt-8 sm:pt-14">
        <div className="mx-auto w-full max-w-lg">
          {!done && step > 1 && (
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="-ml-2 mb-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.85rem] font-semibold text-ink-soft hover:text-ink"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={screenKey}
              initial={{ opacity: 0, x: reduce ? 0 : 24 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduce ? 0 : -24 * dir }}
              transition={{ duration: 0.35, ease }}
            >
              {done ? (
                <Done v={v} done={done} firstName={firstName} />
              ) : step === 0 ? (
                <div className="py-8">
                  <h1 className="font-display text-[2.6rem] leading-[1.04] tracking-[-0.025em] text-ink sm:text-[3.3rem]">
                    Let&apos;s get Suppli Afya set up for your business.
                  </h1>
                  <p className="mt-4 text-[1.1rem] leading-relaxed text-ink-soft">It&apos;ll only take a couple of minutes.</p>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-mute">
                    Four short questions. Everything you tell us is used to set up your workspace and your health check
                    link.
                  </p>
                  <Button size="lg" className="mt-9" onClick={() => go(1)} arrow>
                    Get started
                  </Button>
                </div>
              ) : step === 1 ? (
                <Screen
                  title="First, what's your name?"
                  sub="This is how customers will see you on your health check."
                  error={error}
                  pending={pending}
                  onNext={() => save(1, { name: v.name })}
                >
                  <Field
                    label="Your name"
                    value={v.name}
                    onChange={(e) => setV({ ...v, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && save(1, { name: v.name })}
                    placeholder="e.g. Jane Wanjiku"
                    autoComplete="name"
                    autoFocus
                  />
                </Screen>
              ) : step === 2 ? (
                <Screen
                  title="Tell us a little about your business."
                  error={error}
                  pending={pending}
                  onNext={() =>
                    save(2, { businessName: v.businessName, location: v.location, businessType: v.businessType, whatsapp: v.whatsapp })
                  }
                >
                  <div className="grid gap-5">
                    <Field
                      label="Business or shop name"
                      value={v.businessName}
                      onChange={(e) => setV({ ...v, businessName: e.target.value })}
                      placeholder="e.g. Afya Bora Wellness"
                      hint="If you don't have one, your own name is fine."
                    />
                    <Field
                      label="Where are you based?"
                      value={v.location}
                      onChange={(e) => setV({ ...v, location: e.target.value })}
                      placeholder="e.g. Thika, Kiambu"
                      autoComplete="address-level2"
                    />
                    <div>
                      <div className="text-[0.9rem] font-semibold text-ink">What kind of business is it?</div>
                      <div role="radiogroup" className="mt-2 grid gap-2 sm:grid-cols-2">
                        {BUSINESS_TYPES.map((t) => (
                          <Choice
                            key={t.id}
                            role="radio"
                            selected={v.businessType === t.id}
                            onClick={() => setV({ ...v, businessType: t.id })}
                            label={t.label}
                            hint={"hint" in t ? t.hint : undefined}
                          />
                        ))}
                      </div>
                    </div>
                    <Field
                      label="Your WhatsApp number"
                      value={v.whatsapp}
                      onChange={(e) => setV({ ...v, whatsapp: e.target.value })}
                      placeholder="07XX XXX XXX"
                      inputMode="tel"
                      autoComplete="tel"
                      hint="Customers who do your health check will message you here."
                    />
                  </div>
                </Screen>
              ) : step === 3 ? (
                <Screen
                  title="How do most of your customers find or reach you?"
                  sub="Choose all that apply."
                  error={error}
                  pending={pending}
                  onNext={() => save(3, { channels: v.channels })}
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CHANNELS.map((c) => (
                      <Choice
                        key={c.id}
                        role="checkbox"
                        selected={v.channels.includes(c.id)}
                        onClick={() => toggle("channels", c.id)}
                        label={c.label}
                      />
                    ))}
                  </div>
                </Screen>
              ) : (
                <Screen
                  title="What would you like Suppli Afya to help you improve?"
                  sub="Choose all that apply. We'll put these first in your portal."
                  error={error}
                  pending={pending}
                  cta="Finish setting up"
                  onNext={() => save(4, { goals: v.goals })}
                >
                  <div className="grid gap-2">
                    {GOALS.map((g) => (
                      <Choice
                        key={g.id}
                        role="checkbox"
                        selected={v.goals.includes(g.id)}
                        onClick={() => toggle("goals", g.id)}
                        label={g.label}
                      />
                    ))}
                  </div>
                </Screen>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Screen({
  title,
  sub,
  children,
  error,
  pending,
  onNext,
  cta = "Continue",
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  error: string | null;
  pending: boolean;
  onNext: () => void;
  cta?: string;
}) {
  return (
    <div>
      <h1 className="font-display text-[2.1rem] leading-[1.08] tracking-[-0.02em] text-ink sm:text-[2.5rem]">{title}</h1>
      {sub && <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft">{sub}</p>}
      <div className="mt-8">{children}</div>
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]">
          {error}
        </p>
      )}
      <div className="sticky bottom-0 -mx-5 mt-8 bg-gradient-to-t from-cream via-cream to-cream/0 px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-4">
        <Button size="lg" className="w-full" onClick={onNext} disabled={pending} arrow>
          {pending ? "Saving…" : cta}
        </Button>
      </div>
    </div>
  );
}

function Choice({
  selected,
  onClick,
  label,
  hint,
  role,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
  role: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow] duration-200",
        selected ? "border-forest bg-sage-soft/70 shadow-[0_0_0_1px_var(--color-forest)]" : "border-ink/12 bg-paper hover:border-ink/35",
      )}
    >
      <span
        className={clsx(
          "grid h-5 w-5 shrink-0 place-items-center border transition-colors",
          role === "radio" ? "rounded-full" : "rounded-md",
          selected ? "border-forest bg-forest text-cream" : "border-ink/30 bg-white",
        )}
      >
        {selected && (role === "radio" ? <span className="h-1.5 w-1.5 rounded-full bg-cream" /> : <Check className="h-3.5 w-3.5" />)}
      </span>
      <span className="min-w-0">
        <span className="block font-medium leading-snug text-ink">{label}</span>
        {hint && <span className="block text-[0.8rem] text-ink-mute">{hint}</span>}
      </span>
    </button>
  );
}

function Done({
  v,
  done,
  firstName,
}: {
  v: OnboardingInitial;
  done: Extract<FinishResult, { ok: true }>;
  firstName: string;
}) {
  const [copied, setCopied] = useState(false);
  const channelNote = v.channels.includes("shop")
    ? "a printable QR card for your shop counter"
    : v.channels.includes("social")
      ? "a ready caption for your social media"
      : "a ready message for your WhatsApp status";
  const typeLabel = labelFor(BUSINESS_TYPES, v.businessType);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(done.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="pb-6">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-forest text-xl text-cream">✓</div>
      <h1 className="mt-5 font-display text-[2.6rem] leading-[1.04] tracking-[-0.025em] text-ink sm:text-[3.2rem]">
        You&apos;re all set, {firstName}.
      </h1>
      <p className="mt-3 text-[1.1rem] leading-relaxed text-ink-soft">Your Suppli Afya workspace is ready.</p>

      <div className="mt-10">
        <QrCard
          name={v.name}
          tagline={[v.businessName !== v.name ? v.businessName : typeLabel, v.location].filter(Boolean).join(" · ")}
          url={done.url}
          displayUrl={done.displayUrl}
          svg={done.svg}
        />
      </div>

      <h2 className="mt-14 text-[0.95rem] font-semibold text-ink">Here&apos;s what we set up from your answers</h2>
      <ul className="mt-4 grid gap-3">
        <SetupItem title="Your health check link">
          <span className="font-mono text-[0.85rem] text-forest">{done.displayUrl}</span>{" "}
          <button type="button" onClick={copy} className="ml-1 text-[0.85rem] font-semibold text-forest underline underline-offset-2">
            {copied ? "Copied" : "Copy"}
          </button>
          <br />
          Customers who use it send their plan to your WhatsApp on {prettyPhone(v.whatsapp)}.
        </SetupItem>
        <SetupItem title="Your portal, in your order">
          Your daily list puts {goalFocus(v.goals)} first
          {v.goals.length > 2 ? `, then the rest of what you picked` : ""}.
        </SetupItem>
        <SetupItem title="Ways to share your link">
          Because of how your customers reach you, we&apos;ve started you with {channelNote}.
        </SetupItem>
      </ul>

      <div className="mt-10">
        <ButtonLink href="/portal" size="lg" className="w-full" arrow>
          Enter my distributor portal
        </ButtonLink>
      </div>
    </div>
  );
}

function SetupItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 rounded-2xl bg-paper p-4">
      <Check className="mt-1 h-4 w-4 shrink-0 text-moss" />
      <div>
        <div className="font-semibold text-ink">{title}</div>
        <div className="mt-0.5 text-[0.93rem] leading-relaxed text-ink-soft">{children}</div>
      </div>
    </li>
  );
}
