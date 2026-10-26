import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ClassicOverview } from "@/components/terminal/classic-overview";
import { MarketOverview } from "@/components/terminal/market-overview";
import { MarketsDesk } from "@/components/terminal/markets-desk";
import { MarketsSwitch } from "@/components/terminal/markets-switch";
import { LedgerTerminal } from "@/components/ledger/ledger-terminal";
import { readLayout, useAppLayout } from "@/lib/layout-mode";

export type MarketsSearch = { view?: "terminal" | "overview"; symbol?: string; name?: string };

export const Route = createFileRoute("/markets")({
  ssr: false,
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
  if (terminal && layout === "ledger") return <LedgerTerminal host="overlay" />;
  return (
    <AppShell full={terminal}>
      {terminal ? (
        layout === "classic" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <MarketsSwitch view="terminal" />
            <LedgerTerminal host="embed" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <MarketsSwitch view="terminal" />
            <MarketsDesk />
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
