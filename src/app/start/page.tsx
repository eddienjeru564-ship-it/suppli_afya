import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccount, nextStepFor } from "@/server/auth";
import { AccountStep } from "./AccountForm";

export const metadata: Metadata = { title: "Get started" };

export default async function StartPage() {
  const account = await getAccount();
  if (account) {
    const next = nextStepFor(account);
    redirect(next);
  }
  return <AccountStep />;
}
