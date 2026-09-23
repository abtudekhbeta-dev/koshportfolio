import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFundamentals, apiNews, apiOhlc, apiScreener } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { quoteStatus, quoteStatusLabel } from "@/lib/kosh/market-data";
import { NEWS_BUCKETS, filterNews, newsBucket, newsMaterial, type NewsBucket } from "@/lib/kosh/news";
import { patternStatusLabel, type PatternHit } from "@/lib/kosh/patterns";
import { buildSnapshot } from "@/lib/kosh/snapshot";
import { pickScreenRow } from "@/lib/kosh/screens";
import { stakeDelta, formatShPeriod } from "@/lib/kosh/shareholding";
import { buildValuationModels, earningsQualityRead } from "@/lib/kosh/valuation";
import { formatFinPeriod } from "@/lib/kosh/fin-series";
import { WordChip } from "@/components/kosh-snapshot";
import { bareSymbol, useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Fundamentals, NewsItem, Quote } from "@/lib/kosh/types";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "fundamentals", label: "Fundamentals" },
  { id: "valuation", label: "Valuation" },
  { id: "growth", label: "Growth" },
  { id: "ownership", label: "Ownership" },
  { id: "news", label: "News" },
  { id: "view", label: "Kosh View" },
] as const;

function n(v: number | null | undefined, f: (x: number) => string) {
  return v != null && Number.isFinite(v) ? f(v) : "—";
}

