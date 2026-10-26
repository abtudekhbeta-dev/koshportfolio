import { createFileRoute } from "@tanstack/react-router";
import { refreshCashFlows } from "@/lib/kosh/market-flows.server";

let lastCall = 0;

/**
 * On-demand cash-flow refresh. Production does not use a local timer.
 * A host that can call this route on a schedule (for example Vercel Cron at 30 13 * * 1-5 UTC, 19:00 IST)
 * should do so. Opening the flow API also refreshes when the stored session is behind the expected trading day.
 */
export const Route = createFileRoute("/api/flows-refresh")({
  server: {
    handlers: {
      POST: async () => {
        const now = Date.now();
        if (now - lastCall < 15_000) {
          const health = await refreshCashFlows();
          return Response.json({ ok: true, joined: true, health });
        }
        lastCall = now;
        const health = await refreshCashFlows();
        return Response.json({ ok: health.status !== "unavailable", joined: false, health });
      },
    },
  },
});
