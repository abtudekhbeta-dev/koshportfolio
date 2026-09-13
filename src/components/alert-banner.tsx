import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiQuotes, apiScreener } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { useKosh, type AlertRule } from "@/lib/store";
import type { Quote, ScreenRow } from "@/lib/kosh/types";

function fired(a: AlertRule, quote: Quote | undefined, row: ScreenRow | undefined) {
  const kind = a.kind || "price";
  const px = quote?.price ?? 0;
  if (kind === "price") {
    if (!(px > 0)) return false;
    return a.dir === "above" ? px >= a.price : px <= a.price;
  }
  if (kind === "pct") {
    const ch = quote?.changePct;
    if (ch == null) return false;
    return a.dir === "above" ? ch >= a.price : ch <= -Math.abs(a.price);
  }
  if (kind === "rsi") {
    const r = row?.rsi;
    if (r == null) return false;
    return a.dir === "above" ? r >= a.price : r <= a.price;
  }
  if (kind === "volume") {
    const v = row?.volRatio;
    if (v == null) return false;
    return v >= a.price;
  }
  if (kind === "high52") return px > 0 && (quote?.high52 ?? 0) > 0 && px >= quote!.high52 * 0.995;
  if (kind === "low52") return px > 0 && (quote?.low52 ?? 0) > 0 && px <= quote!.low52 * 1.005;
  return false;
}

function label(a: AlertRule) {
  const kind = a.kind || "price";
  if (kind === "price") return `${a.dir} ${fmtPx(a.price)}`;
  if (kind === "pct") return a.dir === "above" ? `day ≥ ${fmtPct(a.price)}` : `day ≤ −${Math.abs(a.price).toFixed(1)}%`;
  if (kind === "rsi") return `RSI ${a.dir} ${a.price}`;
  if (kind === "volume") return `volume ≥ ${a.price}×`;
  if (kind === "high52") return "at 52-week high";
  if (kind === "low52") return "at 52-week low";
  return "";
}

export function AlertBanner() {
  const alerts = useKosh((s) => s.alerts);
  const remove = useKosh((s) => s.removeAlert);
  const symbols = [...new Set(alerts.map((a) => a.symbol))];
  const needScreen = alerts.some((a) => a.kind === "rsi" || a.kind === "volume");
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
  const map = new Map((q.data || []).map((x) => [x.input.toUpperCase().replace(/\.(NS|BO)$/i, ""), x]));
  const rows = new Map((screen.data?.rows || []).map((r) => [r.symbol.toUpperCase(), r]));
  const hit = alerts.filter((a) => fired(a, map.get(a.symbol), rows.get(a.symbol)));
  if (!hit.length) return null;
  return (
    <div className="border-b border-border bg-surface-2">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2 text-[13px]">
        {hit.map((a) => {
          const px = map.get(a.symbol)?.price;
          return (
            <div key={a.id} className="flex items-center gap-2">
              <Link to="/s/$symbol" params={{ symbol: a.symbol }} className="text-fg hover:text-chart">
                {a.symbol} is {fmtPx(px || 0)} — {label(a)}
              </Link>
              <button type="button" className="text-[12px] text-muted hover:text-fg" onClick={() => remove(a.id)}>
                Dismiss
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
