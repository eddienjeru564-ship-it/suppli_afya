"use client";

import clsx from "clsx";
import { useRef, useState } from "react";
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
  const rail = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  // On phones the steps are a swipeable row; track which card is in front.
  const onScroll = () => {
    const el = rail.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const w = card ? card.offsetWidth + 12 : el.clientWidth;
    setActive(Math.min(STEPS.length - 1, Math.round(el.scrollLeft / w)));
  };
  const goTo = (i: number) => {
    const el = rail.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 20, behavior: "smooth" });
  };

  return (
    <section id="how" className="py-20 sm:py-32">
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

        <ol
          ref={rail}
          onScroll={onScroll}
          className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 md:mx-0 md:mt-16 md:grid md:grid-cols-2 md:gap-px md:overflow-hidden md:rounded-[2rem] md:border md:border-ink/10 md:bg-ink/10 md:px-0 md:pb-0 lg:grid-cols-4"
        >
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="group relative flex w-[82%] shrink-0 snap-start flex-col rounded-[1.6rem] border border-ink/10 bg-paper p-7 sm:w-[60%] md:w-auto md:rounded-none md:border-0 md:bg-cream sm:p-8"
            >
              <Reveal delay={0.08 * i}>
                <span className="font-display text-[3.25rem] leading-none text-sand-deep transition-colors duration-500 group-hover:text-clay-soft md:text-[3.5rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-[1.5rem] leading-[1.15] text-ink md:mt-8">{s.title}</h3>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex items-center justify-center gap-2 md:hidden" aria-hidden>
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              tabIndex={-1}
              onClick={() => goTo(i)}
              className={clsx(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-6 bg-forest" : "w-1.5 bg-ink/20",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
