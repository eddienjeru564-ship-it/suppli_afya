"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { Fragment, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { PackArt } from "@/components/check/ProductGlyph";
import { Check, WhatsAppIcon } from "@/components/ui/icons";
import { KATE, PLAN_REF, SARAH, SARAH_MESSAGE, SUGGESTED, type StoryProduct } from "./story";

/*
 * The phone screens the homepage tells its story with. Two people, two kinds of screen:
 * what Sarah (the customer) sees is Kate's page, calm and consumer-like; what Kate (the
 * distributor) sees is her workspace, plainer and denser. Each mirrors the real product, and the
 * words come from story.ts, which is checked against the real engine.
 * `live` adds small entrances; without it a screen is simply drawn, so it reads the same in the
 * HTML, without JavaScript and with reduced motion.
 */

const ease = [0.22, 1, 0.36, 1] as const;

export function MockPhone({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "relative mx-auto h-[33rem] w-[17rem] shrink-0 rounded-[2.6rem] border-[9px] border-[#0b1711] bg-cream shadow-float sm:h-[36rem] sm:w-[18.5rem]",
        className,
      )}
    >
      <div aria-hidden className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0b1711]" />
      <div className="relative h-full overflow-hidden rounded-[2rem]">{children}</div>
    </div>
  );
}

function Fade({ live, delay = 0, className, children }: { live?: boolean; delay?: number; className?: string; children: ReactNode }) {
  if (!live) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease }}
    >
      {children}
    </motion.div>
  );
}

export function Monogram({ className }: { className?: string }) {
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-full bg-forest font-display tracking-[0.02em] text-cream", className)}>
      {KATE.initials}
    </span>
  );
}

/** A product as Kate's page shows it: the pack, the name, what it's for. */
export function Pack({ product, className }: { product: StoryProduct; className?: string }) {
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-xl bg-sand/70 p-1", className)}>
      <PackArt format={product.format} line={product.line} />
    </span>
  );
}

/** WhatsApp's own formatting: *bold* and line breaks. */
export function WaText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*[^*]+\*)/).map((part, j) =>
            part.startsWith("*") && part.endsWith("*") ? <b key={j}>{part.slice(1, -1)}</b> : <Fragment key={j}>{part}</Fragment>,
          )}
        </Fragment>
      ))}
    </>
  );
}

// ------------------------------------------------------------------ Sarah's side: Kate's page

function UrlBar() {
  return (
    <div className="bg-paper px-3 pb-2 pt-8">
      <div className="flex items-center gap-1.5 rounded-full bg-sand/70 px-3 py-1.5 text-[0.64rem] text-ink-soft">
        <svg viewBox="0 0 12 12" aria-hidden className="h-2.5 w-2.5 shrink-0">
          <rect x="2.5" y="5.5" width="7" height="5" rx="1.2" fill="currentColor" />
          <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
        <span className="truncate">{KATE.link}</span>
      </div>
    </div>
  );
}

/** The top of Kate's page: whose it is, one clear place to start, and a direct line. */
export function PageScreen() {
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <UrlBar />
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2.5">
          <Monogram className="h-11 w-11 text-[1rem]" />
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-[1.08rem] text-ink">{KATE.name}</div>
            <div className="truncate text-[0.68rem] text-ink-mute">{KATE.title}</div>
          </div>
        </div>
        <span className="mt-6 inline-block rounded-full bg-sage-soft px-2.5 py-0.5 text-[0.62rem] font-semibold text-forest">About 3 minutes</span>
        <div className="mt-3 font-display text-[1.5rem] leading-[1.08] tracking-[-0.02em] text-ink">Let&apos;s find what actually suits you.</div>
        <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-soft">
          {KATE.first} uses this short assessment to understand what you&apos;re looking for before suggesting anything.
        </p>
        <div className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-forest px-4 text-[0.8rem] font-semibold text-cream">
          Start
          <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5">
            <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-3.5 flex items-center gap-1.5 text-[0.72rem] font-semibold text-forest">
          <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Or message {KATE.first} directly</span>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between px-4 pb-4 text-[0.58rem] text-ink-mute">
        <span className="inline-flex items-center gap-1">
          Powered by <LogoMark className="h-3 w-3" /> Suppli Afya
        </span>
        <span>Privacy</span>
      </div>
    </div>
  );
}

