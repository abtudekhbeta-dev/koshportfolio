import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Car, Factory, FlaskConical, HeartPulse, Hexagon, Home, Info, Landmark, Monitor, MoreHorizontal, Radio, ShoppingBag, Zap, type LucideIcon } from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import { canOpenStock, stockBare } from "@/components/stock-link";
import { fmtInr, fmtPct } from "@/lib/kosh/engine";
import { buildHoldingHeat, displaySector, groupHeatSectors, type HeatInput, type HeatTile, type ShownTile } from "@/lib/kosh/holding-heat";
import { treemap, type Tile } from "@/lib/kosh/index-basket";
import { cn } from "@/lib/utils";

type Metric = "weight" | "day" | "sector";

const SECTOR_FILL: Record<string, { background: string; color: string }> = {
  Financials: { background: "#d7e6fb", color: "#1e3a5f" },
  IT: { background: "#e4dff8", color: "#3b2f6b" },
  Energy: { background: "#f8efc4", color: "#5c4810" },
  FMCG: { background: "#d8f3e3", color: "#14532d" },
  Auto: { background: "#f8d9d6", color: "#7f1d1d" },
  Telecom: { background: "#f6d7ec", color: "#6b2150" },
  Materials: { background: "#e6e8ee", color: "#334155" },
  Healthcare: { background: "#d5f3ee", color: "#115e59" },
  Industrials: { background: "#dceaf8", color: "#1e3a5f" },
  Consumer: { background: "#fde8d4", color: "#7c3a12" },
  Chemicals: { background: "#e5f0d8", color: "#3f6212" },
  Realty: { background: "#efe4d6", color: "#5c4030" },
  Commodities: { background: "#f3e8c8", color: "#6b5420" },
  Other: { background: "#eceef2", color: "#3f4650" },
  Unclassified: { background: "#eceef2", color: "#3f4650" },
};

const SECTOR_ICON: Record<string, LucideIcon> = {
  Financials: Landmark,
  IT: Monitor,
  Energy: Zap,
  FMCG: ShoppingBag,
  Auto: Car,
  Telecom: Radio,
  Materials: Hexagon,
  Healthcare: HeartPulse,
  Industrials: Factory,
  Consumer: ShoppingBag,
  Chemicals: FlaskConical,
  Realty: Home,
  Commodities: Hexagon,
  Other: MoreHorizontal,
  Unclassified: MoreHorizontal,
};

function sectorPaint(name: string) {
  return SECTOR_FILL[name] || SECTOR_FILL.Other;
}

function mix(from: number[], to: number[], t: number) {
  return `rgb(${from.map((value, i) => Math.round(value + (to[i] - value) * t)).join(",")})`;
}

function weightTint(weight: number, max: number) {
  const t = max > 0 ? Math.max(0, Math.min(1, weight / max)) : 0;
  const e = Math.pow(t, 0.9);
  const background = mix([236, 243, 252], [30, 78, 216], e);
  const dark = e > 0.55;
  return { background, color: dark ? "#f8fafc" : "#1e3a5f", dark };
}

function dayTint(pct: number | null) {
  if (pct == null || !Number.isFinite(pct) || Math.abs(pct) < 0.05) {
    return { background: "#e7eaee", color: "#3f4650", dark: false };
  }
  const t = Math.max(0.28, Math.min(0.7, Math.abs(pct) / 2.4));
  if (pct > 0) return { background: mix([232, 246, 236], [167, 220, 186], t), color: "#14532d", dark: false };
  return { background: mix([252, 236, 236], [244, 196, 196], t), color: "#7f1d1d", dark: false };
}

function dayInk(pct: number | null, onDark: boolean) {
  if (pct == null || !Number.isFinite(pct) || Math.abs(pct) < 0.05) return onDark ? "#e2e8f0" : "#64748b";
  if (pct > 0) return onDark ? "#bbf7d0" : "#15803d";
  return onDark ? "#fecaca" : "#b91c1c";
}

function signed(n: number) {
  if (n > 0) return `+${fmtInr(n)}`;
  return fmtInr(n);
}

function heatFrameHeight(count: number, width: number) {
  const narrow = width > 0 && width < 700;
  const extra = Math.max(0, count - (narrow ? 4 : 8));
  const grown = (narrow ? 188 : 148) + extra * (narrow ? 12 : 9);
  return Math.max(narrow ? 188 : 148, Math.min(narrow ? 560 : 680, grown));
}

