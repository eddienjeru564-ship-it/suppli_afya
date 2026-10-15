"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logIn, type FormState } from "@/app/start/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(logIn, {});
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.fields?.email} required />
      <div>
        <PasswordField label="Password" name="password" autoComplete="current-password" required />
        <Link href="/login/forgot" className="mt-2 inline-block text-[0.85rem] font-semibold text-forest underline underline-offset-2">
          Forgot your password?
        </Link>
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full" arrow>
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <p className="text-[0.9rem] text-ink-soft">
        New to Suppli Afya?{" "}
        <Link href="/#pricing" className="font-semibold text-forest underline underline-offset-2">
          See plans and get started
        </Link>
      </p>
    </form>
  );
}
