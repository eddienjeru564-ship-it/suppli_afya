import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccount, subscriptionState } from "@/server/auth";
import { Onboarding } from "./Onboarding";

export const metadata: Metadata = { title: "Set up your workspace" };

export default async function SetupPage() {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (subscriptionState(account) === "inactive") redirect("/start/pay");
  const w = account.workspace;
  if (w.onboarded_at) redirect("/portal");
  return (
    <Onboarding
      initial={{
        step: w.onboarding_step,
        name: w.owner_name ?? "",
        businessName: w.business_name ?? "",
        location: w.location ?? "",
        businessType: w.business_type ?? "",
        whatsapp: w.whatsapp ?? "",
        channels: w.channels ?? [],
        goals: w.goals ?? [],
      }}
    />
  );
}
