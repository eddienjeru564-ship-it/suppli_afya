"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { keepTogether } from "@/components/ui/KeepTogether";
import { KATE } from "./story";

const FAQ = [
  {
    q: "Is Suppli Afya part of BF Suma?",
    a: "No. Suppli Afya is an independent business, built for people who sell BF Suma products. It doesn't change how you buy stock, your upline or your account with the company.",
  },
  {
    q: "Who owns the customer relationship?",
    a: "You do. Customers come through your page, message your WhatsApp and buy from you. Suppli Afya never contacts your customers, never sells to them and never passes them to other distributors.",
  },
  {
    q: "What happens to my customers' information?",
    a: "Nothing leaves a customer's phone until they choose to send it to you. When they do, their answers and plan are saved in your workspace so you can help them, and nobody else sees them. We don't sell it or use it for anything else. The privacy page explains it in full.",
  },
  {
    q: "Does my customer need an app?",
    a: "No. Your page opens in any phone browser, from your link or your QR code. There's nothing to download and no account to create.",
  },
  {
    q: "How are the products suggested?",
    a: "The assessment asks about goals, daily routine and health, including medicine, allergies and pregnancy. It matches the answers against the BF Suma range, leaves out anything that doesn't suit that person and explains each suggestion in plain words. It's help choosing products, not a diagnosis, and it tells people plainly when something should be checked by a doctor first.",
  },
  {
    q: "How does WhatsApp fit in?",
    a: "Your page sends customers to your own WhatsApp number, the one you already use. There's no WhatsApp Business setup and nothing is sent in your name. From your workspace, follow-up messages open in WhatsApp ready to send, and you press send.",
  },
  {
    q: "How do customers pay?",
    a: "They pay you directly, by M-Pesa, cash or however you already work. Suppli Afya never holds your money. Record each payment against its order with the M-Pesa code, and anything still owed stays on your list until it's in. Sending M-Pesa payment requests straight to a customer's phone is coming to the Pro plan.",
  },
  {
    q: "Do I need to be good with computers?",
    a: "No. If you can use WhatsApp and M-Pesa, you can use Suppli Afya. It runs on your phone, and the part your customers see is just as simple.",
  },
  {
    q: "Can I try it before paying?",
    a: `Yes. The assessment on ${KATE.first}'s example page is the real one your customers will use, so you can see exactly what they get. Your own page and workspace open once you've chosen a plan.`,
  },
  {
    q: "Can I use it for other brands?",
    a: "Not yet. The assessment and product information are built around BF Suma's range, because that's who it's for.",
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
