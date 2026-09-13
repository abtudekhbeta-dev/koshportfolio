import { createFileRoute } from "@tanstack/react-router";
import { resolveHistory } from "@/lib/kosh/yahoo.server";

export const Route = createFileRoute("/api/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbol = String(url.searchParams.get("symbol") || "").trim();
        const range = String(url.searchParams.get("range") || "max");
        if (!symbol) return Response.json({ error: "symbol required" }, { status: 400 });
        const d = await resolveHistory(symbol, range);
        if (!d) {
          return Response.json({
            input: symbol,
            symbol,
            name: symbol,
            price: 0,
            previousClose: 0,
            changePct: 0,
            high52: 0,
            low52: 0,
            first: null,
            last: null,
            sessions: 0,
            bars: [],
            missing: true,
          });
        }
        return Response.json({ ...d, input: symbol, missing: false });
      },
    },
  },
});
