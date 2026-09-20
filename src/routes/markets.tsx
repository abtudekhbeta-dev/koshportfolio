import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MarketOverview } from "@/components/terminal/market-overview";
import { MarketsDesk } from "@/components/terminal/markets-desk";
import { MarketsSwitch } from "@/components/terminal/markets-switch";

export type MarketsSearch = { view?: "terminal" | "overview" };

export const Route = createFileRoute("/markets")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): MarketsSearch => ({
    view: s.view === "overview" ? "overview" : "terminal",
  }),
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
