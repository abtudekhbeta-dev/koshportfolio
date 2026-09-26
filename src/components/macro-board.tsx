import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { canOpenStock } from "@/components/stock-link";
import { apiMacro } from "@/lib/kosh/api";
import { fmtPct } from "@/lib/kosh/engine";
import type { FiidiiRow, ResultEvent, ScreenRow } from "@/lib/kosh/types";
import { marketTemp } from "@/lib/kosh/screens";
import { compareIstDate, formatIstDate } from "@/lib/kosh/dates";
import { cn } from "@/lib/utils";

function cr(n: number) {
  const sign = n >= 0 ? "" : "−";
  return sign + "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " Cr";
}

function Spark({ rows, keyName }: { rows: FiidiiRow[]; keyName: "fiiNet" | "diiNet" }) {
  const vals = [...rows].reverse().map((r) => r[keyName]);
  if (vals.length < 2) return null;
  const w = 160;
  const h = 36;
  const hi = Math.max(...vals.map(Math.abs), 1);
  const y = (v: number) => h / 2 - (v / hi) * (h / 2 - 2);
  const d = vals
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (vals.length - 1)) * w).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");
  const last = vals[vals.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-9 w-40" aria-hidden>
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="var(--color-border)" />
      <path d={d} fill="none" stroke={last >= 0 ? "var(--color-up)" : "var(--color-down)"} strokeWidth="1.6" />
    </svg>
  );
}

export function MarketTempCard({ rows, focus }: { rows: ScreenRow[]; focus: string[] }) {
  if (!rows.length) return null;
  const t = marketTemp(rows, focus);
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">14-day RSI</div>
          <div className="mt-0.5 font-mono text-[18px] tabular">{t.avgRsi.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">Above 200-day</div>
          <div className="mt-0.5 font-mono text-[18px] tabular">{Math.round(t.above200 * 100)}%</div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{t.whose}</div>
          <div className="mt-0.5 text-[15px] font-medium">{t.tag}</div>
        </div>
      </div>
    </div>
  );
}

const FILTERS: { id: "all" | "results" | "macro" | "stock"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "results", label: "Results" },
  { id: "macro", label: "Macro" },
  { id: "stock", label: "Stock events" },
];

function toneOf(kind: ResultEvent["kind"]) {
  if (kind === "results") return "bg-chart/15 text-chart";
  if (kind === "macro") return "bg-warn/20 text-warn";
  return "bg-surface-2 text-muted";
}

export function EventCalendar({ compact, symbols }: { compact?: boolean; symbols?: string[] }) {
  const q = useQuery({ queryKey: ["macro"], queryFn: apiMacro, staleTime: 20 * 60 * 1000 });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const rows = useMemo(() => {
    const wantKey = (symbols || []).map((s) => s.toUpperCase().replace(/\.(NS|BO)$/i, "")).join(",");
    const list = q.data?.results || [];
    const want = wantKey ? wantKey.split(",") : null;
    const filtered = list.filter((r) => {
      if (filter !== "all" && r.kind !== filter) return false;
      if (!want || r.kind === "macro") return true;
      return want.includes(String(r.symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, ""));
    });
    return [...filtered].sort((a, b) => compareIstDate(a.date, b.date));
  }, [q.data, filter, symbols?.join(",")]);
  const shown = compact ? rows.slice(0, 12) : rows.slice(0, 24);

  return (
    <div className="min-w-0 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Calendar</h2>
          <p className="mt-1 text-[12px] text-subtle">Results, board events, and recurring macro dates.</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex h-7 items-center justify-center rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]",
                filter === f.id ? "bg-surface-2 text-fg" : "bg-bg text-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {q.isPending && !shown.length ? (
        <p className="mt-3 text-sm text-muted">Loading the calendar…</p>
      ) : shown.length ? (
        <ul className="mt-3 grid min-w-0 gap-1.5">
          {shown.map((r, i) => {
            const kind = r.kind || "stock";
            const label = (
              <>
                <span className={cn("mr-2 rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase", toneOf(kind))}>
                  {kind === "results" ? "Results" : kind === "macro" ? "Macro" : "Stock"}
                </span>
                {r.expected ? (
                  <span className="mr-2 rounded-sm bg-warn/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-warn uppercase">
                    Expected
                  </span>
                ) : null}
                {r.name}
                <span className="text-[11px] text-subtle"> · {r.purpose}</span>
              </>
            );
            return (
            <li key={r.symbol + r.date + r.purpose + String(i)} className="flex min-w-0 items-baseline justify-between gap-3 text-[13px]">
              {canOpenStock(r.symbol) ? (
                <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="min-w-0 flex-1 truncate hover:text-chart">
                  {label}
                </Link>
              ) : (
                <span className="min-w-0 flex-1 truncate">{label}</span>
              )}
              <span className="shrink-0 font-mono text-[12px] text-muted tabular">{formatIstDate(r.date)}</span>
            </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">Nothing in this filter for the next window.</p>
      )}
    </div>
  );
}

export function MacroBoard() {
  const q = useQuery({ queryKey: ["macro"], queryFn: apiMacro, staleTime: 20 * 60 * 1000 });
  const fiidii = q.data?.fiidii || [];
  const last = fiidii[0];
  return (
    <section>
      <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">FII / DII</h2>
        {q.isPending && !last ? (
          <p className="mt-3 text-sm text-muted">Loading cash-market flows…</p>
        ) : last ? (
          <>
            <p className="mt-1 text-[12px] text-subtle">{last.date} · cash (₹ Cr)</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">FII net</div>
                <div className={cn("mt-1 font-mono text-lg tabular", last.fiiNet >= 0 ? "text-up" : "text-down")}>{cr(last.fiiNet)}</div>
                <Spark rows={fiidii} keyName="fiiNet" />
              </div>
              <div>
                <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">DII net</div>
                <div className={cn("mt-1 font-mono text-lg tabular", last.diiNet >= 0 ? "text-up" : "text-down")}>{cr(last.diiNet)}</div>
                <Spark rows={fiidii} keyName="diiNet" />
              </div>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Flow file not on hand today.</p>
        )}
      </div>
    </section>
  );
}

export function TempLine({ rows }: { rows: ScreenRow[] }) {
  if (!rows.length) return null;
  const t = marketTemp(rows);
  return (
    <p className="text-[13px] text-muted">
      Universe read: <span className="font-medium text-fg">{t.tag}</span>
      {" · "}
      {fmtPct(t.green * 100).replace("+", "")} green
    </p>
  );
}
