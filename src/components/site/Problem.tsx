import clsx from "clsx";
import { Reveal } from "@/components/ui/Reveal";

const CHANNELS = ["Your WhatsApp status", "Instagram", "Facebook", "A friend of a customer", "Chama", "The shop counter"];

/** The walk-through every curious person needs, typed out by hand, and how it usually ends. */
const THREAD: { from: "them" | "you" | "gap"; text: string; time?: string }[] = [
  { from: "them", text: "Hi, what do you have for energy?", time: "7:42 pm" },
  { from: "you", text: "Hi! What are you looking for exactly?", time: "8:30 pm" },
  { from: "you", text: "Have you used anything before? Any medicine I should know about?" },
  { from: "them", text: "Not really. Just tired all the time" },
  { from: "you", text: "Let me send you a few options 👇 [4 photos]" },
  { from: "you", text: "Which one would you like? They're all good" },
  { from: "them", text: "Let me think about it" },
  { from: "gap", text: "Three days later" },
  { from: "you", text: "Hi, still interested?" },
];

export function Problem() {
  return (
    <section id="problem" className="bg-paper py-24 sm:py-32">
      <div className="container-x grid grid-cols-1 gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <div className="eyebrow">How it usually goes</div>
            <h2 className="display-lg mt-5 max-w-[16ch] text-ink">People are curious. Getting them to buy is all on you.</h2>
          </Reveal>
          <div className="prose-big mt-10 grid gap-7 text-ink">
            <Reveal delay={0.05}>
              <p>
                Someone replies to your status asking what&apos;s good for energy. A customer&apos;s sister wants to know
                if the coffee has sugar in it. Interest turns up everywhere.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-ink-soft">
                Every one of those people needs the same walk-through before they buy: what they&apos;re looking for,
                what they&apos;ve tried, which product, how much. Only you can give it, one chat at a time, and when
                you&apos;re busy or delivering, the chat waits. A lot of them never come back to it.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p>
                None of that shows up as a lost sale. It just looks like a <em className="text-clay">slow month.</em>
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-10">
            <ul className="flex flex-wrap gap-2" aria-label="Where interest comes from">
              {CHANNELS.map((c) => (
                <li key={c} className="rounded-full border border-ink/15 px-3 py-1.5 text-[0.85rem] text-ink-soft">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <figure className="mx-auto max-w-[26rem] overflow-hidden rounded-[1.75rem] bg-wa-bg shadow-float ring-1 ring-ink/10 lg:mt-24">
            <div className="flex items-center gap-2.5 bg-wa-deep px-4 py-3 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dfe5e7] text-[0.8rem] font-semibold text-wa-deep">?</span>
              <span className="leading-tight">
                <span className="block text-[0.9rem] font-semibold">+254 7•• ••• 318</span>
                <span className="block text-[0.7rem] text-white/70">last seen 3 days ago</span>
              </span>
            </div>
            <ol className="grid gap-1.5 px-3 py-4" aria-label="A typical chat with someone who asked about a product">
              {THREAD.map((m, i) =>
                m.from === "gap" ? (
                  <li key={i} className="mx-auto my-1 w-fit rounded-md bg-white/80 px-2.5 py-0.5 text-[0.7rem] text-[#54656f] shadow-sm">
                    {m.text}
                  </li>
                ) : (
                  <li
                    key={i}
                    className={clsx(
                      "max-w-[82%] rounded-lg px-3 py-1.5 text-[0.84rem] leading-snug text-[#111b21] shadow-sm",
                      m.from === "you" ? "ml-auto rounded-tr-none bg-wa-bubble" : "rounded-tl-none bg-white",
                    )}
                  >
                    {m.text}
                    {m.time && <span className="ml-2 align-bottom text-[0.62rem] text-[#54656f]">{m.time}</span>}
                  </li>
                ),
              )}
              <li className="ml-auto pr-1 text-[0.68rem] text-[#54656f]">Seen</li>
            </ol>
            <figcaption className="border-t border-ink/10 bg-paper px-4 py-3 text-[0.85rem] leading-snug text-ink-soft">
              Now picture that for everyone who asks in a month.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
