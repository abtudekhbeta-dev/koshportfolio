import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { apiTape } from "@/lib/kosh/api";
import { fmtInr, fmtPct, fmtTapePx } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { tapeFreshness } from "@/lib/kosh/market-data";
import { AuthSlot } from "@/components/auth-slot";
import { LayoutSwitch } from "@/components/layout-switch";
import { SearchBar } from "@/components/search-bar";
import { SyncChip } from "@/components/sync-chip";
import { ThemeToggle } from "@/components/theme-toggle";
import { useKosh } from "@/lib/store";
import { MarketsMenu } from "@/components/markets-menu";
import { cn } from "@/lib/utils";

const InspectorContext = createContext<((node: ReactNode) => void) | null>(null);

export function useLedgerInspector() {
  return useContext(InspectorContext);
}

const NAV = [
  { to: "/" as const, label: "Brief", on: (p: string) => p === "/" },
  { to: "/markets" as const, label: "Markets", on: (p: string) => (p === "/markets" || p.startsWith("/markets?")) || (p.startsWith("/markets") && !p.startsWith("/markets/rotation")) },
  { to: "/markets/rotation" as const, label: "Sector Rotation", on: (p: string) => p.startsWith("/markets/rotation") },
  { to: "/screen" as const, label: "Screener", on: (p: string) => p.startsWith("/screen") },
  { to: "/app" as const, label: "Books", on: (p: string) => p === "/app" || (p.startsWith("/p/") && !p.includes("/path")) },
  { to: "/watch" as const, label: "Watch", on: (p: string) => p.startsWith("/watch") },
];

