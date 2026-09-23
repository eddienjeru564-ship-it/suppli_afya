import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    title: "They start with your link",
    body: "Instead of typing out the same explanation again, you send your link, or they scan the QR code on your card. It works on any phone with a browser.",
  },
  {
    title: "They do a short health check",
    body: "It takes about three minutes. They answer questions about their goals, routine and health, and get a plan that explains which products suit them and why.",
  },
  {
    title: "They message you, ready to talk",
    body: "One tap opens WhatsApp to you with their answers and plan already written in. You start the conversation knowing what they need, and what to leave out.",
  },
  {
    title: "You close, get paid and keep in touch",
    body: "Record the order, collect payment by M-Pesa, and Suppli Afya keeps track of when they'll need more. When it's time, they show up on your list.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <div className="eyebrow">How it works</div>
            <h2 className="display-lg mt-5 max-w-[16ch] text-ink">It fits around the way you already sell</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede max-w-[34rem] lg:ml-auto">
              You keep using WhatsApp and M-Pesa. Suppli Afya adds the structure around them, from the first question
              someone asks you to their fifth order.
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-ink/10 bg-ink/10 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={0.08 * i} className="group relative flex flex-col bg-cream p-7 sm:p-8">
              <span className="font-display text-[3.5rem] leading-none text-sand-deep transition-colors duration-500 group-hover:text-clay-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 font-display text-[1.5rem] leading-[1.15] text-ink">{s.title}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
