import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MarketOverview } from "@/components/terminal/market-overview";
import { MarketsDesk } from "@/components/terminal/markets-desk";
import { MarketsSwitch } from "@/components/terminal/markets-switch";

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
  const { view } = Route.useSearch();
  const terminal = view !== "overview";
  return (
    <AppShell full={terminal}>
      {terminal ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <MarketsSwitch view="terminal" />
          <MarketsDesk />
        </div>
      ) : (
        <>
          <MarketsSwitch view="overview" />
          <MarketOverview />
        </>
      )}
    </AppShell>
  );
}
