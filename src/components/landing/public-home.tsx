import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthSlot } from "@/components/auth-slot";
import { SearchBar } from "@/components/search-bar";
import { LayoutSwitch } from "@/components/layout-switch";
import { SkipToMain } from "@/components/landing/site-chrome";
import { apiHistory, apiTape } from "@/lib/kosh/api";
import { fmtPct, fmtTapePx } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { tapeFreshness } from "@/lib/kosh/market-data";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import "./public-home.css";

const NAV = [
  { to: "/markets" as const, label: "Markets", search: { view: "terminal" as const } },
  { to: "/results" as const, label: "Results" },
  { to: "/markets/rotation" as const, label: "Rotation" },
  { to: "/value" as const, label: "Value" },
  { to: "/app" as const, label: "Portfolios" },
];

const FACTORS = [
  { label: "Relative valuation", weight: 30, note: "Trailing P/E vs the same-sector median. Lenders use P/B." },
  { label: "Earnings growth", weight: 25, note: "Profit CAGR, or the latest year if the CAGR is missing." },
  { label: "Revenue growth", weight: 15, note: "Sales CAGR, or the latest year." },
  { label: "Profitability", weight: 15, note: "ROCE or ROE. A negative ROE is flagged." },
  { label: "Balance sheet", weight: 10, note: "Debt/equity and interest cover, when the card has them." },
  { label: "Cash conversion", weight: 5, note: "CFO versus profit. Dropped when the card has no cash figure." },
];

function LandingMark() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 font-semibold tracking-tight text-fg" aria-label="Kosh home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--lp-mark-tile)" />
        <path d="M9 7h3.15v8.15L19.7 7H23l-8.15 9.25L23.2 25h-3.45l-7.6-8.7V25H9V7z" fill="var(--lp-mark-ink)" />
        <path d="M7 24.5c4.2-3.2 7.8-2.1 12.4-6.4 2.6-2.4 5.2-5.8 7.1-8.6" fill="none" stroke="var(--lp-cobalt)" strokeWidth="1.35" strokeLinecap="round" />
      </svg>
      Kosh
    </Link>
  );
}

function LandingTheme() {
  const theme = useKosh((s) => s.theme);
  const setTheme = useKosh((s) => s.setTheme);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-11" aria-hidden />;
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="grid size-11 place-items-center rounded-md text-muted hover:text-fg"
      aria-label={next === "light" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(next)}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
        </svg>
      )}
    </button>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function Spark({ closes }: { closes: number[] }) {
  if (closes.length < 2) return null;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const d = closes
    .map((c, i) => {
      const x = (i / (closes.length - 1)) * 100;
      const y = 8 + (1 - (c - min) / span) * 84;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full" role="img" aria-label="Recent closing prices">
      <path d={d} fill="none" stroke="var(--lp-cobalt)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function TerminalPreview() {
  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    staleTime: 15_000,
    refetchInterval: isIstSession() ? 20_000 : 60_000,
  });
  const rows = tape.data || [];
  const focus = rows[0];
  const hist = useQuery({
    queryKey: ["landing-spark", focus?.symbol],
    queryFn: () => apiHistory(focus!.symbol, "1y"),
    enabled: Boolean(focus?.symbol),
    staleTime: 10 * 60_000,
  });
  const closes = (hist.data?.bars || []).slice(-120).map((bar) => bar.c).filter((c) => c > 0);
  const fresh = tapeFreshness(rows, isIstSession());
  const up = (focus?.changePct || 0) >= 0;
  return (
    <div className="lp-frame overflow-hidden p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="lp-kicker">Market Terminal</div>
          <div className="mt-1 text-base font-semibold">{focus?.label || "Waiting on the tape"}</div>
        </div>
        <span className="text-xs font-semibold tracking-wide text-subtle uppercase">{fresh.label}</span>
      </div>
      <div className="mt-4 rounded-lg bg-bg px-3 py-3">
        {closes.length > 1 ? (
          <Spark closes={closes} />
        ) : (
          <div className="grid h-40 place-items-center text-sm text-muted">
            {hist.isFetching ? "Loading recent closes…" : "The chart opens in the terminal. This frame will not draw a series it does not have."}
          </div>
        )}
        <p className="mt-1 text-xs text-subtle">
          {closes.length > 1 ? `Recent closes for ${focus?.label}. A path of prices, not a signal.` : "Live prints below come from the market tape."}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-mono text-2xl font-medium tabular">
          {focus?.price ? fmtTapePx(focus.price) : "—"}
          {focus?.unit ? <span className="ml-2 text-xs text-subtle">{focus.unit}</span> : null}
        </div>
        <div className={cn("font-mono text-sm tabular", up ? "text-up" : "text-down")}>{focus?.changePct ? fmtPct(focus.changePct) : ""}</div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.slice(1, 5).map((row) => (
          <li key={row.id} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted">{row.label}</span>
            <span className="font-mono tabular">
              {row.price ? fmtTapePx(row.price) : "—"}
              <span className={cn("ml-2", row.changePct >= 0 ? "text-up" : "text-down")}>{row.changePct ? fmtPct(row.changePct) : ""}</span>
            </span>
          </li>
        ))}
      </ul>
      {!rows.length && !tape.isFetching ? <p className="mt-3 text-sm text-muted">The tape did not answer. No index level was filled in.</p> : null}
    </div>
  );
}