export function PortfolioHeatmap({
  rows,
  pending,
  failed,
  selectedCount,
  portfolioCount,
}: {
  rows: HeatInput[] | null;
  pending: boolean;
  failed: boolean;
  selectedCount: number;
  portfolioCount: number;
}) {
  const navigate = useNavigate();
  const frame = useRef<HTMLDivElement>(null);
  const [metric, setMetric] = useState<Metric>("weight");
  const [scope, setScope] = useState<string>("combined");
  const [active, setActive] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [drill, setDrill] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const bookIds = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows || []) map.set(row.bookId, row.bookName);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [rows]);
  const scopeId = scope !== "combined" && bookIds.some((book) => book.id === scope) ? scope : bookIds.length === 1 ? bookIds[0].id : "combined";
  const scoped = useMemo(() => {
    if (!rows) return [];
    if (scopeId === "combined") return rows;
    return rows.filter((row) => row.bookId === scopeId);
  }, [rows, scopeId]);
  const model = useMemo(() => (rows ? buildHoldingHeat(scoped) : null), [rows, scoped]);
  const stocks = useMemo(() => (model ? model.tiles.map((tile) => ({ ...tile, sector: displaySector(tile.sector) })) : []), [model]);
  const shown = useMemo((): ShownTile[] => {
    if (!stocks.length) return [];
    if (metric === "sector" && !drill) return groupHeatSectors(stocks);
    if (drill) return stocks.filter((tile) => tile.sector === drill);
    return stocks;
  }, [stocks, metric, drill]);
  const height = heatFrameHeight(shown.length, width);
  const boxes = useMemo(() => (width > 0 ? treemap(shown.map((tile) => tile.value), width, height) : []), [shown, width, height]);
  const maxWeight = shown.reduce((max, tile) => Math.max(max, tile.weightOfPriced), 0);
  const tip = shown.find((tile) => tile.key === active) || null;
  const scopeName = scopeId === "combined" ? (bookIds.length > 1 ? "Selected portfolios" : bookIds[0]?.name || "Portfolio") : bookIds.find((book) => book.id === scopeId)?.name || "Portfolio";
  const metricLabel = metric === "day" ? "Colour by day change" : metric === "sector" ? "Colour by sector" : "Weight by market value";

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const apply = () => setWidth(Math.max(0, Math.floor(node.clientWidth)));
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => observer.disconnect();
  }, [model?.tiles.length, pending, failed, selectedCount]);

  useEffect(() => {
    if (metric !== "sector") setDrill(null);
  }, [metric]);

  function openTile(tile: ShownTile) {
    if (metric === "sector" && !drill && tile.members?.length) {
      setDrill(tile.sector || tile.name);
      setActive(tile.key);
      return;
    }
    if (tile.others || tile.members || !canOpenStock(tile.symbol)) {
      setActive(tile.key);
      return;
    }
    void navigate({ to: "/s/$symbol", params: { symbol: stockBare(tile.symbol) } });
  }

  return (
    <section className="mt-3 rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)] sm:px-4" aria-label="Portfolio heatmap" data-portfolio-heatmap>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="shrink-0 text-[15px] font-semibold">Portfolio heatmap</h2>
          {bookIds.length > 1 ? (
            <select
              aria-label="Heatmap portfolio"
              value={scopeId}
              onChange={(event) => setScope(event.target.value)}
              className="h-7 max-w-44 truncate bg-transparent text-[12px] text-muted outline-none"
            >
              <option value="combined">Selected portfolios</option>
              {bookIds.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="truncate text-[12px] text-muted">{scopeName}</span>
          )}
          <span className="truncate text-[12px] text-muted">· {metricLabel}</span>
          <button
            type="button"
            className="grid size-6 shrink-0 place-items-center rounded-full text-subtle hover:bg-bg hover:text-fg"
            title="Rectangle area is market value. Colour follows the selected view. A missing price is left out, not drawn as zero."
            aria-label="How the heatmap is weighted"
          >
            <Info className="size-3.5" />
          </button>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-0.5" role="tablist" aria-label="Heatmap view">
            {(
              [
                ["weight", "Market value"],
                ["day", "Day change"],
                ["sector", "Sector"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={metric === id}
                className={cn("h-7 rounded-full px-3 text-[12px] font-medium", metric === id ? "bg-accent/15 text-accent" : "text-muted hover:text-fg")}
                onClick={() => setMetric(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <HeatLegend metric={metric} shown={shown} />
        </div>
      </div>

      {pending || rows == null ? (
        <div className="mt-3 h-36 animate-pulse rounded-md bg-bg" />
      ) : failed ? (
        <p className="mt-3 text-[13px] text-muted">Prices did not load. The map is withheld so a missing price is not drawn as zero.</p>
      ) : !selectedCount ? (
        <p className="mt-3 text-[13px] text-muted">No portfolio is included in the combined summary. Select one above. Nothing is drawn as zero.</p>
      ) : !model || model.positions === 0 ? (
        <p className="mt-3 text-[13px] text-muted">The selected portfolios have no open positions.</p>
      ) : (
        <>
          {model.tiles.length === 0 ? (
            <p className="mt-3 text-[13px] text-muted">None of the open positions have a price. They are listed below and are not drawn as zero weight.</p>
          ) : (
            <>
              {drill ? (
                <div className="mt-3 flex items-center gap-2 text-[12px]">
                  <button type="button" className="h-7 rounded-full bg-bg px-3 text-muted shadow-[var(--shadow-border)]" onClick={() => setDrill(null)}>
                    All sectors
                  </button>
                  <span className="text-muted">{drill} · each holding</span>
                </div>
              ) : null}
              <div ref={frame} className="relative mt-3 w-full overflow-hidden" style={{ height }} onMouseLeave={() => setActive(null)}>
            {width > 0
              ? shown.map((tile, index) => {
                  const box = boxes[index];
                  if (!box || box.w < 1 || box.h < 1) return null;
                  const face = drill ? "weight" : metric;
                  const paint = face === "day" ? dayTint(tile.dayPct) : face === "sector" ? { ...sectorPaint(tile.sector || tile.name), dark: false } : weightTint(tile.weightOfPriced, maxWeight);
                  const needle = query.trim().toLowerCase();
                  const matched = !needle || tile.symbol.toLowerCase().includes(needle) || tile.name.toLowerCase().includes(needle) || (tile.members || []).some((row) => row.symbol.toLowerCase().includes(needle) || row.name.toLowerCase().includes(needle));
                  const inset = 3;
                  return (
                    <button
                      key={tile.key}
                      type="button"
                      data-heat-tile
                      className="absolute flex overflow-hidden text-left focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563eb]"
                      style={{
                        left: box.x + inset,
                        top: box.y + inset,
                        width: Math.max(0, box.w - inset * 2),
                        height: Math.max(0, box.h - inset * 2),
                        background: paint.background,
                        color: paint.color,
                        opacity: matched ? 1 : 0.28,
                        borderRadius: 8,
                      }}
                      aria-label={`${tile.name}, ${tile.weightOfPriced.toFixed(1)}% of priced value, market value ${fmtInr(tile.value)}, daily change ${tile.dayPct == null ? "unavailable" : fmtPct(tile.dayPct)}`}
                      onMouseEnter={() => setActive(tile.key)}
                      onFocus={() => setActive(tile.key)}
                      onClick={() => {
                        setActive(tile.key);
                        openTile(tile);
                      }}
                    >
                      <TileFace tile={tile} box={{ ...box, w: box.w - inset * 2, h: box.h - inset * 2 }} metric={face} dark={paint.dark} />
                    </button>
                  );
                })
              : null}
          </div>
          <div className="mt-2 min-h-5 text-[12px] leading-snug text-muted" aria-live="polite">
            {tip ? <TileFacts tile={tip} pricedOnly={!model.complete} /> : drill ? "These are the holdings in the sector. Click a stock to open its page." : metric === "sector" ? "Click a sector to see each holding. Area is still market value." : "Every priced holding has its own tile. Point at one for the full figures."}
          </div>
            </>
          )}
          <HoldingList
            stocks={drill ? stocks.filter((tile) => tile.sector === drill) : stocks}
            unpriced={model.unpriced}
            query={query}
            onQuery={setQuery}
            active={active}
            onPick={(key) => {
              setActive(key);
              const tile = stocks.find((row) => row.key === key);
              if (tile && canOpenStock(tile.symbol)) void navigate({ to: "/s/$symbol", params: { symbol: stockBare(tile.symbol) } });
            }}
            complete={model.complete}
            pricedPositions={model.pricedPositions}
            positions={model.positions}
            combined={scopeId === "combined" && bookIds.length > 1}
          />
        </>
      )}
      <span className="sr-only">{portfolioCount} portfolios in this account</span>
    </section>
  );
}

function queryHits(query: string, symbol: string, name: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return symbol.toLowerCase().includes(needle) || name.toLowerCase().includes(needle);
}

function HoldingList({
  stocks,
  unpriced,
  query,
  onQuery,
  active,
  onPick,
  complete,
  pricedPositions,
  positions,
  combined,
}: {
  stocks: HeatTile[];
  unpriced: { symbol: string; name: string }[];
  query: string;
  onQuery: (value: string) => void;
  active: string | null;
  onPick: (key: string) => void;
  complete: boolean;
  pricedPositions: number;
  positions: number;
  combined: boolean;
}) {
  const visible = stocks.filter((tile) => queryHits(query, tile.symbol, tile.name));
  const missing = unpriced.filter((row) => queryHits(query, row.symbol, row.name));
  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Find a holding…"
          aria-label="Find a holding in this heatmap"
          className="h-8 w-full max-w-xs rounded-md bg-bg px-3 text-[12px] shadow-[var(--shadow-border)] outline-none"
        />
        <p className="text-[11px] text-subtle">
          {stocks.length} priced {stocks.length === 1 ? "name" : "names"} on the map.
          {complete ? " Weights are shares of market value." : ` ${pricedPositions} of ${positions} positions have a price. Weights use priced value only.`}
          {combined ? " The same symbol in more than one selected book is added together." : ""}
        </p>
      </div>
      {missing.length ? (
        <div className="mt-2">
          <p className="text-[11px] text-subtle">No price, so these names are not given an area. A missing price is not zero.</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {missing.map((row) => (
              <li key={row.symbol} className="rounded-md bg-bg px-2 py-1 text-[11px] text-muted">
                <span className="font-semibold text-fg">{row.symbol}</span>
                <span> · price unavailable</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul className="mt-2 max-h-52 overflow-auto">
        {visible.map((tile) => (
          <li key={tile.key}>
            <button
              type="button"
              className={cn("flex w-full items-baseline gap-3 rounded-md px-1 py-1.5 text-left text-[12px] hover:bg-bg", active === tile.key && "bg-bg")}
              onClick={() => onPick(tile.key)}
            >
              <span className="w-28 shrink-0 truncate font-semibold">{tile.symbol}</span>
              <span className="min-w-0 flex-1 truncate text-muted">{tile.name}</span>
              <span className="shrink-0 font-mono tabular">{fmtInr(tile.value)}</span>
              <span className="w-14 shrink-0 text-right font-mono tabular">{tile.weightOfPriced.toFixed(1)}%</span>
              <span className={cn("w-16 shrink-0 text-right font-mono tabular", tile.dayPct == null ? "text-subtle" : tile.dayPct > 0 ? "text-up" : tile.dayPct < 0 ? "text-down" : "text-muted")}>
                {tile.dayPct == null ? "—" : fmtPct(tile.dayPct)}
              </span>
              <span className="hidden w-24 shrink-0 truncate text-right text-subtle sm:inline">{tile.sector}</span>
            </button>
          </li>
        ))}
        {!visible.length && !missing.length ? <li className="px-1 py-2 text-[12px] text-muted">No holding matches that search.</li> : null}
      </ul>
    </div>
  );
}

function HeatLegend({ metric, shown }: { metric: Metric; shown: ShownTile[] }) {
  if (metric === "weight") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
        Lower weight
        <span className="inline-block h-1.5 w-16 rounded-full" style={{ background: "linear-gradient(90deg,#e8f1fc,#1e4ed8)" }} />
        Higher weight
      </span>
    );
  }
  if (metric === "day") {
    return (
      <span className="inline-flex items-center gap-2 text-[11px] text-muted">
        <span>Area is market value</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block size-2 rounded-[2px]" style={{ background: dayTint(-1).background }} /> Down</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block size-2 rounded-[2px]" style={{ background: dayTint(0).background }} /> Flat</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block size-2 rounded-[2px]" style={{ background: dayTint(1).background }} /> Up</span>
      </span>
    );
  }
  const sectors = [...new Set(shown.map((tile) => tile.sector || "Other"))].slice(0, 6);
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
      <span>Area is market value</span>
      {sectors.map((sector) => (
        <span key={sector} className="inline-flex items-center gap-1">
          <i className="inline-block size-2 rounded-[2px]" style={{ background: sectorPaint(sector).background }} />
          {sector}
        </span>
      ))}
    </span>
  );
}

function TileFace({ tile, box, metric, dark }: { tile: ShownTile; box: Tile; metric: Metric; dark: boolean }) {
  const label = tile.others ? "Others" : metric === "sector" ? tile.name : tile.symbol;
  const weight = `${tile.weightOfPriced.toFixed(1)}%`;
  const day = tile.dayPct == null ? "Day n/a" : fmtPct(tile.dayPct);
  const ink = dayInk(tile.dayPct, dark);
  const wide = box.w >= 168 && box.h >= 88 && metric !== "sector" && !tile.others;
  const showLogo = metric !== "sector" && !tile.others && box.w >= 68 && box.h >= 78;
  const showTicker = box.w >= 36 && box.h >= 24;
  const showWeight = box.w >= 36 && box.h >= 40;
  const showExtra = box.w >= 52 && box.h >= 58;
  const logoSize = box.w >= 220 ? 36 : box.h >= 100 ? 28 : 22;

  if (metric === "sector") {
    const Icon = SECTOR_ICON[tile.sector || tile.name] || MoreHorizontal;
    return (
      <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-2 text-center">
        {box.w >= 72 && box.h >= 64 ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
        {showTicker ? <span className="max-w-full truncate text-[12px] font-semibold leading-tight">{label}</span> : null}
        {showWeight ? <span className="font-mono text-[12px] leading-tight tabular">{weight}</span> : null}
        {showExtra && tile.members ? <span className="text-[10px] leading-tight opacity-80">{tile.members.length} holdings</span> : null}
      </span>
    );
  }

  if (tile.others) {
    return (
      <span className="flex h-full w-full flex-col items-center justify-center px-1.5 text-center leading-tight">
        <span className="text-[12px] font-semibold">Others</span>
        {showWeight ? <span className="font-mono text-[13px] tabular">{weight}</span> : null}
        {showExtra ? <span className="text-[10px] opacity-80">{tile.others.length} holdings</span> : null}
      </span>
    );
  }

  if (wide) {
    return (
      <span className="flex h-full w-full items-center justify-center gap-3 px-3">
        {showLogo ? <CompanyLogo symbol={tile.symbol} name={tile.name} size={logoSize} /> : null}
        <span className="min-w-0 text-left leading-tight">
          <span className="block truncate text-[14px] font-semibold">{label}</span>
          <span className="block font-mono text-[16px] font-semibold tabular">{weight}</span>
          <span className="block font-mono text-[12px] tabular" style={{ color: ink }}>
            {day}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-1.5 text-center leading-tight">
      {showLogo ? <CompanyLogo symbol={tile.symbol} name={tile.name} size={logoSize} /> : null}
      {showTicker ? <span className={cn("max-w-full truncate font-semibold", box.w >= 110 ? "text-[12px]" : "text-[11px]")}>{label}</span> : null}
      {showWeight ? <span className={cn("font-mono tabular", box.w >= 110 ? "text-[13px]" : "text-[11px]")}>{weight}</span> : null}
      {showExtra ? (
        <span className="font-mono text-[11px] tabular" style={{ color: ink }}>
          {day}
        </span>
      ) : null}
    </span>
  );
}

function TileFacts({ tile, pricedOnly }: { tile: ShownTile; pricedOnly: boolean }) {
  const members = tile.members || tile.others || [];
  return (
    <span>
      <span className="font-semibold text-fg">{tile.symbol}</span>
      {tile.name !== tile.symbol ? <span> · {tile.name}</span> : null}
      <span className="font-mono tabular"> · {fmtInr(tile.value)}</span>
      <span className="font-mono tabular"> · {tile.weightOfPriced.toFixed(1)}% of priced value</span>
      {tile.weightOfBook != null ? <span className="font-mono tabular"> · {tile.weightOfBook.toFixed(1)}% of the book</span> : pricedOnly ? <span> · full-book weight withheld</span> : null}
      <span className="font-mono tabular"> · day {tile.dayPct == null ? "unavailable" : `${fmtPct(tile.dayPct)}${tile.dayAbs != null ? ` (${signed(tile.dayAbs)})` : ""}`}</span>
      {tile.sector && !tile.others ? <span> · {tile.sector}</span> : null}
      {members.length ? (
        <span>
          {" "}
          · {members
            .slice(0, 8)
            .map((row: HeatTile) => `${row.symbol} ${row.weightOfPriced.toFixed(1)}%`)
            .join(", ")}
          {members.length > 8 ? "…" : ""}
        </span>
      ) : null}
    </span>
  );
}
