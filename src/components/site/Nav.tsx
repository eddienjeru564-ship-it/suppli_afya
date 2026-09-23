"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#check", label: "The health check" },
  { href: "#portal", label: "Your portal" },
  { href: "#pricing", label: "Pricing" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [session, setSession] = useState<{ signedIn: boolean; next?: string; name?: string | null } | null>(null);

  // The page is static; ask once whether this is a returning distributor.
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setSession({ signedIn: false }));
  }, []);
  const account = session?.signedIn
    ? { href: session.next ?? "/portal", label: session.next === "/portal" ? "Open your portal" : "Continue setup" }
    : null;

  // Highlight the section being read.
  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        setActive(ids.find((id) => seen.get(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500",
        scrolled || open ? "bg-cream/85 shadow-[0_1px_0_rgb(22_36_28/0.08)] backdrop-blur-md" : "bg-transparent",
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Suppli Afya home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <div className="hidden items-center gap-7 text-[0.92rem] font-medium text-ink-soft lg:flex">
          {LINKS.map((l) => {
            const on = active === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={on ? "true" : undefined}
                className={clsx("relative py-1 transition-colors hover:text-ink", on && "text-ink")}
              >
                {l.label}
                {on && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-clay"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </a>
            );
          })}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          {account ? (
            <ButtonLink href={account.href} size="sm" arrow>
              {account.label}
            </ButtonLink>
          ) : (
            <>
              <Link href="/login" className="px-3 text-[0.92rem] font-medium text-ink-soft transition-colors hover:text-ink">
                Log in
              </Link>
              <ButtonLink href="#pricing" size="sm" arrow>
                Get started
              </ButtonLink>
            </>
          )}
        </div>
        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-full lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={clsx("absolute h-[1.5px] w-5 bg-ink transition-transform duration-300", open ? "rotate-45" : "-translate-y-[4px]")} />
          <span className={clsx("absolute h-[1.5px] w-5 bg-ink transition-transform duration-300", open ? "-rotate-45" : "translate-y-[4px]")} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-cream lg:hidden"
          >
            <div className="container-x flex h-full flex-col pb-10 pt-6">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                  className="border-b border-ink/10 py-4 font-display text-3xl text-ink"
                >
                  {l.label}
                </motion.a>
              ))}
              <p className="mt-6 text-[0.95rem] leading-relaxed text-ink-soft">
                For BF Suma distributors in Kenya. Sell more, follow up less.
              </p>
              <div className="mt-auto grid gap-3">
                {account ? (
                  <ButtonLink href={account.href} size="lg" onClick={() => setOpen(false)} arrow>
                    {account.label}
                  </ButtonLink>
                ) : (
                  <>
                    <ButtonLink href="#pricing" size="lg" onClick={() => setOpen(false)} arrow>
                      Get started
                    </ButtonLink>
                    <ButtonLink href="/login" size="lg" variant="secondary" onClick={() => setOpen(false)}>
                      Log in
                    </ButtonLink>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
