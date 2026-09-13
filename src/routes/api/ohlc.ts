import { createFileRoute } from "@tanstack/react-router";
import { fetchOhlc } from "@/lib/kosh/yahoo.server";

export const Route = createFileRoute("/api/ohlc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbol = String(url.searchParams.get("symbol") || "").trim();
        const range = String(url.searchParams.get("range") || "1y");
        const interval = String(url.searchParams.get("interval") || "1d");
        if (!symbol) return Response.json({ error: "symbol required" }, { status: 400 });
        const pack = await fetchOhlc(symbol, range, interval);
        return Response.json(pack);
      },
    },
  },
});
