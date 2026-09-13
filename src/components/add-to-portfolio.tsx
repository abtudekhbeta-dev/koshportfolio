import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { previewAdd } from "@/lib/kosh/engine";
import { sectorOf } from "@/lib/kosh/sectors";
import { apiHistories } from "@/lib/kosh/api";
import { resolveBench } from "@/lib/kosh/benchmarks";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Bar } from "@/lib/kosh/types";

const SLICES = [0.02, 0.05, 0.1] as const;

function Chip({ n, label }: { n: number | null; label: string }) {
  if (n == null || !Number.isFinite(n)) return null;
  const nicer = label === "Max fall" ? n > 0 : n >= 0;
  const num =
    label === "Sharpe" ? (n >= 0 ? "+" : "") + n.toFixed(2) : (n >= 0 ? "+" : "") + n.toFixed(1) + " pp";
  return (
    <span className={cn("rounded-sm px-2 py-0.5 font-mono text-[12px] tabular", nicer ? "bg-up/15 text-up" : "bg-down/15 text-down")}>
      {label} {num}
    </span>
  );
}

export function AddToPortfolio({
  symbol,
  name,
  px,
  bars,
  sector,
}: {
  symbol: string;
  name: string;
  px: number;
  bars: Bar[];
  sector: string;
}) {
  const ports = useKosh((s) => s.portfolios);
  const addHoldings = useKosh((s) => s.addHoldings);
  const [open, setOpen] = useState(false);
  const [pid, setPid] = useState(ports[0]?.id || "");
  const [slice, setSlice] = useState<(typeof SLICES)[number]>(0.05);
  const port = ports.find((p) => p.id === pid) || ports[0];
  const already = port?.holdings.find((h) => h.symbol.replace(/\.(NS|BO)$/i, "") === symbol.replace(/\.(NS|BO)$/i, ""));
  const sectorNames = (port?.holdings || []).filter((h) => (h.sector || sectorOf(h.symbol)) === sector);

  const hx = useQuery({
    queryKey: ["add-hx", port?.id, symbol],
    queryFn: () => {
      const bench = resolveBench(port!.bench);
      const need = [...new Set([...port!.holdings.map((h) => h.symbol), symbol, bench.symbol])];
      return apiHistories(need, "max");
    },
    enabled: open && Boolean(port),
    staleTime: 10 * 60 * 1000,
  });

  const deltas = useMemo(() => {
    if (!port || !(px > 0) || !hx.data?.length) return null;
    const histories: Record<string, Bar[]> = {};
    let benchBars: Bar[] = [];
    const bench = resolveBench(port.bench).symbol;
    for (const pack of hx.data) {
      histories[pack.input] = pack.bars;
      histories[pack.symbol] = pack.bars;
      if (pack.symbol === bench || pack.input === bench) benchBars = pack.bars;
    }
    histories[symbol] = bars.length ? bars : histories[symbol] || [];
    return previewAdd(port.holdings, histories, benchBars, { symbol, name, qty: 1, avg: px, date: null }, bars, slice, px);
  }, [port, px, hx.data, bars, symbol, name, slice]);

  const qty = Math.max(1, px > 0 ? Math.round(((slice / Math.max(0.05, 1 - slice)) * 50000) / px) : 1);
  // qty from live prices on packs
  const liveQty = useMemo(() => {
    if (!port || !(px > 0) || !hx.data?.length) return qty;
    let v = 0;
    for (const h of port.holdings) {
      const pack = hx.data.find((p) => p.input === h.symbol || p.symbol === h.symbol);
      const last = pack?.price || pack?.bars.at(-1)?.c || 0;
      v += h.qty * last;
    }
    if (!(v > 0)) return qty;
    return Math.max(1, Math.round((slice * v) / ((1 - slice) * px)));
  }, [port, px, hx.data, slice, qty]);

  if (!ports.length) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Add to portfolio
        </Button>
      </DialogTrigger>
      <DialogContent title="Add to a portfolio">
        <div className="grid gap-3 text-[13px] leading-relaxed">
          {ports.length > 1 ? (
            <label className="grid gap-1">
              <span className="text-[11px] tracking-[0.08em] text-subtle uppercase">Portfolio</span>
              <select
                className="h-9 rounded-sm bg-bg px-2 shadow-[var(--shadow-border)]"
                value={pid || ports[0].id}
                onChange={(e) => setPid(e.target.value)}
              >
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-muted">{ports[0].name}</p>
          )}

          {already ? (
            <p>
              You already hold this name ({already.qty.toLocaleString("en-IN")} shares). Adding more size.
            </p>
          ) : null}
          {sectorNames.length ? (
            <p>
              You already have {sectorNames.length} {sector} name{sectorNames.length === 1 ? "" : "s"} in this portfolio
              {sectorNames[0]?.name ? ` (including ${sectorNames[0].name})` : ""}. This would add to that sleeve.
            </p>
          ) : (
            <p className="text-muted">No {sector} names in this portfolio yet.</p>
          )}

          <div className="flex flex-wrap gap-1">
            {SLICES.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setSlice(w)}
                className={cn(
                  "h-9 rounded-sm px-3 text-[13px]",
                  slice === w ? "bg-chart text-accent-fg" : "bg-bg shadow-[var(--shadow-border)]",
                )}
              >
                {(w * 100).toFixed(0)}%
              </button>
            ))}
          </div>

          {deltas ? (
            <div>
              <p className="text-[12px] text-muted">
                If this became {(slice * 100).toFixed(0)}% of the portfolio, last 1 year would have looked like:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Chip n={deltas.dSharpe} label="Sharpe" />
                <Chip n={deltas.dMaxDd} label="Max fall" />
                <Chip n={deltas.dVol} label="Vol" />
                <Chip n={deltas.dCagr} label="1Y" />
              </div>
              <p className="mt-2 text-[11px] text-subtle">How last year would have looked with that mix — not a forecast.</p>
            </div>
          ) : open && hx.isPending ? (
            <p className="text-muted">Comparing against this portfolio…</p>
          ) : null}

          <Button
            onClick={() => {
              if (!port) return;
              addHoldings(port.id, [
                { symbol, name, qty: liveQty, avg: px, date: new Date().toISOString().slice(0, 10) },
              ]);
              setOpen(false);
            }}
          >
            Add {liveQty.toLocaleString("en-IN")} share{liveQty === 1 ? "" : "s"} at {(slice * 100).toFixed(0)}%
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
