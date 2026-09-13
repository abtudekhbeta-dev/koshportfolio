import type { MonthRow } from "@/lib/kosh/types";
import { cn } from "@/lib/utils";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function heatClass(v: number) {
  if (v >= 8) return "bg-up text-accent-fg";
  if (v >= 3) return "bg-up/70 text-accent-fg";
  if (v >= 0) return "bg-up/30 text-fg";
  if (v >= -3) return "bg-down/30 text-fg";
  if (v >= -8) return "bg-down/70 text-accent-fg";
  return "bg-down text-accent-fg";
}

export function MonthHeatmap({ months }: { months: MonthRow[] }) {
  if (!months.length) {
    return <div className="rounded-lg bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]">Need a few months of prices.</div>;
  }
  const years = [...new Set(months.map((m) => m.key.slice(0, 4)))];
  return (
    <div className="overflow-x-auto rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="grid min-w-[520px] gap-1" style={{ gridTemplateColumns: "44px repeat(12, 1fr)" }}>
        <div />
        {MONTHS.map((m, i) => (
          <div key={i} className="text-center text-[10px] text-subtle">
            {m}
          </div>
        ))}
        {years.map((y) => (
          <YearRow key={y} year={y} months={months} />
        ))}
      </div>
    </div>
  );
}

function YearRow({ year, months }: { year: string; months: MonthRow[] }) {
  return (
    <>
      <div className="flex items-center font-mono text-[11px] text-subtle">{year}</div>
      {Array.from({ length: 12 }, (_, i) => {
        const k = year + "-" + String(i + 1).padStart(2, "0");
        const row = months.find((m) => m.key === k);
        if (!row) return <div key={k} className="h-7 rounded-xs bg-surface-2" />;
        return (
          <div
            key={k}
            title={`${k}  ${row.port.toFixed(1)}%`}
            className={cn("grid h-7 place-items-center rounded-xs font-mono text-[10px] font-medium", heatClass(row.port))}
          >
            {row.port.toFixed(0)}
          </div>
        );
      })}
    </>
  );
}