function RrgFrame() {
  return (
    <svg viewBox="0 0 640 420" className="lp-quad" role="img" aria-label="Relative rotation quadrants">
      <rect x="24" y="16" width="592" height="360" rx="18" fill="var(--k-surface)" />
      <line x1="320" y1="40" x2="320" y2="352" stroke="var(--k-border)" />
      <line x1="48" y1="196" x2="592" y2="196" stroke="var(--k-border)" />
      <text x="56" y="64" fill="var(--lp-cobalt)" fontSize="14" fontFamily="IBM Plex Sans, sans-serif">
        Improving
      </text>
      <text x="520" y="64" fill="var(--lp-cobalt)" fontSize="14" fontFamily="IBM Plex Sans, sans-serif" textAnchor="end">
        Leading
      </text>
      <text x="56" y="336" fill="var(--k-muted)" fontSize="14" fontFamily="IBM Plex Sans, sans-serif">
        Lagging
      </text>
      <text x="520" y="336" fill="var(--k-muted)" fontSize="14" fontFamily="IBM Plex Sans, sans-serif" textAnchor="end">
        Weakening
      </text>
      <text x="320" y="388" fill="var(--k-subtle)" fontSize="12" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">
        Relative strength →
      </text>
      <text x="308" y="188" fill="var(--k-subtle)" fontSize="12" fontFamily="IBM Plex Sans, sans-serif" textAnchor="end">
        Momentum
      </text>
      <path
        d="M180 250 C 210 230, 240 150, 300 140 C 360 130, 410 170, 450 150"
        fill="none"
        stroke="var(--lp-cobalt)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="450" cy="150" r="5" fill="var(--lp-cobalt)" />
    </svg>
  );
}

