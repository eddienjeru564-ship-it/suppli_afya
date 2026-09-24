"use client";

import { logOut } from "@/app/start/actions";
import { Button } from "@/components/ui/Button";
import { clearPrivateData } from "./store";

/** Logs out and removes the portal pages saved on this device. */
export function LogoutButton() {
  return (
    <form
      action={async () => {
        await clearPrivateData();
        await logOut();
      }}
    >
      <Button type="submit" variant="secondary" size="md">
        Log out
      </Button>
    </form>
  );
}
