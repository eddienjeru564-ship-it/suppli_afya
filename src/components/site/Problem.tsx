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

/** A normal day selling on WhatsApp, and where it leaks. The process, not the person. */
const LEAKS = [
  {
    title: "Every enquiry starts from zero",
    body: "Someone asks which one they should take, and you work it out with them in the chat: what they're looking for, what they've tried, whether they take any medicine.",
  },
  {
    title: "They're left to compare on their own",
    body: "You send product photos, prices and explanations. The customer has to weigh it all up alone, and often says they'll think about it.",
  },
  {
    title: "Chats wait while you're busy",
    body: "You're delivering an order, at work or with family. By the time you reply, the moment has passed.",
  },
  {
    title: "Nobody keeps a record of who asked",
    body: "Interest is spread across chats, so follow-ups and reorders are easy to miss. It never looks like a lost sale, just a slow month.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="bg-paper py-24 sm:py-28">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <h2 className="display-lg max-w-[16ch] text-ink">Where Sales Get Lost</h2>
            <p className="lede mt-6 max-w-[34rem]">
              It usually starts with “Which one should I take?” Selling on WhatsApp works, but every enquiry depends on you
              being free to answer it, and nothing keeps track of who asked.
            </p>
          </Reveal>
          <ul className="mt-10 max-w-[34rem] divide-y divide-ink/10 border-y border-ink/10">
            {LEAKS.map((l, i) => (
              <Reveal as="li" key={l.title} delay={0.04 * i} className="py-4">
                <h3 className="text-[1.08rem] font-semibold leading-snug text-ink">{l.title}</h3>
                <p className="mt-1 text-[0.98rem] leading-relaxed text-ink-soft">{l.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <figure className="mx-auto max-w-[26rem] overflow-hidden rounded-[1.75rem] bg-wa-bg shadow-float ring-1 ring-ink/10">
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
