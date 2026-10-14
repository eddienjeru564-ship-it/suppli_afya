import { getAccount, nextStepFor } from "@/server/auth";
import { greetingName } from "@/lib/names";

/** Lets the (static) marketing pages show "Open your portal" to signed-in distributors. */
export async function GET() {
  const a = await getAccount();
  return Response.json(
    a ? { signedIn: true, name: greetingName(a.workspace.owner_name) || null, next: nextStepFor(a) } : { signedIn: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
