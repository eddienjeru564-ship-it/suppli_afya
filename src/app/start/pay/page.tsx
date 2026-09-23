import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { planOrDefault } from "@/config/plans";
import { getAccount, nextStepFor, subscriptionState } from "@/server/auth";
import { db } from "@/server/db";
import { methodModes } from "@/server/payments";
import { PaymentStep } from "./PaymentStep";

export const metadata: Metadata = { title: "Payment" };

export default async function PayPage(props: PageProps<"/start/pay">) {
  const sp = await props.searchParams;
  const account = await getAccount();
  const planParam = typeof sp.plan === "string" ? sp.plan : null;
  if (!account) redirect(`/start?plan=${planOrDefault(planParam).id}`);

  const renew = sp.renew === "1";
  const state = subscriptionState(account);
  if (state !== "inactive" && !renew) redirect(nextStepFor(account));

  const d = await db();
  const [last] = await d.query<{ id: string; phone: string | null; status: string; failure_reason: string | null }>(
    `select id, phone, status, failure_reason from payments where workspace_id = $1 order by created_at desc limit 1`,
    [account.workspace.id],
  );
  const failedHere = typeof sp.payment === "string" && last?.id === sp.payment && last.status === "failed";

  return (
    <PaymentStep
      initialPlan={planOrDefault(planParam ?? account.workspace.plan).id}
      modes={methodModes()}
      email={account.user.email}
      renewing={Boolean(account.subscription) || renew}
      lastPhone={last?.phone ?? null}
      lastFailure={failedHere ? last.failure_reason : null}
    />
  );
}
