"use client";

import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;

function AnimatedKes({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => kes(v));
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, mv, reduce]);
  return <motion.span className={className}>{text}</motion.span>;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[0.95rem] leading-snug text-cream/80">
          {label}
        </label>
        <span className="shrink-0 font-display text-[1.35rem] text-cream">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-cream/15 accent-ochre [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-cream [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cream [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgb(196_139_44/0.35)]"
        style={{ background: `linear-gradient(to right, var(--color-ochre) ${pct}%, rgb(244 238 227 / 0.15) ${pct}%)` }}
      />
    </div>
  );
}

export function Calculator() {
  const [customers, setCustomers] = useState(60);
  const [order, setOrder] = useState(6500);
  const [rate, setRate] = useState(15);
  const [extra, setExtra] = useState(10);

  const nowOrders = (customers * rate) / 100;
  const extraOrders = (customers * extra) / 100;
  const monthly = extraOrders * order;

  return (
    <section id="numbers" className="relative overflow-hidden bg-forest py-24 text-cream sm:py-32">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(196_139_44/0.18),transparent)]" />
      <div className="container-x relative grid gap-14 lg:grid-cols-2 lg:gap-24">
        <div>
          <Reveal>
            <div className="eyebrow !text-ochre">Your numbers</div>
            <h2 className="display-lg mt-5 max-w-[14ch]">Work out what better follow-up is worth to you</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[30rem] text-[1.1rem] leading-relaxed text-cream/75">
              You know your business better than we do, so use your own numbers. Move the sliders until they look like
              a normal month for you.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 grid gap-8">
              <Slider
                label="Customers who've bought from you in the last six months"
                value={customers}
                min={10}
                max={400}
                step={5}
                format={(v) => String(v)}
                onChange={setCustomers}
              />
              <Slider label="Your average order" value={order} min={1500} max={30000} step={500} format={kes} onChange={setOrder} />
              <Slider
                label="How many of them buy again in a normal month"
                value={rate}
                min={0}
                max={60}
                step={1}
                format={(v) => `${v}%`}
                onChange={setRate}
              />
              <Slider
                label="If you brought back this many more each month"
                value={extra}
                min={2}
                max={30}
                step={1}
                format={(v) => `+${v}%`}
                onChange={setExtra}
              />
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:pt-24">
          <div className="rounded-[2rem] bg-forest-deep/70 p-7 ring-1 ring-cream/10 sm:p-10">
            <div className="text-[0.95rem] text-cream/70">
              Right now that&apos;s about {Math.round(nowOrders)} repeat orders a month. Bringing back {extra}% more
              adds roughly {Math.max(1, Math.round(extraOrders))} orders, which is
            </div>
            <div className="mt-5">
              <AnimatedKes value={monthly} className="block font-display text-[3rem] leading-none tracking-[-0.02em] sm:text-[4rem]" />
              <div className="mt-2 text-[1rem] text-cream/70">extra a month</div>
            </div>
            <div className="mt-8 border-t border-cream/10 pt-6">
              <AnimatedKes value={monthly * 12} className="font-display text-[1.9rem] text-ochre" />
              <span className="ml-2 text-cream/70">over a year</span>
            </div>
            <p className="mt-8 text-[0.85rem] leading-relaxed text-cream/55">
              A rough estimate from the numbers you entered: past customers, times the extra share who come back, times
              your average order. It isn&apos;t a promise. We&apos;d just rather you judged Suppli Afya this way than
              took our word for it.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
