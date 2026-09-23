import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount, nextStepFor } from "@/server/auth";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const account = await getAccount();
  if (account) redirect(nextStepFor(account));
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/portal") ? sp.next : "/portal";
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="container-x flex h-16 items-center">
        <Link href="/" aria-label="Suppli Afya home">
          <Logo />
        </Link>
      </header>
      <main className="container-x flex flex-1 items-start justify-center pb-16 pt-10 sm:items-center sm:pt-0">
        <div className="w-full max-w-md rounded-[2rem] border border-ink/10 bg-paper p-7 sm:p-10">
          <h1 className="font-display text-[2.3rem] leading-[1.05] tracking-[-0.02em] text-ink">Welcome back</h1>
          <p className="mt-2 text-[1rem] text-ink-soft">Log in to your distributor portal.</p>
          <LoginForm next={next} />
        </div>
      </main>
    </div>
  );
}
