import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HeroMix, HeroSleeves } from "@/components/landing/hero-mix";
import { WindowsPreview } from "@/components/landing/method";
import { Reveal } from "@/components/landing/reveal";
import { LandingHeader, SiteFooter, SkipToMain } from "@/components/landing/site-chrome";
import { Button } from "@/components/ui/button";
import { apiNews, apiScreener, apiTape } from "@/lib/kosh/api";
import { fmtPct, fmtTapePx } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { quoteStatus, quoteStatusLabel } from "@/lib/kosh/market-data";
import { applyScreen } from "@/lib/kosh/screens";
import { cn } from "@/lib/utils";
import { MixNudge } from "@/components/mix-nudge";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

const FEATURES = [
  {
    k: "Improve Portfolio",
    t: "A recommendation at the top",
    d: "Concentration, dated XIRR, sector bets, and analysis on large weights — one page that says what to do next.",
    to: "/app" as const,
  },
  {
    k: "Multibagger analysis",
    t: "Fundamental · Qualitative",
    d: "On every stock: a six-block fundamental, and a qualitative catalyst verdict with multi-bagger potential. You start them.",
    to: "/s/$symbol" as const,
    symbol: "RELIANCE",
  },
  {
    k: "Find names",
    t: "Not another PE sort",
    d: "Quality compounder. Emerging compounder. Turnaround. Built for names that can actually change earnings power — missing data is never a pass.",
    to: "/screen" as const,
  },
  {
    k: "Markets",
    t: "Terminal and Overview",
    d: "Watch a chart, or read what the cash market is doing today. One click between them.",
    to: "/markets" as const,
  },
  {
    k: "Your portfolio vs Nifty",
    t: "When you have holdings",
    d: "Drop a broker file. One line versus the index. Gold and silver sit next to equity.",
    to: "/app" as const,
  },
  {
    k: "Chart that stays put",
    t: "Timeframe is the bar",
    d: "Switch 1D to 1W without wiping analysis, drawings, or the rest of the page.",
    to: "/s/$symbol" as const,
    symbol: "RELIANCE",
  },
];

const STEPS = [
  { n: "01", t: "Add your portfolio", d: "Drop a broker file. Quantity, average cost, and buy date when the sheet has them. Or type tickers." },
  { n: "02", t: "Pick an index", d: "Nifty 50, Sensex, Bank Nifty, IT, Pharma, Midcap — or paste any listed ticker." },
  { n: "03", t: "Read it — or Improve Portfolio", d: "Growth, rupees, rolling returns, XIRR when dates exist, and a recommendation at the top of Improve Portfolio." },
];

const FAQ = [
  {
    q: "What is Fundamental and Qualitative?",
    a: "On every stock page. Fundamental is the multi-bagger lens: interconnected economics, score, stars, and one of six verdicts. Qualitative is catalyst quality over 2–5 years with an explicit multi-bagger potential label. Not a pass/fail stamp.",
  },
  {
    q: "How does the portfolio chart work without buy dates?",
    a: "Kosh takes the stocks you hold today, in today’s sizes, and asks: how would this portfolio have moved on each stock’s own daily prices? It is not a reconstruction of what you held in 2018. It is a read of the portfolio in front of you. XIRR needs buy dates — add them on Holdings.",
  },
  {
    q: "Do I need buy dates or average prices?",
    a: "Average cost helps unrealised P&L. Buy dates unlock XIRR. The chart versus the index does not need them.",
  },
  {
    q: "Where do prices come from?",
    a: "Yahoo Finance, on an IST calendar. The print is delayed unless the provider says otherwise, and the status on the tape matches the terminal. Some Nifty sector indices only print a stub — we then use the ETF that actually has a series.",
  },
  {
    q: "Can I add gold and silver?",
    a: "Yes. Under Add holdings → Gold & silver. Gold is shown as ₹/10g and silver as ₹/kg. You still type grams; average cost is ₹/g. A switch on every portfolio includes or excludes metals from the chart.",
  },
  {
    q: "Guest or account?",
    a: "Guest keeps the portfolio in this browser. Sign in with Google, X, or email and it follows you. Kosh is not a broker, not advice, not SEBI-registered.",
  },
];

