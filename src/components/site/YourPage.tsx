"use client";

import { useId, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { MockPhone, PageScreen } from "./Screens";
import { KATE, ownerFor } from "./story";

const CHANNELS = ["WhatsApp status", "QR cards", "Instagram and TikTok bio", "Facebook", "A link in any chat"];

/**
 * The distributor's own page, with the example owner swapped for whoever is reading: type a name
 * and the page in the phone becomes theirs. Nothing is saved; it only changes the preview.
 */
export function YourPage() {
  const [name, setName] = useState("");
  const owner = ownerFor(name);
  const mine = owner !== KATE;
  const inputId = useId();

  const parts = [
    { title: "Your own link", body: `${owner.link}. The same address your QR code opens, on every card, post and bio.` },
    { title: "Your name at the top", body: "On every screen, so customers know whose page they're on and who they'll be talking to." },
    { title: "One clear place to start", body: "A short assessment instead of a wall of products: what they're looking for, their routine, anything to be careful with." },
    { title: "A direct line to you", body: "Customers who already know what they want can message you straight away." },
  ];

  return (
    <section id="page" className="py-24 sm:py-32">
      <div className="container-x grid grid-cols-1 gap-x-20 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div>
          <Reveal>
            <div className="eyebrow">Your own customer page</div>
            <h2 className="display-lg mt-5 max-w-[15ch] text-ink">A page with your name on it, ready to share</h2>
            <p className="lede mt-6 max-w-[34rem]">
              It&apos;s what customers see when they scan your card or tap your link. {KATE.first}&apos;s is in the phone.
              Put your own name in and it becomes yours.
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-8 max-w-[26rem]">
            <label htmlFor={inputId} className="text-[0.9rem] font-semibold text-ink">
              See it with your name
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-ink/15 bg-paper p-1.5 pl-5 shadow-card focus-within:border-forest/50">
              <input
                id={inputId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                autoComplete="name"
                placeholder="Your name"
                className="h-10 min-w-0 flex-1 bg-transparent text-[1rem] text-ink outline-none placeholder:text-ink-mute"
              />
              {mine && (
                <button
                  type="button"
                  onClick={() => setName("")}
                  className="h-10 shrink-0 rounded-full px-4 text-[0.88rem] font-semibold text-forest hover:bg-forest/[0.06]"
                >
                  Back to {KATE.first}
                </button>
              )}
            </div>
            <p className="mt-2 text-[0.82rem] text-ink-mute" aria-live="polite">
              {mine ? `This is what ${owner.first}'s customers would see.` : "Nothing is saved. It only changes the preview."}
            </p>
          </Reveal>
        </div>

        {/* The phone sits beside everything on large screens, and right after the name box on phones. */}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div aria-hidden className="lg:sticky lg:top-28">
            <MockPhone>
              <PageScreen owner={owner} markers />
            </MockPhone>
          </div>
        </div>

        <div>
          <ol className="grid max-w-[34rem] gap-6">
            {parts.map((p, i) => (
              <Reveal as="li" key={p.title} delay={0.04 * i} className="grid grid-cols-[2rem_1fr] gap-4">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-clay text-[0.8rem] font-bold text-cream">{i + 1}</span>
                <div>
                  <h3 className="text-[1.05rem] font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1 break-words text-[0.98rem] leading-relaxed text-ink-soft">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.1} className="mt-12 border-t border-ink/10 pt-8">
            <h3 className="text-[1.05rem] font-semibold text-ink">Share it wherever people already ask you</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <li key={c} className="rounded-full border border-ink/15 bg-paper px-3.5 py-1.5 text-[0.88rem] text-ink-soft">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