export function LedgerShell({ children, full }: { children: ReactNode; wide?: boolean; full?: boolean }) {
  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    refetchInterval: isIstSession() ? 5_000 : 60_000,
    staleTime: 2_500,
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ports = useKosh((s) => s.portfolios);
  const book = ports.find((p) => p.id !== "sample") || ports[0];
  const fresh = tapeFreshness(tape.data, isIstSession());
  const [inspector, setInspector] = useState<ReactNode>(null);
  const set = useMemo(() => (node: ReactNode) => setInspector(node), []);
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(new Date());

  return (
    <InspectorContext.Provider value={set}>
      <div className={cn("ledger-shell min-h-dvh bg-bg text-fg", full && "flex h-dvh flex-col overflow-hidden")}>
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-3 px-5 pt-5">
            <div>
              <Link to="/" className="ledger-word text-[34px] leading-none tracking-tight">
                Kosh
              </Link>
              <p className="mt-1 text-[12px] tracking-[0.14em] text-subtle uppercase">The ledger · {today}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pb-1">
              <span className="text-[11px] tracking-[0.08em] text-subtle uppercase" title={fresh.title}>
                {fresh.label}
              </span>
              <SyncChip />
              <SearchBar />
              <ThemeToggle />
              <LayoutSwitch />
              <AuthSlot />
            </div>
          </div>
          <nav className="mx-auto mt-4 hidden max-w-5xl gap-6 px-5 pb-3 md:flex" aria-label="Ledger">
            {NAV.map((item) =>
              item.label === "Markets" ? (
                <MarketsMenu key="markets" tone="plain" />
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    "border-b pb-2 text-[14px]",
                    item.on(pathname) ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              to={book ? "/p/$id/path" : "/app"}
              params={book ? { id: book.id } : undefined}
              className={cn(
                "border-b pb-2 text-[14px]",
                pathname.includes("/path") ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg",
              )}
            >
              Path
            </Link>
            {book ? <span className="ml-auto pb-2 text-[13px] text-subtle">{book.name}</span> : null}
          </nav>
        </header>
        <div className={cn(full ? "flex min-h-0 w-full flex-1 flex-col" : "mx-auto w-full max-w-5xl px-5 py-8", !full && inspector && "lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10")}>
          <main className={full ? "min-h-0 flex-1" : "min-w-0 pb-16 md:pb-0"}>{children}</main>
          {inspector ? (
            <aside className="fixed inset-x-0 bottom-14 z-30 max-h-[46vh] overflow-y-auto border-t border-border bg-bg px-5 py-4 lg:static lg:bottom-auto lg:max-h-none lg:overflow-visible lg:border-t-0 lg:border-l lg:px-0 lg:py-0">
              {inspector}
            </aside>
          ) : null}
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
          <Tab to="/" label="Brief" on={pathname === "/"} />
          <MarketsMenu placement="up" tone="tab" />
          <Tab to="/app" label="Books" on={pathname === "/app" || pathname.startsWith("/p/")} />
          <Tab to={book ? "/p/$id/path" : "/app"} params={book ? { id: book.id } : undefined} label="Path" on={pathname.includes("/path")} />
        </nav>
      </div>
    </InspectorContext.Provider>
  );
}

function Tab({
  to,
  label,
  on,
  params,
}: {
  to: "/" | "/markets" | "/app" | "/p/$id/path";
  label: string;
  on: boolean;
  params?: { id: string };
}) {
  return (
    <Link to={to} params={params} className={cn("flex-1 py-3 text-center text-[12px]", on ? "text-fg" : "text-muted")}>
      {label}
    </Link>
  );
}

export function LedgerLanding() {
  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    refetchInterval: isIstSession() ? 5_000 : 60_000,
    staleTime: 2_500,
  });
  const rows = tape.data || [];
  const fresh = tapeFreshness(rows, isIstSession());
  const focus = rows.find((r) => r.price > 0);
  return (
    <LedgerShell>
      <article>
        <p className="text-[12px] tracking-[0.18em] text-subtle uppercase">Investor’s brief</p>
        <h1 className="ledger-word mt-3 max-w-[18ch] text-[44px] leading-[1.08] font-medium">A journal of the book, not another terminal.</h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          {focus ? (
            <>
              {focus.label} is {fmtTapePx(focus.price)}
              <span className={focus.changePct >= 0 ? "text-up" : "text-down"}> {fmtPct(focus.changePct)}</span>.{" "}
            </>
          ) : null}
          <span title={fresh.title}>{fresh.label}.</span> Figures are what the feed returned. Nothing here is a forecast or a target price.
        </p>
        <hr className="my-8 border-border" />
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="ledger-word text-[26px]">The market, in one column</h2>
            <ul className="mt-4">
              {rows.slice(0, 8).map((t) => (
                <li key={t.id} className="flex items-baseline justify-between gap-4 border-b border-border py-2.5">
                  <Link to="/markets" className="text-[15px]">
                    {t.label}
                  </Link>
                  <span className="font-mono text-[14px] tabular">
                    {t.price ? fmtTapePx(t.price, t.unit) : "—"}
                    <span className={cn("ml-3", (t.changePct || 0) >= 0 ? "text-up" : "text-down")}>
                      {t.changePct ? fmtPct(t.changePct) : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {!rows.length ? <p className="mt-3 text-[14px] text-muted">Waiting on prices.</p> : null}
          </section>
          <section className="md:border-l md:border-border md:pl-8">
            <h2 className="ledger-word text-[26px]">Open the book</h2>
            <ol className="mt-4 space-y-4 text-[15px] leading-relaxed">
              <li>
                <Link to="/app" className="underline decoration-accent underline-offset-4">
                  Portfolios
                </Link>
                <span className="text-muted"> — value, what changed, and the holdings as a table, not a grid of cards.</span>
              </li>
              <li>
                <Link to="/p/$id/path" params={{ id: "sample" }} className="underline decoration-accent underline-offset-4">
                  Sample path
                </Link>
                <span className="text-muted"> — pick a session. Quantities come from the trade file. A missing close is not zero.</span>
              </li>
              <li>
                <Link to="/screen" className="underline decoration-accent underline-offset-4">
                  Screener
                </Link>
                <span className="text-muted"> — numbers already on file.</span>
              </li>
            </ol>
          </section>
        </div>
      </article>
    </LedgerShell>
  );
}

export function LedgerOverview({
  name,
  value,
  dayAbs,
  dayPct,
  rows,
}: {
  name: string;
  value: number;
  dayAbs: number;
  dayPct: number;
  rows: { symbol: string; name: string; value: number; qty: number; dayPct?: number }[];
}) {
  const ranked = [...rows].filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
  const top = ranked[0];
  return (
    <article>
      <p className="text-[12px] tracking-[0.16em] text-subtle uppercase">{name}</p>
      <h2 className="ledger-word mt-2 text-[40px] leading-none">{fmtInr(value)}</h2>
      <p className={cn("mt-2 text-[15px]", dayAbs >= 0 ? "text-up" : "text-down")}>
        {fmtInr(dayAbs)} today · {fmtPct(dayPct)}
      </p>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
        Securities only. Untracked cash is not in this figure.
        {top ? ` ${top.name} is the largest line, ${((top.value / value) * 100).toFixed(1)}% of what is priced.` : ""}
      </p>
      <h3 className="ledger-word mt-8 text-[26px]">What is held</h3>
      <table className="mt-3 w-full text-left text-[14px]">
        <thead className="text-[11px] tracking-[0.08em] text-subtle uppercase">
          <tr>
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Value</th>
            <th className="py-2 text-right font-medium">Weight</th>
          </tr>
        </thead>
        <tbody>
          {ranked.slice(0, 12).map((r) => (
            <tr key={r.symbol} className="border-t border-border">
              <td className="py-2">
                <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="hover:underline">
                  {r.name}
                </Link>
              </td>
              <td className="py-2 text-right font-mono tabular">{r.qty}</td>
              <td className="py-2 text-right font-mono tabular">{fmtInr(r.value)}</td>
              <td className="py-2 text-right font-mono tabular">{value > 0 ? ((r.value / value) * 100).toFixed(1) : "—"}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ranked.length > 12 ? <p className="mt-2 text-[12px] text-subtle">Showing 12 of {ranked.length} priced lines.</p> : null}
    </article>
  );
}
