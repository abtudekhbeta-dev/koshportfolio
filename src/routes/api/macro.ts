import { createFileRoute } from "@tanstack/react-router";
import { fetchMacro } from "@/lib/kosh/macro.server";

export const Route = createFileRoute("/api/macro")({
  server: {
    handlers: {
      GET: async () => {
        const pack = await fetchMacro();
        return Response.json(pack);
      },
    },
  },
});
