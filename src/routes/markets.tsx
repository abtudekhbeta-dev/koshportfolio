import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ClassicOverview } from "@/components/terminal/classic-overview";
import { MarketOverview } from "@/components/terminal/market-overview";
import { MarketsSwitch } from "@/components/terminal/markets-switch";
import { readLayout, useAppLayout } from "@/lib/layout-mode";

const MarketsDesk = lazy(() => import("@/components/terminal/markets-desk").then((m) => ({ default: m.MarketsDesk })));
const LedgerTerminal = lazy(() => import("@/components/ledger/ledger-terminal").then((m) => ({ default: m.LedgerTerminal })));

export type MarketsSearch = { view?: "terminal" | "overview"; symbol?: string; name?: string };

export const Route = createFileRoute("/markets")({
  validateSearch: (s: Record<string, unknown>): MarketsSearch => {
    const symbol = typeof s.symbol === "string" ? s.symbol.trim().slice(0, 32) : "";
    const name = typeof s.name === "string" ? s.name.trim().slice(0, 80) : "";
    return {
      view: s.view === "overview" ? "overview" : "terminal",
      ...(symbol ? { symbol } : {}),
      ...(name ? { name } : {}),
    };
  },
  component: Markets,
});

function Markets() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { view } = Route.useSearch();
  const hooked = useAppLayout();
  const layout = typeof document === "undefined" ? hooked : readLayout();
  if (pathname.startsWith("/markets/")) return <Outlet />;
  const terminal = view !== "overview";
  if (terminal && layout === "ledger") {
    return (
      <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-muted">Loading terminal…</div>}>
        <LedgerTerminal host="overlay" />
      </Suspense>
    );
  }
  return (
    <AppShell full={terminal}>
      {terminal ? (
        layout === "classic" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <Suspense fallback={<div className="grid min-h-40 flex-1 place-items-center text-sm text-muted">Loading terminal…</div>}>
              <LedgerTerminal host="embed" />
            </Suspense>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Suspense fallback={<div className="grid min-h-40 flex-1 place-items-center text-sm text-muted">Loading terminal…</div>}>
              <MarketsDesk />
            </Suspense>
          </div>
        )
      ) : (
        <>
          <MarketsSwitch view="overview" />
          {layout === "classic" ? <ClassicOverview /> : <MarketOverview />}
        </>
      )}
    </AppShell>
  );
}
