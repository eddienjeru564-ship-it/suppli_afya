import clsx from "clsx";
import { Reveal } from "@/components/ui/Reveal";

/** The walk-through every curious person needs, typed out by hand, and how it usually ends. */
const THREAD: { from: "them" | "you" | "gap"; text: string; time?: string }[] = [
  { from: "them", text: "Hi, which one should I take for energy?", time: "7:42 pm" },
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
            <h2 className="display-lg mt-5 max-w-[15ch] text-ink">It starts with “Which one should I take?”</h2>
          </Reveal>
          <div className="prose-big mt-10 grid gap-7 text-ink">
            <Reveal delay={0.05}>
              <p>
                Someone replies to your status asking what&apos;s good for energy. You answer by hand, in between
                everything else.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-ink-soft">
                You ask what they&apos;re looking for and whether they take any medicine. You send photos of four
                products and a price list. They say they&apos;ll think about it. By the time you remember to follow up,
                they&apos;ve gone quiet.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p>
                None of that shows up as a lost sale. It just looks like a <em className="text-clay">slow month.</em>
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.1}>
          <figure className="mx-auto max-w-[26rem] overflow-hidden rounded-[1.75rem] bg-wa-bg shadow-float ring-1 ring-ink/10 lg:mt-20">
            <div className="flex items-center gap-2.5 bg-wa-deep px-4 py-3 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dfe5e7] text-[0.8rem] font-semibold text-wa-deep">?</span>
              <span className="leading-tight">
                <span className="block text-[0.9rem] font-semibold">+254 7•• ••• 318</span>
                <span className="block text-[0.72rem] text-white/70">last seen 3 days ago</span>
              </span>
            </div>
            <ol className="grid gap-1.5 px-3 py-4" aria-label="A typical chat with someone who asked about a product">
              {THREAD.map((m, i) =>
                m.from === "gap" ? (
                  <li key={i} className="mx-auto my-1 w-fit rounded-md bg-white/80 px-2.5 py-0.5 text-[0.72rem] text-[#54656f] shadow-sm">
                    {m.text}
                  </li>
                ) : (
                  <li
                    key={i}
                    className={clsx(
                      "max-w-[82%] rounded-lg px-3 py-1.5 text-[0.86rem] leading-snug text-[#111b21] shadow-sm",
                      m.from === "you" ? "ml-auto rounded-tr-none bg-wa-bubble" : "rounded-tl-none bg-white",
                    )}
                  >
                    {m.text}
                    {m.time && <span className="ml-2 align-bottom text-[0.64rem] text-[#54656f]">{m.time}</span>}
                  </li>
                ),
              )}
              <li className="ml-auto pr-1 text-[0.7rem] text-[#54656f]">Seen</li>
            </ol>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
