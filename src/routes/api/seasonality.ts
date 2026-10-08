import { createFileRoute } from "@tanstack/react-router";
import { clientKey, rateLimit, tooLarge } from "@/lib/kosh/guard";
import { ensureMany, persistSourcedClose, seriesBounds, type StoredSeries } from "@/lib/kosh/hist.server";
import { SEASON_VERSION, acceptSourcedClose } from "@/lib/kosh/seasonality";

function slim(row: StoredSeries) {
  const b = seriesBounds(row.days);
  return {
    symbol: row.symbol,
    firstDay: b.firstDay,
    lastDay: b.lastDay,
    source: row.source,
    note: row.note,
    sessions: row.days.length,
    aiDays: row.aiDays,
    conflicts: row.conflicts,
    monthly: row.monthly,
    quarterly: row.quarterly,
  };
}

export const Route = createFileRoute("/api/seasonality")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = clientKey(request);
        if (!rateLimit("season:" + ip, 40, 10 * 60 * 1000)) {
          return Response.json({ error: "Too many history reads. Try again in a few minutes." }, { status: 429 });
        }
        if (tooLarge(request, 80_000)) return Response.json({ error: "Request is too large." }, { status: 413 });
        const body = (await request.json().catch(() => ({}))) as {
          symbols?: string[];
          benchmark?: boolean;
          refresh?: boolean;
          recover?: {
            symbol?: string;
            year?: number;
            month?: number;
            value?: number;
            sourceUrl?: string;
            sourceName?: string;
            evidence?: string;
            methodology?: string;
          };
        };
        if (body.recover) {
          const rec = body.recover;
          const accepted = acceptSourcedClose({
            sourceUrl: rec.sourceUrl,
            sourceName: rec.sourceName,
            evidence: rec.evidence,
            methodology: rec.methodology,
            value: rec.value,
            year: Number(rec.year),
            month: Number(rec.month),
          });
          if (!accepted || !rec.symbol) {
            return Response.json({ ok: false, reason: "That reply is not a sourced close for the requested month." });
          }
          const saved = await persistSourcedClose({
            symbol: rec.symbol,
            day: accepted.day,
            price: accepted.price,
            sourceUrl: String(rec.sourceUrl),
            sourceName: String(rec.sourceName),
            evidence: String(rec.evidence || ""),
          });
          return Response.json(saved);
        }
        const symbols = [...new Set((body.symbols || []).map((s) => String(s || "").trim()).filter(Boolean))].slice(0, 72);
        if (!symbols.length) return Response.json({ error: "symbol required" }, { status: 400 });
        const want = body.benchmark ? [...symbols, "^NSEI"] : symbols;
        const rows = await ensureMany(want, Boolean(body.refresh));
        const bench = rows.find((r) => r.symbol === "^NSEI") || null;
        const series = rows.filter((r) => r.symbol !== "^NSEI").map((r) => slim(r));
        return Response.json({
          version: SEASON_VERSION,
          asOf: new Date(Date.now() + 19800 * 1000).toISOString().slice(0, 10),
          series,
          benchmark: bench ? slim(bench) : null,
        });
      },
    },
  },
});
