import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

const LINKS = [
  ["/markets", "Markets"],
  ["/screen", "Screener"],
  ["/app", "Portfolios"],
  ["/watch", "Watch"],
] as const;

function label(path: string) {
  if (path.startsWith("/markets")) return "Markets";
  if (path.startsWith("/screen")) return "the screener";
  if (path.startsWith("/app") || path.startsWith("/p/")) return "Portfolios";
  if (path.startsWith("/s/")) return "the stock";
  if (path.startsWith("/watch")) return "Watch";
  if (path.startsWith("/compare")) return "Compare";
  if (path.startsWith("/login") || path.startsWith("/signup")) return "sign in";
  return "this page";
}

/** Shown while a client-only route chunk is still loading. Real links, not router
 *  links, so a stuck transition can still leave the page. */
export function RoutePending() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 7000);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border bg-bg">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <a href="/" className="text-[15px] font-semibold tracking-tight text-fg">
            Kosh
          </a>
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-muted">
            {LINKS.map(([href, text]) => (
              <a key={href} href={href} className="hover:text-fg">
                {text}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-[12px] font-medium tracking-[0.14em] text-subtle uppercase">Kosh</p>
        <h1 className="mt-2 text-[1.6rem] font-semibold tracking-tight">Opening {label(pathname)}</h1>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          {slow
            ? "This is taking longer than it should. Reload, or pick a page above."
            : "Fetching the page. It should replace this in a moment."}
        </p>
        {slow ? (
          <button
            type="button"
            className="mt-5 inline-flex h-10 items-center rounded-sm bg-accent px-4 text-[13px] font-medium text-accent-fg"
            onClick={() => {
              try {
                sessionStorage.removeItem("kosh-chunk-reload");
              } catch {
                /* ignore */
              }
              window.location.assign(window.location.href);
            }}
          >
            Reload
          </button>
        ) : null}
      </main>
    </div>
  );
}
