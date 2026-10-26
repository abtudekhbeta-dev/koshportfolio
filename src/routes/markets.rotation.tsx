import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RrgDesk } from "@/components/terminal/rrg-desk";

export const Route = createFileRoute("/markets/rotation")({
  ssr: false,
  component: function RotationRoute() {
    return (
      <AppShell wide>
        <RrgDesk />
      </AppShell>
    );
  },
});
