"use client";

import { motion, useReducedMotion } from "motion/react";
import { ButtonLink } from "@/components/ui/Button";
import { HeroPhone } from "./HeroPhone";

const ease = [0.22, 1, 0.36, 1] as const;
const HEADLINE = ["Most", "of", "your", "next", "orders", "are", "already", "in", "your", "phone."];

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pt-32 lg:pb-28 lg:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(236_213_193/0.7),transparent)]" />
        <div className="absolute bottom-0 left-[-15%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(223_231_214/0.8),transparent)]" />
      </div>

      <div className="container-x grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div>
          <motion.div
            className="eyebrow"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            For BF Suma distributors in Kenya
          </motion.div>

          <h1 className="display-xl mt-6 max-w-[14ch] text-ink">
            {HEADLINE.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className={
                    w === "already" ? "inline-block italic text-forest" : "inline-block"
                  }
                  initial={reduce ? false : { y: "105%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.055, ease }}
                >
                  {w}
                </motion.span>
                {i < HEADLINE.length - 1 && " "}
              </span>
            ))}
          </h1>

          <motion.p
            className="lede mt-7 max-w-[36rem]"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease }}
          >
            Suppli Afya helps you turn enquiries into first orders, and first orders into customers who keep coming
            back. Your customers get a proper health check and a plan that makes sense to them. You get a clear list of
            who to follow up with, who still owes you, and who is about to run out.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease }}
          >
            <ButtonLink href="#check" size="lg" arrow>
              Try the health check
            </ButtonLink>
            <ButtonLink href="#how" size="lg" variant="secondary">
              See how it works
            </ButtonLink>
          </motion.div>
          <motion.p
            className="mt-4 text-[0.85rem] text-ink-mute"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.1 }}
          >
            It takes about three minutes, and nothing you enter is saved.
          </motion.p>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease }}
        >
          <HeroPhone />
        </motion.div>
      </div>
    </section>
  );
}
