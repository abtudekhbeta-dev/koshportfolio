import { Link } from "@tanstack/react-router";
import { fmtInr, fmtPct } from "@/lib/kosh/engine";
import { baseSym } from "@/lib/kosh/sectors";
import type { Book, ScreenRow } from "@/lib/kosh/types";
import type { NiftySnap } from "@/lib/kosh/nifty-snap";

function band(n: number | null, high: number, mid: number) {
  if (n == null) return "Unavailable";
  const a = Math.abs(n);
  if (a >= high) return "High";
  if (a >= mid) return "Moderate";
  return "Low";
}

function weighted(rows: Book["rows"], screen: ScreenRow[], field: keyof ScreenRow) {
  let num = 0;
  let den = 0;
  const map = new Map(screen.map((s) => [baseSym(s.symbol), s]));
  for (const r of rows) {
    if (!(r.weight > 0) || r.kind === "commodity") continue;
    const v = map.get(baseSym(r.symbol))?.[field];
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    num += r.weight * v;
    den += r.weight;
  }
  if (!(den > 0)) return null;
  return { value: num / den, covered: den };
}

export function IntelOverview({
  book,
  portfolioId,
  screen,
  nifty,
}: {
  book: Book;
  portfolioId: string;
  screen: ScreenRow[];
  nifty: NiftySnap | null;
}) {
  const rows = book.rows.filter((r) => book.includeCommodities || r.kind !== "commodity");
  const top = [...rows].sort((a, b) => b.weight - a.weight)[0];
  const sectors = Object.entries(book.sectors).sort((a, b) => b[1].value - a[1].value);
  const sectorTop = sectors[0];
  const sectorShare = book.value > 0 && sectorTop ? sectorTop[1].value / book.value : null;
  const dd = book.risk?.maxDd ?? null;
  const pe = weighted(rows, screen, "pe");
  const pb = weighted(rows, screen, "pb");
  const roe = weighted(rows, screen, "roe");
  const roce = weighted(rows, screen, "roce");
  const div = weighted(rows, screen, "divYield");
  const movers = [...rows].filter((r) => r.costKnown).sort((a, b) => Math.abs(b.unreal) - Math.abs(a.unreal)).slice(0, 5);

  const health = [
    { label: "Concentration", value: top ? `${top.name.split(" ")[0]} ${(top.weight * 100).toFixed(0)}%` : "—", state: band(top ? top.weight * 100 : null, 25, 15), to: "/p/$id/risk" as const },
    { label: "Sector concentration", value: sectorTop ? sectorTop[0] : "—", state: band(sectorShare != null ? sectorShare * 100 : null, 40, 25), to: "/p/$id/sectors" as const },
    { label: "Drawdown", value: dd == null ? "—" : fmtPct(dd), state: band(dd, 25, 12), to: "/p/$id/risk" as const },
    { label: "Data coverage", value: book.coverage || "—", state: book.mix.missing.length ? "Partial" : "On file", to: "/p/$id/holdings" as const },
  ];

  return (
    <section className="grid gap-6 border-y border-border py-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <h2 className="text-[15px] font-semibold">What is moving this book</h2>
        <p className="mt-1 text-[12px] text-muted">Unrealised P&L by holding. Not a score, and not a recommendation.</p>
        <ul className="mt-3 divide-y divide-border">
          {movers.map((r) => (
            <li key={r.symbol} className="flex items-baseline justify-between gap-3 py-2 text-[13px]">
              <Link to="/s/$symbol" params={{ symbol: r.symbol.replace(/\.(NS|BO)$/i, "") }} className="truncate hover:text-chart">
                {r.name}
              </Link>
              <span className={r.unreal >= 0 ? "font-mono text-up tabular" : "font-mono text-down tabular"}>{fmtInr(r.unreal)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-[15px] font-semibold">Portfolio health</h2>
        <ul className="mt-2 divide-y divide-border">
          {health.map((h) => (
            <li key={h.label}>
              <Link to={h.to} params={{ id: portfolioId }} className="grid grid-cols-[1fr_auto] gap-x-3 py-2 text-[13px] hover:text-chart">
                <span>{h.label}</span>
                <span className="text-right font-medium">{h.state}</span>
                <span className="col-span-2 text-[11px] text-muted">{h.value}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-2">
        <h2 className="text-[15px] font-semibold">Valuation of what is on file</h2>
        <p className="mt-1 text-[12px] text-muted">Weighted by current value, only where the holding has that print. Missing names are left out.</p>
        <div className="mt-3 grid grid-cols-2 gap-px bg-border sm:grid-cols-5">
          <Metric label="P/E" value={pe} nifty={nifty?.pe} suffix="x" />
          <Metric label="P/B" value={pb} nifty={nifty?.pb} suffix="x" />
          <Metric label="ROE" value={roe} nifty={nifty?.roe} suffix="%" />
          <Metric label="ROCE" value={roce} nifty={nifty?.roce} suffix="%" />
          <Metric label="Div. yield" value={div} nifty={nifty?.divYield} suffix="%" />
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  nifty,
  suffix,
}: {
  label: string;
  value: { value: number; covered: number } | null;
  nifty?: number | null;
  suffix: string;
}) {
  return (
    <div className="bg-bg px-3 py-2">
      <div className="text-[11px] text-subtle">{label}</div>
      <div className="font-mono text-[16px] tabular">{value ? `${value.value.toFixed(1)}${suffix}` : "—"}</div>
      <div className="text-[11px] text-muted">
        {nifty != null && Number.isFinite(nifty) ? `Nifty ${nifty.toFixed(1)}${suffix}` : "Nifty print unavailable"}
        {value ? ` · ${(value.covered * 100).toFixed(0)}% covered` : ""}
      </div>
    </div>
  );
}
