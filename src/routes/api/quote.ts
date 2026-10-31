import { createFileRoute } from "@tanstack/react-router";
import { fetchFastPrints, fetchQuotes } from "@/lib/kosh/yahoo.server";
import { MARKET_PROVIDER } from "@/lib/kosh/market-data";

export const Route = createFileRoute("/api/quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbols = String(url.searchParams.get("symbols") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 80);
        const fast = url.searchParams.get("fast") === "1";
        const quotes = fast ? await fetchFastPrints(symbols) : await fetchQuotes(symbols);
        return Response.json({
          quotes,
          provider: { id: MARKET_PROVIDER.id, name: MARKET_PROVIDER.name, delay: MARKET_PROVIDER.delay },
        });
      },
    },
  },
});
