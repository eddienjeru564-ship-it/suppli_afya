"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { Fragment, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { PackArt } from "@/components/check/ProductGlyph";
import { Check, WhatsAppIcon } from "@/components/ui/icons";
import {
  CHECKIN_MESSAGE,
  KATE,
  KATE_OPENER,
  ORDER_TOTAL,
  PLAN_REF,
  REORDER_MESSAGE,
  SARAH,
  SARAH_MESSAGE,
  SUGGESTED,
  WHEN,
  kes,
  type Owner,
  type StoryProduct,
} from "./story";

/*
 * The phone screens the homepage tells its story with. Two people, two kinds of screen:
 * what Sarah (the customer) sees is Kate's page, calm and consumer-like; what Kate (the
 * distributor) sees is her workspace, plainer and denser. Each mirrors the real product, and the
 * words come from story.ts, which is checked against the real engine.
 * `live` adds small entrances; without it a screen is simply drawn, so it reads the same in the
 * HTML, without JavaScript and with reduced motion.
 */

const ease = [0.22, 1, 0.36, 1] as const;

export function MockPhone({ children, className, size = "md" }: { children: ReactNode; className?: string; size?: "md" | "sm" }) {
  return (
    <div
      className={clsx(
        "relative mx-auto shrink-0 border-[#0b1711] bg-cream shadow-float",
        size === "md"
          ? "h-[33rem] w-[17rem] rounded-[2.6rem] border-[9px] sm:h-[36rem] sm:w-[18.5rem]"
          : "h-[30rem] w-[15.5rem] rounded-[2.4rem] border-[8px]",
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

export function Monogram({ owner = KATE, className }: { owner?: Owner; className?: string }) {
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-full bg-forest font-display tracking-[0.02em] text-cream", className)}>
      {owner.initials}
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

/** A numbered pointer, used when a section explains the parts of the page. */
function Marker({ n, show, className = "right-0" }: { n: number; show?: boolean; className?: string }) {
  if (!show) return null;
  return (
    <span className={`absolute ${className} top-1/2 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-clay text-[0.68rem] font-bold text-cream ring-2 ring-cream`}>
      {n}
    </span>
  );
}

function UrlBar({ owner, markers }: { owner: Owner; markers?: boolean }) {
  return (
    <div className="bg-paper px-3 pb-2 pt-8">
      <div className="relative flex items-center gap-1.5 rounded-full bg-sand/70 px-3 py-1.5 text-[0.64rem] text-ink-soft">
        <Marker n={1} show={markers} className="right-1" />
        <svg viewBox="0 0 12 12" aria-hidden className="h-2.5 w-2.5 shrink-0">
          <rect x="2.5" y="5.5" width="7" height="5" rx="1.2" fill="currentColor" />
          <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
        <span className="truncate pr-5">{owner.link}</span>
      </div>
    </div>
  );
}

/** The top of a distributor's page: whose it is, one clear place to start, and a direct line. */
export function PageScreen({ owner = KATE, pressed, markers }: { owner?: Owner; pressed?: boolean; markers?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <UrlBar owner={owner} markers={markers} />
      <div className="px-4 pt-6">
        <div className="relative flex items-center gap-2.5 pr-6">
          <Marker n={2} show={markers} />
          <Monogram owner={owner} className="h-11 w-11 text-[1rem]" />
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-[1.08rem] text-ink">{owner.name}</div>
            <div className="truncate text-[0.68rem] text-ink-mute">{owner.title}</div>
          </div>
        </div>
        <span className="mt-6 inline-block rounded-full bg-sage-soft px-2.5 py-0.5 text-[0.62rem] font-semibold text-forest">About 3 minutes</span>
        <div className="mt-3 font-display text-[1.5rem] leading-[1.08] tracking-[-0.02em] text-ink">Let&apos;s find what actually suits you.</div>
        <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-soft">
          {owner.first} uses this short assessment to understand what you&apos;re looking for before suggesting anything.
        </p>
        <div className="relative mt-5">
          <Marker n={3} show={markers} />
          <div
            className={clsx(
              "inline-flex h-9 items-center gap-1.5 rounded-full bg-forest px-4 text-[0.8rem] font-semibold text-cream transition-transform duration-300",
              pressed && "scale-95 ring-4 ring-sage/60",
            )}
          >
            Start
            <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5">
              <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="relative mt-3.5 flex items-center gap-1.5 pr-6 text-[0.72rem] font-semibold text-forest">
          <Marker n={4} show={markers} />
          <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Or message {owner.first} directly</span>
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
export function SuggestionsScreen({ live, highlight }: { live?: boolean; highlight?: boolean }) {
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
        <div
          className={clsx(
            "mt-2 flex h-8 items-center justify-center gap-1.5 rounded-full bg-wa text-[0.72rem] font-semibold text-[#06331f] transition-transform duration-300",
            highlight && "scale-[1.04] ring-4 ring-wa/40",
          )}
        >
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

export function Bubble({
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

function DayChip({ children }: { children: ReactNode }) {
  return <div className="mx-auto mt-2 w-fit rounded-md bg-white/85 px-2 py-0.5 text-[0.58rem] text-[#54656f] shadow-sm">{children}</div>;
}

/**
 * WhatsApp on Sarah's phone, at each point in the story: her plan going to Kate, the sale, Kate
 * checking in two weeks later, then the reorder.
 */
export function ChatScreen({ stage, live }: { stage: "sent" | "sold" | "checkin" | "reorder"; live?: boolean }) {
  const [coffee, joints] = SUGGESTED;
  return (
    <div className="absolute inset-0 flex flex-col bg-wa-bg">
      <ChatHeader with={KATE.name} initial={KATE.first[0]} />
      <div className="flex flex-1 flex-col justify-end overflow-hidden px-2.5 pb-3">
        {(stage === "sent" || stage === "sold") && (
          <Bubble mine time="9:14 pm" live={live && stage === "sent"} delay={0.3} className="text-[0.62rem]">
            <WaText text={SARAH_MESSAGE} />
          </Bubble>
        )}
        {stage === "sold" && (
          <>
            <Bubble time="9:16 pm" live={live} delay={0.4}>
              Hi {SARAH.name}! The coffee is {kes(coffee.price)} and {joints.short} is {kes(joints.price)}. I can deliver both tomorrow.
              Shall I?
            </Bubble>
            <Bubble mine time="9:18 pm" live={live} delay={1.4}>
              Yes please 🙏 Sending it on M-Pesa now.
            </Bubble>
          </>
        )}
        {stage === "checkin" && (
          <>
            <DayChip>Two weeks later</DayChip>
            <Bubble time="10:02 am" live={live} delay={0.4}>
              {CHECKIN_MESSAGE}
            </Bubble>
            <Bubble mine time="10:20 am" live={live} delay={1.5}>
              My afternoons are much better, thank you!
            </Bubble>
          </>
        )}
        {stage === "reorder" && (
          <>
            <DayChip>Six days later</DayChip>
            <Bubble time="9:31 am" live={live} delay={0.4}>
              {REORDER_MESSAGE}
            </Bubble>
            <Bubble mine time="9:40 am" live={live} delay={1.5}>
              Same again please 🙏
            </Bubble>
          </>
        )}
      </div>
    </div>
  );
}

function QrEye({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="7" height="7" fill="currentColor" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
    </g>
  );
}

/** A decorative QR code: finder squares and a fixed pattern (never a real link). */
export function FakeQr({ className }: { className?: string }) {
  const n = 21;
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && (x * 7 + y * 13 + x * y) % 5 < 2) cells.push([x, y]);
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} aria-hidden className={clsx("bg-white text-ink", className)} shapeRendering="crispEdges">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
      <QrEye x={0} y={0} />
      <QrEye x={n - 7} y={0} />
      <QrEye x={0} y={n - 7} />
    </svg>
  );
}

// ------------------------------------------------------------------ Kate's side: her phone and workspace

/** Kate's status update, with her own link in it. */
export function StatusScreen() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0b6b58]">
      <div className="flex items-center justify-between px-4 pt-9 text-[0.62rem] font-semibold text-white/80">
        <span>✕</span>
        <span>My status</span>
        <span>Aa</span>
      </div>
      <div className="flex flex-1 items-center px-6 text-center font-display text-[1.2rem] leading-snug text-white">
        Not sure which supplements suit you? Answer a few quick questions on my page and see what could help, and why 👇
      </div>
      <div className="mx-4 mb-3 truncate rounded-lg bg-white/15 px-3 py-2 text-[0.64rem] text-white">{KATE.link}</div>
      <div className="flex items-center justify-between bg-black/20 px-4 py-3 text-[0.62rem] text-white/80">
        <span>Status · My contacts</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-wa text-[#06331f]">➤</span>
      </div>
    </div>
  );
}

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

function TodayRow({ initial, name, kind, why }: { initial: string; name: string; kind: Kind; why: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-ink/10 bg-paper/70 px-2.5 py-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sand font-display text-[0.8rem] text-ink">{initial}</span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.7rem] font-semibold text-ink">{name}</span>
          <KindTag kind={kind} />
        </div>
        <div className="truncate text-[0.6rem] text-ink-soft">{why}</div>
      </div>
    </div>
  );
}

function TodayTop({ day, count }: { day: string; count: number }) {
  return (
    <div className="px-4 pt-9">
      <div className="text-[0.62rem] font-semibold text-ink-mute">{day}</div>
      <div className="font-display text-[1.25rem] leading-tight text-ink">Good morning, {KATE.first}.</div>
      <div className="text-[0.66rem] text-ink-soft">
        {count} {count === 1 ? "person needs" : "people need"} you today.
      </div>
    </div>
  );
}

/** Kate's Today list before Sarah has found her page: other customers, no Sarah. */
export function TodayBeforeScreen() {
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <TodayTop day="Tuesday 6 October" count={2} />
      <div className="mx-3 mt-4 grid grid-cols-1 gap-1.5">
        <TodayRow initial="A" name="Achieng" kind="payment" why="Order of KES 7,800 from 2 Oct isn't paid yet." />
        <TodayRow initial="K" name="Kiprono" kind="quiet" why="No order since 3 Jul." />
      </div>
    </div>
  );
}

/** Sarah's enquiry in Kate's workspace, the moment she sends her plan. */
export function EnquiryScreen({ live }: { live?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <div className="border-b border-ink/10 bg-paper px-4 pb-3 pt-9">
        <div className="text-[0.6rem] font-semibold text-ink-mute">‹ Prospects</div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="font-display text-[1.2rem] leading-tight text-ink">
            {SARAH.name}, {SARAH.age}
          </span>
          <KindTag kind="new" />
        </div>
        <div className="text-[0.62rem] text-ink-mute">Did the assessment on your page just now</div>
      </div>
      <div className="grid gap-2.5 px-4 pt-3">
        <Fade live={live} delay={0.2}>
          <div className="text-[0.58rem] font-semibold text-ink-mute">Looking for</div>
          <div className="mt-1 flex gap-1">
            {SARAH.goals.map((g, i) => (
              <span key={g} className="rounded-full bg-sage-soft px-2 py-0.5 text-[0.62rem] font-semibold text-forest">
                {i + 1}. {g}
              </span>
            ))}
          </div>
        </Fade>
        <Fade live={live} delay={0.35}>
          <div className="text-[0.58rem] font-semibold text-ink-mute">Suggested</div>
          <div className="mt-1 grid gap-1">
            {SUGGESTED.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-xl bg-paper px-2 py-1.5">
                <Pack product={p} className="h-8 w-7 rounded-lg p-0.5" />
                <span className="text-[0.68rem] font-medium text-ink">{p.name}</span>
              </div>
            ))}
          </div>
        </Fade>
        <Fade live={live} delay={0.5} className="rounded-xl bg-sand/60 px-2.5 py-2 text-[0.62rem] leading-snug text-ink-soft">
          First time taking supplements. Explain how and when to take each product.
        </Fade>
        <Fade live={live} delay={0.65}>
          <div className="text-[0.58rem] font-semibold text-ink-mute">Your first reply, ready to send</div>
          <div className="mt-1 rounded-xl bg-wa-bubble px-2.5 py-2 text-[0.62rem] leading-snug text-[#111b21]">
            <span className="line-clamp-3">{KATE_OPENER}</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-wa px-2.5 py-1 text-[0.62rem] font-semibold text-[#06331f]">
            <WhatsAppIcon className="h-3 w-3" /> Send on WhatsApp
          </div>
        </Fade>
      </div>
    </div>
  );
}

/** The order Kate recorded, paid by M-Pesa. */
export function OrderScreen({ live }: { live?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <div className="border-b border-ink/10 bg-paper px-4 pb-3 pt-9">
        <div className="text-[0.6rem] font-semibold text-ink-mute">‹ Orders</div>
        <div className="mt-0.5 font-display text-[1.2rem] leading-tight text-ink">{ORDER_TOTAL}</div>
        <div className="text-[0.62rem] text-ink-mute">
          {SARAH.name} · {SARAH.phone}
        </div>
      </div>
      <div className="px-4 pt-3">
        <div className="rounded-xl border border-ink/10 bg-paper text-[0.68rem]">
          {SUGGESTED.map((p) => (
            <div key={p.name} className="flex items-center gap-2 border-b border-ink/10 px-2.5 py-2 text-ink">
              <Pack product={p} className="h-8 w-7 rounded-lg p-0.5" />
              <span className="min-w-0 flex-1 truncate">1 × {p.short}</span>
              <span className="text-ink-soft">{kes(p.price)}</span>
            </div>
          ))}
          <div className="flex justify-between px-2.5 py-2 font-semibold text-ink">
            <span>Total</span>
            <span>{ORDER_TOTAL}</span>
          </div>
        </div>
        <Fade live={live} delay={0.5} className="mt-3 flex items-center gap-2 rounded-xl bg-[#e3f4e0] px-3 py-2 text-[0.66rem] font-semibold text-[#1f5a2b]">
          <Check className="h-3.5 w-3.5" /> Paid by M-Pesa · SJK4H7Q2XP
        </Fade>
        <Fade live={live} delay={0.8} className="mt-3 rounded-xl border border-dashed border-ink/15 px-3 py-2 text-[0.64rem] leading-snug text-ink-soft">
          Check in after two weeks. Likely to need more in <b className="text-ink">about three weeks</b>.
        </Fade>
      </div>
    </div>
  );
}

/** Kate's Today list later on, with Sarah at the top and a message ready to send. */
export function TodayScreen({ kind, live }: { kind: "checkin" | "reorder"; live?: boolean }) {
  const both = SUGGESTED.map((p) => p.short).join(" and ");
  const why =
    kind === "checkin"
      ? `Started ${both} 2 weeks ago. A good time to ask how it's going.`
      : `Bought ${both} on ${WHEN.bought}. Probably running out this week.`;
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <TodayTop day={kind === "checkin" ? WHEN.checkinDay : WHEN.reorderDay} count={kind === "checkin" ? 2 : 3} />
      <Fade live={live} delay={0.25} className="mx-3 mt-4 rounded-2xl border border-ink/15 bg-paper p-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-sand font-display text-[0.8rem] text-ink">S</span>
          <span className="text-[0.72rem] font-semibold text-ink">{SARAH.name}</span>
          <KindTag kind={kind} />
        </div>
        <div className="mt-1.5 text-[0.62rem] leading-snug text-ink-soft">{why}</div>
        <div className="mt-2 text-[0.56rem] font-semibold text-ink-mute">Message, ready to send</div>
        <div className="mt-1 rounded-lg bg-wa-bubble px-2.5 py-2 text-[0.62rem] leading-snug text-[#111b21]">
          <span className="line-clamp-4">{kind === "checkin" ? CHECKIN_MESSAGE : REORDER_MESSAGE}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 whitespace-nowrap">
          <span className="inline-flex items-center gap-1 rounded-full bg-wa px-2.5 py-1 text-[0.62rem] font-semibold text-[#06331f]">
            <WhatsAppIcon className="h-3 w-3" /> Send on WhatsApp
          </span>
          <span className="rounded-full border border-ink/15 px-2.5 py-1 text-[0.62rem] font-semibold text-ink">Mark done</span>
        </div>
      </Fade>
      <div className="mx-3 mt-1.5 grid grid-cols-1 gap-1.5 opacity-80">
        {kind === "reorder" && <TodayRow initial="W" name="Wanjiru, 41" kind="new" why="Did the assessment on your page last night." />}
        <TodayRow initial="K" name="Kiprono" kind="quiet" why="No order since 3 Jul." />
      </div>
    </div>
  );
}
