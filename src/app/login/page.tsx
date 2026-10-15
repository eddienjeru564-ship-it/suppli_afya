import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccount, nextStepFor } from "@/server/auth";
import { AuthCard } from "./AuthCard";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const account = await getAccount();
  if (account) redirect(nextStepFor(account));
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/portal") ? sp.next : "/portal";
  return (
    <AuthCard title="Welcome back" lede="Log in to your distributor portal.">
      <LoginForm next={next} />
    </AuthCard>
  );
}
