import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { WatchBoard } from "@/components/watch-board";
import { apiScreener } from "@/lib/kosh/api";
import { fmtPx } from "@/lib/kosh/engine";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watch")({ ssr: false, component: WatchPage });

function WatchPage() {
  const watchlists = useKosh((s) => s.watchlists);
  const activeWatchId = useKosh((s) => s.activeWatchId);
  const toggle = useKosh((s) => s.toggleWatch);
  const addWatchList = useKosh((s) => s.addWatchList);
  const renameWatchList = useKosh((s) => s.renameWatchList);
  const deleteWatchList = useKosh((s) => s.deleteWatchList);
  const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
  const recents = useKosh((s) => s.recents);
  const alerts = useKosh((s) => s.alerts);
  const removeAlert = useKosh((s) => s.removeAlert);
  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const [newName, setNewName] = useState("");
  const active = watchlists.find((l) => l.id === activeWatchId) || watchlists[0];

  return (
    <AppShell>
      <div className="kosh-page grid gap-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Watch</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Several lists — Main, Trade, Long-term, or ones you add. Star a name on a stock page to pin it to the list that is
            open. Guest lists stay in this browser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {watchlists.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setActiveWatchId(l.id)}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-sm px-3.5 text-[13px] font-medium leading-none shadow-[var(--shadow-border)]",
                l.id === activeWatchId ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg",
              )}
            >
              {l.name}
              <span className="ml-2 font-mono text-[11px] text-subtle">{l.symbols.length}</span>
            </button>
          ))}
          <form
            className="flex items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              const n = newName.trim();
              if (!n) return;
              addWatchList(n);
              setNewName("");
            }}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New list"
              className="h-10 w-32 rounded-sm bg-bg-elevated px-2.5 text-[13px] shadow-[var(--shadow-border)] outline-none"
            />
            <Button type="submit" size="sm" variant="secondary">
              Add list
            </Button>
          </form>
        </div>
        {active ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              defaultValue={active.name}
              key={active.id}
              onBlur={(e) => {
                const n = e.target.value.trim();
                if (n && n !== active.name) renameWatchList(active.id, n);
              }}
              className="h-9 w-40 rounded-sm bg-bg-elevated px-2.5 text-[13px] shadow-[var(--shadow-border)] outline-none"
              aria-label="Rename list"
            />
            {watchlists.length > 1 ? (
              <Button size="sm" variant="ghost" onClick={() => deleteWatchList(active.id)}>
                Delete list
              </Button>
            ) : null}
          </div>
        ) : null}
        <WatchBoard symbols={active?.symbols || []} rows={screen.data?.rows || []} loading={screen.isPending} />
        {active?.symbols.length ? (
          <div className="flex flex-wrap gap-2">
            {active.symbols.map((s) => (
              <Button key={s} size="sm" variant="ghost" onClick={() => toggle(s)}>
                Remove {s}
              </Button>
            ))}
          </div>
        ) : null}
        {alerts.length ? (
          <section>
            <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Alerts</h2>
            <ul className="grid gap-1">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg bg-surface px-4 py-3 text-[13px] shadow-[var(--shadow-border)]">
                  <Link to="/s/$symbol" params={{ symbol: a.symbol }} className="hover:text-chart">
                    {a.symbol} · {a.kind || "price"} {a.dir} {a.kind === "price" || !a.kind ? fmtPx(a.price) : a.price}
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => removeAlert(a.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {recents.length ? (
          <section>
            <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Recent</h2>
            <div className="flex flex-wrap gap-2">
              {recents.map((r) => (
                <Link
                  key={r.symbol}
                  to="/s/$symbol"
                  params={{ symbol: r.symbol }}
                  className="h-8 rounded-sm bg-surface px-2.5 text-[12px] leading-8 shadow-[var(--shadow-border)] hover:text-chart"
                >
                  {r.symbol}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
