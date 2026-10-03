"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { keepTogether } from "@/components/ui/KeepTogether";

const FAQ = [
  {
    q: "Is Suppli Afya part of BF Suma?",
    a: "No. Suppli Afya is an independent business built for people who sell BF Suma products. Your upline, stock purchases and distributor account stay exactly as they are.",
  },
  {
    q: "Do I need to change how I sell?",
    a: "No. You keep selling on WhatsApp, the way you already do. Suppli Afya gives your customers a better starting point and keeps track of who to follow up.",
  },
  {
    q: "Do my customers stay mine?",
    a: "Yes. Customers come through your page, message your WhatsApp and buy from you. We don't sell their details, share them with other distributors or contact them ourselves.",
  },
  {
    q: "Can customers still contact me directly on WhatsApp?",
    a: "Yes. Your page has a button to message you straight away, for customers who already know what they want. The assessment is there for those who don't.",
  },
  {
    q: "How does payment work?",
    a: "Your customers pay you directly, by M-Pesa, cash or however you already work. Suppli Afya never holds your money. You record each payment against its order, and anything still owed stays on your list until it's paid. Your own plan is paid monthly by M-Pesa or card.",
  },
  {
    q: "Can I stop my subscription?",
    a: "Yes. Nothing renews automatically, so there's nothing to cancel. If you don't renew, your plan simply ends.",
  },
  {
    q: "What happens if I have more than 50 customers?",
    a: "Starter includes up to 50 customers. When you need more, Growth is KES 2,900 a month with no limit, and lets you bring in your existing customers from a spreadsheet. You can move up at any renewal.",
  },
  {
    q: "Is the assessment medical advice?",
    a: "No. It gives general wellness information to help customers choose products. It doesn't diagnose anything, and it tells people to speak to a doctor or pharmacist first when that's the right step, for example during pregnancy or alongside certain medicines.",
  },
  {
    q: "Can I use it from my phone?",
    a: "Yes. Your workspace runs on your phone and can be installed like an app, straight from the browser. Your customers only need a phone browser too, with nothing to download.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <h2 className="display-lg max-w-[12ch] text-ink lg:sticky lg:top-28">Common Questions</h2>
        </Reveal>
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-[1.3rem] leading-snug text-ink sm:text-[1.45rem]">{keepTogether(f.q)}</span>
                  <span
                    className={clsx(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-[transform,background-color,color] duration-300",
                      isOpen ? "rotate-45 border-forest bg-forest text-cream" : "border-ink/15 text-ink",
                    )}
                  >
                    <Plus />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[40rem] pb-7 text-[1.02rem] leading-relaxed text-ink-soft">{keepTogether(f.a)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
