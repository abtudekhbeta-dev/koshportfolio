import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useBookCtx } from "@/components/book-context";
import { NavChart } from "@/components/charts/nav-chart";
import { BookDesk, HoldingDesk } from "@/components/note-desk";
import { NewsBoard } from "@/components/news-board";
import { EventCalendar } from "@/components/macro-board";
import { OvernightCard, DispositionList } from "@/components/holdings-pulse";
import { Kpi, toneOf } from "@/components/kpi";
import { ShareRing, MiniBars, CapSplit } from "@/components/charts/share-ring";
import { insights, fmtInr, fmtPct } from "@/lib/kosh/engine";
import { bookXirr } from "@/lib/kosh/xirr";
import { apiNews, apiScreener, apiFundamentals } from "@/lib/kosh/api";
import { mixVsNifty, niftyOverlap, bareSym } from "@/lib/kosh/portfolio-stats";
import type { NiftySnap } from "@/lib/kosh/nifty-snap";
import { AttentionStrip } from "@/components/attention-strip";
import { IntelOverview } from "@/components/intel-overview";
import { useAppLayout } from "@/lib/layout-mode";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/p/$id/")({ component: Overview });

function Overview() {
  const { query, portfolio } = useBookCtx();
  const setIncludeCommodities = useKosh((s) => s.setIncludeCommodities);
  const book = query.data!;
  const { rows, value, invested, unreal, dayAbs, dayPct, sectors, caps } = book;
  const unrealPct = invested ? (unreal / invested) * 100 : 0;
  const pts = insights(book);
  const xirr = bookXirr(
    rows.map((r) => {
      const h = portfolio.holdings.find((x) => x.symbol === r.symbol);
      return {
        date: h?.date || null,
        boughtAt: h?.boughtAt,
        qty: r.qty,
        avg: r.avg,
        px: r.px,
        value: r.value,
        lots: h?.lots || r.lots,
      };
    }),
    true,
  );
  const sectorList = Object.entries(sectors).sort((a, b) => b[1].value - a[1].value);
  const contrib = [...rows]
    .filter((r) => book.includeCommodities || r.kind !== "commodity")
    .sort((a, b) => Math.abs(b.unreal) - Math.abs(a.unreal))
    .slice(0, 8);
  const metalsOn = book.includeCommodities;
  const hasMetals = book.commodityValue > 0;
  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const chartNav = book.mix.nav;
  const intel = useAppLayout() === "intelligence";

  return (
    <div className="kosh-page grid gap-8">
      <section className="kosh-stagger grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Kpi metricId="value" label="Current value" value={fmtInr(value)} />
        <Kpi metricId="invested" label="Invested" value={fmtInr(invested)} />
        <Kpi metricId="day" label="Today" value={fmtInr(dayAbs)} hint={book.dayWarn ? `${fmtPct(dayPct)} · check print` : fmtPct(dayPct)} tone={toneOf(dayAbs)} />
        <Kpi metricId="unreal" label="Unrealised P&L" value={fmtInr(unreal)} hint={invested ? unrealPct.toFixed(2) + "%" : "Cost unavailable"} tone={toneOf(unreal)} />
      </section>
      {intel ? (
        <IntelOverview
          book={book}
          portfolioId={portfolio.id}
          screen={screen.data?.rows || []}
          nifty={screen.data?.nifty ?? null}
        />
      ) : null}
      {book.dayWarn ? <p className="text-[13px] text-amber-700 dark:text-amber-400">{book.dayWarn}</p> : null}
      {book.costMissing ? (
        <p className="text-[13px] text-muted">
          Cost unavailable on {book.costMissing} {book.costMissing === 1 ? "name" : "names"}. Those lines stay in
          current value and are left out of invested and unrealised P&L.
        </p>
      ) : null}
      {xirr.xirr != null ? (
        <p className="text-[13px] text-muted">
          Your XIRR{" "}
          <span className={cn("font-mono tabular", xirr.xirr >= 0 ? "text-up" : "text-down")}>{xirr.xirr.toFixed(1)}%</span>
          {xirr.from ? ` from ${xirr.from}` : ""}
          {xirr.nMissing ? ` · ${fmtInr(xirr.missingValue)} has no date` : ""}
          {xirr.note ? ` · ${xirr.note}` : ""}. Money-weighted from dated remaining lots — sold lines and dividends are not in this figure. The chart below is the current mix replayed historically, not your XIRR.
        </p>
      ) : (
        <p className="text-[13px] text-muted">
          {xirr.note || "Add buy dates for your XIRR."}{" "}
          <Link to="/p/$id/holdings" params={{ id: portfolio.id }} className="text-chart hover:underline">
            Holdings
          </Link>
          {" · "}
          <Link to="/p/$id/improve" params={{ id: portfolio.id }} className="text-chart hover:underline">
            Improve Portfolio
          </Link>
        </p>
      )}
      <AttentionStrip
        symbols={rows.filter((r) => r.kind !== "commodity").map((r) => ({ symbol: r.symbol, name: r.name, weight: r.weight }))}
        title="Near-term triggers"
      />

      {hasMetals ? (
        <section className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          <Kpi label="Equity" value={fmtInr(book.equityValue)} />
          <Kpi label="Gold & silver" value={fmtInr(book.commodityValue)} hint={metalsOn ? "included in totals" : "excluded from totals"} />
          <Kpi
            label="Chart"
            value={metalsOn ? "Equity + metals" : "Equity only"}
            hint="Toggle below the chart, or in the header"
          />
        </section>
      ) : null}

      <MixFacts rows={rows} screen={screen.data?.rows || []} nifty={screen.data?.nifty ?? null} ready={!screen.isPending} />

      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">This mix vs {book.benchName}</h2>
        <p className="mb-3 text-[12px] text-muted">
          Blue is today’s remaining names, taken back through each stock’s adjusted daily prices. It is not your XIRR
          and not a reconstruction of what you held in the past.
          {hasMetals && !metalsOn ? " Gold and silver sit on Holdings but are out of this line and the totals." : ""}{" "}
          <Link to="/compare" className="text-chart hover:underline">
            Compare this portfolio
          </Link>
        </p>
        <NavChart
          nav={chartNav}
          portLabel="This mix"
          benchLabel={book.benchName}
          coverage={`${book.coverage}${book.mix.missing.length ? " · skipped " + book.mix.missing.join(", ") : ""}`}
          nowValue={book.value}
          metals={
            hasMetals
              ? {
                  present: true,
                  included: metalsOn,
                  onChange: (on) => setIncludeCommodities(portfolio.id, on),
                }
              : undefined
          }
        />
      </section>

      <OvernightCard rows={rows} screen={screen.data?.rows} />
      <DispositionList rows={rows} />

      <HoldingDesk
        brief={{
          name: portfolio.name,
          bench: book.benchName,
          names: rows
            .filter((r) => book.includeCommodities || r.kind !== "commodity")
            .map((r) => ({ symbol: r.symbol, weight: r.weight, sector: r.sector })),
        }}
      />

      <PortfolioNews name={portfolio.name} id={portfolio.id} symbols={rows.filter((r) => r.kind !== "commodity").slice(0, 8).map((r) => ({ symbol: r.symbol, name: r.name }))} />
      <EventCalendar compact symbols={rows.map((r) => r.symbol)} />

      <BookDesk
        brief={{
          name: portfolio.name,
          bench: book.benchName,
          names: rows
            .filter((r) => book.includeCommodities || r.kind !== "commodity")
            .map((r) => ({ symbol: r.symbol, weight: r.weight, sector: r.sector })),
        }}
      />

      <section>
        <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">At a glance</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {pts.map((p) => (
            <div key={p.title} className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
              <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{p.title}</div>
              <div
                className={cn(
                  "mt-1 font-mono text-xl font-medium tabular",
                  p.tone === "good" && "text-up",
                  p.tone === "bad" && "text-down",
                  p.tone === "warn" && "text-warn",
                )}
              >
                {p.figure}
              </div>
              <p className="mt-1 text-[13px] leading-snug text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Market cap</h2>
        <p className="mb-3 text-[12px] text-muted">
          Live Indian buckets from market cap — not the spreadsheet’s label. Large ≥ ₹20,000 Cr, mid ≥ ₹5,000 Cr, small ≥ ₹500 Cr, else micro.
        </p>
        <div className="max-w-xl rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <CapSplit
            items={(["Large", "Mid", "Small", "Micro"] as const).map((name) => ({
              name,
              pct: value ? ((caps[name] || 0) / value) * 100 : 0,
            }))}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Sectors</h2>
          <div className="max-w-md">
            <ShareRing
              items={sectorList.map(([name, s]) => ({
                name,
                pct: value ? (s.value / value) * 100 : 0,
              }))}
            />
          </div>
        </div>
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">P&L drivers</h2>
          {contrib.length && contrib.every((r) => !r.unreal) ? (
            <p className="text-sm text-muted">No P&L yet — add average cost on Holdings.</p>
          ) : (
            <MiniBars
              items={contrib.map((r) => ({
                name: r.name,
                sub: r.symbol,
                symbol: r.symbol,
                value: r.unreal,
                label: fmtInr(r.unreal),
                tone: r.unreal >= 0 ? "up" : "down",
              }))}
            />
          )}
        </div>
      </section>

      <p className="text-[12px] text-subtle">
        {book.coverage}
        {book.firstDay ? ` · ${book.firstDay} → ${book.lastDay}` : ""} · {portfolio.holdings.length} lines
        {hasMetals ? ` · metals ${metalsOn ? "included in totals" : "excluded from totals"}` : ""}
      </p>
    </div>
  );
}

