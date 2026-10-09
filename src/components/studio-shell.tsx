import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { apiTape } from "@/lib/kosh/api";
import { fmtTapePx, fmtPct } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { quoteStatus, quoteStatusLabel } from "@/lib/kosh/market-data";
import { AddHoldings } from "@/components/add-holdings";
import { AlertBanner } from "@/components/alert-banner";
import { AuthSlot } from "@/components/auth-slot";
import { LayoutSwitch } from "@/components/layout-switch";
import { SearchBar } from "@/components/search-bar";
import { SyncChip } from "@/components/sync-chip";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

const InspectorContext = createContext<((node: ReactNode) => void) | null>(null);

export function useStudioInspector() {
  return useContext(InspectorContext);
}

function sectionOf(pathname: string) {
  if (pathname.startsWith("/markets")) return "Markets";
  if (pathname.startsWith("/screen") || pathname.startsWith("/compare") || pathname.startsWith("/watch")) return "Research";
  if (pathname.includes("/path") || pathname.includes("/improve")) return "Decisions";
  if (pathname.startsWith("/p/") || pathname.startsWith("/app")) return "Portfolios";
  if (pathname.startsWith("/s/")) return "Stock";
  return "Studio";
}

export function StudioShell({ children, full }: { children: ReactNode; wide?: boolean; full?: boolean }) {
  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    refetchInterval: isIstSession() ? 15_000 : 60_000,
    staleTime: 10_000,
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const port = pathname.match(/^\/p\/([^/]+)/)?.[1] || null;
  const ports = useKosh((s) => s.portfolios);
  const book = ports.find((p) => p.id === port) || ports.find((p) => p.id !== "sample") || ports[0];
  const tapeOn = isIstSession() && (tape.data || []).some((t) => t.price > 0);
  const tapeLabel = quoteStatusLabel(quoteStatus({ session: isIstSession(), price: tapeOn ? 1 : (tape.data || [])[0]?.price }), null);
  const overview = pathname.startsWith("/markets") && /(?:^|[?&])view=overview(?:&|$)/.test(searchStr);
  const [inspector, setInspector] = useState<ReactNode>(null);
  const set = useMemo(() => (node: ReactNode) => setInspector(node), []);
  const section = sectionOf(pathname);

  return (
    <InspectorContext.Provider value={set}>
      <div className={cn("studio-shell min-h-dvh bg-bg text-fg lg:grid lg:grid-cols-[232px_minmax(0,1fr)]", full && "flex h-dvh flex-col overflow-hidden lg:grid")}>
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border px-4 py-5 lg:flex">
          <Link to="/" className="studio-word text-[22px] tracking-tight">
            Kosh
          </Link>
          <p className="mt-1 text-[11px] text-subtle">Studio · {tapeLabel}</p>
          <Rail n="01" label="Markets">
            <A to="/markets" search={{ view: "terminal" }} on={pathname.startsWith("/markets") && !overview}>
              Terminal
            </A>
            <A to="/markets" search={{ view: "overview" }} on={overview}>
              Overview
            </A>
          </Rail>
          <Rail n="02" label="Research">
            <A to="/watch" on={pathname.startsWith("/watch")}>
              Watchlists
            </A>
            <A to="/screen" on={pathname.startsWith("/screen")}>
              Screener
            </A>
            <A to="/compare" on={pathname.startsWith("/compare")}>
              Compare
            </A>
          </Rail>
          <Rail n="03" label="Portfolios">
            <A to="/app" on={pathname === "/app"}>
              All books
            </A>
            {book ? (
              <A to="/p/$id" params={{ id: book.id }} on={Boolean(port) && !pathname.includes("/path") && !pathname.includes("/improve")}>
                {book.name}
              </A>
            ) : null}
          </Rail>
          <Rail n="04" label="Decisions">
            <A to={book ? "/p/$id/improve" : "/app"} params={book ? { id: book.id } : undefined} on={pathname.includes("/improve")}>
              Improve
            </A>
            <A to={book ? "/p/$id/path" : "/app"} params={book ? { id: book.id } : undefined} on={pathname.includes("/path")}>
              Path
            </A>
          </Rail>
          <div className="mt-auto grid gap-3 border-t border-border pt-4">
            <SyncChip />
            <LayoutSwitch />
            <AuthSlot />
          </div>
        </aside>
        <div className={cn("flex min-w-0 flex-col", full && "min-h-0 flex-1")}>
          <header className={cn("z-30 border-b border-border", full ? "shrink-0" : "sticky top-0 bg-bg/95")}>
            <div className="flex h-12 items-center gap-3 px-3 sm:px-5">
              <div className="hidden min-w-0 sm:block">
                <div className="text-[10px] tracking-[0.16em] text-subtle uppercase">{section}</div>
              </div>
              <div className="min-w-0 flex-1">
                <SearchBar hint="⌘K" dense placeholder="Search a stock, index, portfolio, or page" />
              </div>
              <span data-tape-status className="hidden text-[11px] text-subtle xl:inline">
                {tapeLabel}
              </span>
              <SyncChip />
              <AddHoldings
                trigger={
                  <Button size="sm" variant="secondary" aria-label="Add holdings">
                    <Plus className="size-3.5" />
                  </Button>
                }
              />
              <ThemeToggle />
              <span className="lg:hidden">
                <LayoutSwitch />
              </span>
            </div>
            <AlertBanner />
          </header>
          <div className={cn("min-w-0", inspector && !full && "lg:grid lg:grid-cols-[minmax(0,1fr)_320px]")}>
            <main className={cn(full ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "min-w-0 px-3 py-5 pb-24 sm:px-5 lg:pb-10")}>{children}</main>
            {inspector && !full ? <aside className="hidden border-l border-border px-4 py-5 lg:block">{inspector}</aside> : null}
          </div>
          {inspector && !full ? (
            <div className="fixed inset-x-0 bottom-14 z-30 max-h-[46vh] overflow-y-auto border-t border-border bg-bg px-3 py-3 lg:hidden">{inspector}</div>
          ) : null}
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden">
          <div className="flex">
            <Tab to="/markets" label="Markets" on={pathname.startsWith("/markets")} />
            <Tab to="/screen" label="Screen" on={pathname.startsWith("/screen")} />
            <Tab to="/app" label="Books" on={pathname === "/app" || (pathname.startsWith("/p/") && !pathname.includes("/path"))} />
            <Tab to={book ? "/p/$id/path" : "/app"} params={book ? { id: book.id } : undefined} label="Path" on={pathname.includes("/path")} />
          </div>
        </nav>
      </div>
    </InspectorContext.Provider>
  );
}

