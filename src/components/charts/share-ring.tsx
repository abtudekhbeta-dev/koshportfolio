import { Link } from "@tanstack/react-router";
import { canOpenStock } from "@/components/stock-link";
import { cn } from "@/lib/utils";

const PALETTE = ["var(--color-chart)", "var(--color-warn)", "var(--color-up)", "var(--color-down)", "var(--color-muted)", "var(--color-subtle)"];

export function ShareRing({
  items,
  size = 132,
  legend = true,
}: {
  items: { name: string; pct: number }[];
  size?: number;
  legend?: boolean;
}) {
  const clean = items.filter((x) => x.pct > 0.4).slice(0, 8);
  const total = clean.reduce((s, x) => s + x.pct, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  let acc = 0;
  if (!clean.length) return <p className="text-[13px] text-muted">Nothing to split yet.</p>;
  return (
    <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
      <svg width={size} height={size} viewBox="0 0 120 120" className="shrink-0" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth="16" />
        {clean.map((it, i) => {
          const frac = it.pct / total;
          const dash = frac * c;
          const gap = c - dash;
          const rot = (acc / total) * 360 - 90;
          acc += it.pct;
          return (
            <circle
              key={it.name}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="16"
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rot} 60 60)`}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <ul className={cn("min-w-0 flex-1 grid gap-1.5", !legend && "hidden")}>
        {clean.map((it, i) => (
          <li key={it.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-[12px]">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="truncate">{it.name}</span>
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-bg-elevated" aria-hidden>
              <span
                className="block h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(2, it.pct))}%`, background: PALETTE[i % PALETTE.length] }}
              />
            </span>
            <span className="font-mono tabular text-muted">{it.pct.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CapSplit({
  items,
}: {
  items: { name: string; pct: number }[];
}) {
  const clean = items.filter((x) => x.pct > 0.2);
  if (!clean.length) return <p className="text-[13px] text-muted">Nothing to split yet.</p>;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <ShareRing items={clean} size={108} legend={false} />
      <ul className="grid min-w-[11rem] grid-cols-2 gap-2">
        {clean.map((it, i) => (
          <li key={it.name} className="rounded-md bg-bg px-3 py-2 shadow-[var(--shadow-border)]">
            <div className="flex items-center gap-1.5 text-[11px] tracking-[0.06em] text-subtle uppercase">
              <span className="size-1.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              {it.name}
            </div>
            <div className="mt-1 font-mono text-[18px] tabular">{it.pct.toFixed(0)}%</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MiniBars({
  items,
}: {
  items: { name: string; sub?: string; symbol?: string; value: number; label: string; tone?: "up" | "down" | "muted" }[];
  unit?: string;
}) {
  const max = Math.max(...items.map((x) => Math.abs(x.value)), 1);
  if (!items.length) return null;
  return (
    <div className="grid gap-2">
      {items.map((it) => (
        <div key={it.name} className="grid grid-cols-[minmax(0,6.5rem)_1fr_4.5rem] items-center gap-2 text-[12px] sm:grid-cols-[minmax(0,7.5rem)_1fr_4.5rem]">
          <div className="min-w-0">
            <div className="truncate font-medium">
              {it.symbol && canOpenStock(it.symbol) ? (
                <Link to="/s/$symbol" params={{ symbol: it.symbol }} className="hover:text-chart">
                  {it.name}
                </Link>
              ) : (
                it.name
              )}
            </div>
            {it.sub ? <div className="truncate text-[11px] text-subtle">{it.sub}</div> : null}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn("h-full", it.tone === "down" ? "bg-down" : it.tone === "muted" ? "bg-subtle" : "bg-up")}
              style={{ width: `${Math.min(100, (Math.abs(it.value) / max) * 100)}%` }}
            />
          </div>
          <div
            className={cn(
              "text-right font-mono tabular",
              it.tone === "down" ? "text-down" : it.tone === "up" ? "text-up" : "text-muted",
            )}
          >
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BreadthBar({ green, n }: { green: number; n: number }) {
  const pct = n > 0 ? (green / n) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between font-mono text-[12px] tabular text-muted">
        <span className="text-up">{green} advancing</span>
        <span>{pct.toFixed(0)}%</span>
        <span className="text-down">{Math.max(0, n - green)} declining</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-down/25">
        <div className="h-full bg-up" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
