import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { planOrDefault } from "@/config/plans";
import { getAccount, nextStepFor } from "@/server/auth";
import { AccountStep } from "./AccountForm";

export const metadata: Metadata = { title: "Get started" };

export default async function StartPage(props: PageProps<"/start">) {
  const sp = await props.searchParams;
  const plan = planOrDefault(typeof sp.plan === "string" ? sp.plan : null).id;
  const account = await getAccount();
  if (account) {
    const next = nextStepFor(account);
    redirect(next === "/start/pay" ? `/start/pay?plan=${plan}` : next);
  }
  return <AccountStep initialPlan={plan} />;
}
