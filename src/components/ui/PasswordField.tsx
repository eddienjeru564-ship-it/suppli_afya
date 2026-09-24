"use client";

import clsx from "clsx";
import { useId, useState, type ComponentProps } from "react";
import { inputClass } from "./Field";

/** A password input with a Show/Hide switch, so people on phones can check what they typed. */
export function PasswordField({ label, hint, ...props }: { label: string; hint?: string } & Omit<ComponentProps<"input">, "type">) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[0.9rem] font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input id={id} type={visible ? "text" : "password"} className={clsx(inputClass, "pr-20")} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute right-2 top-[calc(50%+0.25rem)] -translate-y-1/2 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold text-forest hover:bg-sage-soft/60"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <span className="mt-1.5 block text-[0.8rem] text-ink-mute">{hint}</span>}
    </div>
  );
}