export function StudioLanding() {
  const tape = useQuery({ queryKey: ["tape"], queryFn: apiTape, staleTime: 60_000 });
  const rows = (tape.data || []).slice(0, 6);
  const tapeOn = isIstSession() && rows.some((t) => t.price > 0);
  const tapeLabel = quoteStatusLabel(quoteStatus({ session: isIstSession(), price: tapeOn ? 1 : rows[0]?.price }), null);
  return (
    <StudioShell>
      <p className="text-[11px] tracking-[0.16em] text-subtle uppercase">01 · Today</p>
      <h1 className="studio-word mt-2 max-w-[16ch] text-[40px] leading-[1.05] font-medium tracking-tight">The book, the market, and the path.</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
        Studio is a different workspace on the same calculations. {tapeLabel}. Nothing here is a live feed.
      </p>
      <ol className="mt-8 divide-y divide-border border-y border-border">
        <li>
          <Link to="/markets" search={{ view: "terminal" }} className="flex items-baseline justify-between gap-4 py-3">
            <span>
              <span className="mr-3 text-[12px] text-subtle">01</span>Market terminal
            </span>
            <span className="text-[12px] text-muted">Charts</span>
          </Link>
        </li>
        <li>
          <Link to="/screen" className="flex items-baseline justify-between gap-4 py-3">
            <span>
              <span className="mr-3 text-[12px] text-subtle">02</span>Screener
            </span>
            <span className="text-[12px] text-muted">Numbers on file</span>
          </Link>
        </li>
        <li>
          <Link to="/app" className="flex items-baseline justify-between gap-4 py-3">
            <span>
              <span className="mr-3 text-[12px] text-subtle">03</span>Portfolios
            </span>
            <span className="text-[12px] text-muted">The sample book is already here</span>
          </Link>
        </li>
        <li>
          <Link to="/p/$id/path" params={{ id: "sample" }} className="flex items-baseline justify-between gap-4 py-3">
            <span>
              <span className="mr-3 text-[12px] text-subtle">04</span>Path timeline
            </span>
            <span className="text-[12px] text-muted">Pick a session</span>
          </Link>
        </li>
      </ol>
      {rows.length ? (
        <ul className="mt-8 grid gap-x-8 sm:grid-cols-2">
          {rows.map((t) => (
            <li key={t.id} className="flex items-baseline justify-between border-b border-border py-2 text-[13px]">
              <span>{t.label}</span>
              <span className="font-mono tabular">
                {t.price ? fmtTapePx(t.price, t.unit) : "—"}
                <span className={cn("ml-3", (t.changePct || 0) >= 0 ? "text-up" : "text-down")}>{t.changePct ? fmtPct(t.changePct) : ""}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-[13px] text-muted">Waiting on the market tape.</p>
      )}
    </StudioShell>
  );
}

function Rail({ n, label, children }: { n: string; label: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <div className="text-[10px] tracking-[0.14em] text-subtle uppercase">
        {n} {label}
      </div>
      <div className="mt-1 grid">{children}</div>
    </div>
  );
}

function A({
  to,
  params,
  search,
  on,
  children,
}: {
  to: "/markets" | "/watch" | "/screen" | "/compare" | "/app" | "/p/$id" | "/p/$id/path" | "/p/$id/improve";
  params?: { id: string };
  search?: { view: "terminal" | "overview" };
  on?: boolean;
  children: ReactNode;
}) {
  const className = item(on);
  if (to === "/p/$id" && params) return <Link to="/p/$id" params={params} className={className}>{children}</Link>;
  if (to === "/p/$id/path" && params) return <Link to="/p/$id/path" params={params} className={className}>{children}</Link>;
  if (to === "/p/$id/improve" && params) return <Link to="/p/$id/improve" params={params} className={className}>{children}</Link>;
  if (to === "/markets") return <Link to="/markets" search={search || { view: "terminal" }} className={className}>{children}</Link>;
  if (to === "/watch") return <Link to="/watch" className={className}>{children}</Link>;
  if (to === "/screen") return <Link to="/screen" className={className}>{children}</Link>;
  if (to === "/compare") return <Link to="/compare" className={className}>{children}</Link>;
  return <Link to="/app" className={className}>{children}</Link>;
}

function item(on?: boolean) {
  return cn("border-l px-2 py-1.5 text-[14px]", on ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg");
}

function Tab({
  to,
  params,
  label,
  on,
}: {
  to: "/markets" | "/screen" | "/app" | "/p/$id/path";
  params?: { id: string };
  label: string;
  on: boolean;
}) {
  const className = cn("grid min-h-14 flex-1 place-items-center text-[12px]", on ? "text-fg" : "text-muted");
  if (to === "/p/$id/path" && params) return <Link to="/p/$id/path" params={params} className={className}>{label}</Link>;
  if (to === "/markets") return <Link to="/markets" className={className}>{label}</Link>;
  if (to === "/screen") return <Link to="/screen" className={className}>{label}</Link>;
  return <Link to="/app" className={className}>{label}</Link>;
}