export function PublicHome() {
  const [menu, setMenu] = useState(false);
  return (
    <div className="kosh-public min-h-dvh overflow-x-hidden">
      <SkipToMain />
      <header className="lp-bar">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <LandingMark />
          <nav className="lp-nav hidden items-center gap-1 lg:flex" aria-label="Platform">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={"search" in item ? item.search : undefined}
                className="rounded-md px-3 text-sm font-medium text-muted hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden min-w-0 max-w-xs flex-1 lg:block">
            <SearchBar dense placeholder="Search a name…" />
          </div>
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <LandingTheme />
            <div className="hidden md:block">
              <LayoutSwitch />
            </div>
            <AuthSlot />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-md text-fg lg:hidden"
              aria-expanded={menu}
              aria-label={menu ? "Close menu" : "Open menu"}
              onClick={() => setMenu((v) => !v)}
            >
              <MenuIcon open={menu} />
            </button>
          </div>
        </div>
        {menu ? (
          <div className="lp-menu-panel border-t border-border px-4 py-3 lg:hidden">
            <div className="mb-3">
              <SearchBar dense />
            </div>
            <div className="mb-3 md:hidden">
              <LayoutSwitch />
            </div>
            <div className="grid">
              {NAV.map((item) => (
                <Link key={item.label} to={item.to} search={"search" in item ? item.search : undefined} className="text-base font-medium" onClick={() => setMenu(false)}>
                  {item.label}
                </Link>
              ))}
              <Link to="/alerts" className="text-base font-medium" onClick={() => setMenu(false)}>
                Alerts
              </Link>
              <Link to="/journal" className="text-base font-medium" onClick={() => setMenu(false)}>
                Journal
              </Link>
              <Link to="/watch" className="text-base font-medium" onClick={() => setMenu(false)}>
                Watchlists
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main id="main">
        <section className="lp-hero">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div>
              <p className="lp-kicker">Market intelligence for Indian markets</p>
              <h1 className="lp-display mt-4 max-w-[12ch]">
                See beyond the market. <span className="lp-mark">Understand every move.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Discover opportunities, research companies, track investments and manage your entire market workflow — all in one connected workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/markets" search={{ view: "terminal" }} className="lp-btn lp-btn-solid">
                  Open Market Terminal
                </Link>
                <a href="#intelligence" className="lp-btn lp-btn-line">
                  Discover the platform
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-2">
                <li>
                  <Link to="/results" className="lp-chip">
                    Results calendar
                  </Link>
                </li>
                <li>
                  <Link to="/markets/rotation" className="lp-chip">
                    Sector rotation
                  </Link>
                </li>
                <li>
                  <Link to="/value" className="lp-chip">
                    Undervalued Growth
                  </Link>
                </li>
                <li>
                  <Link to="/journal" className="lp-chip">
                    Trading journal
                  </Link>
                </li>
              </ul>
            </div>
            <TerminalPreview />
          </div>
        </section>

        <section id="intelligence" className="lp-navy scroll-mt-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
            <div>
              <p className="text-xs font-semibold tracking-widest text-chart uppercase">Market intelligence</p>
              <h2 className="lp-title mt-3">Know what is happening across the market.</h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                Indices, the day’s breadth and movers, news, and the terminal sit together. The results calendar keeps a board meeting apart from a filing that has actually been published.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/markets" search={{ view: "overview" }} className="lp-btn lp-btn-solid">
                  Market overview
                </Link>
                <Link to="/results" className="lp-btn lp-btn-line">
                  Results calendar
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <div className="lp-chip">Scheduled</div>
                <h3 className="mt-4 text-lg font-semibold">Upcoming board meeting</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  The company has told the exchange it will consider results. That is not a published result. The original meeting date stays on the row.
                </p>
              </article>
              <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <div className="lp-chip">Reported</div>
                <h3 className="mt-4 text-lg font-semibold">Filing already published</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  A financial-results filing, or an outcome notice that submits the results, replaces the open meeting. The filing time is kept beside the meeting date.
                </p>
              </article>
              <details className="rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted shadow-[var(--shadow-border)] sm:col-span-2">
                <summary className="cursor-pointer font-medium text-fg">What the calendar does not cover</summary>
                <p className="mt-3">
                  This is an NSE calendar. BSE’s results feed currently refuses the request, so no BSE-only date is filled in. Dual-listed names use the NSE filing. The NSE financial-results file is not current through the whole recent reporting season, and the dated announcement archive does not answer in time. A filing that has left the latest announcement batch can still look scheduled. Nothing on this page invents a missing date.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section id="rotation" className="lp-pale scroll-mt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
            <div>
              <RrgFrame />
              <p className="mt-3 text-xs text-subtle">Quadrant diagram. The curve shows the shape of a tail, not a live sector reading. Open rotation for the indices Kosh actually plots.</p>
            </div>
            <div>
              <p className="lp-kicker">Sector intelligence</p>
              <h2 className="lp-title mt-3">Find where market leadership is shifting.</h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                Relative Rotation Graphs with leading, weakening, lagging and improving quadrants, historical tails, and relative-strength ranks for the indices on the rotation board. Not every NSE sector index has a historical series here.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-muted">
                <li>Leading, weakening, lagging, improving.</li>
                <li>Tails through time, not a single snapshot.</li>
                <li>Momentum beside relative strength.</li>
              </ul>
              <Link to="/markets/rotation" className="lp-btn lp-btn-solid mt-6">
                Open sector rotation
              </Link>
            </div>
          </div>
        </section>

        <section id="research" className="scroll-mt-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
            <div className="lg:pt-6">
              <p className="lp-kicker">Stock research</p>
              <h2 className="lp-title mt-3">Find the opportunity. Understand the business.</h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                Charts, drawings, financials and a company read sit on the stock page. Undervalued Growth looks for a discount to the same sector that still shows growth and quality — it is not a claim that a low P/E is cheap, and it is not a forecast.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/value" className="lp-btn lp-btn-solid">
                  Open Undervalued Growth
                </Link>
                <Link to="/s/$symbol" params={{ symbol: "RELIANCE" }} className="lp-btn lp-btn-line">
                  Open a company
                </Link>
              </div>
              <p className="mt-4 text-sm text-subtle">The screener uses NSE cards. A BSE filter is not a functioning BSE screen.</p>
            </div>
            <div className="lp-frame p-5 sm:p-7">
              <h3 className="text-lg font-semibold">Where valuation, growth and quality meet</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                The score is the weighted average of the factors actually on the card. Missing factors are dropped, not treated as zero. If less than 40 weight points are covered, the score stays blank. Negative earnings stay out of the peer P/E. Peer medians need at least four positive P/E names under 150. Banks and NBFCs are scored on price-to-book and ROE.
              </p>
              <ul className="mt-6 grid gap-4">
                {FACTORS.map((factor) => (
                  <li key={factor.label}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">{factor.label}</span>
                      <span className="font-mono text-xs text-subtle">{factor.weight}</span>
                    </div>
                    <div className="lp-weight mt-2" aria-hidden>
                      <span data-w={factor.weight} />
                    </div>
                    <p className="mt-1 text-xs text-subtle">{factor.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="valuation" className="border-t border-border">
          <div className="mx-auto grid max-w-6xl items-end gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="lp-kicker">Historical valuation</p>
              <h2 className="lp-title mt-3">Put today’s valuation into historical context.</h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                One, three, five and ten year windows. Where the inputs exist, Kosh estimates P/E, earnings yield, price-to-book and price-to-sales. It does not keep a point-in-time filing database.
              </p>
              <Link to="/s/$symbol" params={{ symbol: "RELIANCE" }} className="lp-btn lp-btn-line mt-6">
                See it on a stock
              </Link>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {["1Y", "3Y", "5Y", "10Y"].map((label, i) => (
                  <span key={label} className={i === 2 ? "lp-chip lp-chip-on" : "lp-chip"}>
                    {label}
                  </span>
                ))}
              </div>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Estimated P/E", "Today’s EPS scaled by that year’s profit."],
                  ["Earnings yield", "The inverse of that estimate, when it exists."],
                  ["P/B and P/S", "Only with book value, sales, and a comparable price."],
                  ["EV/EBITDA", "Not shown. Dated enterprise value is missing."],
                ].map(([term, def]) => (
                  <div key={term} className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
                    <dt className="text-sm font-semibold">{term}</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-muted">{def}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-subtle">
                Share count is assumed roughly stable, so a split makes older years less reliable. These are calculated estimates, not historical filing multiples.
              </p>
            </div>
          </div>
        </section>

        <section id="portfolio" className="lp-pale scroll-mt-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-24">
            <div>
              <p className="lp-kicker">Portfolio intelligence</p>
              <h2 className="lp-title mt-3">Know what you own. Understand what drives it.</h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                Growth against a benchmark, rolling returns, drawdown and holdings. Exposure is the holding weight of sector, size, growth, quality and momentum. These are portfolio characteristics, not factor betas.
              </p>
              <Link to="/app" className="lp-btn lp-btn-solid mt-6">
                Open portfolios
              </Link>
            </div>
            <div className="lp-frame p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-widest text-subtle uppercase">Portfolio valuation</p>
              <p className="mt-3 font-mono text-xl tracking-tight sm:text-2xl">P/E = 1 / weighted earnings yield</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Not an average of the P/E ratios. Names with negative or missing earnings are left out, and their weight is shown so the coverage is visible.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {["Sector", "Size", "Growth", "Quality", "Momentum", "Benchmark path"].map((label) => (
                  <li key={label} className="rounded-md bg-bg px-3 py-3 font-medium">
                    {label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-subtle">No sample portfolio is drawn here. The weights appear once you open a book that has holdings.</p>
            </div>
          </div>
        </section>

        <section id="workflow" className="lp-navy scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
            <p className="text-xs font-semibold tracking-widest text-chart uppercase">Investment workflow</p>
            <h2 className="lp-title mt-3 max-w-[16ch]">From an idea to a disciplined investment process.</h2>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <article className="rounded-xl bg-surface p-6">
                <h3 className="text-xl font-semibold">Smart alerts</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">Price, percent move, volume, RSI, and a moving-average cross. Create, edit, pause, resume, duplicate, set an expiry, and keep a trigger history.</p>
                <p className="mt-3 text-xs leading-relaxed text-subtle">Checked only while Kosh is open, on the quote poll. No email and no alert while the app is closed.</p>
                <Link to="/alerts" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-chart">
                  Manage alerts
                </Link>
              </article>
              <article className="rounded-xl bg-surface p-6">
                <h3 className="text-xl font-semibold">Trading journal</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Manual entry and CSV import, with duplicates skipped. Fees, taxes and slippage sit in the P&L. Open trades are not closed wins. Equity, drawdown, and splits by strategy, instrument, timeframe, setup, session and weekday.
                </p>
                <p className="mt-3 text-xs leading-relaxed text-subtle">A chart reference is a link or a note, not an uploaded screenshot. Sector and market-regime splits are not inferred. Signed-in accounts sync the journal.</p>
                <Link to="/journal" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-chart">
                  Open the journal
                </Link>
              </article>
              <article className="rounded-xl bg-surface p-6">
                <h3 className="text-xl font-semibold">Watchlists</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">Keep the names you are working through next to the terminal, the screener and the journal — the same symbols, not a separate product.</p>
                <Link to="/watch" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-chart">
                  Open watchlists
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="lp-cta">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 sm:flex-row sm:items-end lg:py-20">
            <div>
              <h2 className="lp-title max-w-[14ch]">One workspace for the market and the book.</h2>
              <p className="lp-cta-note mt-3 max-w-md text-sm leading-relaxed">Guest use stays on this device. An account keeps portfolios and the journal with you. Kosh is not a broker and not advice.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/markets" search={{ view: "terminal" }} className="lp-btn lp-btn-solid">
                Explore Kosh
              </Link>
              <Link to="/signup" className="lp-btn lp-btn-line">
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
          <div>
            <LandingMark />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">Indian markets, company research, and the portfolio you actually hold. Not investment advice.</p>
          </div>
          <div className="grid gap-2 text-sm text-muted">
            <Link to="/markets" search={{ view: "terminal" }} className="hover:text-fg">Market Terminal</Link>
            <Link to="/results" className="hover:text-fg">Results calendar</Link>
            <Link to="/markets/rotation" className="hover:text-fg">Sector rotation</Link>
            <Link to="/value" className="hover:text-fg">Undervalued Growth</Link>
            <Link to="/screen" className="hover:text-fg">Screener</Link>
            <Link to="/app" className="hover:text-fg">Portfolios</Link>
          </div>
          <div className="grid gap-2 text-sm text-muted">
            <Link to="/alerts" className="hover:text-fg">Alerts</Link>
            <Link to="/journal" className="hover:text-fg">Trading journal</Link>
            <Link to="/watch" className="hover:text-fg">Watchlists</Link>
            <Link to="/login" className="hover:text-fg">Sign in</Link>
            <Link to="/privacy" className="hover:text-fg">Privacy</Link>
            <Link to="/terms" className="hover:text-fg">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
