import { createFileRoute } from "@tanstack/react-router";
import { loadIndexBasket } from "@/lib/kosh/index-basket.server";
import { NIFTY_CATALOGUE } from "@/lib/kosh/nifty-catalogue";

export const Route = createFileRoute("/api/index-constituents")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbol = url.searchParams.get("symbol") || "";
        const fresh = url.searchParams.get("fresh") === "1";
        const row = NIFTY_CATALOGUE.find((item) => item.symbol === symbol);
        if (!row) return Response.json({ unavailable: "Unknown index." }, { status: 404 });
        try {
          const basket = await loadIndexBasket(row, fresh);
          return Response.json(basket);
        } catch {
          return Response.json({
            symbol: row.symbol,
            name: row.name,
            rows: [],
            weightSum: 0,
            source: null,
            benchmark: null,
            asOf: null,
            note: null,
            unavailable: "The holdings feed did not answer. Try this index again in a moment.",
          });
        }
      },
    },
  },
});
