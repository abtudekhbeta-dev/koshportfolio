import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function MarketsSwitch({ view }: { view: "terminal" | "overview" }) {
  return (
    <div data-markets-switch className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 sm:px-4">
      <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Markets</div>
      <div className="flex items-center gap-1">
        <Link
          to="/markets"
          search={{ view: "terminal" }}
          aria-current={view === "terminal" ? "page" : undefined}
          className={cn(
            "inline-flex h-9 items-center rounded-sm px-3 text-[13px] font-semibold",
            view === "terminal"
              ? "bg-surface text-fg shadow-[var(--shadow-border)] ring-1 ring-fg/25"
              : "text-muted hover:text-fg",
          )}
        >
          ★ Terminal
        </Link>
        <Link
          to="/markets"
          search={{ view: "overview" }}
          aria-current={view === "overview" ? "page" : undefined}
          className={cn(
            "inline-flex h-9 items-center rounded-sm px-3 text-[13px] font-medium",
            view === "overview"
              ? "bg-surface text-fg shadow-[var(--shadow-border)]"
              : "text-muted hover:text-fg",
          )}
        >
          Overview
        </Link>
      </div>
      <p className="ml-auto hidden text-[11px] text-subtle md:block">
        {view === "terminal" ? "Charts and watchlists" : "How the cash market looks today"}
      </p>
    </div>
  );
}
