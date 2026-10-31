import { createFileRoute } from "@tanstack/react-router";
import { PublicHome } from "@/components/landing/public-home";
import { LedgerLanding } from "@/components/ledger-shell";
import { StudioLanding } from "@/components/studio-shell";
import { useAppLayout } from "@/lib/layout-mode";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const layout = useAppLayout();
  if (layout === "studio") return <StudioLanding />;
  if (layout === "ledger") return <LedgerLanding />;
  return <PublicHome />;
}
