import { Link } from "@tanstack/react-router";
import { AuthSlot } from "@/components/auth-slot";
import { BrandLink } from "@/components/mark";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutSwitch } from "@/components/layout-switch";
import type { ReactNode } from "react";

export function SkipToMain() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-accent-fg"
    >
      Skip to content
    </a>
  );
}

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="kosh-topbar mx-auto grid h-16 max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <BrandLink to="/" />
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/markets"
              className="grid h-11 place-items-center rounded-sm bg-surface px-4 text-[15px] font-semibold text-fg shadow-[var(--shadow-border)]"
            >
              Markets
            </Link>
            <Link
              to="/screen"
              className="grid h-11 place-items-center rounded-sm bg-surface px-4 text-[15px] font-semibold text-muted shadow-[var(--shadow-border)] hover:text-fg"
            >
              Screener
            </Link>
            <Link
              to="/app"
              className="grid h-11 place-items-center rounded-sm bg-surface px-4 text-[15px] font-semibold text-muted shadow-[var(--shadow-border)] hover:text-fg"
            >
              Portfolios
            </Link>
          </nav>
        </div>
        <div className="flex justify-center px-1">
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/watch"
              className="grid h-11 place-items-center rounded-sm bg-surface px-3.5 text-[15px] font-semibold text-muted shadow-[var(--shadow-border)] hover:text-fg"
            >
              Watch
            </Link>
          </nav>
          <ThemeToggle />
          <LayoutSwitch />
          <AuthSlot />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLink to="/" />
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted">
            Indian prices, stock pages, screens, and a portfolio versus Nifty. Quality over clutter. Not a broker, not advice.
          </p>
        </div>
        <div>
          <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Product</div>
          <div className="mt-3 grid gap-2 text-[13px] text-muted">
            <Link to="/" className="hover:text-fg">
              Home
            </Link>
            <Link to="/markets" className="hover:text-fg">
              Markets
            </Link>
            <Link to="/screen" className="hover:text-fg">
              Screener
            </Link>
            <Link to="/watch" className="hover:text-fg">
              Watch
            </Link>
            <Link to="/app" className="hover:text-fg">
              Portfolios
            </Link>
            <Link to="/compare" className="hover:text-fg">
              Compare
            </Link>
            <Link to="/icons" className="hover:text-fg">
              App icon
            </Link>
            <Link to="/login" className="hover:text-fg">
              Sign in
            </Link>
            <Link to="/signup" className="hover:text-fg">
              Create account
            </Link>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Legal</div>
          <div className="mt-3 grid gap-2 text-[13px] text-muted">
            <Link to="/privacy" className="hover:text-fg">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-fg">
              Terms
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[12px] text-subtle">
          <span>Kosh · Indian prices · IST calendar</span>
          <span>Not investment advice.</span>
        </div>
      </div>
    </footer>
  );
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SkipToMain />
      <LandingHeader />
      <main id="main" className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-[clamp(1.8rem,1.2rem+2vw,2.4rem)] font-semibold tracking-tight">{title}</h1>
        <div className="legal-prose mt-8 grid gap-5 text-[15px] leading-relaxed text-muted">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
