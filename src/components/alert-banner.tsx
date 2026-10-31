import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiQuotes, apiScreener } from "@/lib/kosh/api";
import { alertDetail, evaluateAlert } from "@/lib/kosh/alerts";
import { listingId, listingLabel } from "@/lib/kosh/listing";
import { fmtPx } from "@/lib/kosh/engine";
import { useKosh } from "@/lib/store";
import type { Quote, ScreenRow } from "@/lib/kosh/types";

export function AlertBanner() {
  const alerts = useKosh((s) => s.alerts);
  const patch = useKosh((s) => s.patchAlert);
  const symbols = [...new Set(alerts.map((a) => listingId(a.symbol)).filter(Boolean))];
  const needScreen = alerts.some((a) => a.kind === "rsi" || a.kind === "volume" || a.kind === "ma");
  const q = useQuery({
    queryKey: ["alert-quotes", symbols],
    queryFn: () => apiQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const screen = useQuery({
    queryKey: ["screener"],
    queryFn: apiScreener,
    enabled: needScreen,
    staleTime: 10 * 60 * 1000,
  });
  const map = new Map((q.data || []).map((x) => [listingId(x.input || x.symbol), x]));
  const rows = new Map((screen.data?.rows || []).map((r) => [r.symbol.toUpperCase(), r]));
  const checks = alerts.map((a) => ({
    a,
    check: evaluateAlert(a, map.get(listingId(a.symbol)) as Quote | undefined, rows.get(listingLabel(a.symbol).toUpperCase()) as ScreenRow | undefined),
  }));
  const signature = checks
    .map((row) => `${row.a.id}:${row.check.hit ? 1 : 0}:${row.check.expired ? 1 : 0}:${row.check.memory ?? ""}`)
    .join("|");

  useEffect(() => {
    const now = Date.now();
    for (const row of checks) {
      if (row.check.expired && row.a.status !== "expired") {
        patch(row.a.id, { status: "expired" });
        continue;
      }
      if (row.check.memory != null && row.check.memory !== row.a.lastAbove && !row.check.hit) {
        patch(row.a.id, { lastAbove: row.check.memory });
      }
      if (!row.check.hit) continue;
      const note = `${listingLabel(row.a.symbol)} ${row.check.detail}`;
      patch(row.a.id, {
        status: "triggered",
        triggeredAt: now,
        ackAt: null,
        lastAbove: row.check.memory ?? row.a.lastAbove,
        history: [{ at: now, note }, ...(row.a.history || [])].slice(0, 12),
      });
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(note);
        } catch {
          /* the in-app line still shows */
        }
      }
    }
    // signature is the stable stand-in for the check results
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const shown = alerts.filter((a) => a.status === "triggered" && !a.ackAt);
  if (!shown.length) return null;
  return (
    <div className="border-b border-border bg-surface-2">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2 text-[13px]">
        {shown.slice(0, 6).map((a) => {
          const px = map.get(listingId(a.symbol))?.price;
          return (
            <div key={a.id} className="flex items-center gap-2">
              <Link to="/s/$symbol" params={{ symbol: listingId(a.symbol) }} className="text-fg hover:text-chart">
                {listingLabel(a.symbol)} {px ? `is ${fmtPx(px)} — ` : ""}
                {alertDetail(a)}
              </Link>
              <button type="button" className="text-[12px] text-muted hover:text-fg" onClick={() => patch(a.id, { ackAt: Date.now() })}>
                Dismiss
              </button>
            </div>
          );
        })}
        <Link to="/alerts" className="text-[12px] text-muted hover:text-fg">
          All alerts
        </Link>
      </div>
    </div>
  );
}