function Tape() {
  const tape = useQuery({ queryKey: ["tape"], queryFn: apiTape, staleTime: 60_000 });
  const rows = tape.data || [];
  if (!rows.length) return null;
  const items = [...rows, ...rows];
  const tapeOn = isIstSession() && rows.some((t) => t.price > 0);
  const tapeLabel = quoteStatusLabel(quoteStatus({ session: isIstSession(), price: tapeOn ? 1 : rows[0]?.price }), null);
  return (
    <div className="overflow-hidden border-b border-border bg-bg-elevated">
      <div className="flex items-center px-4 pt-1.5">
        <span data-tape-status className="text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase">
          {tapeLabel}
        </span>
      </div>
      <div className="kosh-tape-track inline-flex w-max gap-8 px-4 py-2 text-[12px] text-muted">
        {items.map((t, i) => (
          <span key={t.id + "-" + i} className="inline-flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
            {t.label}
            <b className="font-mono font-medium text-fg tabular">{t.price ? fmtTapePx(t.price) : "—"}</b>
            {t.unit ? <span className="text-[10px] text-subtle">{t.unit}</span> : null}
            <span className={cn("font-mono tabular", t.changePct >= 0 ? "text-up" : "text-down")}>
              {t.changePct ? fmtPct(t.changePct) : ""}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroBoard() {
  const tape = useQuery({ queryKey: ["tape"], queryFn: apiTape, staleTime: 60_000 });
  const rows = tape.data || [];
  const focus = rows[0];
  const last = focus?.price || 0;
  const pct = focus?.changePct ?? 0;
  const prev = last && Number.isFinite(pct) ? last / (1 + pct / 100) : 0;
  const abs = last && prev ? last - prev : null;
  const up = pct >= 0;
  const mini = rows.slice(0, 4);
  return (
    <div className="overflow-hidden rounded-[28px] bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Markets Terminal</div>
          <div className="mt-0.5 text-[13px] font-semibold">{focus?.label || "Nifty 50"}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span data-hero-status className="text-[10px] font-semibold tracking-[0.06em] text-subtle uppercase">
            {quoteStatusLabel(quoteStatus({ session: isIstSession(), price: last || rows.find((r) => r.price > 0)?.price }), null)}
          </span>
          <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-fg">LOG</span>
          <span className="rounded-sm px-1.5 py-0.5 text-[10px] text-muted">1D</span>
          <span className="rounded-sm px-1.5 py-0.5 text-[10px] text-muted">W</span>
          <span className="rounded-sm px-1.5 py-0.5 text-[10px] text-muted">M</span>
        </div>
      </div>
      <div className="relative h-[200px] overflow-hidden rounded-lg bg-bg sm:h-[220px]">
        {[18, 38, 58, 78].map((top) => (
          <div
            key={top}
            className="absolute right-14 left-3 border-t"
            style={{ top: `${top}%`, borderColor: "var(--color-chart-grid)" }}
          />
        ))}
        <div className="absolute top-3 right-2 bottom-3 flex w-11 flex-col justify-between font-mono text-[9px] text-subtle tabular">
          <span>{last ? fmtTapePx(last * 1.04) : "—"}</span>
          <span>{last ? fmtTapePx(last) : "—"}</span>
          <span>{last ? fmtTapePx(last * 0.96) : "—"}</span>
        </div>
        <div className="absolute top-6 right-16 bottom-8 left-6 flex items-stretch gap-2">
          {[0.22, 0.38, 0.18, 0.42, 0.3, 0.26, 0.34, 0.2].map((h, i) => (
            <span key={i} className="relative flex-1">
              <i
                className="absolute top-[8%] bottom-[10%] left-1/2 w-px -translate-x-1/2"
                style={{ background: i % 3 === 1 ? "var(--color-down)" : "var(--color-up)" }}
              />
              <b
                className="absolute left-[28%] right-[28%] rounded-[1px]"
                style={{
                  top: `${18 + (i % 4) * 8}%`,
                  height: `${h * 100}%`,
                  background: i % 3 === 1 ? "var(--color-down)" : "var(--color-up)",
                }}
              />
            </span>
          ))}
        </div>
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="rounded-sm bg-surface px-1.5 py-0.5 text-[9px] text-muted shadow-[var(--shadow-border)]">Draw</span>
          <span className="rounded-sm bg-surface px-1.5 py-0.5 text-[9px] text-muted shadow-[var(--shadow-border)]">Pattern</span>
        </div>
        {last ? (
          <span
            className="absolute right-12 rounded-sm px-1 py-0.5 font-mono text-[9px] tabular"
            style={{ top: "42%", background: up ? "var(--color-up)" : "var(--color-down)", color: "var(--color-bg)" }}
          >
            {fmtTapePx(last)}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-mono text-[13px] tabular">
          <span className="font-semibold">{last ? fmtTapePx(last) : "—"}</span>
          {abs != null ? (
            <span className={cn("ml-2", up ? "text-up" : "text-down")}>
              {abs >= 0 ? "+" : ""}
              {fmtTapePx(Math.abs(abs))} · {fmtPct(pct)}
            </span>
          ) : pct ? (
            <span className={cn("ml-2", up ? "text-up" : "text-down")}>{fmtPct(pct)}</span>
          ) : null}
        </div>
        <Link to="/markets" search={{ view: "terminal" }} className="text-[12px] font-semibold text-chart hover:underline">
          Open Terminal →
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {(mini.length ? mini : Array.from({ length: 4 }, () => null)).map((t, i) =>
          t ? (
            <div key={t.id} className="flex items-center justify-between rounded-md bg-bg-elevated px-2 py-1.5 font-mono text-[11px] tabular">
              <span className="font-sans text-[11px] font-semibold">{t.label}</span>
              <span className={t.changePct >= 0 ? "text-up" : "text-down"}>{t.changePct ? fmtPct(t.changePct) : "—"}</span>
            </div>
          ) : (
            <div key={i} className="h-8 animate-pulse rounded-md bg-bg-elevated" />
          ),
        )}
      </div>
    </div>
  );
}

function Morning() {
  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const news = useQuery({
    queryKey: ["news", "NIFTY", "market"],
    queryFn: () => apiNews("NIFTY", "Nifty Sensex Indian stock market"),
    staleTime: 10 * 60 * 1000,
  });
  const rows = screen.data?.rows || [];
  const up = applyScreen(rows, "up").slice(0, 5);
  const down = applyScreen(rows, "down").slice(0, 5);

  return (
    <section id="today" className="scroll-mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <p className="text-[12px] font-medium tracking-[0.16em] text-chart uppercase">Today</p>
          <h2 className="mt-3 max-w-[18ch] text-[clamp(1.6rem,1.1rem+1.8vw,2.35rem)] font-semibold tracking-tight">
            What moved. Then open any name.
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            Overview for breadth, movers, and Pulse. Terminal to watch a chart. A stock page for the full write-up.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Board title="Winners" rows={up} loading={screen.isPending} />
          <Board title="Losers" rows={down} loading={screen.isPending} />
          <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <h3 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Headlines</h3>
            {news.isPending ? (
              <p className="mt-3 text-sm text-muted">Fetching headlines…</p>
            ) : news.data?.length ? (
              <ul className="mt-3 grid gap-2.5">
                {news.data.slice(0, 5).map((n) => (
                  <li key={n.link + n.title}>
                    <a href={n.link} target="_blank" rel="noreferrer" className="block text-[13px] leading-snug hover:text-chart">
                      {n.title}
                    </a>
                    <div className="mt-0.5 text-[11px] text-subtle">{n.publisher}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">No market headlines right now.</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/markets" search={{ view: "terminal" }}>
              Open Markets Terminal →
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/markets" search={{ view: "overview" }}>
              View market overview
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/s/$symbol" params={{ symbol: "RELIANCE" }}>
              Sample: Reliance
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Board({
  title,
  rows,
  loading,
}: {
  title: string;
  rows: { symbol: string; name: string; price: number; changePct: number }[];
  loading: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h3 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{title}</h3>
      {loading && !rows.length ? (
        <p className="mt-3 text-sm text-muted">Loading prices…</p>
      ) : rows.length ? (
        <ul className="mt-2 grid gap-0.5">
          {rows.map((r) => (
            <li key={r.symbol}>
              <Link
                to="/s/$symbol"
                params={{ symbol: r.symbol }}
                className="flex items-center justify-between rounded-sm px-1 py-1.5 hover:bg-bg"
              >
                <span className="truncate text-[13px]">{r.name}</span>
                <span className={cn("ml-3 shrink-0 font-mono text-[13px] tabular", r.changePct >= 0 ? "text-up" : "text-down")}>
                  {fmtPct(r.changePct)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">Waiting on live prices.</p>
      )}
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <SkipToMain />
      <LandingHeader />
      <Tape />

      <main id="main">
        <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div className="pt-2">
            <p className="kosh-rise text-[12px] font-medium tracking-[0.16em] text-chart uppercase">
              Indian stocks · Markets Terminal · Improve Portfolio
            </p>
            <h1
              className="kosh-rise mt-3 max-w-[18ch] text-[clamp(2.15rem,1.2rem+3vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.035em]"
              style={{ animationDelay: "70ms" }}
            >
              Watch the market. <span className="text-chart">Understand the stock.</span>
            </h1>
            <p className="kosh-rise mt-4 max-w-md text-[16px] leading-relaxed text-muted" style={{ animationDelay: "140ms" }}>
              A charting workspace, a morning overview, and a full read of any name you hold — without pretending a pattern is a forecast.
            </p>
            <div className="kosh-rise mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: "210ms" }}>
              <Button asChild>
                <Link to="/markets" search={{ view: "terminal" }}>
                  Open Markets Terminal →
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/markets" search={{ view: "overview" }}>
                  View market overview
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/app">Improve Portfolio</Link>
              </Button>
            </div>
            <p className="kosh-rise mt-3 text-[12px] text-subtle" style={{ animationDelay: "280ms" }}>
              Guest stays on this device. An account keeps a portfolio with you.
            </p>
          </div>
          <div className="kosh-rise" style={{ animationDelay: "120ms" }}>
            <HeroBoard />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-3 px-4 pb-12 md:grid-cols-3">
          {[
            {
              k: "Improve Portfolio",
              t: "See what to change",
              d: "Concentration, XIRR, and analysis on large weights — a recommendation at the top.",
              to: "/app" as const,
            },
            {
              k: "Multibagger analysis",
              t: "Run it on any stock",
              d: "Fundamental + qualitative, with a native verdict and multi-bagger potential.",
              href: "/s/RELIANCE",
            },
            {
              k: "Find names",
              t: "Sound and turnaround screens",
              d: "Not another PE sort. Ranked on the numbers we have, with leftover checks listed.",
              to: "/screen" as const,
            },
          ].map((c) => (
            <Link
              key={c.k}
              to={c.to || "/s/$symbol"}
              params={c.href ? { symbol: "RELIANCE" } : undefined}
              className="group rounded-xl border-l-[4px] border-l-chart bg-surface p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
            >
              <div className="text-[11px] font-semibold tracking-[0.14em] text-chart uppercase">{c.k}</div>
              <h2 className="mt-2 text-[18px] font-semibold tracking-tight group-hover:text-chart">{c.t}</h2>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">{c.d}</p>
            </Link>
          ))}
        </section>

        <Morning />

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <MixNudge where="landing" />
          </div>
        </section>

        <section id="quality" className="scroll-mt-16 border-t border-border bg-bg-elevated">
          <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 lg:grid-cols-2">
            <Reveal>
              <p className="text-[12px] font-medium tracking-[0.16em] text-chart uppercase">Fundamental · Qualitative</p>
              <h2 className="mt-3 max-w-[16ch] text-[clamp(1.6rem,1.1rem+1.8vw,2.35rem)] font-semibold tracking-tight">
                Multibagger analysis. On the stock.
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                Fundamental analysis is the numbers and the company. Qualitative analysis is management, industry, brand,
                and whether that stack can compound. They sit at the top of a stock page and fold away when you open the
                chart.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link to="/s/$symbol" params={{ symbol: "RELIANCE" }}>
                    Read Reliance
                  </Link>
                </Button>
              </div>
            </Reveal>
            <div className="grid gap-3">
              <article className="rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]">
                <div className="text-[11px] font-semibold tracking-[0.14em] text-chart uppercase">Fundamental</div>
                <h3 className="mt-2 text-[16px] font-semibold tracking-tight">Is the company sound?</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  Profitability, balance sheet, growth, valuation, ownership. The numbers we have, then the argument. Not a
                  pass/fail stamp.
                </p>
              </article>
              <article className="rounded-lg border-l-[3px] border-l-warn bg-surface p-4 shadow-[var(--shadow-border)]">
                <div className="text-[11px] font-semibold tracking-[0.14em] text-warn uppercase">Qualitative</div>
                <h3 className="mt-2 text-[16px] font-semibold tracking-tight">Can it compound from here?</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  Management, industry, brand, how the factors stack. The multi-bagger argument — not a yes/no badge.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="grid gap-6 sm:grid-cols-2">
              {FEATURES.map((f, i) => (
                <Reveal key={f.k} delay={i * 60}>
                  <Link
                    to={f.to}
                    params={"symbol" in f && f.symbol ? { symbol: f.symbol } : undefined}
                    className="block rounded-lg bg-surface p-4 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
                  >
                    <div className="text-[11px] font-medium tracking-[0.08em] text-chart uppercase">{f.k}</div>
                    <h2 className="mt-2 text-[17px] font-semibold tracking-tight">{f.t}</h2>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.d}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
            <Reveal delay={80}>
              <HeroSleeves />
            </Reveal>
          </div>
        </section>

        <section id="read" className="scroll-mt-16 border-t border-border bg-bg-elevated">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <Reveal>
              <h2 className="text-[12px] font-medium tracking-[0.16em] text-chart uppercase">When you have a portfolio</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                Upload what you hold today. See it versus the index — growth, drawdown, rolling windows.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 90}>
                  <div className="font-mono text-[13px] text-chart tabular">{s.n}</div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">{s.t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.d}</p>
                </Reveal>
              ))}
            </div>
            <div className="mt-12">
              <p className="mb-4 text-[12px] font-medium tracking-[0.16em] text-chart uppercase">
                Then every window versus the index
              </p>
              <div className="mb-6">
                <HeroMix />
              </div>
              <WindowsPreview />
              <p className="mt-3 text-[12px] text-subtle">Sample illustration · open a portfolio for your numbers.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-16 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <Reveal>
              <h2 className="text-[12px] font-medium tracking-[0.16em] text-chart uppercase">FAQ</h2>
              <p className="mt-3 max-w-[18ch] text-[clamp(1.6rem,1.1rem+1.8vw,2.35rem)] font-semibold tracking-tight">
                What the numbers are — and are not.
              </p>
            </Reveal>
            <div className="mt-8 max-w-3xl">
              {FAQ.map((f) => (
                <details key={f.q} className="group border-b border-border py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium tracking-tight [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Plus className="size-4 shrink-0 text-subtle transition-transform duration-150 group-open:rotate-45" />
                  </summary>
                  <p className="mt-2 max-w-2xl pb-1 text-[14px] leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-end">
            <div>
              <h2 className="max-w-[16ch] text-[clamp(1.6rem,1.1rem+1.8vw,2.35rem)] font-semibold tracking-tight">
                Start on Markets. Add a portfolio when you want.
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted">
                Prices and any stock page work as a guest. Eight NSE names in the sample if you want holdings versus
                Nifty 50. An account keeps it with you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/markets">Open markets</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/app">My portfolio</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
