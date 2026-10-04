import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { apiTape } from "@/lib/kosh/api";
import { isIstSession } from "@/lib/kosh/market-hours";
import { quoteStatus, quoteStatusLabel } from "@/lib/kosh/market-data";
import { AddHoldings } from "@/components/add-holdings";
import { AlertBanner } from "@/components/alert-banner";
import { AuthSlot } from "@/components/auth-slot";
import { BrandLink } from "@/components/mark";
import { SearchBar } from "@/components/search-bar";
import { TapeQuote } from "@/components/tape-quote";
import { LayoutSwitch } from "@/components/layout-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const MAIN = [
  { to: "/markets" as const, label: "Markets" },
  { to: "/screen" as const, label: "Screener" },
  { to: "/app" as const, label: "Portfolios" },
];

const SIDE = [
  { to: "/watch" as const, label: "Watch" },
];

const PRIMARY = [...MAIN, ...SIDE];

function navOn(to: string, pathname: string) {
  if (to === "/") return pathname === "/";
  if (to === "/app") return pathname === "/app" || pathname.startsWith("/p/");
  return pathname === to || pathname.startsWith(to + "/");
}

export function AppShell({ children, wide, full }: { children: ReactNode; wide?: boolean; full?: boolean }) {
  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    refetchInterval: isIstSession() ? 5_000 : 60_000,
    staleTime: isIstSession() ? 2_500 : 30_000,
    enabled: !full,
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tapeOn = isIstSession() && (tape.data || []).some((t) => t.price > 0);
  const tapeLabel = quoteStatusLabel(quoteStatus({ session: isIstSession(), price: tapeOn ? 1 : (tape.data || [])[0]?.price }), null);

  return (
    <div className={cn(full ? "flex h-dvh min-h-0 flex-col overflow-hidden" : "min-h-dvh")}>
      {!full ? (
      <div className="border-b border-border bg-bg-elevated">
        <div className="kosh-marquee-wrap overflow-hidden px-3 py-2 sm:px-4">
          <div className="mb-1 flex items-center gap-2 px-1">
            <span data-tape-status className="text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase">
              {tapeLabel}
            </span>
          </div>
          <div className="kosh-tape-track flex w-max items-center">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex min-w-[100vw] shrink-0 items-center gap-8 pr-8">
                {(tape.data || []).map((t) => (
                  <TapeQuote key={t.id + "-" + copy} t={t} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      ) : null}
      <header className={cn("z-30 border-b border-border bg-bg/85 backdrop-blur-md", full ? "shrink-0" : "sticky top-0")}>
        <div className={cn("kosh-app-header mx-auto grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 sm:grid-cols-[1fr_minmax(0,36rem)_1fr] sm:gap-3 sm:px-4", full ? "max-w-none" : wide ? "max-w-[1400px]" : "max-w-6xl")}>
          <div className="flex items-center gap-2">
            <BrandLink to="/" />
            <nav className="hidden items-center gap-1 md:flex">
              {MAIN.map((n) => {
                const on = navOn(n.to, pathname);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "grid h-12 place-items-center rounded-sm bg-surface px-4 text-[16px] font-semibold shadow-[var(--shadow-border)] lg:px-5",
                      on ? "text-fg ring-1 ring-fg/25" : "text-fg/80 hover:text-fg",
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex justify-center px-1">
            <div className="w-full max-w-xl">
              <SearchBar />
            </div>
          </div>
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <nav className="hidden items-center gap-1 md:flex">
              {SIDE.map((n) => {
                const on = navOn(n.to, pathname);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "grid h-9 place-items-center rounded-sm px-3 text-[13px] font-medium",
                      on ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <AddHoldings
              trigger={
                <Button size="default" aria-label="Add holdings">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              }
            />
            <ThemeToggle />
            <LayoutSwitch />
            <AuthSlot />
          </div>
        </div>
        {full ? null : (
          <div className="hidden md:block">
            <FirstStrip />
          </div>
        )}
        <AlertBanner />
      </header>
      <main
        className={cn(
          full
            ? "kosh-main flex min-h-0 flex-1 flex-col overflow-hidden px-0 pb-14 pt-0 md:pb-0"
            : cn("kosh-main mx-auto px-3 pb-24 pt-5 sm:px-4 sm:pb-20 sm:pt-6", wide ? "max-w-[1400px]" : "max-w-6xl"),
        )}
      >
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="flex items-stretch">
          {PRIMARY.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "grid min-h-14 flex-1 place-items-center px-0.5 text-center text-[12px] font-medium leading-tight",
                navOn(n.to, pathname) ? "bg-surface text-fg" : "text-muted",
                (n.to === "/markets" || n.to === "/screen" || n.to === "/app") && "font-semibold",
              )}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function FirstStrip() {
  const done = useKosh((s) => s.tourDone);
  const setTourDone = useKosh((s) => s.setTourDone);
  if (done) return null;
  return (
    <div className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-3 py-3 sm:px-4">
        <p className="min-w-0 flex-1 text-[14px] leading-snug text-fg">
          Search a stock → Screener numbers → Add holdings.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/markets"
            className="inline-flex h-10 items-center rounded-sm bg-accent px-3.5 text-[13px] font-medium text-accent-fg"
          >
            Search
          </Link>
          <Link
            to="/screen"
            className="inline-flex h-10 items-center rounded-sm bg-bg-elevated px-3.5 text-[13px] font-medium shadow-[var(--shadow-border)]"
          >
            Screener
          </Link>
          <AddHoldings trigger={<Button size="default">Add holdings</Button>} />
          <button
            type="button"
            aria-label="Dismiss"
            className="grid size-10 place-items-center text-muted hover:text-fg"
            onClick={() => setTourDone(true)}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
