"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import type { PlanId } from "@/config/plans";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { PlanSummary } from "@/components/start/PlanSummary";
import { StartShell } from "@/components/start/Shell";
import { createAccount, type FormState } from "./actions";

export function AccountStep({ initialPlan }: { initialPlan: PlanId }) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [state, action, pending] = useActionState<FormState, FormData>(createAccount, {});

  const choose = (p: PlanId) => {
    setPlan(p);
    router.replace(`/start?plan=${p}`, { scroll: false });
  };

  return (
    <StartShell step={0} aside={<PlanSummary plan={plan} onChange={choose} />}>
      <div className="max-w-md">
        <h1 className="font-display text-[2.3rem] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[2.8rem]">
          Create your account
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">
          You&apos;ll use this to log in to your portal. Your account is saved even if the payment doesn&apos;t go
          through first time.
        </p>

        <form action={action} className="mt-8 grid gap-5" noValidate>
          <input type="hidden" name="plan" value={plan} />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            defaultValue={state.fields?.email}
            required
          />
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
          {state.error && (
            <p role="alert" className="rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]">
              {state.error === "exists" ? (
                <>
                  There&apos;s already an account with this email.{" "}
                  <Link href="/login" className="font-semibold underline">
                    Log in instead
                  </Link>
                  .
                </>
              ) : (
                state.error
              )}
            </p>
          )}
          <Button type="submit" size="lg" disabled={pending} arrow className="mt-1 w-full">
            {pending ? "Creating your account…" : "Continue to payment"}
          </Button>
        </form>
        <p className="mt-6 text-[0.9rem] text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-forest underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </StartShell>
  );
}
