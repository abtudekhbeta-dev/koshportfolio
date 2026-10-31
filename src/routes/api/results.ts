import { createFileRoute } from "@tanstack/react-router";
import { loadResultsCalendar } from "@/lib/kosh/results-calendar.server";

export const Route = createFileRoute("/api/results")({
  server: {
    handlers: {
      GET: async () => Response.json(await loadResultsCalendar()),
    },
  },
});
