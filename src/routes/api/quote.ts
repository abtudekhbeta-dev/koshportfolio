import { createFileRoute } from "@tanstack/react-router";
import { fetchQuotes } from "@/lib/kosh/yahoo.server";

export const Route = createFileRoute("/api/quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbols = String(url.searchParams.get("symbols") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 80);
        const quotes = await fetchQuotes(symbols);
        return Response.json({ quotes });
      },
    },
  },
});
