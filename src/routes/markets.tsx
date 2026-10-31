import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ClassicOverview } from "@/components/terminal/classic-overview";
import { MarketOverview } from "@/components/terminal/market-overview";
import { MarketsSwitch } from "@/components/terminal/markets-switch";
import { NIFTY_CATALOGUE } from "@/lib/kosh/nifty-catalogue";
import { readLayout, useAppLayout } from "@/lib/layout-mode";
import type { Quote, TapeRow } from "@/lib/kosh/types";

const MarketsDesk = lazy(() => import("@/components/terminal/markets-desk").then((m) => ({ default: m.MarketsDesk })));
const LedgerTerminal = lazy(() => import("@/components/ledger/ledger-terminal").then((m) => ({ default: m.LedgerTerminal })));

export type MarketsSearch = { view?: "terminal" | "overview"; symbol?: string; name?: string };

type MarketBoard = { tape: TapeRow[]; indices: Quote[] };

const EMPTY_BOARD: MarketBoard = { tape: [], indices: [] };

async function pullJson(url: string, ms: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: "application/json" } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function boardOrigin(href: string): Promise<string> {
  if (typeof window !== "undefined") return window.location.origin;
  if (/^https?:\/\//.test(href)) {
    try {
      return new URL(href).origin;
    } catch {
      /* relative href */
    }
  }
  // Same slot Start uses for the in-flight request. Not a server-only import — the route is also client code.
  try {
    const storage = (globalThis as Record<symbol, { getStore?: () => { h3Event?: { req?: { url?: string } } } } | undefined>)[
      Symbol.for("tanstack-start:event-storage")
    ];
    const url = storage?.getStore?.()?.h3Event?.req?.url;
    if (url) return new URL(url).origin;
  } catch {
    /* no request scope */
  }
  return "";
}

export const Route = createFileRoute("/markets")({
  validateSearch: (s: Record<string, unknown>): MarketsSearch => {
    const symbol = typeof s.symbol === "string" ? s.symbol.trim().slice(0, 32) : "";
    const name = typeof s.name === "string" ? s.name.trim().slice(0, 80) : "";
    return {
      view: s.view === "overview" ? "overview" : "terminal",
      ...(symbol ? { symbol } : {}),
      ...(name ? { name } : {}),
    };
  },
  staleTime: 20_000,
  pendingMs: 10_000,
  loader: async ({ location }): Promise<MarketBoard> => {
    const view = (location.search as MarketsSearch).view;
    if (view !== "overview") return EMPTY_BOARD;
    const origin = await boardOrigin(location.href);
    if (!origin) return EMPTY_BOARD;
    const symbols = NIFTY_CATALOGUE.map((row) => row.symbol).join(",");
    const [tapeBody, indexBody] = await Promise.all([
      pullJson(`${origin}/api/tape`, 7_000),
      pullJson(`${origin}/api/quote?fast=1&symbols=${encodeURIComponent(symbols)}`, 7_000),
    ]);
    const tape = (tapeBody as { rows?: TapeRow[] } | null)?.rows || [];
    const indices = (indexBody as { quotes?: Quote[] } | null)?.quotes || [];
    return { tape, indices };
  },
  component: Markets,
});

function seedBoard(qc: ReturnType<typeof useQueryClient>, board: MarketBoard) {
  if (board.tape.some((row) => row.price > 0)) {
    const have = qc.getQueryData<TapeRow[]>(["tape"]);
    if (!have?.some((row) => row.price > 0)) qc.setQueryData(["tape"], board.tape);
  }
  if (board.indices.some((row) => row.price > 0)) {
    const have = qc.getQueryData<Quote[]>(["nifty-catalogue"]);
    if (!have?.some((row) => row.price > 0)) qc.setQueryData(["nifty-catalogue"], board.indices);
  }
}

function Markets() {
  const board = Route.useLoaderData();
  const qc = useQueryClient();
  seedBoard(qc, board);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { view } = Route.useSearch();
  const hooked = useAppLayout();
  const layout = typeof document === "undefined" ? hooked : readLayout();
  if (pathname.startsWith("/markets/")) return <Outlet />;
  const terminal = view !== "overview";
  if (terminal && layout === "ledger") {
    return (
      <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-muted">Loading terminal…</div>}>
        <LedgerTerminal host="overlay" />
      </Suspense>
    );
  }
  return (
    <AppShell full={terminal}>
      {terminal ? (
        layout === "classic" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <Suspense fallback={<div className="grid min-h-40 flex-1 place-items-center text-sm text-muted">Loading terminal…</div>}>
              <LedgerTerminal host="embed" />
            </Suspense>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Suspense fallback={<div className="grid min-h-40 flex-1 place-items-center text-sm text-muted">Loading terminal…</div>}>
              <MarketsDesk />
            </Suspense>
          </div>
        )
      ) : (
        <>
          <MarketsSwitch view="overview" />
          {layout === "classic" ? <ClassicOverview /> : <MarketOverview />}
        </>
      )}
    </AppShell>
  );
}
