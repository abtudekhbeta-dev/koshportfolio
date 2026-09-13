import { useState, type ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { metric as defOf } from "@/lib/kosh/metrics";
import { cn } from "@/lib/utils";

export function MetricLabel({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const m = defOf(id);
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Tooltip content={m.hover || m.short}>
        <button type="button" className="text-left text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">
          {m.label}
        </button>
      </Tooltip>
      <button
        type="button"
        className="grid size-5 place-items-center rounded-sm text-subtle transition-colors duration-150 hover:text-fg"
        aria-label={`What ${m.label} means`}
        onClick={() => setOpen(true)}
      >
        <CircleHelp className="size-3.5" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={m.label}>
          <p className="text-[15px] leading-relaxed text-fg">{m.short}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">{m.deep}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function MetricCard({
  id,
  value,
  hint,
  tone,
  children,
}: {
  id: string;
  value: string;
  hint?: string;
  tone?: "up" | "down" | "warn" | "neutral";
  children?: ReactNode;
}) {
  const m = defOf(id);
  return (
    <div className="rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]">
      <MetricLabel id={id} />
      <div
        className={cn(
          "mt-1.5 font-mono text-[22px] font-medium tabular tracking-tight",
          tone === "up" && "text-up",
          tone === "down" && "text-down",
          tone === "warn" && "text-warn",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div
          className={cn(
            "mt-1 text-[12px] font-mono tabular",
            tone === "up" && "text-up",
            tone === "down" && "text-down",
            !tone && "text-muted",
          )}
        >
          {hint}
        </div>
      ) : null}
      {m.short ? <p className="mt-1.5 text-[12px] leading-snug text-muted">{m.short}</p> : null}
      {children}
    </div>
  );
}

export function ChartSkeleton({ label = "Loading the chart…" }: { label?: string }) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex gap-2">
        <div className="h-8 w-40 animate-pulse rounded-sm bg-surface-2" />
        <div className="ml-auto h-8 w-48 animate-pulse rounded-sm bg-surface-2" />
      </div>
      <div className="relative mt-3 h-[280px] w-full overflow-hidden sm:h-[320px]">
        <svg viewBox="0 0 640 280" className="h-full w-full" aria-hidden>
          {[40, 90, 140, 190, 240].map((y) => (
            <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="currentColor" className="text-border" />
          ))}
          <path
            d="M0 190 C 80 186, 120 160, 180 155 S 280 170, 340 120 S 460 90, 520 70 S 600 88, 640 60"
            fill="none"
            stroke="var(--color-chart)"
            strokeWidth="2.2"
            className="kosh-draw"
          />
          <path
            d="M0 200 C 90 194, 140 180, 200 175 S 300 188, 360 150 S 470 130, 640 110"
            fill="none"
            stroke="var(--color-chart-bench)"
            strokeWidth="1.6"
            strokeDasharray="5 4"
            className="kosh-draw kosh-draw-bench"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-surface/40">
          <p className="rounded-sm bg-bg-elevated px-3 py-1.5 text-[12px] text-muted shadow-[var(--shadow-border)]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
