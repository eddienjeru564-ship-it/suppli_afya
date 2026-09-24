"use client";

import { Check } from "@/components/ui/icons";
import { AppIcon } from "./icons";
import { InstallSheet, InstallSteps } from "./InstallSheet";
import { MorningReminder } from "./MorningReminder";
import { useInstall } from "./useInstall";

/**
 * "Suppli Afya on your phone": the permanent home for installing, whatever the
 * device, plus the morning reminder once it's possible.
 */
export function AppSettings({ phoneQrSvg, pushEnabled }: { phoneQrSvg: string; pushEnabled: boolean }) {
  const { pwa, kind, install, sheetOpen, closeSheet } = useInstall();
  if (!pwa.ready) return <div className="h-40 animate-pulse rounded-[1.25rem] bg-paper" aria-hidden />;

  return (
    <div className="grid gap-4">
      <div className="rounded-[1.25rem] border border-ink/10 bg-paper p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <AppIcon className="h-14 w-14" />
          <div className="min-w-0 flex-1">
            {kind === "done" ? (
              <>
                <h3 className="flex items-center gap-2 font-semibold text-ink">
                  <Check className="h-4 w-4 text-moss" />
                  {pwa.standalone ? "You're using the app" : "Installed on this device"}
                </h3>
                <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-soft">
                  {pwa.standalone
                    ? "Suppli Afya opens from your home screen, keeps you signed in, and shows pages you've opened even without signal."
                    : "Open Suppli Afya from your home screen or app list for the full-screen app."}
                </p>
              </>
            ) : pwa.platform === "desktop" ? (
              <>
                <h3 className="font-semibold text-ink">Use Suppli Afya on your phone</h3>
                <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-soft">
                  Scan this with your phone&apos;s camera, log in, and add it to your home screen from there.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-ink">Add Suppli Afya to your home screen</h3>
                <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-soft">
                  It opens like an app: full screen, straight into today&apos;s list, and it still works on a weak signal.
                </p>
              </>
            )}
          </div>
        </div>

        {kind === "prompt" && (
          <button
            type="button"
            onClick={install}
            className="mt-5 h-12 w-full rounded-full bg-forest text-[0.95rem] font-semibold text-cream active:scale-[0.99] sm:w-auto sm:px-6"
          >
            {pwa.platform === "desktop" ? "Install on this computer" : "Install Suppli Afya"}
          </button>
        )}
        {kind === "steps" && (
          <div className="mt-2">
            <InstallSteps pwa={pwa} />
          </div>
        )}
        {pwa.platform === "desktop" && kind !== "done" && (
          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-cream p-4">
            <div
              className="h-28 w-28 shrink-0 rounded-lg bg-white p-1.5 [&_svg]:h-full [&_svg]:w-full"
              role="img"
              aria-label="QR code that opens your portal on a phone"
              dangerouslySetInnerHTML={{ __html: phoneQrSvg }}
            />
            <p className="text-[0.88rem] leading-relaxed text-ink-soft">
              Works on Android and iPhone. On an iPhone, open it in Safari to add it to the home screen.
            </p>
          </div>
        )}
      </div>

      {pushEnabled && <MorningReminder />}
      <InstallSheet open={sheetOpen} onClose={closeSheet} pwa={pwa} />
    </div>
  );
}
