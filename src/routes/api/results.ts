import { createFileRoute } from "@tanstack/react-router";
import { loadResultsCalendar } from "@/lib/kosh/results-calendar.server";

export const Route = createFileRoute("/api/results")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const fresh = new URL(request.url).searchParams.get("fresh") === "1";
        return Response.json(await loadResultsCalendar({ fresh }));
      },
    },
  },
});