function PortfolioNews({
  name,
  id,
  symbols,
}: {
  name: string;
  id: string;
  symbols: { symbol: string; name: string }[];
}) {
  const q = useQuery({
    queryKey: ["p-news", id, symbols.map((s) => s.symbol).join(",")],
    queryFn: async () => {
      const lists = await Promise.all(symbols.map((s) => apiNews(s.symbol, s.name).catch(() => [])));
      const seen = new Set<string>();
      const items = [];
      for (const list of lists) {
        for (const it of list) {
          const k = (it.link || "") + it.title;
          if (seen.has(k)) continue;
          seen.add(k);
          items.push(it);
        }
      }
      return items.sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 16);
    },
    enabled: symbols.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <NewsBoard
        title="Portfolio news"
        items={q.data}
        loading={q.isPending}
        shareTitle={`${name} news`}
        alertScope={"p:" + id}
      />
    </section>
  );
}


function MixFacts({
  rows,
  screen,
  nifty,
  ready,
}: {
  rows: { symbol: string; name: string; weight: number; kind?: string }[];
  screen: { symbol: string; pe?: number | null; roe?: number | null; de?: number | null; divYield?: number | null }[];
  nifty: NiftySnap | null;
  ready: boolean;
}) {
  const eq = rows.filter((r) => r.kind !== "commodity");
  const map = new Map(
    screen.map((r) => [
      bareSym(r.symbol),
      { pe: r.pe, roe: r.roe, de: r.de, divYield: r.divYield },
    ]),
  );
  const missing = ready
    ? eq
        .filter((r) => {
          const x = map.get(bareSym(r.symbol));
          return !x || (x.pe == null && x.roe == null);
        })
        .slice(0, 16)
    : [];
  const extras = useQueries({
    queries: missing.map((r) => ({
      queryKey: ["fund", r.symbol],
      queryFn: () => apiFundamentals(r.symbol),
      staleTime: 30 * 60 * 1000,
    })),
  });
  extras.forEach((q, i) => {
    const f = q.data;
    if (!f) return;
    const key = bareSym(missing[i].symbol);
    const prev = map.get(key);
    map.set(key, {
      pe: f.pe ?? prev?.pe,
      roe: f.roe ?? prev?.roe,
      de: f.de ?? prev?.de,
      divYield: f.divYield ?? prev?.divYield,
    });
  });
  if (!eq.length) return null;
  const vs = mixVsNifty(eq, map, screen);
  const ov = niftyOverlap(eq);
  const snap = nifty && nifty.covered >= 15 ? nifty : null;
  const line = (label: string, a: number | null, b: number | null, fmt: (x: number) => string) => (
    <div className="kosh-row kosh-row-stack py-1.5">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="font-mono text-[14px] tabular">
        {a == null ? "—" : fmt(a)}
        <span className="text-subtle"> · Nifty {b == null ? "—" : fmt(b)}</span>
      </dd>
    </div>
  );
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Your companies vs Nifty 50</h2>
      <p className="mt-1 text-[12px] text-muted">
        Your weights next to the 50 names. Each holding uses its own company numbers — a blank is missing, not
        zero.
      </p>
      <dl className="mt-2 max-w-xl">
        <div className="kosh-row kosh-row-stack py-1.5">
          <dt className="text-[13px] text-muted">Aggregate P/E</dt>
          <dd className="font-mono text-[14px] tabular">{vs.pe == null ? "—" : vs.pe.toFixed(1) + "×"}</dd>
        </div>
        <div className="kosh-row kosh-row-stack py-1.5">
          <dt className="text-[13px] text-muted">Weighted constituent P/E</dt>
          <dd className="font-mono text-[14px] tabular">
            {vs.weightedPe == null ? "—" : vs.weightedPe.toFixed(1) + "×"}
            <span className="text-subtle">
              {" "}
              · Nifty names {vs.niftyPe == null ? "—" : vs.niftyPe.toFixed(1) + "×"}
            </span>
          </dd>
        </div>
        {line("Profitability (ROE)", vs.roe, snap?.roe ?? null, (x) => x.toFixed(0) + "%")}
        {line("Debt / equity", vs.de, snap?.de ?? null, (x) => x.toFixed(2))}
        {line("Dividend", vs.divYield, snap?.divYield ?? null, (x) => x.toFixed(1) + "%")}
      </dl>
      <p className="mt-3 text-[12px] text-subtle">
        Aggregate P/E is portfolio value over attributable earnings. The weighted figure is an average of the P/E
        numbers and is not the same thing. The Nifty names figure is a constituent average, not the index P/E.
        {vs.covered} of {eq.length} names have numbers
        {ov.satellites.length ? ` · ${ov.satellites.length} sit outside the 50` : ""}.
        {snap
          ? ` The ROE comparison uses a saved average of ${snap.covered} Nifty 50 names. A blank stays blank.`
          : " A blank is unavailable, not zero."}
      </p>
    </section>
  );
}
