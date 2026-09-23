"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

const ease = [0.22, 1, 0.36, 1] as const;

const DAYS = [
  {
    day: "Monday",
    who: "Mary asks about joint pain after seeing your status.",
    without:
      "You reply between other chats, send three photos and a price. She says she'll think about it, and that's the last you hear from her.",
    with: "You send your link. She does the health check that evening and messages you with her answers, so you already know her knees have hurt for a year and that she avoids pork.",
  },
  {
    day: "Tuesday",
    who: "Otieno bought Veggie Veggie in August.",
    without: "His sachets ran out last week. He hasn't said anything, and you haven't noticed it's been a month.",
    with: "He's on today's list with a note that his supply is probably finished. You send a quick message and he orders again.",
  },
  {
    day: "Wednesday",
    who: "Achieng confirms an order and says she'll pay on Friday.",
    without: "Friday comes and goes. You don't want to sound pushy, so you wait, and the order just sits there.",
    with: "The unpaid order stays on your list until it's settled. On Friday it comes up, and you send a polite reminder with the amount already filled in.",
  },
  {
    day: "Thursday",
    who: "Twenty people took your number at a chama meeting.",
    without: "The numbers are somewhere in your phone, and you mean to message them all when you get a free evening.",
    with: "They scanned your card at the meeting. Everyone who finished the health check is already on your list, with what they're interested in.",
  },
  {
    day: "Friday",
    who: "The end of the week.",
    without: "You know you were busy, but you're not sure what you sold, who still owes you, or who's due next week.",
    with: "You can see what came in, what's still owed and who's due for a reorder next week.",
  },
];

export function Week() {
  const [withIt, setWithIt] = useState(false);
  return (
    <section id="week" className="bg-sand/60 py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <div className="eyebrow">Before and after</div>
            <h2 className="display-lg mt-5 text-ink">
              The same week, <span className="whitespace-nowrap">two ways</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="hidden lg:block lg:justify-self-end">
            <Toggle withIt={withIt} onChange={setWithIt} id="week-pill-lg" />
          </Reveal>
        </div>

        {/* On phones the switch follows you down the list. */}
        <div className="sticky top-16 z-20 -mx-5 mt-6 flex justify-center bg-[#ede5d6]/95 px-5 py-3 backdrop-blur lg:hidden">
          <Toggle withIt={withIt} onChange={setWithIt} id="week-pill-sm" floating />
        </div>

        <ol className="mt-2 divide-y lg:mt-14 divide-ink/10 border-y border-ink/10">
          {DAYS.map((d, i) => (
            <Reveal as="li" key={d.day} delay={0.04 * i} className="grid gap-3 py-7 md:grid-cols-[10rem_1fr_1.35fr] md:gap-8">
              <div className="font-display text-[1.35rem] text-ink">{d.day}</div>
              <div className="text-[1rem] font-medium leading-relaxed text-ink">{d.who}</div>
              <div className="relative min-h-[4.5rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={withIt ? "with" : "without"}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.35, delay: 0.03 * i, ease }}
                    className={clsx(
                      "border-l-2 pl-4 text-[1rem] leading-relaxed",
                      withIt ? "border-forest text-ink" : "border-clay/60 text-ink-soft",
                    )}
                  >
                    {withIt ? d.with : d.without}
                  </motion.p>
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Toggle({
  withIt,
  onChange,
  id,
  floating,
}: {
  withIt: boolean;
  onChange: (v: boolean) => void;
  id: string;
  floating?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label="Compare"
      className={clsx(
        "relative inline-flex rounded-full border border-ink/15 bg-paper p-1",
        floating && "shadow-[0_10px_30px_-12px_rgb(17_35_26/0.35)]",
      )}
    >
      {[false, true].map((v) => (
        <button
          key={String(v)}
          role="tab"
          aria-selected={withIt === v}
          onClick={() => onChange(v)}
          className={clsx(
            "relative z-10 rounded-full px-5 py-2.5 text-[0.92rem] font-semibold transition-colors duration-300",
            withIt === v ? "text-cream" : "text-ink-soft hover:text-ink",
          )}
        >
          {withIt === v && (
            <motion.span
              layoutId={id}
              className={clsx("absolute inset-0 -z-10 rounded-full", v ? "bg-forest" : "bg-clay")}
              transition={{ duration: 0.45, ease }}
            />
          )}
          {v ? "With Suppli Afya" : "Without it"}
        </button>
      ))}
    </div>
  );
}
