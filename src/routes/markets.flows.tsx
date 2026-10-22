import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MarketFlowsPage } from "@/components/terminal/market-flows";

export const Route = createFileRoute("/markets/flows")({
  ssr: false,
  component: function FlowsRoute() {
    return (
      <AppShell>
        <MarketFlowsPage />
      </AppShell>
    );
  },
});
