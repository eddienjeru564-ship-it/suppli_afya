"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { forgotPassword, type ForgotState } from "../actions";

export function ForgotForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<ForgotState, FormData>(forgotPassword, {});
  if (state.sent)
    return (
      <div className="mt-8 grid gap-5">
        <p role="status" className="rounded-xl bg-sage-soft/70 px-4 py-3 text-[0.95rem] leading-relaxed text-ink">
          If <b>{state.email}</b> has a Suppli Afya account, a link to choose a new password is on its way. It works for one hour.
        </p>
        <p className="text-[0.9rem] leading-relaxed text-ink-soft">
          Nothing after a few minutes? Check your spam folder, or make sure it&apos;s the email you signed up with.
        </p>
        <Link href="/login" className="text-[0.9rem] font-semibold text-forest underline underline-offset-2">
          Back to log in
        </Link>
      </div>
    );
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.email ?? email} required />
      {state.error && (
        <p role="alert" className="rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full" arrow>
        {pending ? "Sending…" : "Send the link"}
      </Button>
      <Link href="/login" className="text-[0.9rem] font-semibold text-forest underline underline-offset-2">
        Back to log in
      </Link>
    </form>
  );
}
