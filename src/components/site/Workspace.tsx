import clsx from "clsx";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { KATE, ORDER_TOTAL, SARAH, SUGGESTED } from "./story";

const POINTS = [
  {
    title: "What she was looking for",
    body: "Her goals, in her own answers, and anything to be careful with, like medicine or an allergy.",
  },
  {
    title: "What you suggested, and what she bought",
    body: "So the next conversation starts from the right place, even months later.",
  },
  {
    title: "What happens next",
    body: "A check-in date and a likely reorder date, worked out from what she bought and how long it lasts.",
  },
];

const TIMELINE: { label: string; detail: string; when: string; tone?: "done" | "next" }[] = [
  { label: "Did the assessment on your page", detail: `Looking for: ${SARAH.goals.join(", ")}`, when: "Tue, 9:02 pm", tone: "done" },
  { label: "Suggested", detail: SUGGESTED.map((p) => p.name).join(" · "), when: "Tue, 9:05 pm", tone: "done" },
  { label: "Messaged you on WhatsApp", detail: "With her answers and the suggested plan", when: "Tue, 9:14 pm", tone: "done" },
  { label: "Bought", detail: `${ORDER_TOTAL} · paid by M-Pesa`, when: "Thu", tone: "done" },
  { label: "Check in", detail: "Two weeks on the coffee: ask how she's finding it", when: "In 2 weeks", tone: "next" },
  { label: "Likely to reorder", detail: `${SUGGESTED[0].short}, when the pack runs low`, when: "In about a month", tone: "next" },
];

export function Workspace() {
  return (
    <section id="workspace" className="py-24 sm:py-32">
      <div className="container-x grid grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <Reveal>
            <div className="eyebrow">Your workspace</div>
            <h2 className="display-lg mt-5 max-w-[14ch] text-ink">Suppli Afya remembers what happened</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede mt-6 max-w-[34rem]">
              Once someone comes through your page, they&apos;re in your workspace. When {SARAH.name} messages you three
              weeks later, you don&apos;t have to scroll back through your chats to work out who she is.
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-6">
            {POINTS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={0.05 * i} className="border-l-2 border-sage pl-5">
                <h3 className="text-[1.05rem] font-semibold text-ink">{p.title}</h3>
                <p className="mt-1 text-[0.98rem] leading-relaxed text-ink-soft">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <figure className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-paper shadow-float">
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-3 text-[0.8rem] text-ink-mute sm:px-6">
              <span>
                {KATE.first}&apos;s workspace · <span className="text-ink">Customers</span>
              </span>
              <span className="hidden sm:inline">Today · Prospects · Orders · Customers</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 px-5 pt-6 sm:px-6">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-sand font-display text-[1.3rem] text-ink">S</span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[1.6rem] leading-tight text-ink">{SARAH.name}</div>
                <div className="text-[0.85rem] text-ink-mute">
                  {SARAH.phone} · Came through your page
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-wa px-3 py-1.5 text-[0.8rem] font-semibold text-[#06331f]">
                <WhatsAppIcon className="h-3.5 w-3.5" /> Message
              </span>
            </div>
            <ol className="px-5 pb-6 pt-6 sm:px-6">
              {TIMELINE.map((t, i) => (
                <li key={t.label} className="grid grid-cols-[1.25rem_1fr_auto] gap-x-3 pb-5 last:pb-0">
                  <span className="relative flex justify-center">
                    <span
                      className={clsx(
                        "mt-1.5 h-2.5 w-2.5 rounded-full",
                        t.tone === "next" ? "border-2 border-clay bg-paper" : "bg-forest",
                      )}
                    />
                    {i < TIMELINE.length - 1 && <span aria-hidden className="absolute top-5 h-[calc(100%-0.25rem)] w-px bg-ink/15" />}
                  </span>
                  <span className="min-w-0">
                    <span className={clsx("block text-[0.95rem] font-semibold", t.tone === "next" ? "text-clay" : "text-ink")}>
                      {t.label}
                    </span>
                    <span className="block text-[0.9rem] leading-snug text-ink-soft">{t.detail}</span>
                  </span>
                  <span className="pt-0.5 text-right text-[0.78rem] text-ink-mute">{t.when}</span>
                </li>
              ))}
            </ol>
          </figure>
          <p className="mt-5 text-center text-[0.95rem] text-ink-soft">
            You don&apos;t lose a customer after the first conversation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
