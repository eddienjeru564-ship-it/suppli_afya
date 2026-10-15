"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { choosePassword, type ResetState } from "../actions";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(choosePassword, {});
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <PasswordField label="New password" name="password" autoComplete="new-password" hint="At least 8 characters." required minLength={8} />
      {state.error && (
        <p role="alert" className="rounded-xl bg-clay-soft/60 px-4 py-3 text-[0.9rem] text-[#6b3a1f]">
          {state.error}{" "}
          {state.expired && (
            <Link href="/login/forgot" className="font-semibold underline underline-offset-2">
              Send a new link
            </Link>
          )}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full" arrow>
        {pending ? "Saving…" : "Save and log in"}
      </Button>
    </form>
  );
}
