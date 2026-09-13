import { Link } from "@tanstack/react-router";
import type { HoldingRow, ScreenRow } from "@/lib/kosh/types";
import { fmtInr, fmtPct } from "@/lib/kosh/engine";
import { cn } from "@/lib/utils";

export function OvernightCard({ rows, screen }: { rows: HoldingRow[]; screen?: ScreenRow[] }) {
  const map = new Map((screen || []).map((r) => [r.symbol.toUpperCase(), r]));
  const list = [...rows]
    .filter((r) => r.kind !== "commodity")
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 8);
  if (!list.length) return null;
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Overnight moves</h2>
      <p className="mt-1 text-[13px] text-muted">Versus previous close.</p>
      <ul className="mt-3 grid gap-1">
        {list.map((r) => {
          const s = map.get(r.symbol.toUpperCase());
          return (
            <li key={r.symbol} className="flex items-center justify-between gap-3 py-1 text-[13px]">
              <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="min-w-0 hover:text-chart">
                <div className="truncate font-medium">{r.name}</div>
                <div className="text-[11px] text-subtle">
                  {r.symbol}
                  {s?.gapPct != null ? ` · gap ${fmtPct(s.gapPct)}` : ""}
                </div>
              </Link>
              <div className={cn("font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down")}>{fmtPct(r.changePct)}</div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function DispositionList({ rows }: { rows: HoldingRow[] }) {
  const eq = rows.filter((r) => r.kind !== "commodity" && r.invested > 0);
  const winners = eq.filter((r) => r.unrealPct >= 25).sort((a, b) => b.unrealPct - a.unrealPct).slice(0, 4);
  const losers = eq.filter((r) => r.unrealPct <= -15).sort((a, b) => a.unrealPct - b.unrealPct).slice(0, 4);
  const large = eq.filter((r) => r.weight >= 0.12).sort((a, b) => b.weight - a.weight).slice(0, 4);
  if (!winners.length && !losers.length && !large.length) return null;
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Disposition</h2>
      <p className="mt-1 text-[13px] text-muted">
        Easy to sell winners, easy to hold losers. A list — not a rule.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <Col title="Winners" hint="Protect the lead" items={winners} kind="up" />
        <Col title="Losers" hint="Revisit the thesis" items={losers} kind="down" />
        <Col title="Large bets" hint="Weight ≥ 12%" items={large} kind="muted" />
      </div>
    </section>
  );
}

function Col({
  title,
  hint,
  items,
  kind,
}: {
  title: string;
  hint: string;
  items: HoldingRow[];
  kind: "up" | "down" | "muted";
}) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{title}</div>
      <div className="text-[11px] text-muted">{hint}</div>
      {items.length ? (
        <ul className="mt-2 grid gap-1.5">
          {items.map((r) => (
            <li key={r.symbol}>
              <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="block hover:text-chart">
                <div className="truncate text-[13px] font-medium">{r.name}</div>
                <div className={cn("font-mono text-[12px] tabular", kind === "up" && "text-up", kind === "down" && "text-down")}>
                  {fmtPct(r.unrealPct)} · {fmtInr(r.unreal)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] text-muted">None.</p>
      )}
    </div>
  );
}
