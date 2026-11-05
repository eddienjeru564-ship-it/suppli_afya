import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { greetingName } from "@/lib/names";
import { stopTarget } from "@/server/sms";
import { PoweredBy } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { setTexts } from "./actions";

export const metadata: Metadata = { title: "Reminder texts", robots: { index: false, follow: false } };

/**
 * Where the link at the end of every reminder text leads: the customer can stop the texts in one
 * tap, and start them again if they change their mind. Customer-facing, so calm and short.
 */
export default async function StopTextsPage(props: PageProps<"/s/[token]">) {
  const { token } = await props.params;
  const sp = await props.searchParams;
  const t = await stopTarget(token);
  if (!t) notFound();
  const who = greetingName(t.customerName);
  const seller = greetingName(t.sellerName) || t.sellerName;
  const justDone = sp.done === "stopped" || sp.done === "restarted";

  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-5 py-12">
      <main className="w-full max-w-[26rem]">
        <div className="rounded-[1.75rem] bg-paper p-7 shadow-card ring-1 ring-ink/[0.06] sm:p-8">
          {t.stopped ? (
            <>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-soft text-forest">
                <Check className="h-5 w-5" />
              </span>
              <h1 className="mt-5 font-display text-[1.9rem] leading-tight tracking-[-0.015em] text-ink">
                {justDone ? "Done. The texts are off." : "The texts are off."}
              </h1>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
                {who ? `${who}, you` : "You"} won&apos;t get reminder texts from {seller}. You can still message {seller} on WhatsApp
                whenever you need something.
              </p>
              {t.byCustomer && (
                <form action={setTexts} className="mt-7">
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="stop" value="0" />
                  <Button type="submit" variant="secondary" size="md" className="w-full">
                    Turn reminder texts back on
                  </Button>
                </form>
              )}
            </>
          ) : (
            <>
              <h1 className="font-display text-[1.9rem] leading-tight tracking-[-0.015em] text-ink">
                {justDone ? "Texts are back on." : `Stop reminder texts from ${seller}?`}
              </h1>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
                {seller} sends {who ? `you, ${who},` : "you"} a short text when your products are about to run out, or when an order
                is still to be paid. Nothing else.
              </p>
              <form action={setTexts} className="mt-7">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="stop" value="1" />
                <Button type="submit" size="lg" className="w-full">
                  Stop the texts
                </Button>
              </form>
            </>
          )}
        </div>
        <div className="mt-8 flex justify-center text-ink-mute">
          <PoweredBy className="h-8" />
        </div>
      </main>
    </div>
  );
}
