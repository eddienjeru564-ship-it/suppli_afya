"use server";

import { redirect } from "next/navigation";
import { getAccount, nextStepFor, startSession } from "@/server/auth";
import { requestPasswordReset, resetPassword } from "@/server/passwords";

export interface ForgotState {
  sent?: boolean;
  email?: string;
  error?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Always answers the same way, so the form never reveals which emails have an account. */
export async function forgotPassword(_prev: ForgotState, fd: FormData): Promise<ForgotState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { error: "Please enter a valid email address.", email };
  await requestPasswordReset(email);
  return { sent: true, email };
}

export interface ResetState {
  error?: string;
  expired?: boolean;
}

export async function choosePassword(_prev: ResetState, fd: FormData): Promise<ResetState> {
  const token = String(fd.get("token") ?? "");
  const password = String(fd.get("password") ?? "");
  const r = await resetPassword(token, password);
  if (!r.ok) return { error: r.error, expired: r.expired };
  await startSession(r.userId);
  redirect(nextStepFor(await getAccount()));
}
