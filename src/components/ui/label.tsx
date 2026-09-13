import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("grid gap-1.5 text-[12px] font-medium text-muted", className)} {...props} />;
}
