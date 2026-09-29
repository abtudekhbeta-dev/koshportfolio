import { createFileRoute } from "@tanstack/react-router";
import { fetchDeepMany } from "@/lib/kosh/deep.server";
import { upsertCompanyFunds } from "@/lib/kosh/company-cache.server";
import { advanceEnrichJob, startEnrichJob } from "@/lib/kosh/jobs.server";
import { clientKey, rateLimit, tooLarge } from "@/lib/kosh/guard";
import { executeResearch } from "@/lib/kosh/ai.server";

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
        if (!rateLimit("enrich:" + ip, 40, 10 * 60 * 1000)) {
          return Response.json({ error: "Too many data requests. Try again in a few minutes." }, { status: 429 });
        }
        if (tooLarge(request, 32_000)) return Response.json({ error: "Request is too large." }, { status: 413 });
        const body = (await request.json().catch(() => ({}))) as {
          symbols?: string[];
          research?: { symbol?: string; missing?: string[] };
        };
        if (body.research) {
          if (!rateLimit("research:" + ip, 8, 10 * 60 * 1000)) {
            return Response.json({ ok: false, error: "AI research unavailable" }, { status: 429 });
          }
          const result = await executeResearch({
            symbol: String(body.research.symbol || ""),
            missing: Array.isArray(body.research.missing) ? body.research.missing.map((s) => String(s)) : [],
          });
          return Response.json(result);
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
