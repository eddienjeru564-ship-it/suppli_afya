"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";

const ease = [0.22, 1, 0.36, 1] as const;

type Kind = "new" | "reorder" | "payment" | "checkin" | "quiet";

const KIND: Record<Kind, { label: string; tone: string }> = {
  new: { label: "New", tone: "bg-sage-soft text-forest" },
  reorder: { label: "Reorder due", tone: "bg-[#f3e3c3] text-[#7a5412]" },
  payment: { label: "Unpaid", tone: "bg-clay-soft text-clay" },
  checkin: { label: "Check in", tone: "bg-sand text-ink-soft" },
  quiet: { label: "Gone quiet", tone: "bg-ink/[0.06] text-ink-soft" },
};

const TODAY: { kind: Kind; name: string; why: string; action: string }[] = [
  {
    kind: "new",
    name: "Wanjiru, 34",
    why: "Did the health check last night. Energy and joints. Wants a focused plan.",
    action: "Reply",
  },
  {
    kind: "reorder",
    name: "Otieno",
    why: "Bought Veggie Veggie on 12 September. Probably running out this week.",
    action: "Send reminder",
  },
  {
    kind: "payment",
    name: "Achieng",
    why: "Confirmed an order of KES 7,800 on Friday. Not paid yet.",
    action: "Remind",
  },
  {
    kind: "checkin",
    name: "Mama Njeri",
    why: "Started ArthroXtra three weeks ago. A good time to ask how her knees feel.",
    action: "Check in",
  },
  {
    kind: "quiet",
    name: "Kiprono",
    why: "Ordered every month until July. Nothing for 70 days.",
    action: "Say hello",
  },
];

const BLOCKS = [
  {
    title: "Orders and M-Pesa in one place",
    body: "When someone says yes, create the order from their record. If you take payments on a Till or Paybill, send an M-Pesa request straight to their phone and see it marked paid when the money arrives. If they pay to your own number, record it against the order in a couple of taps. Either way, you stop scrolling through M-Pesa messages to work out who paid for what.",
  },
  {
    title: "Reorders that don't depend on your memory",
    body: "Suppli Afya knows roughly how long each product lasts at the usual dose. A few days before a customer runs out, they appear on your list with a message ready to send or change. Customers who've gone quiet show up too, so you can check in before they start buying from someone else.",
  },
  {
    title: "Every customer's history in one place",
    body: "What they came to you for, what they bought, what they paid and what you last talked about. When someone messages you after three months, you know exactly where you left off.",
  },
];

export function Portal() {
  const reduce = useReducedMotion();
  return (
    <section id="portal" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <Reveal>
              <div className="eyebrow">Your portal</div>
              <h2 className="display-lg mt-5 max-w-[15ch] text-ink">Each morning, a short list of who to talk to, and why</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lede mt-6 max-w-[34rem]">
                A customer list only helps if it tells you what to do next. The first screen in your portal is
                today&apos;s list: people who&apos;ve just done the health check, follow-ups that are due, payments that
                haven&apos;t come in, and customers whose supply is running low. Each one comes with the reason it&apos;s
                there, so you&apos;re not guessing.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-[2rem] border border-ink/10 bg-paper p-3 shadow-float sm:p-4">
              <div className="flex items-center justify-between px-3 pb-3 pt-2">
                <div>
                  <div className="font-display text-[1.45rem] leading-tight text-ink">Today</div>
                  <div className="text-[0.8rem] text-ink-mute">Tuesday 14 October · 5 people</div>
                </div>
                <div className="flex gap-1.5 text-[0.72rem] font-semibold">
                  <span className="rounded-full bg-forest px-2.5 py-1 text-cream">All</span>
                  <span className="hidden rounded-full px-2.5 py-1 text-ink-soft sm:inline">Reorders</span>
                  <span className="hidden rounded-full px-2.5 py-1 text-ink-soft sm:inline">Unpaid</span>
                </div>
              </div>
              <ul className="grid gap-1.5">
                {TODAY.map((t, i) => (
                  <motion.li
                    key={t.name}
                    className="flex items-center gap-3 rounded-2xl bg-cream/70 p-3.5 sm:gap-4"
                    initial={reduce ? false : { opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease }}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand font-display text-lg text-ink">
                      {t.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-ink">{t.name}</span>
                        <span className={clsx("rounded-full px-2 py-0.5 text-[0.68rem] font-semibold", KIND[t.kind].tone)}>
                          {KIND[t.kind].label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[0.84rem] leading-snug text-ink-soft">{t.why}</p>
                    </div>
                    <span className="hidden shrink-0 rounded-full border border-forest/25 px-3 py-1.5 text-[0.75rem] font-semibold text-forest sm:inline">
                      {t.action}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mt-24 grid gap-12 border-t border-ink/10 pt-14 md:grid-cols-3 md:gap-10">
          {BLOCKS.map((b, i) => (
            <Reveal key={b.title} delay={0.08 * i}>
              <h3 className="font-display text-[1.55rem] leading-[1.15] text-ink">{b.title}</h3>
              <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft">{b.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
