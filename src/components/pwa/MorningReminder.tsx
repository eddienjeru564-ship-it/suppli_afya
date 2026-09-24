"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { subscribePush, unsubscribePush } from "@/app/portal/actions";
import { usePwa } from "./store";

type Status = "loading" | "unsupported" | "needs-install" | "off" | "on" | "denied";

function keyBytes(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Reads and changes whether this device gets the morning reminder. */
export function useMorningReminder() {
  const pwa = usePwa();
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pwa.ready) return;
    let live = true;
    (async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      // iPhones only allow notifications for apps on the home screen.
      const s: Status = !supported
        ? pwa.platform === "ios" && !pwa.standalone
          ? "needs-install"
          : "unsupported"
        : Notification.permission === "denied"
          ? "denied"
          : (await navigator.serviceWorker.getRegistration())
            ? (await (await navigator.serviceWorker.ready).pushManager.getSubscription())
              ? "on"
              : "off"
            : "off";
      if (live) setStatus(s);
    })().catch(() => live && setStatus("unsupported"));
    return () => {
      live = false;
    };
  }, [pwa.ready, pwa.platform, pwa.standalone]);

  const turnOn = async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""),
        }));
      const r = await subscribePush(JSON.parse(JSON.stringify(sub)));
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setStatus("on");
    } catch {
      setError("That didn't work on this device. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    try {
      const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  };

  return { status, busy, error, turnOn, turnOff };
}

/** The Settings row. */
export function MorningReminder() {
  const { status, busy, error, turnOn, turnOff } = useMorningReminder();
  if (status === "loading" || status === "unsupported") return null;
  const on = status === "on";

  return (
    <div className="rounded-[1.25rem] border border-ink/10 bg-paper p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 id="reminder-label" className="font-semibold text-ink">
            Morning reminder
          </h3>
          <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-soft">
            {status === "needs-install"
              ? "On an iPhone, reminders work once Suppli Afya is on your home screen. Add it, open it from there, and turn this on."
              : status === "denied"
                ? "Notifications are blocked for Suppli Afya. Allow them in your phone's settings for this app, then come back."
                : "A notification at 8 each morning when people need you, saying who first. Nothing on quiet days."}
          </p>
        </div>
        {(status === "on" || status === "off") && (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-labelledby="reminder-label"
            disabled={busy}
            onClick={on ? turnOff : turnOn}
            className={clsx(
              "relative mt-0.5 h-8 w-14 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-60",
              on ? "bg-forest" : "bg-ink/20",
            )}
          >
            <span
              className={clsx(
                "absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200",
                on && "translate-x-6",
              )}
            />
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-[0.85rem] text-clay">
          {error}
        </p>
      )}
    </div>
  );
}

const CARD_KEY = "sa-reminder-card-dismissed";

/**
 * Offered once on Today, only inside the installed app (where it's most
 * useful and, on iPhone, the only place it works). Never asks for permission
 * until they tap "Turn on".
 */
export function ReminderCard() {
  const pwa = usePwa();
  const { status, busy, error, turnOn } = useMorningReminder();
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a device-only preference after mount
      setHidden(localStorage.getItem(CARD_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);
  if (!pwa.standalone || hidden || status !== "off") return null;
  const dismiss = () => {
    try {
      localStorage.setItem(CARD_KEY, "1");
    } catch {
      /* private mode */
    }
    setHidden(true);
  };
  return (
    <section aria-label="Morning reminder" className="rounded-[1.25rem] border border-ink/10 bg-paper p-4">
      <h2 className="font-semibold text-ink">Want a nudge at 8 each morning?</h2>
      <p className="mt-0.5 text-[0.88rem] leading-snug text-ink-soft">
        We&apos;ll tell you who needs you that day. Nothing on quiet days.
      </p>
      {error && <p className="mt-2 text-[0.85rem] text-clay">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            await turnOn();
            dismiss();
          }}
          className="h-10 rounded-full bg-forest px-4 text-[0.88rem] font-semibold text-cream active:scale-[0.98] disabled:opacity-60"
        >
          Turn on
        </button>
        <button type="button" onClick={dismiss} className="h-10 rounded-full px-3 text-[0.88rem] font-semibold text-ink-soft">
          Not now
        </button>
      </div>
    </section>
  );
}
