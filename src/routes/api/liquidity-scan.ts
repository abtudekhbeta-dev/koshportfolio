import { createFileRoute } from "@tanstack/react-router";
import { clientKey, rateLimit } from "@/lib/kosh/guard";
import { scanOrRecall, type ScanUniverse } from "@/lib/kosh/liquidity-scan.server";
import { parseCr, type CapBand, type McapSpec } from "@/lib/kosh/liquidity-book";
import type { LiqTimeframe } from "@/lib/kosh/liquidity";

const TF = new Set(["15m", "1H", "4H", "1D", "1W", "1M"]);
const UNI = new Set(["nifty50", "nifty100", "nifty200", "nifty500", "all", "nse", "bse", "watch", "portfolio"]);
const BANDS = new Set(["all", "large", "mid", "small", "micro", "nano"]);

export const Route = createFileRoute("/api/liquidity-scan")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ip = clientKey(request);
        if (!rateLimit("liq:" + ip, 400, 10 * 60 * 1000)) {
          return Response.json({ error: "Too many scans. Wait a few minutes and try again." }, { status: 429 });
        }
        const url = new URL(request.url);
        const timeframe = url.searchParams.get("tf") || "1W";
        const universe = url.searchParams.get("universe") || "nifty50";
        if (!TF.has(timeframe) || !UNI.has(universe)) {
          return Response.json({ error: "Unknown timeframe or universe." }, { status: 400 });
        }
        const cap = universe === "portfolio" ? 400 : 80;
        const symbols = (url.searchParams.get("symbols") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, cap);
        const cursor = Number(url.searchParams.get("cursor") || "0");
        const mode = url.searchParams.get("mode") === "read" ? "read" : "scan";
        const band = url.searchParams.get("cap") || "all";
        const mcap: McapSpec = {
          band: (BANDS.has(band) ? band : "all") as CapBand | "all",
          minCr: parseCr(url.searchParams.get("mcapMin") || ""),
          maxCr: parseCr(url.searchParams.get("mcapMax") || ""),
          includeUnknown: url.searchParams.get("unknown") === "1",
        };
        const page = await scanOrRecall({
          timeframe: timeframe as LiqTimeframe,
          universe: universe as ScanUniverse,
          symbols,
          cursor: Number.isFinite(cursor) ? cursor : 0,
          fresh: url.searchParams.get("fresh") === "1",
          mode,
          mcap,
        });
        return Response.json(page);
      },
    },
  },
});