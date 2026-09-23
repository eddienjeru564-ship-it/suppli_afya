"use client";

import { useTransition } from "react";
import { dismissCommunity } from "@/app/portal/actions";

export function CommunityInvite({ url }: { url: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="rounded-[1.25rem] bg-forest p-5 text-cream sm:p-6">
      <div className="font-display text-[1.35rem] leading-tight">You&apos;re part of Suppli Afya.</div>
      <p className="mt-1.5 max-w-lg text-[0.93rem] leading-relaxed text-cream/75">
        Join the distributor community for product training, practical tips and updates from the team. It&apos;s a
        WhatsApp community, so it lives where you already work.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center rounded-full bg-cream px-4 text-[0.88rem] font-semibold text-forest-deep"
        >
          Join the community
        </a>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => dismissCommunity())}
          className="text-[0.85rem] font-semibold text-cream/70 hover:text-cream"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
