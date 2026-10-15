import type { Metadata } from "next";
import Link from "next/link";
import { resetTokenUser } from "@/server/passwords";
import { AuthCard } from "../AuthCard";
import { ResetForm } from "./ResetForm";

// The link carries a token: never pass this page's address on to another site.
export const metadata: Metadata = { title: "Choose a new password", referrer: "no-referrer", robots: { index: false } };

export default async function ResetPage(props: PageProps<"/login/reset">) {
  const sp = await props.searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const holder = await resetTokenUser(token);
  if (!holder)
    return (
      <AuthCard title="This link has expired" lede="Reset links work once, for one hour. Ask for a new one and use the latest email.">
        <Link
          href="/login/forgot"
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-forest px-6 py-3.5 text-[1rem] font-semibold text-cream"
        >
          Send a new link
        </Link>
      </AuthCard>
    );
  return (
    <AuthCard title="Choose a new password" lede={<>For {holder.email}. You&apos;ll be logged out on your other devices.</>}>
      <ResetForm token={token} />
    </AuthCard>
  );
}
