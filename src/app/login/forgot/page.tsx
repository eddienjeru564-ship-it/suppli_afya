import type { Metadata } from "next";
import { AuthCard } from "../AuthCard";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPage(props: PageProps<"/login/forgot">) {
  const sp = await props.searchParams;
  const email = typeof sp.email === "string" ? sp.email.slice(0, 200) : "";
  return (
    <AuthCard title="Reset your password" lede="Enter the email you signed up with. We'll send you a link to choose a new password.">
      <ForgotForm email={email} />
    </AuthCard>
  );
}
