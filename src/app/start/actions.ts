"use server";

import { redirect } from "next/navigation";
import { planOrDefault, type PlanId } from "@/config/plans";
import { endSession, getAccount, hashPassword, nextStepFor, startSession, verifyPassword } from "@/server/auth";
import { db } from "@/server/db";
import { startPayment, type Method, type StartResult } from "@/server/payments";

export interface FormState {
  error?: string;
  fields?: Record<string, string>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function createAccount(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const plan = planOrDefault(String(fd.get("plan") ?? "")).id;
  const fields = { email };

  if (!EMAIL.test(email)) return { error: "Please enter a valid email address.", fields };
  if (password.length < 8) return { error: "Use a password of at least 8 characters.", fields };

  const d = await db();
  const existing = await d.query(`select 1 from users where email = $1`, [email]);
  if (existing.length) return { error: "exists", fields };

  const [user] = await d.query<{ id: string }>(`insert into users (email, password_hash) values ($1, $2) returning id`, [
    email,
    await hashPassword(password),
  ]);
  await d.query(`insert into workspaces (owner_id, plan) values ($1, $2)`, [user.id, plan]);
  await startSession(user.id);
  redirect(`/start/pay?plan=${plan}`);
}

export async function logIn(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = String(fd.get("next") ?? "");
  const d = await db();
  const [u] = await d.query<{ id: string; password_hash: string }>(`select id, password_hash from users where email = $1`, [email]);
  if (!u || !(await verifyPassword(password, u.password_hash)))
    return { error: "That email and password don't match. Try again.", fields: { email } };
  await startSession(u.id);
  const account = await getAccount();
  const step = nextStepFor(account);
  redirect(step === "/portal" && next.startsWith("/portal") ? next : step);
}

export async function logOut() {
  await endSession();
  redirect("/");
}

export async function beginPayment(input: { plan: PlanId; method: Method; phone?: string }): Promise<StartResult> {
  const account = await getAccount();
  if (!account) return { ok: false, error: "Your session has ended. Please log in again." };
  const plan = planOrDefault(input.plan).id;
  const d = await db();
  await d.query(`update workspaces set plan = $2 where id = $1`, [account.workspace.id, plan]);
  return startPayment({
    workspaceId: account.workspace.id,
    email: account.user.email,
    plan,
    method: input.method === "card" ? "card" : "mpesa",
    phone: input.phone,
  });
}
