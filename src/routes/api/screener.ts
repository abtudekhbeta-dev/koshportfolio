import { createFileRoute } from "@tanstack/react-router";
import { fetchScreener, fetchScreenerOne, fetchScreenerUniverse } from "@/lib/kosh/live.server";
import { getNiftySnapshot } from "@/lib/kosh/nifty-snap";
import { mergeScreenRows } from "@/lib/kosh/screens";

async function hydrate(symbols: string[]) {
  const out: Awaited<ReturnType<typeof fetchScreenerOne>>[] = [];
  let i = 0;
  const n = Math.min(6, Math.max(1, symbols.length));
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < symbols.length) {
        const s = symbols[i++];
        const row = await fetchScreenerOne(s);
        if (row && row.price > 0) out.push(row);
      }
    }),
  );
  return out.filter((r): r is NonNullable<typeof r> => Boolean(r));
}

export const Route = createFileRoute("/api/screener")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const add = url.searchParams.get("add") || "";
        const depth = url.searchParams.get("depth") || "";
        const extras = [
          ...new Set(
            add
              .split(",")
              .map((s) => s.replace(/\.(NS|BO)$/i, "").trim().toUpperCase())
              .filter(Boolean),
          ),
        ].slice(0, 80);
        const rows = depth === "full" ? await fetchScreener() : await fetchScreenerUniverse();
        const merged = depth === "full" ? rows : mergeScreenRows(rows, []);
        if (!extras.length) return Response.json({ rows: merged, nifty: getNiftySnapshot(), asOf: new Date().toISOString() });
        const have = new Set(merged.filter((r) => r.price > 0).map((r) => r.symbol.toUpperCase()));
        const need = extras.filter((s) => !have.has(s));
        const more = need.length ? await hydrate(need) : [];
        return Response.json({ rows: [...merged, ...more], nifty: getNiftySnapshot(), asOf: new Date().toISOString() });
      },
    },
  },
});
