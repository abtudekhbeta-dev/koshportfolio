import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/picks")({ ssr: false, component: PicksRedirect });

function PicksRedirect() {
  return <Navigate to="/screen" />;
}
