import { createFileRoute } from "@tanstack/react-router";
import { fetchFundamentals } from "@/lib/kosh/fundamentals.server";
import { fetchDeepFundamentals } from "@/lib/kosh/deep.server";
import { loadCompanyFunds } from "@/lib/kosh/company-cache.server";
import { fillFundamentals } from "@/lib/kosh/fund-merge";
import { stampCard } from "@/lib/kosh/evidence";
import { clientKey, rateLimit } from "@/lib/kosh/guard";

export const Route = createFileRoute("/api/fundamentals")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ip = clientKey(request);
        if (!rateLimit("fund:" + ip, 60, 10 * 60 * 1000)) {
          return Response.json({ error: "Too many data requests. Try again in a few minutes." }, { status: 429 });
        }
        const url = new URL(request.url);
        const symbol = String(url.searchParams.get("symbol") || "").slice(0, 24);
        if (!symbol) return Response.json({ fund: null }, { status: 400 });
        const deep = url.searchParams.get("deep") === "1" || url.searchParams.get("deep") === "true";
        if (deep) {
          const got = await fetchDeepFundamentals(symbol);
          return Response.json({ fund: got.fund, sources: got.sources });
        }
        const [live, cache] = await Promise.all([
          fetchFundamentals(symbol).catch(() => null),
          loadCompanyFunds([symbol]),
        ]);
        const cached = cache.get(symbol.replace(/\.(NS|BO)$/i, "").toUpperCase());
        if (live && cached?.fund) {
          return Response.json({ fund: stampCard(fillFundamentals(live, cached.fund)), sources: cached.sources });
        }
        if (live) return Response.json({ fund: stampCard(live) });
        if (cached?.fund) return Response.json({ fund: stampCard(cached.fund), sources: cached.sources });
        return Response.json({ fund: null });
      },
    },
  },
});
