import { createFileRoute } from "@tanstack/react-router";
import { fetchTape } from "@/lib/kosh/yahoo.server";

export const Route = createFileRoute("/api/tape")({
  server: {
    handlers: {
      GET: async () => {
        const rows = await fetchTape();
        return Response.json({ rows, asOf: new Date().toISOString() });
      },
    },
  },
});
