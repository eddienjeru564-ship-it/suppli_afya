"use client";

import Image from "next/image";
import { useState } from "react";
import front from "./cards/kate-card-front.webp";
import back from "./cards/kate-card-back.webp";

/**
 * Kate's printed business card, front and back, as our team designs them in setup. Hover turns it
 * over on a computer; on a phone, a tap does. The button keeps it reachable by keyboard too.
 */
export function BusinessCard() {
  const [flipped, setFlipped] = useState(false);
  return (
    <figure className="w-full max-w-[30rem]">
      <div className="card-drift">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          data-flipped={flipped}
          aria-label={flipped ? "Show the front of Kate's card" : "Turn Kate's card over to see the QR code"}
          className="flip-card block w-full rounded-[1.1rem] text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-forest"
        >
          <span className="flip-card-inner block aspect-[7/4] w-full">
            <span className="flip-face absolute inset-0 overflow-hidden rounded-[1.1rem] shadow-float ring-1 ring-ink/10">
              <Image
                src={front}
                alt="Front of Kate Cromuel's card: her name, Independent BF Suma distributor, Powered by Suppli Afya."
                sizes="(min-width: 1024px) 30rem, 90vw"
                className="h-full w-full object-cover"
                placeholder="blur"
              />
            </span>
            <span className="flip-face flip-back overflow-hidden rounded-[1.1rem] shadow-float ring-1 ring-ink/10">
              <Image
                src={back}
                alt="Back of Kate's card: a QR code to her shop, her link and her WhatsApp number."
                sizes="(min-width: 1024px) 30rem, 90vw"
                className="h-full w-full object-cover"
                placeholder="blur"
              />
            </span>
          </span>
        </button>
      </div>
      <figcaption className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[0.85rem] text-ink-mute">
        <span>Kate&apos;s card, designed by our team. Yours comes with setup.</span>
        <span className="font-semibold text-forest">
          <span className="hidden [@media(hover:hover)]:inline">Hover</span>
          <span className="[@media(hover:hover)]:hidden">Tap</span> to turn it over.
        </span>
      </figcaption>
    </figure>
  );
}
