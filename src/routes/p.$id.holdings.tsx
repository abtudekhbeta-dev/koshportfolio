import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useBookCtx } from "@/components/book-context";
import { AddHoldings } from "@/components/add-holdings";
import { Pct } from "@/components/pct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StockLink } from "@/components/stock-link";
import { Tooltip } from "@/components/ui/tooltip";
import { fmtInr, fmtPct } from "@/lib/kosh/engine";
import { taxClock } from "@/lib/kosh/portfolio-stats";
import { sortEntities } from "@/lib/kosh/kosh-table";
import { METALS, type MetalId } from "@/lib/kosh/commodities";
import { apiSearch } from "@/lib/kosh/api";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Holding } from "@/lib/kosh/types";

export const Route = createFileRoute("/p/$id/holdings")({ component: Holdings });

type SortKey = "weight" | "value" | "changePct" | "m1" | "y1" | "unrealPct" | "xirr" | "contrib" | "daysHeld";

function Holdings() {
  const { query, portfolio } = useBookCtx();
  const book = query.data!;
  const removeHolding = useKosh((s) => s.removeHolding);
  const updateHolding = useKosh((s) => s.updateHolding);
  const addHoldings = useKosh((s) => s.addHoldings);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("weight");

  const rows = useMemo(() => {
    const qq = q.trim().toUpperCase();
    const list = book.rows.filter((r) => !qq || r.symbol.includes(qq) || r.name.toUpperCase().includes(qq));
    return sortEntities(list, sort, "desc", (r, k) => {
      if (k === "m1") return r.periods.m1;
      if (k === "y1") return r.periods.y1;
      if (k === "xirr") return r.xirr;
      if (k === "contrib") return r.contrib;
      if (k === "daysHeld") return r.daysHeld;
      return (r as Record<string, unknown>)[k];
    });
  }, [book.rows, q, sort]);

  function patch(symbol: string, next: Partial<Holding>) {
    updateHolding(portfolio.id, symbol, next);
  }

  return (
    <div className="kosh-page grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="min-w-0 flex-1 sm:max-w-xs" placeholder="Search name or ticker" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="text-[12px] text-subtle">{rows.length} lines</span>
        <AddHoldings
          portfolioId={portfolio.id}
          trigger={<Button size="sm">Upload file</Button>}
        />
      </div>
      <p className="text-[13px] text-muted">
        Edit quantity, average cost and buy date in place. Upload a buy/sell file and remaining lots stay on the line (still
        one row per name) so Your XIRR is money-weighted from those remaining lots. Sold lines and dividends are not in that figure. Editing the line replaces those lots. Sold names
        are not added. Returns from buy date need both a date and an average cost — otherwise the cell stays blank, not
        zero.
      </p>

      <div className="hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block">
        <table className="kosh-table w-full text-[13px]">
          <thead>
            <tr className="text-left">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Avg cost</th>
              <th className="px-3 py-2">Buy date</th>
              <th className="px-3 py-2 text-right">
                <button type="button" className="text-[11px] font-medium tracking-[0.06em] text-subtle uppercase" onClick={() => setSort("value")}>
                  Value
                </button>
              </th>
              <th className="px-3 py-2 text-right">
                <button type="button" className="text-[11px] font-medium tracking-[0.06em] text-subtle uppercase" onClick={() => setSort("changePct")}>
                  1D
                </button>
              </th>
              <HeadTip label="P&L ₹" tip="Rupees up or down versus average cost. Needs buy date and average. Use this for how much money is on the line." onClick={() => setSort("unrealPct")} />
              <HeadTip label="Simple %" tip="Same P&L as a percent of what you paid. A quick look — not annualised." onClick={() => setSort("unrealPct")} />
              <HeadTip label="XIRR" tip="Annualised return from dated buys to today. Remaining lots from a trade-file import are used when present. Use this when names were bought on different dates." onClick={() => setSort("xirr")} />
              <th className="hidden px-3 py-2 text-right xl:table-cell">1Y</th>
              <HeadTip className="hidden xl:table-cell" label="Days" tip="Calendar days since the buy date. Use this to see how long the position has been on." onClick={() => setSort("daysHeld")} />
              <HeadTip className="hidden xl:table-cell" label="vs Nifty" tip="Your simple % minus Nifty over the same dates. Did you beat the index since you bought?" />
              <HeadTip className="hidden xl:table-cell" label="vs sector" tip="Your simple % minus the sector index over the same dates. Did you beat the industry since you bought?" />
              <HeadTip className="hidden xl:table-cell" label="Contrib" tip="Share of the portfolio’s total unrealised rupees. A small name with a huge % can still be a small rupee contribution." onClick={() => setSort("contrib")} />
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const h = portfolio.holdings.find((x) => x.symbol === r.symbol);
              return (
                <tr key={r.symbol + String(h?.date) + String(r.qty) + String(r.avg)}>
                  <td className="px-3 py-2">
                    <StockLink symbol={r.symbol} name={r.name} className="font-medium" />
                    <div className="text-[11px] text-subtle">
                      {r.symbol} · {r.sector}
                      {h?.lots && h.lots.length > 1 ? ` · ${h.lots.length} lots` : ""}
                      {r.kind === "commodity" && !book.includeCommodities ? " · excluded from totals" : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Input
                      className="ml-auto h-8 w-20 text-right"
                      defaultValue={String(r.qty)}
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        if (n > 0 && n !== r.qty) patch(r.symbol, { qty: n });
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Input
                      className="ml-auto h-8 w-24 text-right"
                      defaultValue={r.avg ? String(r.avg) : ""}
                      placeholder="₹"
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        patch(r.symbol, { avg: n > 0 ? n : null });
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      className="h-8 w-36"
                      type="date"
                      defaultValue={h?.date || ""}
                      onChange={(e) => {
                        const d = e.target.value || null;
                        patch(r.symbol, { date: d, boughtAt: d ? d + "T00:00:00.000Z" : null });
                      }}
                    />
                    <TaxNote date={h?.date} />
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular">{fmtInr(r.value)}</td>
                  <td className="px-3 py-2 text-right">
                    <Pct n={r.changePct} />
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular">
                    {!r.avg ? "Cost unavailable" : haveRet(r) ? fmtInr(r.unreal) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">{!r.avg ? "Cost unavailable" : haveRet(r) ? <Pct n={r.unrealPct} /> : "—"}</td>
                  <td className="px-3 py-2 text-right">{r.xirr == null ? "—" : <Pct n={r.xirr} />}</td>
                  <td className="hidden px-3 py-2 text-right xl:table-cell">
                    <Pct n={r.periods.y1} />
                  </td>
                  <td className="hidden px-3 py-2 text-right font-mono tabular xl:table-cell">{r.daysHeld == null ? "—" : `${r.daysHeld}d`}</td>
                  <td className="hidden px-3 py-2 text-right xl:table-cell">{r.vsNiftyHold == null ? "—" : <Pct n={r.vsNiftyHold} />}</td>
                  <td className="hidden px-3 py-2 text-right xl:table-cell">
                    {r.vsSectorHold == null ? "—" : <Pct n={r.vsSectorHold} />}
                    {r.sectorIndexName ? <div className="text-[11px] text-subtle">{r.sectorIndexName}</div> : null}
                  </td>
                  <td className="hidden px-3 py-2 text-right font-mono tabular xl:table-cell">
                    {r.contrib == null ? "—" : fmtPct(r.contrib, 0)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => removeHolding(portfolio.id, r.symbol)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2 md:hidden">
        {rows.map((r) => {
          const h = portfolio.holdings.find((x) => x.symbol === r.symbol);
          return (
            <article key={r.symbol + String(h?.date) + String(r.qty) + String(r.avg)} className="rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <StockLink symbol={r.symbol} name={r.name} className="font-medium" />
                  <div className="text-[11px] text-subtle">
                    {r.symbol} · {fmtInr(r.value)} · <Pct n={r.unrealPct} />
                    {h?.lots && h.lots.length > 1 ? ` · ${h.lots.length} lots` : ""}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeHolding(portfolio.id, r.symbol)}>
                  Remove
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="text-[11px] text-subtle">
                  Qty
                  <Input
                    className="mt-1 h-9"
                    defaultValue={String(r.qty)}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (n > 0 && n !== r.qty) patch(r.symbol, { qty: n });
                    }}
                  />
                </label>
                <label className="text-[11px] text-subtle">
                  Avg cost
                  <Input
                    className="mt-1 h-9"
                    defaultValue={r.avg ? String(r.avg) : ""}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      patch(r.symbol, { avg: n > 0 ? n : null });
                    }}
                  />
                </label>
                <label className="col-span-2 text-[11px] text-subtle">
                  Buy date
                  <Input
                    className="mt-1 h-9"
                    type="date"
                    defaultValue={h?.date || ""}
                    onChange={(e) => {
                      const d = e.target.value || null;
                      patch(r.symbol, { date: d, boughtAt: d ? d + "T00:00:00.000Z" : null });
                    }}
                  />
                  <TaxNote date={h?.date} />
                </label>
                <div className="col-span-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
                  <span>
                    1Y <Pct n={r.periods.y1} />
                  </span>
                  {haveRet(r) ? (
                    <>
                      <span>P&L {fmtInr(r.unreal)}</span>
                      <span>
                        Simple <Pct n={r.unrealPct} />
                      </span>
                      <span>XIRR {r.xirr == null ? "—" : <Pct n={r.xirr} />}</span>
                      <span>{r.daysHeld == null ? "—" : `${r.daysHeld}d`}</span>
                      <span>
                        vs Nifty {r.vsNiftyHold == null ? "—" : <Pct n={r.vsNiftyHold} />}
                      </span>
                      <span>
                        vs sector {r.vsSectorHold == null ? "—" : <Pct n={r.vsSectorHold} />}
                      </span>
                      <span>Contrib {r.contrib == null ? "—" : fmtPct(r.contrib, 0)}</span>
                    </>
                  ) : (
                    <span className="text-subtle">Returns need a buy date and average cost.</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <AddRow
        onAdd={(h) => addHoldings(portfolio.id, [h])}
      />
    </div>
  );
}

function haveRet(r: { date?: string | null; avg?: number | null }) {
  return Boolean(r.date && r.avg && r.avg > 0);
}

function HeadTip({
  label,
  tip,
  onClick,
  className,
}: {
  label: string;
  tip: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th className={cn("px-3 py-2 text-right", className)}>
      <Tooltip content={<span className="block max-w-[16rem] text-left leading-snug">{tip}</span>}>
        <button
          type="button"
          className="text-[11px] font-medium tracking-[0.06em] text-subtle uppercase"
          onClick={onClick}
        >
          {label}
        </button>
      </Tooltip>
    </th>
  );
}

function TaxNote({ date }: { date?: string | null }) {
  const t = taxClock(date);
  if (!t) return null;
  return (
    <div className="mt-0.5 text-[11px] text-subtle">
      {t.longTerm ? `Held ${t.days}d · 12-month LTCG` : `Held ${t.days}d · ${t.toLtcg}d to 12-month LTCG`}
    </div>
  );
}

function AddRow({ onAdd }: { onAdd: (h: Holding) => void }) {
  const [mode, setMode] = useState<"stock" | MetalId>("stock");
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [avg, setAvg] = useState("");
  const [date, setDate] = useState("");
  const [hits, setHits] = useState<{ symbol: string; name: string }[]>([]);

  async function onSym(v: string) {
    setSymbol(v);
    if (v.trim().length < 2) {
      setHits([]);
      return;
    }
    try {
      setHits(await apiSearch(v.trim()));
    } catch {
      setHits([]);
    }
  }

  function save() {
    const n = Number(qty);
    if (!(n > 0)) return;
    if (mode === "stock") {
      const s = symbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
      if (!s) return;
      onAdd({ symbol: s, name: s, qty: n, avg: Number(avg) || null, date: date || null, boughtAt: date ? date + "T00:00:00.000Z" : null });
    } else {
      onAdd({
        symbol: mode,
        name: METALS[mode].name,
        qty: n,
        avg: Number(avg) || null,
        date: date || null,
        boughtAt: date ? date + "T00:00:00.000Z" : null,
        kind: "commodity",
        unit: "g",
      });
    }
    setSymbol("");
    setQty("");
    setAvg("");
    setDate("");
    setHits([]);
  }

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Add a line</h2>
      <div className="mt-3 flex flex-wrap gap-1">
        {(["stock", "GOLD", "SILVER"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-sm px-3 text-[12px] font-medium",
              mode === m ? "bg-bg-elevated text-fg shadow-[var(--shadow-border)]" : "text-muted",
            )}
          >
            {m === "stock" ? "Stock" : m === "GOLD" ? "Gold" : "Silver"}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {mode === "stock" ? (
          <label className="text-[12px] text-muted">
            Ticker
            <Input className="mt-1" value={symbol} onChange={(e) => void onSym(e.target.value)} placeholder="Search" />
            {hits.length ? (
              <ul className="mt-1 max-h-36 overflow-auto rounded-sm bg-bg text-[12px] shadow-[var(--shadow-border)]">
                {hits.slice(0, 6).map((h) => (
                  <li key={h.symbol}>
                    <button
                      type="button"
                      className="block w-full px-2 py-1.5 text-left hover:bg-surface-2"
                      onClick={() => {
                        setSymbol(h.symbol.replace(/\.(NS|BO)$/i, ""));
                        setHits([]);
                      }}
                    >
                      {h.symbol.replace(/\.(NS|BO)$/i, "")} · {h.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </label>
        ) : (
          <p className="text-[13px] text-muted self-end">
            Quantity in grams. Avg is ₹/g.
            {mode === "GOLD" ? " Live gold is ₹/10g on the tape." : " Live silver is ₹/kg on the tape."}
          </p>
        )}
        <label className="text-[12px] text-muted">
          {mode === "stock" ? "Quantity" : "Grams"}
          <Input className="mt-1" value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" />
        </label>
        <label className="text-[12px] text-muted">
          Average cost
          <Input className="mt-1" value={avg} onChange={(e) => setAvg(e.target.value)} inputMode="decimal" />
        </label>
        <label className="text-[12px] text-muted">
          Buy date
          <Input className="mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <Button className="mt-3" size="sm" onClick={save}>
        Add to portfolio
      </Button>
    </section>
  );
}
