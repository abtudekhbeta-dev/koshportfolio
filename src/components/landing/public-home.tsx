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
  { to: "/markets" as const, label: "Markets", search: { view: "overview" as const } },
  { to: "/markets" as const, label: "Terminal", search: { view: "terminal" as const } },
  { to: "/screen" as const, label: "Screener" },
  { to: "/markets/rotation" as const, label: "Rotation" },
  { to: "/app" as const, label: "Portfolios" },
  { to: "/watch" as const, label: "Watchlists" },
];

const SHOWCASE = [
  { title: "Market Terminal", copy: "Candles, volume, drawings and the names you are working.", to: "/markets" as const, search: { view: "terminal" as const }, cta: "Open terminal" },
  { title: "Markets overview", copy: "Index levels, breadth and the session, from the live tape.", to: "/markets" as const, search: { view: "overview" as const }, cta: "Open markets" },
  { title: "Screener", copy: "Filter the NSE universe, then open a company from the row.", to: "/screen" as const, cta: "Open screener" },
  { title: "Sector rotation", copy: "Relative strength and momentum for the indices on the rotation board.", to: "/markets/rotation" as const, cta: "Open rotation" },
  { title: "Portfolios", copy: "Holdings, benchmark path, drawdown and what the book is exposed to.", to: "/app" as const, cta: "Open portfolios" },
  { title: "Stock research", copy: "Price history, filings and historical valuation open on the company. This page does not invent a score.", to: "/screen" as const, cta: "Find a company" },
];

const SECONDARY = [
  { label: "Results calendar", to: "/results" as const },
  { label: "Undervalued Growth", to: "/value" as const },
  { label: "Alerts", to: "/alerts" as const },
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
      onClick={() => {
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", next === "light" ? "#f7f9ff" : "#09090b");
      }}
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

export function PublicHome() {
  const [menu, setMenu] = useState(false);
  return (
    <div className="kosh-public min-h-dvh overflow-x-hidden">
      <SkipToMain />
      <header className="lp-bar">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <LandingMark />
          <nav className="lp-nav hidden items-center gap-0.5 xl:flex" aria-label="Platform">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={"search" in item ? item.search : undefined}
                className="rounded-md px-2 text-[13px] font-medium text-muted hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden min-w-0 max-w-[220px] flex-1 xl:block">
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
              className="grid size-11 place-items-center rounded-md text-fg xl:hidden"
              aria-expanded={menu}
              aria-label={menu ? "Close menu" : "Open menu"}
              onClick={() => setMenu((v) => !v)}
            >
              <MenuIcon open={menu} />
            </button>
          </div>
        </div>
        {menu ? (
          <div className="lp-menu-panel border-t border-border px-4 py-3 xl:hidden">
            <div className="mb-3">
              <SearchBar dense />
            </div>
            <div className="mb-3 md:hidden">
              <LayoutSwitch />
            </div>
            <div className="grid">
              {NAV.map((item) => (
                <Link key={item.label} to={item.to} search={"search" in item ? item.search : undefined} className="min-h-11 text-base font-medium" onClick={() => setMenu(false)}>
                  {item.label}
                </Link>
              ))}
              <Link to="/alerts" className="min-h-11 text-base font-medium" onClick={() => setMenu(false)}>
                Alerts
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
                <Link to="/markets" search={{ view: "overview" }} className="lp-btn lp-btn-line">
                  Explore Markets
                </Link>
              </div>
            </div>
            <TerminalPreview />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <p className="lp-kicker">The workspace</p>
          <h2 className="lp-title mt-3 max-w-[18ch]">Research the market. Then the book.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SHOWCASE.map((item) => (
              <article key={item.title} className="flex flex-col rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{item.copy}</p>
                <Link to={item.to} search={"search" in item ? item.search : undefined} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-chart">
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">Also in Kosh</p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium" aria-label="More tools">
              {SECONDARY.map((item) => (
                <Link key={item.to} to={item.to} className="text-fg hover:text-chart">
                  {item.label}
                </Link>
              ))}
            </nav>
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
            <Link to="/markets" search={{ view: "overview" }} className="hover:text-fg">Markets</Link>
            <Link to="/screen" className="hover:text-fg">Screener</Link>
            <Link to="/markets/rotation" className="hover:text-fg">Sector rotation</Link>
            <Link to="/app" className="hover:text-fg">Portfolios</Link>
            <Link to="/watch" className="hover:text-fg">Watchlists</Link>
          </div>
          <div className="grid gap-2 text-sm text-muted">
            <Link to="/results" className="hover:text-fg">Results calendar</Link>
            <Link to="/login" className="hover:text-fg">Sign in</Link>
            <Link to="/privacy" className="hover:text-fg">Privacy</Link>
            <Link to="/terms" className="hover:text-fg">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
