import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AddHoldings } from "@/components/add-holdings";
import { EnrichButton } from "@/components/enrich-button";
import { BenchPicker } from "@/components/bench-picker";
import { BookProvider } from "@/components/book-context";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/export-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBook } from "@/lib/kosh/use-book";
import { resolveBench } from "@/lib/kosh/benchmarks";
import { fmtInr, fmtPct } from "@/lib/kosh/engine";
import { useKosh, usePortfolio } from "@/lib/store";
import { cn } from "@/lib/utils";
import { UnresolvedHoldings } from "@/components/unresolved-holdings";

export const Route = createFileRoute("/p/$id")({ ssr: false, component: PortfolioLayout });

const TABS = [
  { to: "/p/$id" as const, label: "Overview", exact: true },
  { to: "/p/$id/path" as const, label: "Path" },
  { to: "/p/$id/performance" as const, label: "Performance" },
  { to: "/p/$id/holdings" as const, label: "Holdings" },
  { to: "/p/$id/improve" as const, label: "Improve Portfolio" },
  { to: "/p/$id/sectors" as const, label: "Sectors" },
  { to: "/p/$id/risk" as const, label: "Risk" },
];

function PortfolioLayout() {
  const { id } = Route.useParams();
  const portfolio = usePortfolio(id);
  const query = useBook(portfolio);
  const setBench = useKosh((s) => s.setBench);
  const setIncludeCommodities = useKosh((s) => s.setIncludeCommodities);
  const renamePortfolio = useKosh((s) => s.renamePortfolio);
  const deletePortfolio = useKosh((s) => s.deletePortfolio);
  const duplicatePortfolio = useKosh((s) => s.duplicatePortfolio);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!portfolio) {
    return (
      <AppShell>
        <p className="text-sm text-muted">Portfolio not found.</p>
        <Link to="/" className="mt-3 inline-block text-sm text-muted underline">
          Back
        </Link>
      </AppShell>
    );
  }

  const book = query.data;
  const bench = resolveBench(portfolio.bench);

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link to="/app" className="text-[12px] text-subtle hover:text-muted">
            Portfolios
          </Link>
          <input
            className="mt-1 block w-full bg-transparent text-[26px] font-semibold tracking-tight outline-none"
            defaultValue={portfolio.name}
            aria-label="Portfolio name"
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== portfolio.name) renamePortfolio(id, v);
            }}
          />
          {book ? (
            <p className="mt-1 font-mono text-sm text-muted tabular">
              {fmtInr(book.value)}
              <span className={cn("ml-2", book.dayAbs >= 0 ? "text-up" : "text-down")}>
                {fmtPct(book.dayPct)} today
              </span>
            </p>
          ) : query.isPending ? (
            <Skeleton className="mt-2 h-4 w-40" />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={portfolio.includeCommodities !== false}
            onClick={() => setIncludeCommodities(id, portfolio.includeCommodities === false)}
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-sm px-2.5 text-[12px] shadow-[var(--shadow-border)]",
              portfolio.includeCommodities === false ? "bg-bg-elevated text-muted" : "bg-surface text-fg",
            )}
            title="When off, gold and silver stay on Holdings but drop out of totals, risk and the chart."
          >
            Gold & silver {portfolio.includeCommodities === false ? "excluded from totals" : "included in totals"}
          </button>
          <label className="flex items-center gap-2 text-[12px] text-muted">
            Benchmark
            <BenchPicker value={portfolio.bench} onChange={(v) => setBench(id, v)} />
          </label>
          <AddHoldings portfolioId={id} trigger={<Button size="sm" variant="secondary">Add holdings</Button>} />
          <EnrichButton
            symbols={[
              ...portfolio.holdings.map((h) => h.symbol),
              ...(portfolio.trades || []).map((t) => t.symbol),
            ]}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const nid = duplicatePortfolio(id);
              if (nid) void navigate({ to: "/p/$id", params: { id: nid } });
            }}
          >
            Duplicate
          </Button>
          <ExportButton name={portfolio.name} book={book} portfolio={portfolio} />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm("Delete this portfolio?")) {
                deletePortfolio(id);
                void navigate({ to: "/" });
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <nav className="-mx-3 mb-5 flex gap-1 overflow-x-auto px-3 sm:-mx-4 sm:px-4">
        {TABS.map((t) => {
          const href = t.to.replace("$id", id);
          const active = t.exact ? pathname === `/p/${id}` || pathname === `/p/${id}/` : pathname.startsWith(href);
          return (
            <Link
              key={t.to}
              to={t.to}
              params={{ id }}
              className={cn(
                "inline-flex h-9 shrink-0 items-center justify-center rounded-sm px-3 text-[13px] font-medium leading-none",
                active ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {book?.missing?.length ? (
        <UnresolvedHoldings portfolioId={id} missing={book.missing} holdings={portfolio.holdings} />
      ) : null}

      {query.isError ? (
        <div className="rounded-lg bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]">
          Could not load market data. {query.error.message}
          <div className="mt-3">
            <Button size="sm" variant="secondary" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : query.isPending ? (
        <div className="kosh-page grid gap-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[320px] rounded-lg" />
          <p className="text-[12px] text-subtle">Loading live prices and full history vs {bench.name}…</p>
        </div>
      ) : book ? (
        <BookProvider portfolio={portfolio} query={query}>
          <Outlet />
        </BookProvider>
      ) : (
        <p className="text-sm text-muted">Add stocks to this portfolio to draw the chart.</p>
      )}
    </AppShell>
  );
}
