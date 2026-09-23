"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";

const FAQ = [
  {
    q: "Do I need to be good with computers?",
    a: "No. If you can use WhatsApp and M-Pesa, you can use Suppli Afya. It runs on your phone, and the part your customers see is just as simple.",
  },
  {
    q: "Is this from BF Suma?",
    a: "No. Suppli Afya is an independent tool built for people who sell BF Suma products. It doesn't change how you buy stock, your upline, or your account with the company.",
  },
  {
    q: "Who owns my customer list?",
    a: "You do. Your customers and their records belong to you. We don't sell your data, share it with other distributors or contact your customers ourselves, and if you leave, you can take your list with you.",
  },
  {
    q: "What does my customer need?",
    a: "A phone with a browser and WhatsApp. There's no app to download and no account to create.",
  },
  {
    q: "What if a customer's answers point to a medical problem?",
    a: "The health check looks for things that should be checked by a doctor, like pregnancy, certain medicines, or symptoms that need attention, and tells the customer plainly. You see the same notes on your side, so you can advise them properly.",
  },
  {
    q: "How does M-Pesa work with it?",
    a: "If you're paid through a Till or Paybill number, you can send payment requests straight to a customer's phone and see when they've paid. If customers pay to your own line, you can record payments against their orders in a couple of taps.",
  },
  {
    q: "How much does it cost?",
    a: "Starter is KES 1,500, Growth is KES 2,900 and Pro is KES 4,900 a month. You pay each month by M-Pesa or card. Nothing is taken automatically, so there's nothing to cancel: if you stop renewing, your plan simply ends.",
  },
  {
    q: "What happens if my payment doesn't go through?",
    a: "Your account is kept. You can try again straight away, with M-Pesa or a card, without filling anything in twice.",
  },
  {
    q: "Can I try it before paying?",
    a: "The health check on this page is the real one your customers will use, so you can see exactly what they get. The portal opens once you've chosen a plan.",
  },
  {
    q: "Can I use it for other brands?",
    a: "Not yet. The health check and product information are built around BF Suma's range, because that's who it's for.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-ink/10 py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <div className="eyebrow">Questions</div>
          <h2 className="display-lg mt-5 max-w-[12ch] text-ink">What distributors usually ask</h2>
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
                  <span className="font-display text-[1.3rem] leading-snug text-ink sm:text-[1.45rem]">{f.q}</span>
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
                      <p className="max-w-[40rem] pb-7 text-[1.02rem] leading-relaxed text-ink-soft">{f.a}</p>
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
