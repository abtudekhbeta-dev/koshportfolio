import { MetricLabel } from "@/components/metric";
import { Pct } from "@/components/pct";
import type { WindowPair } from "@/lib/kosh/types";

const LABELS: { lab: string; k: string; id: string }[] = [
  { lab: "1W", k: "w1", id: "w1" },
  { lab: "1M", k: "m1", id: "m1" },
  { lab: "3M", k: "m3", id: "m3" },
  { lab: "6M", k: "m6", id: "m6" },
  { lab: "1Y", k: "y1", id: "y1" },
  { lab: "YTD", k: "ytd", id: "ytd" },
];

export function WindowsGrid({
  windows,
  portLabel = "Portfolio",
  benchLabel = "Index",
}: {
  windows: Record<string, WindowPair>;
  portLabel?: string;
  benchLabel?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {LABELS.map(({ lab, k, id }) => {
        const w = windows[k];
        return (
          <div key={lab} className="rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]">
            <MetricLabel id={id} />
            <div className="mt-2 text-[12px] text-muted">
              {portLabel}{" "}
              <b>
                <Pct n={w?.port} />
              </b>
            </div>
            <div className="mt-0.5 text-[12px] text-muted">
              {benchLabel}{" "}
              <b>
                <Pct n={w?.bench} />
              </b>
            </div>
          </div>
        );
      })}
    </div>
  );
}