export function IntelPanel({
  symbol,
  name,
  quote,
  owned,
  tab,
  onTab,
  patterns,
}: {
  symbol: string;
  name: string;
  quote?: Quote | null;
  owned?: string | null;
  tab: string;
  onTab: (id: string) => void;
  patterns?: PatternHit[];
}) {
  const skillReads = useKosh((s) => s.skillReads);
  const patternsOn = useKosh((s) => s.chartPrefs.patternsOn === true);
  const fundQ = useQuery({
    queryKey: ["fundamentals", symbol],
    queryFn: () => apiFundamentals(symbol),
    staleTime: 10 * 60_000,
    placeholderData: keepPreviousData,
  });
  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60_000 });
  const news = useQuery({
    queryKey: ["news", symbol],
    queryFn: () => apiNews(symbol, name),
    staleTime: 10 * 60_000,
  });
  const daily = useQuery({
    queryKey: ["ohlc", symbol, "2y", "1d"],
    queryFn: () => apiOhlc(symbol, "2y", "1d"),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
  const fund = fundQ.data || null;
  const row = pickScreenRow(screen.data?.rows || [], symbol) || null;
  const skill = skillReads[bareSymbol(symbol)] || null;
  const px = quote?.price && quote.price > 0 ? quote.price : daily.data?.price || null;
  const chg = quote?.changePct ?? daily.data?.changePct ?? 0;
  const bars = daily.data?.bars?.map((b) => ({ t: b.t, c: b.c })) || [];
  const snap = useMemo(
    () => buildSnapshot({ symbol, name, price: px, fund, row, skill, bars }),
    [symbol, name, px, fund, row, skill, bars],
  );
  const models = useMemo(() => buildValuationModels({ price: px, fund, bars }), [px, fund, bars]);
  const eq = earningsQualityRead(fund);
  const sh = stakeDelta(fund?.shareholding);
  const active = TABS.some((t) => t.id === tab) ? tab : "overview";
  const status = quoteStatus({ session: isIstSession(), price: px });
  const hits = patternsOn ? patterns || [] : [];

  const facts = [
    ["P/E", n(fund?.pe, (x) => x.toFixed(1) + "x")],
    ["Industry P/E", n(fund?.industryPe, (x) => x.toFixed(1) + "x")],
    ["ROCE", n(fund?.roce, (x) => x.toFixed(1) + "%")],
    ["D/E", n(fund?.de, (x) => x.toFixed(2) + "x")],
    ["Profit 1Y", n(fund?.profitYoY, (x) => fmtPct(x))],
    ["Market cap", n(fund?.mcapCr, (x) => `₹${x.toLocaleString("en-IN")} Cr`)],
  ] as const;

  return (
    <section data-intel-panel className="flex flex-col bg-bg">
      <div className="flex shrink-0 flex-col gap-2 border-b border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2 className="text-[15px] font-semibold">{bareSymbol(symbol)}</h2>
            <span className="truncate text-[12px] text-muted">{name}</span>
            <span className="font-mono text-[15px] tabular">{px ? fmtPx(px) : "—"}</span>
            <span className={cn("font-mono text-[12px] tabular", chg >= 0 ? "text-up" : "text-down")}>{fmtPct(chg)}</span>
            <span
              className={cn(
                "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]",
                status === "session" ? "bg-up/15 text-up" : status === "last" ? "bg-surface-2 text-muted" : "bg-down/15 text-down",
              )}
            >
              {quoteStatusLabel(status)}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-subtle">Kosh intelligence — numbers on file, not a forecast.</p>
        </div>
        <Link
          to="/s/$symbol"
          params={{ symbol }}
          data-open-full-analysis
          className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-sm bg-chart/15 px-3 text-[13px] font-semibold text-chart sm:h-10 sm:w-auto"
        >
          Open Full Analysis →
        </Link>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-1.5 border-b border-border px-3 py-2 sm:grid-cols-6">
        {facts.map(([k, v]) => (
          <div key={k}>
            <div className="text-[10px] tracking-[0.06em] text-subtle uppercase">{k}</div>
            <div className="font-mono text-[13px] font-semibold tabular">{v}</div>
          </div>
        ))}
      </div>

      {snap.read ? (
        <p className="shrink-0 border-b border-border px-3 py-2 text-[12px] leading-snug text-muted">
          <span className="mr-1.5 text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase">Kosh observation</span>
          {snap.read}
        </p>
      ) : null}

      {patternsOn ? (
        <div data-pattern-box className="shrink-0 border-b border-border px-3 py-2">
          <div className="text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase">Technical</div>
          {hits.length ? (
            <ul className="mt-1 space-y-1">
              {hits.map((h) => (
                <li key={h.kind} className="text-[12px] leading-snug text-muted">
                  <span className="font-semibold text-fg">
                    {h.label} · {patternStatusLabel(h.status)}
                  </span>
                  <span className="mx-1 text-subtle">·</span>
                  {h.note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[12px] text-muted">No pattern on this window.</p>
          )}
          <p className="mt-1 text-[10px] text-subtle">Analytical aid — not a signal or prediction.</p>
        </div>
      ) : null}

      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            data-intel-tab={t.id}
            onClick={() => onTab(t.id)}
            className={cn(
              "h-10 shrink-0 px-2.5 text-[12px] font-medium",
              active === t.id ? "border-b-2 border-fg text-fg" : "text-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-3">
        {active === "overview" ? <Overview fund={fund} snap={snap} owned={owned} /> : null}
        {active === "fundamentals" ? <FundamentalsTab fund={fund} /> : null}
        {active === "valuation" ? <ValuationTab models={models} fund={fund} /> : null}
        {active === "growth" ? <GrowthTab fund={fund} /> : null}
        {active === "ownership" ? <OwnershipTab fund={fund} sh={sh} /> : null}
        {active === "news" ? <NewsTab items={news.data} loading={news.isPending} /> : null}
        {active === "view" ? (
          <ViewTab snap={snap} models={models} eq={eq} fund={fund} owned={owned} />
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-sm bg-surface px-2.5 py-2 shadow-[var(--shadow-border)]" title={hint}>
      <div className="text-[10px] tracking-[0.06em] text-subtle uppercase">{label}</div>
      <div className={cn("mt-0.5 font-mono text-[14px] font-semibold tabular", tone === "up" && "text-up", tone === "down" && "text-down")}>
        {value}
      </div>
    </div>
  );
}

function Overview({
  fund,
  snap,
  owned,
}: {
  fund: Fundamentals | null;
  snap: ReturnType<typeof buildSnapshot>;
  owned?: string | null;
}) {
  const items = [
    ["Market cap", n(fund?.mcapCr, (x) => `₹${x.toLocaleString("en-IN")} Cr`)],
    ["P/E", n(fund?.pe, (x) => x.toFixed(1) + "x")],
    ["Industry P/E", n(fund?.industryPe, (x) => x.toFixed(1) + "x")],
    ["P/B", n(fund?.pb, (x) => x.toFixed(2))],
    ["ROCE", n(fund?.roce, (x) => x.toFixed(1) + "%")],
    ["ROE", n(fund?.roe, (x) => x.toFixed(1) + "%")],
    ["Debt / equity", n(fund?.de, (x) => x.toFixed(2) + "x")],
    ["Div yield", n(fund?.divYield, (x) => x.toFixed(2) + "%")],
    ["EPS", n(fund?.eps, (x) => `₹${x.toFixed(2)}`)],
    ["Sales 1Y", n(fund?.salesYoY, (x) => fmtPct(x))],
    ["Profit 1Y", n(fund?.profitYoY, (x) => fmtPct(x))],
  ] as const;
  return (
    <div>
      {owned ? <p className="mb-2 text-[12px] text-muted">{owned}</p> : null}
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
        {items.map(([k, v]) => (
          <Metric key={k} label={k} value={v} />
        ))}
      </div>
      {fund?.finPeriod ? (
        <p className="mt-2 text-[11px] text-subtle">Financials {formatFinPeriod(fund.finPeriod)}.</p>
      ) : null}
      {snap.missing.length ? (
        <p className="mt-1 text-[11px] text-subtle">Blank is missing, not a guess. Missing: {snap.missing.slice(0, 6).join(", ")}.</p>
      ) : null}
    </div>
  );
}

function FundamentalsTab({ fund }: { fund: Fundamentals | null }) {
  if (!fund) {
    return <p className="text-[13px] text-muted">No company numbers for this ticker — numbers are not invented.</p>;
  }
  const rows = [
    ["Revenue last", n(fund.sales?.at(-1)?.value, (x) => `₹${x.toLocaleString("en-IN")} Cr`)],
    ["Profit last", n(fund.profits?.at(-1)?.value, (x) => `₹${x.toLocaleString("en-IN")} Cr`)],
    ["EPS", n(fund.eps, (x) => `₹${x.toFixed(2)}`)],
    ["OPM", n(fund.opm, (x) => x.toFixed(1) + "%")],
    ["ROCE", n(fund.roce, (x) => x.toFixed(1) + "%")],
    ["ROE", n(fund.roe, (x) => x.toFixed(1) + "%")],
    ["CFO / PAT", n(fund.cfoPat, (x) => x.toFixed(2) + "×")],
    ["Debt / equity", n(fund.de, (x) => x.toFixed(2))],
    ["Interest cover", n(fund.interestCover, (x) => x.toFixed(1) + "×")],
  ] as const;
  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map(([k, v]) => (
          <Metric key={k} label={k} value={v} />
        ))}
      </div>
      {fund.finPeriod ? <p className="mt-2 text-[11px] text-subtle">Period {formatFinPeriod(fund.finPeriod)}.</p> : null}
    </div>
  );
}

function ValuationTab({
  models,
  fund,
}: {
  models: ReturnType<typeof buildValuationModels>;
  fund: Fundamentals | null;
}) {
  const simple = models.simple;
  const reverse = models.models.find((m) => m.id === "C");
  const pes = models.hist.map((h) => h.pe).filter((x): x is number => x != null && x > 0);
  const med = pes.length >= 4 ? [...pes].sort((a, b) => a - b)[Math.floor(pes.length / 2)] : null;
  return (
    <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Metric label="P/E" value={n(fund?.pe, (x) => x.toFixed(1) + "x")} />
        <Metric label="Industry" value={n(fund?.industryPe, (x) => x.toFixed(1) + "x")} />
        <Metric label="Hist median" value={n(med, (x) => x.toFixed(1) + "x")} />
        <Metric label="P/B" value={n(fund?.pb, (x) => x.toFixed(2))} />
        <Metric label="PEG" value={n(fund?.peg, (x) => x.toFixed(2))} />
        <Metric label="Reverse" value={reverse?.figure || "—"} />
      </div>
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[11px] tracking-[0.08em] text-subtle uppercase">Kosh valuation</span>
          <WordChip word={simple.word} />
        </div>
        <p className="text-[12px] leading-relaxed text-muted">{simple.body || simple.figure}</p>
        <p className="mt-1 text-[11px] text-subtle">{simple.note}</p>
      </div>
    </div>
  );
}

function GrowthTab({ fund }: { fund: Fundamentals | null }) {
  if (!fund) return <p className="text-[13px] text-muted">Insufficient data.</p>;
  const sales = fund.sales?.slice(-6) || [];
  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Metric label="Sales 1Y" value={n(fund.salesYoY, (x) => fmtPct(x))} tone={fund.salesYoY != null ? (fund.salesYoY >= 0 ? "up" : "down") : undefined} />
        <Metric label="Profit 1Y" value={n(fund.profitYoY, (x) => fmtPct(x))} tone={fund.profitYoY != null ? (fund.profitYoY >= 0 ? "up" : "down") : undefined} />
        <Metric label="Sales 3Y" value={n(fund.salesCagr3, (x) => fmtPct(x))} />
        <Metric label="Profit 3Y" value={n(fund.profitCagr3, (x) => fmtPct(x))} />
        <Metric label="OPM" value={n(fund.opm, (x) => x.toFixed(1) + "%")} />
        <Metric label="ROCE" value={n(fund.roce, (x) => x.toFixed(1) + "%")} />
      </div>
      {sales.length >= 2 ? (
        <p className="mt-3 text-[12px] text-muted">
          Revenue print: {sales.map((s) => `${formatFinPeriod(s.period)} ₹${s.value.toLocaleString("en-IN")} Cr`).join(" · ")}
        </p>
      ) : (
        <p className="mt-2 text-[12px] text-subtle">Not enough yearly points for a trend.</p>
      )}
    </div>
  );
}

function OwnershipTab({
  fund,
  sh,
}: {
  fund: Fundamentals | null;
  sh: ReturnType<typeof stakeDelta>;
}) {
  if (!fund) return <p className="text-[13px] text-muted">No shareholding print on file.</p>;
  const period = fund.shPeriod ? formatShPeriod(fund.shPeriod) : sh?.label || null;
  return (
    <div>
      {period ? <p className="mb-2 text-[11px] text-subtle">Shareholding {period}. Not a live print.</p> : null}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        <Metric label="Promoter" value={n(fund.promoters, (x) => x.toFixed(1) + "%")} />
        <Metric
          label="Promoter Δ"
          value={sh && fund.shareholding.length >= 2 && fund.shareholding.at(-1)?.promoters != null && fund.shareholding.at(-2)?.promoters != null
            ? `${((fund.shareholding.at(-1)!.promoters as number) - (fund.shareholding.at(-2)!.promoters as number) >= 0 ? "+" : "")}${((fund.shareholding.at(-1)!.promoters as number) - (fund.shareholding.at(-2)!.promoters as number)).toFixed(1)} pp`
            : "—"}
        />
        <Metric label="FII" value={n(fund.fii, (x) => x.toFixed(1) + "%")} />
        <Metric
          label="FII Δ"
          value={sh?.fiiDelta != null ? `${sh.fiiDelta >= 0 ? "+" : ""}${sh.fiiDelta.toFixed(1)} pp` : "—"}
        />
        <Metric label="DII" value={n(fund.dii, (x) => x.toFixed(1) + "%")} />
        <Metric label="Pledge" value={n(fund.pledge, (x) => x.toFixed(1) + "%")} />
      </div>
    </div>
  );
}

function NewsTab({ items, loading }: { items: NewsItem[] | undefined; loading?: boolean }) {
  const [bucket, setBucket] = useState<NewsBucket>("all");
  const shown = useMemo(() => filterNews(items || [], bucket).slice(0, 8), [items, bucket]);
  if (loading && !items?.length) return <p className="text-[13px] text-muted">Loading headlines…</p>;
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {NEWS_BUCKETS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBucket(b.id)}
            className={cn(
              "h-7 rounded-sm px-2 text-[11px]",
              bucket === b.id ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
            )}
          >
            {b.label}
          </button>
        ))}
      </div>
      {!shown.length ? (
        <p className="text-[13px] text-muted">No headlines in this bucket.</p>
      ) : (
        <ul className="space-y-2">
          {shown.map((it, i) => {
            const mat = it.material || newsMaterial(it.title);
            const cat = NEWS_BUCKETS.find((b) => b.id === newsBucket(it.title))?.label || "Market";
            const when = it.ts
              ? new Date(it.ts < 2e10 ? it.ts * 1000 : it.ts).toISOString().slice(0, 10)
              : "";
            return (
              <li key={i}>
                <a href={it.link} target="_blank" rel="noreferrer" className="block text-[13px] leading-snug hover:text-chart">
                  {it.title}
                </a>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-subtle">
                  <span>{it.publisher || "Headline"}</span>
                  {when ? <span>· {when}</span> : null}
                  <span className="uppercase">{cat}</span>
                  <span>
                    {mat === "high" ? "High materiality" : mat === "medium" ? "Medium materiality" : "Background"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ViewTab({
  snap,
  models,
  eq,
  fund,
  owned,
}: {
  snap: ReturnType<typeof buildSnapshot>;
  models: ReturnType<typeof buildValuationModels>;
  eq: ReturnType<typeof earningsQualityRead>;
  fund: Fundamentals | null;
  owned?: string | null;
}) {
  const lines: { label: string; body: string }[] = [];
  if (fund?.roce != null) {
    lines.push({
      label: "Quality",
      body: `ROCE ${fund.roce.toFixed(1)}% on the company card${fund.roe != null ? ` · ROE ${fund.roe.toFixed(1)}%` : ""}.`,
    });
  }
  if (fund?.profitYoY != null || fund?.profitCagr3 != null) {
    const bits = [];
    if (fund.profitYoY != null) bits.push(`1Y ${fmtPct(fund.profitYoY)}`);
    if (fund.profitCagr3 != null) bits.push(`3Y ${fmtPct(fund.profitCagr3)}`);
    lines.push({ label: "Growth", body: `Profit growth on file: ${bits.join(" · ")}.` });
  }
  if (models.simple.word !== "Not enough data") {
    lines.push({ label: "Valuation", body: `${models.simple.word}. ${models.simple.figure}` });
  }
  if (fund?.de != null) {
    lines.push({
      label: "Balance sheet",
      body: `Debt / equity ${fund.de.toFixed(2)}${fund.de > 1.5 ? " — elevated versus a 1.5 screen." : "."}`,
    });
  }
  if (eq.cfoPat != null) {
    lines.push({ label: "Cash flow", body: `Operating cash / profit ${eq.cfoPat.toFixed(2)}× on the latest print.` });
  }
  if (owned) lines.push({ label: "Portfolio", body: owned });
  if (!lines.length) {
    return <p className="text-[13px] text-muted">Insufficient data.</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {lines.map((l) => (
        <div key={l.label} className="border-l-2 border-warn pl-2.5">
          <div className="text-[11px] font-semibold tracking-[0.06em] uppercase">{l.label}</div>
          <p className="mt-0.5 text-[12px] leading-snug text-muted">{l.body}</p>
        </div>
      ))}
      {snap.read ? <p className="sm:col-span-2 text-[12px] text-subtle">{snap.read}</p> : null}
    </div>
  );
}
