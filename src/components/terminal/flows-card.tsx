import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiMacro } from "@/lib/kosh/api";
import { bucketFlows, grossOk, type FlowPeriod } from "@/lib/kosh/flows";
import type { FiidiiRow } from "@/lib/kosh/types";
import { cn } from "@/lib/utils";

function cr(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return sign + "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " Cr";
}

function FlowChart({ rows }: { rows: FiidiiRow[] }) {
  const series = [...rows].reverse().filter((row) => Number.isFinite(row.fiiNet) && Number.isFinite(row.diiNet));
  if (series.length < 2) return null;
  const w = 640;
  const h = 92;
  const vals = series.flatMap((row) => [row.fiiNet, row.diiNet]);
  const hi = Math.max(...vals.map(Math.abs), 1);
  const y = (v: number) => h / 2 - (v / hi) * (h / 2 - 6);
  const path = (key: "fiiNet" | "diiNet") =>
    series
      .map((row, i) => `${i === 0 ? "M" : "L"}${((i / (series.length - 1)) * w).toFixed(1)} ${y(row[key]).toFixed(1)}`)
      .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label="FII and DII daily net flows">
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="var(--color-border)" />
      <path d={path("fiiNet")} fill="none" stroke="var(--color-chart)" strokeWidth="1.6" />
      <path d={path("diiNet")} fill="none" stroke="var(--color-down)" strokeWidth="1.6" />
    </svg>
  );
}

export function FlowsCard() {
  const q = useQuery({ queryKey: ["macro"], queryFn: apiMacro, staleTime: 20 * 60_000 });
  const [period, setPeriod] = useState<FlowPeriod>("daily");
  const rows = q.data?.fiidii || [];
  const latest = rows[0];
  const buckets = useMemo(() => (period === "daily" ? [] : bucketFlows(rows, period)), [rows, period]);
  const shown = period === "daily" ? null : buckets[0];
  const fiiGross = latest ? grossOk(latest.fiiBuy, latest.fiiSell, latest.fiiNet) : false;
  const diiGross = latest ? grossOk(latest.diiBuy, latest.diiSell, latest.diiNet) : false;

  return (
    <section className="rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]" aria-label="FII and DII cash flows">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">FII / FPI and DII</h2>
          <p className="mt-1 max-w-2xl text-[11px] text-subtle">
            Equity cash-market nets only. Not debt, mutual funds, or a confirmed NSDL/CDSL print.
            {q.data?.asOf ? ` File time ${q.data.asOf}.` : ""}
          </p>
        </div>
        <div className="flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]" role="tablist" aria-label="Flow period">
          {(["daily", "monthly", "yearly"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={period === id}
              className={cn("h-7 rounded-sm px-2 text-[11px] capitalize", period === id ? "bg-surface text-fg" : "text-muted")}
              onClick={() => setPeriod(id)}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {q.isPending && !rows.length ? (
        <p className="mt-3 text-[13px] text-muted">Loading the flow file…</p>
      ) : !rows.length ? (
        <p className="mt-3 text-[13px] text-muted">
          Data temporarily unavailable. The third-party cash-market file did not return rows, and NSE / NSDL / CDSL are not connected here. No figures are filled in.
        </p>
      ) : period === "daily" && latest ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <FlowStat label="FII / FPI net" value={cr(latest.fiiNet)} up={latest.fiiNet >= 0} note={latest.date} />
          <FlowStat label="DII net" value={cr(latest.diiNet)} up={latest.diiNet >= 0} note={latest.date} />
          <FlowStat
            label="Combined net"
            value={cr(latest.fiiNet + latest.diiNet)}
            up={latest.fiiNet + latest.diiNet >= 0}
            note="FII net + DII net"
          />
        </div>
      ) : shown ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <FlowStat label="FII / FPI net" value={cr(shown.fiiNet)} up={shown.fiiNet >= 0} note={`${shown.label} · ${shown.days} daily rows`} />
          <FlowStat label="DII net" value={cr(shown.diiNet)} up={shown.diiNet >= 0} note={`${shown.label} · sum of daily nets`} />
          <FlowStat
            label="Combined net"
            value={cr(shown.fiiNet + shown.diiNet)}
            up={shown.fiiNet + shown.diiNet >= 0}
            note="Not an official period print"
          />
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-muted">No dated rows could be grouped for this period.</p>
      )}

      {period === "daily" && latest ? (
        <p className="mt-2 text-[11px] text-subtle">
          {fiiGross
            ? `FII buy ${cr(latest.fiiBuy)} · sell ${cr(latest.fiiSell)}. `
            : "FII gross buy and sell were not on this row. "}
          {diiGross ? `DII buy ${cr(latest.diiBuy)} · sell ${cr(latest.diiSell)}.` : "DII gross buy and sell were not on this row."}
        </p>
      ) : rows.length ? (
        <p className="mt-2 text-[11px] text-subtle">Monthly and yearly totals are the sum of daily nets on file, not a separate exchange publication.</p>
      ) : null}

      <div className="mt-3 rounded-sm border border-dashed border-border p-2">
        {rows.length >= 2 ? (
          <>
            <div className="mb-1 flex gap-3 text-[10px] text-subtle">
              <span>Chart · daily net ₹ Cr</span>
              <span className="text-chart">FII</span>
              <span className="text-down">DII</span>
            </div>
            <FlowChart rows={rows.slice(0, 260)} />
          </>
        ) : (
          <p className="py-4 text-center text-[12px] text-muted">History chart waits on at least two dated rows.</p>
        )}
      </div>
      <p className="mt-2 text-[10px] text-subtle">
        Source: third-party cash file when it answers. Provisional versus confirmed depository status is not labeled because this feed does not say which it is.
      </p>
    </section>
  );
}

function FlowStat({ label, value, up, note }: { label: string; value: string; up: boolean; note: string }) {
  return (
    <div className="rounded-sm bg-bg px-2.5 py-2 shadow-[var(--shadow-border)]">
      <div className="text-[10px] tracking-[0.08em] text-subtle uppercase">{label}</div>
      <div className={cn("mt-1 font-mono text-[16px] tabular", up ? "text-up" : "text-down")}>{value}</div>
      <div className="text-[10px] text-subtle">{note}</div>
    </div>
  );
}
