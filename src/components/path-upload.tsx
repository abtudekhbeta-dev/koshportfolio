import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { auditTradeLines, parseHoldingsFiles } from "@/lib/kosh/parse";
import { fillTradePrices } from "@/lib/kosh/path";
import { enrichHoldings } from "@/lib/kosh/enrich";
import { displayName } from "@/lib/kosh/names";
import { apiHistories } from "@/lib/kosh/api";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { HistoryPack, TradeLine } from "@/lib/kosh/types";

export function PathUpload({ portfolioId }: { portfolioId: string }) {
  const mergeTrades = useKosh((s) => s.mergeTrades);
  const setTrades = useKosh((s) => s.setTrades);
  const existing = useKosh((s) => s.portfolios.find((p) => p.id === portfolioId)?.trades) || [];
  const [msg, setMsg] = useState(
    "CSV or Excel with dated buys and sells. Broker files can contain sensitive identifiers. Kosh reads the file in the browser and does not send the raw file to AI. This does not change This mix.",
  );
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<TradeLine[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  async function ingest(files: FileList | File[]) {
    const list = [...files];
    if (!list.length) return;
    setBusy(true);
    setMsg("Reading " + list.length + " file(s)…");
    setErrors([]);
    setNotes([]);
    try {
      const { holdings, trades, errors: fails, audit } = await parseHoldingsFiles(list);
      const issues = [...fails];
      if (!trades?.length) {
        setPreview(null);
        if (holdings.length) {
          issues.push(
            "This file looks like a holdings snapshot, not a buy/sell book. Path needs a date, a side (buy or sell), and a quantity on each line.",
          );
        } else if (!issues.length) {
          issues.push("No dated buy/sell lines found. Need a ticker, quantity, buy or sell, and a date.");
        }
        setErrors([...issues, ...auditTradeLines(trades || [])]);
        setMsg("Nothing to add to your path.");
        return;
      }
      setMsg("Matching stock names…");
      let resolved = trades;
      try {
        const stub = trades.map((t) => ({
          symbol: t.symbol,
          name: t.name,
          qty: t.qty,
          avg: t.price || null,
          date: t.date,
        }));
        const named = await enrichHoldings(stub);
        const by = new Map(named.map((h) => [h.symbol.toUpperCase(), h.name]));
        resolved = trades.map((t) => ({
          ...t,
          name: by.get(t.symbol.toUpperCase()) || displayName(t) || t.name,
        }));
      } catch {
        resolved = trades;
      }
      const needPx = [...new Set(resolved.filter((t) => t.date && !(t.price > 0)).map((t) => t.symbol))];
      const hints: string[] = [];
      if (needPx.length) {
        setMsg("Looking up that day’s close for lines with no price…");
        try {
          const rows: HistoryPack[] = await apiHistories(needPx, "max");
          const hx: Record<string, HistoryPack["bars"]> = {};
          for (const r of rows) {
            hx[r.input] = r.bars || [];
            hx[r.symbol] = r.bars || [];
          }
          const got = fillTradePrices(resolved, hx);
          resolved = got.trades;
          if (got.filled.length) {
            hints.push(
              `${got.filled.length} execution price${got.filled.length === 1 ? "" : "s"} unavailable; historical closing price used. Add prices in the file if you want the exact cash you paid.`,
            );
          }
        } catch {
          hints.push("Could not look up closes for missing prices. Those lines will use the close when the path is drawn, or stay out if we have no history.");
        }
      }
      const audited = auditTradeLines(resolved);
      setPreview(resolved);
      setErrors([...issues, ...audited.filter((n) => !/day’s close|day's close/i.test(n))]);
      setNotes([...hints, ...audited.filter((n) => /day’s close|day's close/i.test(n))]);
      const undated = resolved.filter((t) => !t.date).length;
      const filledN = resolved.filter((t) => t.priceFilled).length;
      const needs = (audit?.ambiguous || 0) + (audit?.unresolved || 0);
      setMsg(
        audit?.rowsRead
          ? `Read ${audit.rowsRead.toLocaleString("en-IN")} rows · Kept ${audit.accepted.toLocaleString("en-IN")} · Needs review ${needs.toLocaleString("en-IN")}` +
            (audit.ignored ? ` · Ignored ${audit.ignored.toLocaleString("en-IN")}` : "") +
            (filledN ? ` · ${filledN} used that day’s close` : "") +
            (undated ? ` · ${undated} without a date` : "") +
            " · This mix is not updated"
          : `Ready · ${resolved.length} buy/sell line${resolved.length === 1 ? "" : "s"}`,
      );
    } finally {
      setBusy(false);
    }
  }

  function add() {
    if (!preview?.length) return;
    mergeTrades(portfolioId, preview);
    toast.success(`Added ${preview.length} line${preview.length === 1 ? "" : "s"} to your path. This mix is unchanged.`);
    setPreview(null);
    setMsg("Added to your path.");
  }

  function replace() {
    if (!preview?.length) return;
    if (existing.length && !confirm("Replace every buy/sell on your path with this file? This mix stays as it is.")) return;
    setTrades(portfolioId, preview);
    toast.success(`Your path now has ${preview.length} line${preview.length === 1 ? "" : "s"} from this file. This mix is unchanged.`);
    setPreview(null);
    setMsg("Path replaced.");
  }

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Upload buys and sells</h2>
      <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
        Adds to your path only. CSV, TSV, or Excel. Headers can sit below a title, and a repeated header is skipped.
        Buy, Sell, Purchased, and Sold are recognized. A side that is not one of those is left for review, not guessed.
        This mix is not changed.
      </p>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void ingest(e.dataTransfer.files);
        }}
        className="mt-3 block cursor-pointer rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted"
      >
        <input
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,.xlsm,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void ingest(e.target.files);
            e.target.value = "";
          }}
        />
        Drop a buy/sell file
        <div className="mt-1 text-[12px] text-subtle">Click to pick · CSV or Excel. Does not change quantities on This mix.</div>
      </label>
      <p className="mt-2 text-[12px] text-subtle">{busy ? "Reading…" : msg}</p>
      {errors.length ? (
        <ul className="mt-2 grid gap-1 text-[12px] text-down">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      {notes.length ? (
        <ul className="mt-2 grid gap-1 text-[12px] text-muted">
          {notes.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      {preview?.length ? (
        <div className="mt-3">
          <div className="max-h-[40dvh] overflow-y-auto rounded-sm bg-bg px-3 py-2 text-[12px] shadow-[var(--shadow-border)] sm:max-h-56">
            <div className="grid grid-cols-[1fr_40px_56px_72px] gap-2 pb-1.5 font-medium tracking-[0.06em] text-subtle uppercase sm:grid-cols-[1fr_48px_72px_88px_88px]">
              <span>Stock</span>
              <span>Side</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Price</span>
              <span className="hidden text-right sm:block">Date</span>
            </div>
            {preview.slice(0, 80).map((t, i) => (
              <div
                key={t.symbol + t.date + t.side + t.qty + i}
                className="grid grid-cols-[1fr_40px_56px_72px] gap-2 border-t border-border/60 py-1.5 sm:grid-cols-[1fr_48px_72px_88px_88px]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-fg">{t.name}</span>
                  <span className="block truncate font-mono text-[11px] text-subtle tabular">
                    {t.symbol}
                    <span className="sm:hidden"> · {t.date || "no date"}</span>
                  </span>
                </span>
                <span className={cn("text-[11px] font-medium uppercase", t.side > 0 ? "text-up" : "text-down")}>
                  {t.side > 0 ? "Buy" : "Sell"}
                </span>
                <span className="text-right font-mono tabular">{t.qty}</span>
                <span className={cn("text-right font-mono tabular", t.price > 0 ? "text-fg" : "text-warn")}>
                  {t.price > 0 ? `₹${t.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "missing"}
                  {t.priceFilled ? <span className="block text-[10px] text-subtle">day’s close</span> : null}
                </span>
                <span className="hidden text-right font-mono text-muted tabular sm:block">{t.date || "no date"}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button className="flex-1 min-w-[9rem]" onClick={add}>
              Add to path
            </Button>
            <Button variant="secondary" className="flex-1 min-w-[9rem]" onClick={replace}>
              Replace path
            </Button>
          </div>
        </div>
      ) : null}
      <a href="/sample-trades.csv" download className="mt-3 inline-block text-[12px] text-muted underline-offset-2 hover:text-fg hover:underline">
        Sample buy/sell file
      </a>
    </section>
  );
}
