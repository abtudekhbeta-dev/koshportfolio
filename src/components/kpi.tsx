import { MetricCard } from "@/components/metric";
import { cn } from "@/lib/utils";

export function Kpi({
  label,
  value,
  hint,
  tone,
  metricId,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "up" | "down" | "warn" | "neutral";
  metricId?: string;
}) {
  if (metricId) {
    return <MetricCard id={metricId} value={value} hint={hint} tone={tone} />;
  }
  return (
    <div className="kosh-card rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]">
      <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">{label}</div>
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
            "mt-1 text-[12px] text-muted",
            tone === "up" && "text-up",
            tone === "down" && "text-down",
          )}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function toneOf(n: number | null | undefined): "up" | "down" | "neutral" {
  if (n == null || !Number.isFinite(n)) return "neutral";
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "neutral";
}
