import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Every model call uses this. Deterministic fetches do not. */
export function AIButton({
  children,
  busy,
  busyLabel,
  className,
  disabled,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; busyLabel?: string }) {
  return (
    <button
      type={type}
      title="Uses AI. It interprets evidence. It does not invent numbers."
      className={cn(
        "kosh-ai-btn inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[13px] font-medium disabled:opacity-40",
        className,
      )}
      {...props}
      disabled={disabled || busy}
    >
      <span className="kosh-ai-mark">✦ AI</span>
      <span>{busy ? busyLabel || "Working…" : children}</span>
    </button>
  );
}
