import { createFileRoute } from "@tanstack/react-router";
import { fetchFundamentals } from "@/lib/kosh/fundamentals.server";

export const Route = createFileRoute("/api/fundamentals")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbol = String(url.searchParams.get("symbol") || "").slice(0, 24);
        if (!symbol) return Response.json({ fund: null }, { status: 400 });
        const fund = await fetchFundamentals(symbol);
        return Response.json({ fund });
      },
    },
  },
});
