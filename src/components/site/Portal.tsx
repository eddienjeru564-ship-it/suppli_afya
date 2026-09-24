"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
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

const TODAY: { kind: Kind; name: string; why: string; action: string; message: string }[] = [
  {
    kind: "new",
    name: "Wanjiru, 34",
    why: "Did the health check last night. Energy and joints. Wants a focused plan.",
    action: "Reply",
    message:
      "Hi Wanjiru, thanks for doing the health check last night. I saw energy and joints were top of your list. Can I ask you a couple of quick questions before we decide what to start with?",
  },
  {
    kind: "reorder",
    name: "Otieno",
    why: "Bought Veggie Veggie on 12 September. Probably running out this week.",
    action: "Send reminder",
    message:
      "Habari Otieno! It's been about a month since you started Veggie Veggie, so you're probably nearly out. How has it been going? I can bring the next pack on Thursday if that works.",
  },
  {
    kind: "payment",
    name: "Achieng",
    why: "Confirmed an order of KES 7,800 on Friday. Not paid yet.",
    action: "Remind",
    message:
      "Hi Achieng, just a quick reminder about Friday's order of KES 7,800. Send it whenever you're ready and I'll bring everything over. Asante!",
  },
  {
    kind: "checkin",
    name: "Mama Njeri",
    why: "Started ArthroXtra three weeks ago. A good time to ask how her knees feel.",
    action: "Check in",
    message:
      "Habari Mama Njeri! It's been three weeks on ArthroXtra. How are the knees feeling? It usually takes six to eight weeks to notice a real difference, so keep going and tell me how you're doing.",
  },
  {
    kind: "quiet",
    name: "Kiprono",
    why: "Ordered every month until July. Nothing for 70 days.",
    action: "Say hello",
    message: "Hi Kiprono, it's been a while! Hope all is well at home. Are you still taking your coffee? I have stock if you need some.",
  },
];

const FILTERS: { id: "all" | Kind | "follow"; label: string; kinds: Kind[] }[] = [
  { id: "all", label: "All", kinds: ["new", "reorder", "payment", "checkin", "quiet"] },
  { id: "new", label: "New", kinds: ["new"] },
  { id: "reorder", label: "Reorders", kinds: ["reorder", "quiet"] },
  { id: "payment", label: "Unpaid", kinds: ["payment"] },
  { id: "follow", label: "Check-ins", kinds: ["checkin"] },
];

const BLOCKS = [
  {
    title: "Orders and M-Pesa in one place",
    body: "When someone says yes, create the order from their record. When the money arrives, record it against the order with the M-Pesa code in a couple of taps. Anything still owed stays on your list, with a polite reminder ready to send, so you stop scrolling through M-Pesa messages to work out who paid for what.",
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
            <TodayList />
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

function TodayList() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [open, setOpen] = useState<string | null>("Otieno");
  const kinds = FILTERS.find((f) => f.id === filter)!.kinds;
  const rows = TODAY.filter((t) => kinds.includes(t.kind));

  return (
    <div className="rounded-[2rem] border border-ink/10 bg-paper p-3 shadow-float sm:p-4 lg:min-h-[36rem]">
      <div className="px-3 pb-3 pt-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-display text-[1.45rem] leading-tight text-ink">Today</div>
            <div className="text-[0.8rem] text-ink-mute">Tuesday 14 October · {TODAY.length} people</div>
          </div>
          <span className="hidden text-[0.72rem] font-semibold text-ink-mute sm:block">Tap anyone to see the message</span>
        </div>
        <div role="tablist" aria-label="Filter" className="no-scrollbar -mx-3 mt-3 flex gap-1.5 overflow-x-auto px-3 text-[0.75rem] font-semibold">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "relative shrink-0 rounded-full px-3 py-1.5 transition-colors",
                filter === f.id ? "text-cream" : "text-ink-soft hover:text-ink",
              )}
            >
              {filter === f.id && (
                <motion.span layoutId="today-filter" className="absolute inset-0 -z-0 rounded-full bg-forest" transition={{ duration: 0.35, ease }} />
              )}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
      <motion.ul layout className="grid gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((t, i) => {
            const isOpen = open === t.name;
            return (
              <motion.li
                key={t.name}
                layout
                initial={reduce ? false : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, delay: 0.05 * i, ease }}
                className={clsx("rounded-2xl transition-colors", isOpen ? "bg-sand/70" : "bg-cream/70")}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : t.name)}
                  className="flex w-full items-center gap-3 p-3.5 text-left sm:gap-4"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand font-display text-lg text-ink">
                    {t.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-ink">{t.name}</span>
                      <span className={clsx("rounded-full px-2 py-0.5 text-[0.68rem] font-semibold", KIND[t.kind].tone)}>
                        {KIND[t.kind].label}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[0.84rem] leading-snug text-ink-soft">{t.why}</span>
                  </span>
                  <span
                    className={clsx(
                      "hidden shrink-0 rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold transition-colors sm:inline",
                      isOpen ? "border-forest bg-forest text-cream" : "border-forest/25 text-forest",
                    )}
                  >
                    {t.action}
                  </span>
                  <Chevron open={isOpen} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 sm:pl-[4.25rem]">
                        <div className="text-[0.7rem] font-semibold text-ink-mute">Ready to send · edit if you like</div>
                        <div className="mt-1.5 rounded-xl rounded-tr-sm bg-wa-bubble px-3 py-2.5 text-[0.86rem] leading-relaxed text-[#111b21] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]">
                          {t.message}
                        </div>
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-wa px-3 py-1.5 text-[0.75rem] font-semibold text-[#06331f]">
                            <WhatsAppIcon className="h-3.5 w-3.5" /> Open in WhatsApp
                          </span>
                          <span className="text-[0.72rem] text-ink-mute">Demo · nothing is sent</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={clsx("h-4 w-4 shrink-0 text-ink-mute transition-transform duration-300 sm:hidden", open && "rotate-180")}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
