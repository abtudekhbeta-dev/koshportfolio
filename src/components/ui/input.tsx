import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-sm bg-bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      {...props}
    />
  );
}
