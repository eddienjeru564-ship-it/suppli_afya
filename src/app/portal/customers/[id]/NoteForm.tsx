"use client";

import { useState, useTransition } from "react";
import { addNote } from "@/app/portal/actions";
import { Button } from "@/components/ui/Button";

export function NoteForm({ customerId }: { customerId: string }) {
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note, e.g. prefers delivery on Saturdays"
        className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-forest"
      />
      <Button
        disabled={pending || !note.trim()}
        className="h-auto"
        onClick={() =>
          start(async () => {
            const r = await addNote(customerId, note);
            if (r.ok) setNote("");
          })
        }
      >
        Save
      </Button>
    </div>
  );
}
