import { createFileRoute } from "@tanstack/react-router";
import { fetchWiki } from "@/lib/kosh/live.server";

export const Route = createFileRoute("/api/wiki")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const name = String(new URL(request.url).searchParams.get("name") || "").trim();
        if (!name) return Response.json({ card: null });
        const card = await fetchWiki(name);
        return Response.json({ card });
      },
    },
  },
});
