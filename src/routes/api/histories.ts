import { createFileRoute } from "@tanstack/react-router";
import { fetchHistories } from "@/lib/kosh/yahoo.server";

export const Route = createFileRoute("/api/histories")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { symbols?: string[]; range?: string };
        const symbols = [...new Set((body.symbols || []).map((s) => String(s).trim()).filter(Boolean))].slice(0, 80);
        const range = body.range || "max";
        const rows = await fetchHistories(symbols, range);
        return Response.json({ rows, range, asOf: new Date().toISOString() });
      },
    },
  },
});
