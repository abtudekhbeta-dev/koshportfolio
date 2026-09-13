import { createFileRoute } from "@tanstack/react-router";
import { closeOnDay } from "@/lib/kosh/yahoo.server";

export const Route = createFileRoute("/api/close")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbol = url.searchParams.get("symbol") || "";
        const day = url.searchParams.get("day") || "";
        if (!symbol || !day) return Response.json({ error: "symbol and day required" }, { status: 400 });
        const hit = await closeOnDay(symbol, day);
        if (!hit) return Response.json({ error: "no price" }, { status: 404 });
        return Response.json(hit);
      },
    },
  },
});
