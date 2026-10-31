import { createFileRoute } from "@tanstack/react-router";
import { mergeSearchQuotes } from "@/lib/kosh/listing";
import { searchSymbols } from "@/lib/kosh/yahoo.server";
import { searchNse } from "@/lib/kosh/universe";
import { searchMaster } from "@/lib/kosh/master.server";

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const q = new URL(request.url).searchParams.get("q") || "";
        if (!q.trim()) return Response.json({ quotes: [] });
        const live = await searchMaster(q.trim(), 10).catch(() => []);
        const local = (live.length ? live : searchNse(q.trim(), 10)).map((x) => ({
          symbol: x.symbol,
          name: x.name,
          exch: "NSE",
        }));
        const remote = await searchSymbols(q.trim());
        return Response.json({ quotes: mergeSearchQuotes(local, remote, 16) });
      },
    },
  },
});
