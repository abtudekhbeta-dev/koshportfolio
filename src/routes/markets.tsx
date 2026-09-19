import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MarketsDesk } from "@/components/terminal/markets-desk";

export const Route = createFileRoute("/markets")({ ssr: false, component: Markets });

function Markets() {
  return (
    <AppShell full>
      <MarketsDesk />
    </AppShell>
  );
}
