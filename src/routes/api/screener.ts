import { createFileRoute } from "@tanstack/react-router";
import { fetchScreener, fetchScreenerOne } from "@/lib/kosh/live.server";

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
        const add = new URL(request.url).searchParams.get("add") || "";
        const extras = [
          ...new Set(
            add
              .split(",")
              .map((s) => s.replace(/\.(NS|BO)$/i, "").trim().toUpperCase())
              .filter(Boolean),
          ),
        ].slice(0, 80);
        const rows = await fetchScreener();
        if (!extras.length) return Response.json({ rows, asOf: new Date().toISOString() });
        const have = new Set(rows.filter((r) => r.price > 0).map((r) => r.symbol.toUpperCase()));
        const need = extras.filter((s) => !have.has(s));
        const more = need.length ? await hydrate(need) : [];
        return Response.json({ rows: [...rows, ...more], asOf: new Date().toISOString() });
      },
    },
  },
});
