import { createFileRoute } from "@tanstack/react-router";
import { fetchDeepMany } from "@/lib/kosh/deep.server";
import { loadCompanyFunds, upsertCompanyFunds } from "@/lib/kosh/company-cache.server";
import { advanceEnrichJob, startEnrichJob } from "@/lib/kosh/jobs.server";
import { clientKey, rateLimit, tooLarge } from "@/lib/kosh/guard";
import { executeResearch } from "@/lib/kosh/ai.server";
import { commitFund } from "@/lib/kosh/complete";
import { fetchScreenerOne, rememberScreenRow } from "@/lib/kosh/live.server";
import type { Fundamentals } from "@/lib/kosh/types";

export const Route = createFileRoute("/api/enrich")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ip = clientKey(request);
        if (!rateLimit("enrich:" + ip, 80, 10 * 60 * 1000)) {
          return Response.json({ error: "Too many data requests. Try again in a few minutes." }, { status: 429 });
        }
        const id = new URL(request.url).searchParams.get("job") || "";
        const job = await advanceEnrichJob(id, 1);
        if (!job) return Response.json({ error: "That verification job is not running." }, { status: 404 });
        return Response.json(job);
      },
      POST: async ({ request }) => {
        const ip = clientKey(request);
        if (!rateLimit("enrich:" + ip, 4000, 10 * 60 * 1000)) {
          return Response.json({ error: "Too many reads. Try again in a few minutes." }, { status: 429 });
        }
        if (tooLarge(request, 400_000)) return Response.json({ error: "Request is too large." }, { status: 413 });
        const body = (await request.json().catch(() => ({}))) as {
          symbols?: string[];
          research?: { symbol?: string; missing?: string[] };
          market?: string[];
          commit?: { symbol?: string; fund?: Fundamentals };
        };
        if (body.research) {
          if (!rateLimit("research:" + ip, 2000, 10 * 60 * 1000)) {
            return Response.json({ ok: false, error: "Too many reads. Try again in a few minutes." }, { status: 429 });
          }
          const result = await executeResearch({
            symbol: String(body.research.symbol || ""),
            missing: Array.isArray(body.research.missing) ? body.research.missing.map((s) => String(s)) : [],
          });
          return Response.json(result);
        }
        if (Array.isArray(body.market)) {
          if (!rateLimit("market:" + ip, 500, 10 * 60 * 1000)) {
            return Response.json({ error: "Too many reads. Try again in a few minutes." }, { status: 429 });
          }
          const symbols = [...new Set(body.market.map((s) => String(s).trim()).filter(Boolean))].slice(0, 24);
          const rows = [];
          for (const symbol of symbols) {
            const row = await fetchScreenerOne(symbol);
            if (row) {
              rememberScreenRow(row);
              rows.push(row);
            }
          }
          return Response.json({ rows });
        }
        if (body.commit?.fund && body.commit.symbol) {
          const symbol = String(body.commit.symbol).replace(/\.(NS|BO)$/i, "").toUpperCase();
          const cache = await loadCompanyFunds([symbol]);
          const cached = cache.get(symbol)?.fund || null;
          const fund = commitFund(cached, body.commit.fund, symbol);
          const wrote = await upsertCompanyFunds({ [symbol]: fund }, { [symbol]: ["ai-researched"] });
          if (!wrote) return Response.json({ ok: false, error: "Company cache did not save." }, { status: 503 });
          return Response.json({ ok: true, symbol, fund });
        }
        const symbols = [...new Set((body.symbols || []).map((s) => String(s).trim()).filter(Boolean))].slice(0, 40);
        if (!symbols.length) return Response.json({ funds: {}, sources: {} });
        if (symbols.length > 3) {
          const job = startEnrichJob(symbols);
          return Response.json({ ...job, funds: {}, sources: {} });
        }
        const got = await fetchDeepMany(symbols);
        await upsertCompanyFunds(got.funds || {}, got.sources || {});
        return Response.json(got);
      },
    },
  },
});