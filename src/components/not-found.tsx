import { Link } from "@tanstack/react-router";
import { BrandLink } from "@/components/mark";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-start justify-center px-6">
      <BrandLink to="/" />
      <p className="mt-10 font-mono text-[13px] text-subtle tabular">404</p>
      <h1 className="mt-2 text-[28px] font-semibold tracking-tight">This page is not here.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        That link does not match a portfolio, a stock, or a landing section.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/app">Open my portfolio</Link>
        </Button>
      </div>
    </main>
  );
}
