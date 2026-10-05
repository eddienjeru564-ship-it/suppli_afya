import clsx from "clsx";
import { Reveal } from "@/components/ui/Reveal";
import { SwirlArrow } from "@/components/ui/SwirlArrow";

type Line =
  | { from: "them" | "you"; text: string; time?: string }
  | { from: "gap"; text: string }
  | { from: "seen" }
  /** A pen note beside the chat, pointing up at the message above it. */
  | { from: "note"; text: string; side: "left" | "right" };

/** A personal question, a generic answer, and how it usually ends. */
const THREAD: Line[] = [
  { from: "them", text: "Hi, which one should I take for energy?", time: "7:42 pm" },
  { from: "note", text: "A personal question…", side: "left" },
  { from: "you", text: "Hi! Sorry, just seeing this", time: "9:15 pm" },
  { from: "you", text: "Here are a few options 👇 [4 photos]" },
  { from: "you", text: "They're all good, which one would you like?" },
  { from: "note", text: "…a generic answer", side: "right" },
  { from: "them", text: "Let me think about it" },
  { from: "gap", text: "Three days later" },
  { from: "you", text: "Hi, still interested?" },
  { from: "seen" },
  { from: "note", text: "…and the sale goes quiet", side: "right" },
];

/** Why the sale slips: the customer wanted an answer for them, and got a catalogue. */
const LEAKS = [
  {
    title: "Every customer needs a different answer",
    body: "What suits someone who's tired all the time isn't what suits someone with stiff joints. Finding out means asking the same questions in every chat.",
  },
  {
    title: "A list of products isn't a recommendation",
    body: "Photos and prices leave the customer to choose alone. Without a reason that fits them, most say they'll think about it.",
  },
  {
    title: "Interest fades while you're busy",
    body: "Questions arrive while you're delivering an order or with family. By the time you've worked out what suits them, they've moved on.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="bg-paper py-24 sm:py-28">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <h2 className="display-lg max-w-[16ch] text-ink">Where WhatsApp Sales Get Lost</h2>
            <p className="lede mt-6 max-w-[34rem]">
              Most potential customers start with the same WhatsApp message: “Which one should I take?” The right answer is
              different for every person, and working it out in a chat takes time you don&apos;t always have.
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
          <Reveal delay={0.12}>
            <p className="mt-8 max-w-[30rem] font-display text-[1.45rem] leading-snug text-ink">
              Suppli Afya gives every customer a personal recommendation on your page,{" "}
              <span className="text-clay">before they message you.</span>
            </p>
          </Reveal>
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
                m.from === "seen" ? (
                  <li key={i} className="ml-auto pr-1 text-[0.7rem] text-[#54656f]">
                    Seen
                  </li>
                ) : m.from === "gap" ? (
                  <li key={i} className="mx-auto my-1 w-fit rounded-md bg-white/80 px-2.5 py-0.5 text-[0.72rem] text-[#54656f] shadow-sm">
                    {m.text}
                  </li>
                ) : m.from === "note" ? (
                  <li
                    key={i}
                    aria-hidden
                    className={clsx("-mt-0.5 mb-1 flex items-start gap-1.5 text-clay", m.side === "right" ? "flex-row-reverse pr-3" : "pl-4")}
                  >
                    <SwirlArrow direction="up" strokeWidth={7} className="h-12 w-4 shrink-0" />
                    <span className="pt-4 font-display text-[1.08rem] italic leading-none">{m.text}</span>
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
            </ol>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
