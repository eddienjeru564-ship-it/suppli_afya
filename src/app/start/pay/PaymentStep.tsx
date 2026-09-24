"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { PLANS_BY_ID, kes, type PlanId } from "@/config/plans";
import type { Method, Mode } from "@/server/payments";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PlanSummary } from "@/components/start/PlanSummary";
import { StartShell } from "@/components/start/Shell";
import { beginPayment } from "../actions";

type Stage =
  | { kind: "choose"; error?: string }
  | { kind: "waiting"; paymentId: string }
  | { kind: "test"; paymentId: string }
  | { kind: "failed"; reason: string }
  | { kind: "confirmed" };

const ease = [0.22, 1, 0.36, 1] as const;

/** Same rule as the server: a Kenyan mobile number in any common format. */
const validPhone = (v: string) => /^(?:254|0)?[17]\d{8}$/.test(v.replace(/[^\d+]/g, "").replace(/^\+/, ""));

export function PaymentStep({
  initialPlan,
  modes,
  email,
  renewing,
  lastPhone,
  lastFailure,
}: {
  initialPlan: PlanId;
  modes: Record<Method, Mode>;
  email: string;
  renewing: boolean;
  lastPhone: string | null;
  lastFailure: string | null;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [method, setMethod] = useState<Method>(modes.mpesa !== "off" ? "mpesa" : "card");
  const [phone, setPhone] = useState(lastPhone ? `0${lastPhone.slice(3)}` : "");
  const [stage, setStage] = useState<Stage>(lastFailure ? { kind: "failed", reason: lastFailure } : { kind: "choose" });
  const [pending, start] = useTransition();
  const p = PLANS_BY_ID[plan];
  const mode = modes[method];

  const choosePlan = (id: PlanId) => {
    setPlan(id);
    router.replace(`/start/pay?plan=${id}${renewing ? "&renew=1" : ""}`, { scroll: false });
  };

  const pay = () => {
    if (method === "mpesa" && !validPhone(phone)) {
      setStage({ kind: "choose", error: "Enter the M-Pesa number to pay from, like 0712 345 678." });
      return;
    }
    start(async () => {
      const r = await beginPayment({ plan, method, phone });
      if (!r.ok) return setStage({ kind: "choose", error: r.error });
      if (r.next === "redirect") {
        window.location.assign(r.url);
        return;
      }
      setStage(r.next === "test" ? { kind: "test", paymentId: r.paymentId } : { kind: "waiting", paymentId: r.paymentId });
    });
  };

  const onResult = (status: string, reason?: string | null) => {
    if (status === "succeeded") {
      setStage({ kind: "confirmed" });
      setTimeout(() => router.push("/start/welcome"), 700);
    } else if (status === "failed") setStage({ kind: "failed", reason: reason || "The payment didn't go through." });
  };

  return (
    <StartShell step={1} aside={<PlanSummary plan={plan} onChange={choosePlan} />}>
      <div className="max-w-md">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage.kind}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease }}
          >
            {stage.kind === "choose" && (
              <>
                <h1 className="font-display text-[2.3rem] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[2.8rem]">
                  {renewing ? "Renew your plan" : "Payment"}
                </h1>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">
                  {kes(p.price)} for {renewing ? "another" : "your first"} month of {p.name}.
                </p>

                <div role="radiogroup" aria-label="Payment method" className="mt-8 grid grid-cols-2 gap-2">
                  {(["mpesa", "card"] as Method[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={method === m}
                      disabled={modes[m] === "off"}
                      onClick={() => setMethod(m)}
                      className={clsx(
                        "rounded-2xl border px-4 py-4 text-left transition-colors disabled:opacity-40",
                        method === m ? "border-forest bg-sage-soft/60 shadow-[0_0_0_1px_var(--color-forest)]" : "border-ink/15 bg-paper hover:border-ink/35",
                      )}
                    >
                      <span className="block font-semibold text-ink">{m === "mpesa" ? "M-Pesa" : "Card"}</span>
                      <span className="mt-0.5 block text-[0.8rem] text-ink-mute">
                        {modes[m] === "off" ? "Not available yet" : m === "mpesa" ? "Prompt on your phone" : "Visa or Mastercard"}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  {method === "mpesa" ? (
                    <Field
                      label="M-Pesa number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="07XX XXX XXX"
                      hint="You'll get a prompt on this phone to enter your M-Pesa PIN."
                    />
                  ) : (
                    <p className="rounded-2xl bg-paper px-4 py-3.5 text-[0.92rem] leading-relaxed text-ink-soft">
                      You&apos;ll enter your card details on Paystack&apos;s secure page, then come straight back here to
                      set up.
                    </p>
                  )}
                </div>

                {mode === "test" && (
                  <p className="mt-4 rounded-xl border border-dashed border-ochre/60 px-4 py-3 text-[0.82rem] leading-relaxed text-[#7a5412]">
                    Test mode. Payment keys aren&apos;t connected here, so no real money moves. You&apos;ll be able to
                    approve or decline the payment yourself.
                  </p>
                )}
                {stage.error && (
                  <p role="alert" className="mt-4 rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]">
                    {stage.error}
                  </p>
                )}

                <Button size="lg" className="mt-6 w-full" disabled={pending || mode === "off"} onClick={pay} arrow>
                  {pending ? "Starting payment…" : renewing ? `Pay ${kes(p.price)} and renew` : `Pay ${kes(p.price)} and start Suppli Afya`}
                </Button>
                <p className="mt-4 text-center text-[0.8rem] leading-relaxed text-ink-mute">
                  Nothing renews automatically. Your portal reminds you a few days before the month ends.
                  <br />
                  Signed in as {email}
                </p>
              </>
            )}

            {stage.kind === "waiting" && (
              <Waiting
                key={stage.paymentId}
                paymentId={stage.paymentId}
                phone={phone}
                amount={p.price}
                resending={pending}
                onResult={onResult}
                onResend={pay}
                onChange={(m) => {
                  setMethod(m);
                  setStage({ kind: "choose" });
                }}
                cardAvailable={modes.card !== "off"}
              />
            )}

            {stage.kind === "test" && (
              <TestApproval paymentId={stage.paymentId} method={method} amount={p.price} onResult={onResult} />
            )}

            {stage.kind === "failed" && (
              <>
                <div className="grid h-11 w-11 place-items-center rounded-full bg-clay-soft text-lg text-clay">!</div>
                <h1 className="mt-5 font-display text-[2.1rem] leading-[1.05] tracking-[-0.02em] text-ink">
                  The payment didn&apos;t go through
                </h1>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">{stage.reason}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
                  Your account is saved and nothing was charged. You can try again now, with M-Pesa or a card.
                </p>
                <Button size="lg" className="mt-7 w-full" onClick={() => setStage({ kind: "choose" })} arrow>
                  Try again
                </Button>
                {method === "mpesa" && (
                  <p className="mt-4 text-center text-[0.85rem] text-ink-mute">
                    Already paid?{" "}
                    <button type="button" onClick={() => router.refresh()} className="font-semibold text-forest underline underline-offset-2">
                      Check again
                    </button>
                  </p>
                )}
              </>
            )}

            {stage.kind === "confirmed" && (
              <div className="py-10">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-forest text-xl text-cream">✓</div>
                <h1 className="mt-5 font-display text-[2.2rem] leading-tight text-ink">Payment confirmed.</h1>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </StartShell>
  );
}

function usePoll(paymentId: string, onResult: (s: string, r?: string | null) => void) {
  const cb = useRef(onResult);
  useEffect(() => {
    cb.current = onResult;
  });
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/payments/${paymentId}`, { cache: "no-store" });
        const body = (await r.json()) as { status: string; reason?: string | null };
        if (body.status !== "pending") {
          cb.current(body.status, body.reason);
          return;
        }
      } catch {
        /* keep trying */
      }
      if (!stop) setTimeout(tick, 2500);
    };
    const t = setTimeout(tick, 2500);
    return () => {
      stop = true;
      clearTimeout(t);
    };
  }, [paymentId]);
}

function Waiting({
  paymentId,
  phone,
  amount,
  resending,
  onResult,
  onResend,
  onChange,
  cardAvailable,
}: {
  paymentId: string;
  phone: string;
  amount: number;
  resending: boolean;
  onResult: (s: string, r?: string | null) => void;
  onResend: () => void;
  onChange: (m: Method) => void;
  cardAvailable: boolean;
}) {
  usePoll(paymentId, onResult);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 30_000);
    return () => clearTimeout(t);
  }, []);
  const link = "font-semibold text-forest underline underline-offset-2 disabled:opacity-50";
  return (
    <div>
      <div className="relative grid h-12 w-12 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-moss/30" />
        <span className="relative h-3 w-3 rounded-full bg-moss" />
      </div>
      <h1 className="mt-5 font-display text-[2.2rem] leading-[1.05] tracking-[-0.02em] text-ink">Check your phone</h1>
      <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">
        We&apos;ve sent an M-Pesa prompt to <span className="font-semibold text-ink">{phone}</span>. Enter your PIN to pay{" "}
        {kes(amount)}. This page moves on by itself once it&apos;s done.
      </p>
      <AnimatePresence initial={false}>
        {slow && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="mt-6 rounded-2xl bg-paper p-4 text-[0.92rem] leading-relaxed text-ink-soft"
          >
            No prompt yet? Make sure the phone is on, unlocked and has signal, then{" "}
            <button type="button" onClick={onResend} disabled={resending} className={link}>
              {resending ? "sending…" : "send it again"}
            </button>
            .
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-6 text-[0.85rem] text-ink-mute">
        <button type="button" onClick={() => onChange("mpesa")} className={link}>
          Use a different number
        </button>
        {cardAvailable && (
          <>
            {" · "}
            <button type="button" onClick={() => onChange("card")} className={link}>
              Pay by card instead
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function TestApproval({
  paymentId,
  method,
  amount,
  onResult,
}: {
  paymentId: string;
  method: Method;
  amount: number;
  onResult: (s: string, r?: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const decide = async (outcome: "approve" | "decline") => {
    setBusy(true);
    const r = await fetch(`/api/payments/${paymentId}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    const body = (await r.json()) as { status: string; reason?: string };
    onResult(body.status, body.reason);
  };
  return (
    <div>
      <div className="text-[0.8rem] font-semibold text-[#7a5412]">Test mode</div>
      <h1 className="mt-2 font-display text-[2.2rem] leading-[1.05] tracking-[-0.02em] text-ink">
        {method === "mpesa" ? "Approve the M-Pesa prompt" : "Complete the card payment"}
      </h1>
      <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">
        On the live site this is where {method === "mpesa" ? "the customer enters their M-Pesa PIN" : "Paystack takes the card details"} for{" "}
        {kes(amount)}. Choose what happens.
      </p>
      <div className="mt-7 grid gap-2 sm:grid-cols-2">
        <Button size="lg" disabled={busy} onClick={() => decide("approve")}>
          Approve payment
        </Button>
        <Button size="lg" variant="secondary" disabled={busy} onClick={() => decide("decline")}>
          Decline it
        </Button>
      </div>
    </div>
  );
}