function Bar({ fill }: { fill: number[] }) {
  return (
    <div className="flex gap-1">
      {fill.map((f, i) => (
        <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-forest transition-[width] duration-700" style={{ width: `${f * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

/** "What would you most like to improve?", with Sarah's two goals picked in order. */
export function QuestionScreen({ live }: { live?: boolean }) {
  const opts = ["Energy", "Immunity", "Digestion", "Joints & bones", "Sleep & stress", "Blood sugar"];
  const picks: Record<string, number> = { Energy: 1, "Joints & bones": 2 };
  const on = { borderColor: "#1e3a2b", backgroundColor: "rgb(223 231 214 / 0.8)" };
  const off = { borderColor: "rgb(22 36 28 / 0.12)", backgroundColor: "#fbf8f2" };
  return (
    <div className="absolute inset-0 px-4 pt-9">
      <Bar fill={[1, 0.4, 0, 0]} />
      <div className="mt-1.5 flex justify-between text-[0.58rem] font-semibold text-ink-mute">
        <span>About you</span>
        <span className="text-forest">Goals</span>
        <span>Daily life</span>
        <span>Safety</span>
      </div>
      <div className="mt-4 font-display text-[1.3rem] leading-[1.15] text-ink">What would you most like to improve?</div>
      <div className="mt-1 text-[0.7rem] text-ink-mute">Choose up to three, most important first.</div>
      <div className="mt-3.5 grid gap-1.5">
        {opts.map((o) => {
          const rank = picks[o];
          const at = rank ? 0.6 + rank * 0.7 : 0;
          return (
            <motion.div
              key={o}
              className="flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[0.8rem] font-medium"
              initial={live ? off : false}
              animate={rank ? on : off}
              transition={{ delay: live ? at : 0, duration: 0.3 }}
            >
              <motion.span
                className="grid h-4 w-4 place-items-center rounded-[5px] border text-[0.6rem] font-bold text-cream"
                initial={live ? { backgroundColor: "#ffffff", borderColor: "rgb(22 36 28 / 0.3)" } : false}
                animate={rank ? { backgroundColor: "#1e3a2b", borderColor: "#1e3a2b" } : { backgroundColor: "#ffffff", borderColor: "rgb(22 36 28 / 0.3)" }}
                transition={{ delay: live ? at : 0, duration: 0.3 }}
              >
                {rank ?? ""}
              </motion.span>
              <span className={clsx(!rank && "text-ink-soft")}>{o}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-3.5 h-9 rounded-full bg-forest text-center text-[0.8rem] font-semibold leading-9 text-cream">Continue</div>
    </div>
  );
}

/** What could fit, and why, then the way back to Kate. */
export function SuggestionsScreen({ live }: { live?: boolean }) {
  return (
    <div className="absolute inset-0 px-3.5 pt-9">
      <Bar fill={[1, 1, 1, 1]} />
      <div className="mt-4 text-[0.64rem] font-semibold text-clay">Your plan · {PLAN_REF}</div>
      <div className="mt-0.5 font-display text-[1.35rem] leading-[1.1] text-ink">{SARAH.name}, here&apos;s your plan.</div>
      <div className="mt-2.5 grid gap-2">
        {SUGGESTED.map((it, i) => (
          <Fade key={it.name} live={live} delay={0.3 + i * 0.3} className="rounded-2xl border border-ink/10 bg-paper p-2.5">
            <div className="flex items-center gap-2.5">
              <Pack product={it} className="h-14 w-12" />
              <div className="min-w-0">
                <div className="font-display text-[0.95rem] leading-tight text-ink">{it.name}</div>
                <span className="mt-1 inline-block rounded-full bg-sage-soft px-1.5 py-px text-[0.6rem] font-semibold text-forest">{it.goal}</span>
              </div>
            </div>
            <div className="mt-2 flex gap-1.5 text-[0.62rem] leading-snug text-ink-soft">
              <Check className="mt-px h-2.5 w-2.5 shrink-0 text-moss" />
              <span className="line-clamp-2">{it.why}</span>
            </div>
          </Fade>
        ))}
      </div>
      <Fade live={live} delay={1.1} className="mt-2.5 rounded-2xl bg-forest p-3 text-cream">
        <div className="font-display text-[0.95rem] leading-tight">Want help deciding? Talk it through with {KATE.first}</div>
        <div className="mt-2 flex h-8 items-center justify-center gap-1.5 rounded-full bg-wa text-[0.72rem] font-semibold text-[#06331f]">
          <WhatsAppIcon className="h-3.5 w-3.5" /> Send my plan to {KATE.first}
        </div>
      </Fade>
    </div>
  );
}

function ChatHeader({ with: who, initial }: { with: string; initial: string }) {
  return (
    <div className="flex items-center gap-2 bg-wa-deep px-3 pb-2.5 pt-8 text-white">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dfe5e7] text-xs font-semibold text-wa-deep">{initial}</span>
      <div className="leading-tight">
        <div className="text-[0.8rem] font-semibold">{who}</div>
        <div className="text-[0.6rem] text-white/75">online</div>
      </div>
    </div>
  );
}

function Bubble({
  mine,
  time,
  live,
  delay,
  className,
  children,
}: {
  mine?: boolean;
  time: string;
  live?: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Fade
      live={live}
      delay={delay}
      className={clsx(
        "mt-2 max-w-[88%] rounded-lg px-2.5 pb-4 pt-2 text-[0.66rem] leading-[1.45] text-[#111b21] shadow-sm",
        mine ? "ml-auto rounded-tr-none bg-wa-bubble" : "rounded-tl-none bg-white",
        className,
      )}
    >
      {children}
      <div className="-mb-3 mt-0.5 text-right text-[0.56rem] text-[#54656f]">
        {time}
        {mine && " ✓✓"}
      </div>
    </Fade>
  );
}

/** WhatsApp on Sarah's phone: her plan, already written, on its way to Kate. */
export function ChatScreen({ live }: { live?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-wa-bg">
      <ChatHeader with={KATE.name} initial={KATE.first[0]} />
      <div className="flex flex-1 flex-col justify-end overflow-hidden px-2.5 pb-3">
        <Bubble mine time="9:14 pm" live={live} delay={0.3} className="text-[0.62rem]">
          <WaText text={SARAH_MESSAGE} />
        </Bubble>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Kate's side

type Kind = "new" | "payment" | "reorder" | "checkin" | "quiet";

/** The same tags the real Today list uses (src/components/portal/ui.tsx). */
export const KIND: Record<Kind, { label: string; tone: string }> = {
  new: { label: "New", tone: "bg-sage-soft text-forest" },
  payment: { label: "Unpaid", tone: "bg-clay-soft text-clay" },
  reorder: { label: "Reorder due", tone: "bg-[#f3e3c3] text-[#7a5412]" },
  checkin: { label: "Check in", tone: "bg-sand text-ink-soft" },
  quiet: { label: "Gone quiet", tone: "bg-ink/[0.06] text-ink-soft" },
};

export function KindTag({ kind, className }: { kind: Kind; className?: string }) {
  return <span className={clsx("rounded-full px-1.5 py-px text-[0.56rem] font-semibold", KIND[kind].tone, className)}>{KIND[kind].label}</span>;
}
