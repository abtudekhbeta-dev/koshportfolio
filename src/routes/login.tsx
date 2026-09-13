import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { BrandLink } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Seg } from "@/components/seg";
import { HeroMix } from "@/components/landing/hero-mix";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: () => <AuthScreen initial="in" />,
  head: () => ({ meta: [{ title: "Sign in · Kosh" }] }),
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

export function AuthScreen({ initial = "in" }: { initial?: "in" | "up" }) {
  const [mode, setMode] = useState<"in" | "up">(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      if (mode === "up") {
        const { error } = await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
        if (error) throw new Error(error.message || "Could not create account");
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message || "No match");
      }
      await authClient.getSession();
      void navigate({ to: "/app" });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <BrandLink to="/" />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-[28px] font-semibold tracking-tight">{mode === "in" ? "Sign in" : "Create account"}</h1>
          <p className="mt-2 text-sm text-muted">Google, X, or email. Guest keeps the portfolio on this device only.</p>

          <Seg
            className="mt-6 grid w-full grid-cols-2"
            value={mode}
            onChange={(v) => {
              setMode(v);
              setMsg("");
            }}
            options={[
              { id: "in", label: "Sign in" },
              { id: "up", label: "Create account" },
            ]}
          />

          {authEnabled ? (
            <div className="mt-6 grid gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => void signIn(p.providerId, { callbackURL: "/app", errorCallbackURL: "/login" })}
                >
                  {p.idp === "google" ? <GoogleMark /> : <XMark />}
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
          )}

          <div className="my-6 flex items-center gap-3 text-[11px] tracking-[0.08em] text-subtle uppercase">
            <span className="h-px flex-1 bg-border" />
            Email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="grid gap-3" onSubmit={(e) => void onEmail(e)}>
            {mode === "up" ? (
              <Label>
                Name
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Label>
            ) : null}
            <Label>
              Email
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
            </Label>
            <Label>
              Password
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                required
                minLength={8}
              />
            </Label>
            {msg ? <p className="text-sm text-down">{msg}</p> : null}
            <Button type="submit" disabled={busy || !authEnabled}>
              {busy ? "Please wait…" : mode === "in" ? "Sign in with email" : "Create account"}
            </Button>
          </form>

          <Button asChild variant="ghost" className={cn("mt-6 w-full")}>
            <Link to="/app">Continue as guest</Link>
          </Button>
        </div>
      </div>
      <div className="hidden bg-bg-elevated lg:grid lg:place-items-center lg:p-12">
        <div className="w-full max-w-xl">
          <p className="mb-4 text-[12px] tracking-[0.14em] text-subtle uppercase">What you get</p>
          <HeroMix />
          <p className="mt-4 text-sm text-muted">Your stocks versus Nifty, as far back as prices go. Buy dates optional.</p>
        </div>
      </div>
    </div>
  );
}