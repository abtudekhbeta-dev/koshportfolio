import { createFileRoute } from "@tanstack/react-router";
import { searchSymbols } from "@/lib/kosh/yahoo.server";
import { searchNse } from "@/lib/kosh/universe";

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const q = new URL(request.url).searchParams.get("q") || "";
        if (!q.trim()) return Response.json({ quotes: [] });
        const local = searchNse(q.trim(), 10).map((x) => ({ symbol: x.symbol, name: x.name, exch: "NSE" }));
        const seen = new Set(local.map((x) => x.symbol.toUpperCase()));
        const remote = await searchSymbols(q.trim());
        const rest = remote.filter((x) => {
          const bare = x.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
          if (seen.has(bare) || seen.has(x.symbol.toUpperCase())) return false;
          seen.add(bare);
          return true;
        });
        return Response.json({ quotes: [...local, ...rest].slice(0, 16) });
      },
    },
  },
});
