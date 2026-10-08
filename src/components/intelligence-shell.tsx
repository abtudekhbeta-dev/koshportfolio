import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { apiTape } from "@/lib/kosh/api";
import { isIstSession } from "@/lib/kosh/market-hours";
import { quoteStatus, quoteStatusLabel } from "@/lib/kosh/market-data";
import { AddHoldings } from "@/components/add-holdings";
import { AlertBanner } from "@/components/alert-banner";
import { AuthSlot } from "@/components/auth-slot";
import { SearchBar } from "@/components/search-bar";
import { LayoutSwitch } from "@/components/layout-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

function navOn(to: string, pathname: string) {
  if (to === "/app") return pathname === "/app" || pathname.startsWith("/p/");
  return pathname === to || pathname.startsWith(to + "/");
}

export function IntelligenceShell({ children, full }: { children: ReactNode; wide?: boolean; full?: boolean }) {
  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    refetchInterval: isIstSession() ? 5_000 : 60_000,
    staleTime: isIstSession() ? 2_500 : 30_000,
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const tapeOn = isIstSession() && (tape.data || []).some((t) => t.price > 0);
  const tapeLabel = quoteStatusLabel(
    quoteStatus({ session: isIstSession(), price: tapeOn ? 1 : (tape.data || [])[0]?.price }),
    null,
  );
  const port = pathname.match(/^\/p\/([^/]+)/)?.[1] || null;
  const marketsOverview = pathname.startsWith("/markets") && /(?:^|[?&])view=overview(?:&|$)/.test(searchStr);

  return (
    <div className={cn("iq-shell min-h-dvh md:grid md:grid-cols-[200px_minmax(0,1fr)]", full && "flex h-dvh flex-col overflow-hidden md:grid")}>
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-bg px-3 py-4 md:flex">
        <Link to="/" className="px-2 text-[15px] font-semibold tracking-tight">
          Kosh
        </Link>
        <Rail label="Markets">
          <RailLink to="/markets" search={{ view: "terminal" }} on={pathname.startsWith("/markets") && !marketsOverview}>
            Terminal
          </RailLink>
          <RailLink to="/markets" search={{ view: "overview" }} on={marketsOverview}>
            Overview
          </RailLink>
        </Rail>
        <Rail label="Research">
          <RailLink to="/watch" on={navOn("/watch", pathname)}>
            Watch
          </RailLink>
          <RailLink to="/screen" on={navOn("/screen", pathname)}>
            Screener
          </RailLink>
          <RailLink to="/compare" on={navOn("/compare", pathname)}>
            Compare
          </RailLink>
        </Rail>
        <Rail label="Portfolios">
          <RailLink to="/app" on={pathname === "/app"}>
            Portfolios
          </RailLink>
          {port ? (
            <RailLink to="/p/$id" params={{ id: port }} on={pathname.startsWith("/p/")}>
              This portfolio
            </RailLink>
          ) : null}
        </Rail>
        <div className="mt-auto grid gap-2 border-t border-border pt-3">
          <LayoutSwitch />
          <AuthSlot />
        </div>
      </aside>
      <div className={cn("flex min-w-0 flex-col", full && "min-h-0 flex-1")}>
        <header className={cn("z-30 border-b border-border bg-bg/90 backdrop-blur-md", full ? "shrink-0" : "sticky top-0")}>
          <div className="flex h-12 items-center gap-2 px-3">
            <Link to="/" className="text-[14px] font-semibold md:hidden">
              Kosh
            </Link>
            <div className="min-w-0 flex-1">
              <SearchBar hint="⌘K" dense placeholder="Search a stock, index, portfolio, or page" />
            </div>
            <span data-tape-status className="hidden shrink-0 text-[11px] text-subtle lg:inline">
              {tapeLabel}
            </span>
            <AlertMenu />
            <AddHoldings
              trigger={
                <Button size="sm" aria-label="Add holdings">
                  <Plus className="size-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              }
            />
            <ThemeToggle />
            <span className="md:hidden">
              <LayoutSwitch />
            </span>
            <span className="md:hidden">
              <AuthSlot />
            </span>
          </div>
          <AlertBanner />
        </header>
        <main className={cn(full ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "min-w-0 px-3 py-4 pb-24 sm:px-5 md:pb-8")}>{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex">
          <Tab to="/markets" label="Markets" on={navOn("/markets", pathname)} />
          <Tab to="/watch" label="Watch" on={navOn("/watch", pathname)} />
          <Tab to="/screen" label="Screen" on={navOn("/screen", pathname)} />
          <Tab to="/app" label="Portfolio" on={navOn("/app", pathname)} />
        </div>
      </nav>
    </div>
  );
}

function Rail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <div className="px-2 text-[10px] font-medium tracking-[0.14em] text-subtle uppercase">{label}</div>
      <div className="mt-1 grid">{children}</div>
    </div>
  );
}

function RailLink({
  to,
  params,
  search,
  on,
  children,
}: {
  to: "/markets" | "/watch" | "/screen" | "/compare" | "/app" | "/p/$id";
  params?: { id: string };
  search?: { view: "terminal" | "overview" };
  on?: boolean;
  children: ReactNode;
}) {
  const className = cn("rounded-sm px-2 py-1.5 text-[13px]", on ? "bg-surface text-fg" : "text-muted hover:text-fg");
  if (to === "/p/$id" && params) {
    return (
      <Link to="/p/$id" params={params} className={className}>
        {children}
      </Link>
    );
  }
  if (to === "/markets") {
    return (
      <Link to="/markets" search={search ?? { view: "terminal" }} className={className}>
        {children}
      </Link>
    );
  }
  if (to === "/watch") return <Link to="/watch" className={className}>{children}</Link>;
  if (to === "/screen") return <Link to="/screen" className={className}>{children}</Link>;
  if (to === "/compare") return <Link to="/compare" className={className}>{children}</Link>;
  return (
    <Link to="/app" className={className}>
      {children}
    </Link>
  );
}

function Tab({ to, label, on }: { to: "/markets" | "/watch" | "/screen" | "/app"; label: string; on: boolean }) {
  return (
    <Link to={to} className={cn("grid min-h-14 flex-1 place-items-center text-[12px] font-medium", on ? "text-fg" : "text-muted")}>
      {label}
    </Link>
  );
}

function AlertMenu() {
  const alerts = useKosh((s) => s.alerts);
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={alerts.length ? `${alerts.length} alerts` : "Alerts"}
        onClick={() => setOpen((v) => !v)}
        className="h-8 rounded-sm px-2 text-[12px] text-muted hover:text-fg"
      >
        Alerts{alerts.length ? ` ${alerts.length}` : ""}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-1 w-64 rounded-sm border border-border bg-surface p-2">
          {alerts.length ? (
            alerts.slice(0, 12).map((a) => (
              <Link
                key={a.id}
                to="/s/$symbol"
                params={{ symbol: a.symbol }}
                className="block rounded-sm px-2 py-1.5 text-[13px] hover:bg-bg"
                onClick={() => setOpen(false)}
              >
                <span className="font-medium">{a.symbol}</span>
                <span className="text-muted">
                  {" "}
                  · {a.kind || "price"} {a.dir} {a.price}
                </span>
              </Link>
            ))
          ) : (
            <p className="px-2 py-2 text-[12px] leading-relaxed text-muted">No alerts yet. Set a price, move, or 52-week alert on a stock.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
