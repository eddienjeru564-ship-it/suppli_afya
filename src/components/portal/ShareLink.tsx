"use client";

import Link from "next/link";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";

/** Ways to share the health check link, ordered by how this distributor's customers reach them. */
export function ShareLink({ url, displayUrl, channels, compact }: { url: string; displayUrl: string; channels: string[]; compact?: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  };

  const status = `Not sure which supplements suit you? Take my free three-minute health check and get a plan that explains why: ${url}`;
  const caption = `Wondering what could help with your energy, joints, digestion or sleep? My free health check takes three minutes, and you get a plan that explains what suits you and why. ${url}`;

  const ideas = [
    {
      id: "whatsapp",
      show: true,
      title: "Post it on your WhatsApp status",
      body: status,
      action: (
        <a
          href={`https://wa.me/?text=${encodeURIComponent(status)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-wa px-3 py-1.5 text-[0.8rem] font-semibold text-[#06331f]"
        >
          <WhatsAppIcon className="h-3.5 w-3.5" /> Share
        </a>
      ),
    },
    {
      id: "shop",
      show: channels.includes("shop") || channels.includes("referrals"),
      title: channels.includes("shop") ? "Print your QR card for the counter" : "Print cards to hand to customers",
      body: "Anyone who scans it lands on your health check, and their plan comes to your WhatsApp.",
      action: (
        <Link href="/portal/settings#card" className="rounded-full bg-forest px-3 py-1.5 text-[0.8rem] font-semibold text-cream">
          Get the card
        </Link>
      ),
    },
    {
      id: "social",
      show: channels.includes("social"),
      title: "Use this caption on Facebook, Instagram or TikTok",
      body: caption,
      action: (
        <button type="button" onClick={() => copy("social", caption)} className="rounded-full border border-ink/15 px-3 py-1.5 text-[0.8rem] font-semibold text-ink">
          {copied === "social" ? "Copied" : "Copy caption"}
        </button>
      ),
    },
  ]
    .filter((i) => i.show)
    .sort((a, b) => Number(channels.includes(b.id)) - Number(channels.includes(a.id)));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-cream px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate font-mono text-[0.85rem] text-forest">{displayUrl}</span>
        <button type="button" onClick={() => copy("link", url)} className="shrink-0 text-[0.82rem] font-semibold text-forest underline underline-offset-2">
          {copied === "link" ? "Copied" : "Copy link"}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[0.82rem] font-semibold text-ink-soft">
          Preview
        </a>
      </div>
      {!compact && (
        <ul className="mt-3 grid gap-2">
          {ideas.map((i) => (
            <li key={i.id} className="rounded-xl border border-ink/10 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[0.92rem] font-semibold text-ink">{i.title}</div>
                  <p className="mt-1 line-clamp-2 text-[0.84rem] leading-snug text-ink-soft">{i.body}</p>
                </div>
                <div className="shrink-0">{i.action}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
