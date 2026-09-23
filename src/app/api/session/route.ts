import { getAccount, nextStepFor } from "@/server/auth";

/** Lets the (static) marketing pages show "Open your portal" to signed-in distributors. */
export async function GET() {
  const a = await getAccount();
  return Response.json(
    a ? { signedIn: true, name: a.workspace.owner_name?.split(" ")[0] ?? null, next: nextStepFor(a) } : { signedIn: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
