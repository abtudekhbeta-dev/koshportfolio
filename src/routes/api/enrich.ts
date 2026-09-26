import { createFileRoute } from "@tanstack/react-router";
import { fetchDeepMany } from "@/lib/kosh/deep.server";
import { upsertCompanyFunds } from "@/lib/kosh/company-cache.server";

export const Route = createFileRoute("/api/enrich")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { symbols?: string[] };
        const symbols = [...new Set((body.symbols || []).map((s) => String(s).trim()).filter(Boolean))].slice(0, 40);
        if (!symbols.length) return Response.json({ funds: {}, sources: {} });
        const got = await fetchDeepMany(symbols);
        await upsertCompanyFunds(got.funds || {}, got.sources || {});
        return Response.json(got);
      },
    },
  },
});
