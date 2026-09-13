import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "./login";

export const Route = createFileRoute("/signup")({
  ssr: false,
  component: Signup,
  head: () => ({ meta: [{ title: "Create account · Kosh" }] }),
});

function Signup() {
  return <AuthScreen initial="up" />;
}