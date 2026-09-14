import { createFileRoute, Navigate } from "@tanstack/react-router";

/** Trade scans live on Screener. Keep this path so old links do not 404. */
export const Route = createFileRoute("/trade")({
  ssr: false,
  component: function TradeRedirect() {
    return <Navigate to="/screen" />;
  },
});
