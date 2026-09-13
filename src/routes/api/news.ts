import { createFileRoute } from "@tanstack/react-router";
import { fetchNews } from "@/lib/kosh/live.server";

export const Route = createFileRoute("/api/news")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbol = String(url.searchParams.get("symbol") || "").trim();
        const name = String(url.searchParams.get("name") || "").trim();
        if (!symbol && !name) return Response.json({ items: [] });
        const items = await fetchNews(symbol || name, name || undefined);
        return Response.json({ items });
      },
    },
  },
});
