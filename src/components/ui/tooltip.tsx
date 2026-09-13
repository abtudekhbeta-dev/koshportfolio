import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TooltipProvider({
  children,
  delayDuration = 200,
}: {
  children: ReactNode;
  delayDuration?: number;
}) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({
  children,
  content,
  className,
}: {
  children: ReactNode;
  content: ReactNode;
  className?: string;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className={cn(
            "z-50 rounded-sm bg-surface px-2 py-1 text-xs text-fg shadow-[var(--shadow-border)]",
            className,
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
