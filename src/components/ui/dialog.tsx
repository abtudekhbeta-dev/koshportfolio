import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="kosh-overlay fixed inset-0 z-50 bg-black/55" />
      <DialogPrimitive.Content
        className={cn(
          "kosh-dialog fixed z-50 overflow-y-auto bg-bg-elevated shadow-[var(--shadow-border)] focus:outline-none",
          "inset-x-0 bottom-0 max-h-[min(92dvh,840px)] rounded-t-xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(520px,calc(100vw-24px))] sm:max-h-[min(88dvh,720px)] sm:rounded-xl sm:p-5",
          className,
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
        {title ? (
          <DialogPrimitive.Title className="mb-3 text-lg font-semibold tracking-tight">{title}</DialogPrimitive.Title>
        ) : (
          <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
        )}
        {children}
        <DialogPrimitive.Close className="absolute top-3.5 right-3.5 rounded-sm p-1 text-muted hover:text-fg">
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
