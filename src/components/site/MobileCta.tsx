"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Arrow } from "@/components/ui/Button";

/** Sections that already have their own call to action or a control at the bottom of the screen. */
const QUIET_ZONES = ["check", "numbers", "early-access", "start", "site-footer"];

/** A slim "try it" bar for phones, shown between sections that don't have their own. */
export function MobileCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const pastHero = window.scrollY > vh * 0.9;
      const blocked = QUIET_ZONES.some((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top < vh && r.bottom > vh - 140;
      });
      setShow(pastHero && !blocked);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 lg:hidden"
        >
          <div className="flex items-center gap-2 rounded-full bg-forest-deep/95 p-1.5 pl-5 text-cream shadow-float ring-1 ring-cream/10 backdrop-blur">
            <span className="min-w-0 flex-1 truncate text-[0.85rem] text-cream/80">See what your customers get</span>
            <a
              href="#check"
              className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-cream px-4 text-[0.85rem] font-semibold text-forest-deep"
            >
              Try it <Arrow className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
