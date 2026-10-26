import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Crosshair,
  Eye,
  EyeOff,
  Lock,
  Maximize2,
  Minus,
  MousePointer2,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { apiOhlc, apiQuotes, apiSearch } from "@/lib/kosh/api";
import { fmtPct } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { classifyFreshness, quoteMap } from "@/lib/kosh/market-data";
import { resample } from "@/lib/kosh/ohlc";
import { terminalSearch } from "@/lib/kosh/instrument-nav";
import { cleanBars, ohlcCollapsed } from "@/lib/kosh/ledger-bars";
import {
  addIndicator,
  drawScope,
  loadLedgerLayout,
  saveLedgerLayout,
  type DrawKind,
  type IndKind,
  type LedgerDraw,
  type LedgerInd,
  type LedgerLayout,
} from "@/lib/kosh/ledger-layout";
import {
  LEDGER_INTERVALS,
  LEDGER_RANGES,
  clampRange,
  intradayWindow,
  intervalSpec,
  rangesFor,
  type LedgerChartType,
  type LedgerRangeId,
  type LedgerTool,
} from "@/lib/kosh/ledger-spec";
import { bareSymbol, isWatched, useKosh } from "@/lib/store";
import { canOpenStock } from "@/components/stock-link";
import { LayoutSwitch } from "@/components/layout-switch";
import { LedgerChart } from "./ledger-chart";
import { LedgerWatch } from "./ledger-watch";
import "./ledger-terminal.css";

const route = getRouteApi("/markets");

const TOOLS: { id: LedgerTool; label: string; glyph: string }[] = [
  { id: "cursor", label: "Select and pan", glyph: "select" },
  { id: "crosshair", label: "Crosshair", glyph: "cross" },
  { id: "trend", label: "Trend line", glyph: "trend" },
  { id: "ray", label: "Ray", glyph: "ray" },
  { id: "hline", label: "Horizontal line", glyph: "hline" },
  { id: "vline", label: "Vertical line", glyph: "vline" },
  { id: "rect", label: "Rectangle", glyph: "rect" },
  { id: "fib", label: "Fibonacci retracement", glyph: "fib" },
  { id: "measure", label: "Measure", glyph: "measure" },
  { id: "text", label: "Text note", glyph: "text" },
];

const ADDABLE: { kind: IndKind; label: string }[] = [
  { kind: "sma", label: "SMA" },
  { kind: "ema", label: "EMA 20" },
  { kind: "bb", label: "Bollinger 20, 2" },
  { kind: "vwap", label: "Session VWAP" },
  { kind: "volume", label: "Volume" },
  { kind: "rsi", label: "RSI 14" },
  { kind: "macd", label: "MACD 12, 26, 9" },
  { kind: "atr", label: "ATR 14" },
];

function typingTarget(target: EventTarget | null): boolean {
  const node = target as HTMLElement | null;
  return !!node && (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.tagName === "SELECT" || node.isContentEditable);
}

function fmtMove(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const body = Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n > 0) return `+${body}`;
  if (n < 0) return `-${body}`;
  return body;
}

function toolIcon(id: LedgerTool) {
  if (id === "cursor") return <MousePointer2 size={15} />;
  if (id === "crosshair") return <Crosshair size={15} />;
  if (id === "hline") return <Minus size={15} />;
  if (id === "rect") return <Square size={15} />;
  if (id === "text") return <Type size={15} />;
  if (id === "fib") return <span>Fib</span>;
  if (id === "measure") return <span>Δ</span>;
  if (id === "ray") return <span>Ray</span>;
  if (id === "vline") return <span>I</span>;
  return <span>/</span>;
}

export function LedgerTerminal() {
  const search = route.useSearch();
  const navigate = useNavigate();
  const loaded = useMemo(() => loadLedgerLayout(), []);
  const [layout, setLayout] = useState<LedgerLayout>(loaded.layout);
  const [viewNonce, setViewNonce] = useState(0);
  const [tool, setTool] = useState<LedgerTool>("cursor");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menu, setMenu] = useState<"indicators" | "type" | "settings" | "alert" | null>(null);
  const [context, setContext] = useState<{ x: number; y: number; price: number | null; time: number | null; symbol?: string; name?: string } | null>(null);
  const [notice, setNotice] = useState("");
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [mobileWatch, setMobileWatch] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<{ symbol: string; name: string }[]>([]);
  const [alertPrice, setAlertPrice] = useState("");
  const [alertDir, setAlertDir] = useState<"above" | "below">("above");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const layoutRef = useRef(layout);
  const pastRef = useRef<LedgerDraw[][]>([]);
  const futureRef = useRef<LedgerDraw[][]>([]);
  const gestureRef = useRef<LedgerDraw[] | null>(null);
  const [hist, setHist] = useState(0);
  layoutRef.current = layout;

  const symbol = bareSymbol(search.symbol || layout.symbol || "RELIANCE");
  const spec = intervalSpec(layout.interval);
  const scope = drawScope(symbol, spec.id);
  const drawings = layout.drawings[scope] || [];
  const allowedRanges = rangesFor(spec.id);
  const watch = useKosh((s) => s.watch);
  const addAlert = useKosh((s) => s.addAlert);
  const removeAlert = useKosh((s) => s.removeAlert);
  const alerts = useKosh((s) => s.alerts);
  const toggleWatch = useKosh((s) => s.toggleWatch);

  useEffect(() => {
    if (search.symbol) return;
    void navigate({
      to: "/markets",
      search: { view: "terminal", symbol: layoutRef.current.symbol, ...(layoutRef.current.name ? { name: layoutRef.current.name } : {}) },
      replace: true,
    });
  }, [search.symbol, navigate]);

  useEffect(() => {
    setViewNonce((n) => n + 1);
    setSelectedId(null);
    pastRef.current = [];
    futureRef.current = [];
    setHist(0);
  }, [symbol, spec.id, layout.range]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 980px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSave("saving");
      setSave(saveLedgerLayout(layout).ok ? "saved" : "failed");
    }, 450);
    return () => window.clearTimeout(timer);
  }, [layout]);

  const ohlc = useQuery({
    queryKey: ["ledger-ohlc", symbol, spec.yahooRange, spec.yahoo, spec.resample],
    queryFn: () => apiOhlc(symbol, spec.yahooRange, spec.yahoo),
  });
  const quoteQuery = useQuery({
    queryKey: ["ledger-quote", symbol],
    queryFn: () => apiQuotes([symbol]),
    staleTime: 8_000,
    refetchInterval: isIstSession() ? 15_000 : 120_000,
  });

  const bars = useMemo(() => {
    const cleaned = cleanBars(ohlc.data?.bars);
    return spec.resample > 0 ? resample(cleaned, spec.resample) : cleaned;
  }, [ohlc.data, spec.resample]);
  const quote = quoteMap(quoteQuery.data).get(symbol);
  const packPrice = ohlc.data && ohlc.data.price > 0 ? ohlc.data.price : null;
  const lastClose = bars.length ? bars[bars.length - 1].c : null;
  const price = quote && quote.price > 0 ? quote.price : packPrice || lastClose;
  const previous = quote && quote.previousClose > 0 ? quote.previousClose : ohlc.data && ohlc.data.previousClose > 0 ? ohlc.data.previousClose : null;
  const move = price != null && previous != null ? price - previous : null;
  const pct = previous != null && quote && Number.isFinite(quote.changePct) ? quote.changePct : previous != null && ohlc.data && Number.isFinite(ohlc.data.changePct) ? ohlc.data.changePct : null;
  const fresh = quote
    ? classifyFreshness({ session: isIstSession(), price: quote.price, marketTime: quote.marketTime, retrievedAt: quote.retrievedAt })
    : { state: "off" as const, label: ohlc.data ? "QUOTE PENDING" : "NO QUOTE", title: "The header uses the quote request. Candles are a separate historical response and are not filled from this number." };
  const name = ohlc.data?.name || search.name || layout.name || symbol;
  const collapsed = ohlcCollapsed(bars);
  const mine = alerts.filter((alert) => bareSymbol(alert.symbol) === symbol && (alert.kind == null || alert.kind === "price"));
  const watchShown = narrow ? mobileWatch : layout.watchOpen;

  function writeDrawings(next: LedgerDraw[]) {
    setLayout((prev) => {
      const book = { ...prev.drawings };
      if (next.length) book[scope] = next;
      else delete book[scope];
      return { ...prev, drawings: book };
    });
  }

  function onDrawings(next: LedgerDraw[], phase: "start" | "move" | "commit" | "cancel") {
    if (phase === "start") {
      gestureRef.current = layoutRef.current.drawings[scope] || [];
      return;
    }
    if (phase === "cancel") {
      gestureRef.current = null;
      return;
    }
    writeDrawings(next);
    if (phase === "commit") {
      const prev = gestureRef.current;
      gestureRef.current = null;
      if (prev && JSON.stringify(prev) !== JSON.stringify(next)) {
        pastRef.current.push(prev);
        if (pastRef.current.length > 40) pastRef.current.shift();
        futureRef.current = [];
        setHist((n) => n + 1);
      }
    }
  }

  function commitDrawings(next: LedgerDraw[]) {
    const prev = layoutRef.current.drawings[scope] || [];
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      pastRef.current.push(prev);
      futureRef.current = [];
      setHist((n) => n + 1);
    }
    writeDrawings(next);
  }

  function undo() {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push(layoutRef.current.drawings[scope] || []);
    writeDrawings(prev);
    setHist((n) => n + 1);
  }

  function redo() {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(layoutRef.current.drawings[scope] || []);
    writeDrawings(next);
    setHist((n) => n + 1);
  }

  function pick(next: string, nextName?: string) {
    const bare = bareSymbol(next);
    if (!bare) return;
    setLayout((prev) => ({ ...prev, symbol: bare, name: nextName || prev.name }));
    void navigate({ to: "/markets", search: terminalSearch(bare, nextName || bare) });
    setQuery("");
    setHits([]);
    setContext(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (typingTarget(e.target)) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === "Escape") {
        setTool("cursor");
        setMenu(null);
        setContext(null);
        setSelectedId(null);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        commitDrawings(drawings.filter((row) => row.id !== selectedId));
        setSelectedId(null);
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        void toggleFullscreen();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function toggleFullscreen() {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) await document.exitFullscreen();
      else await el.requestFullscreen();
      setNotice("");
    } catch {
      setNotice("Fullscreen was blocked by the browser.");
    }
  }

  async function onSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 1) {
      setHits([]);
      return;
    }
    try {
      const rows = await apiSearch(value.trim());
      setHits(rows.slice(0, 8).map((row) => ({ symbol: bareSymbol(row.symbol), name: row.name })));
    } catch {
      setHits([]);
      setNotice("Symbol search failed.");
    }
  }

  function setIndicators(indicators: LedgerInd[]) {
    setLayout((prev) => ({ ...prev, indicators }));
  }

  const selected = drawings.find((row) => row.id === selectedId) || null;
  const saveLabel = save === "saving" ? "Saving" : save === "saved" ? "Saved" : save === "failed" ? "Save failed" : "Save";

  return (
    <div ref={rootRef} className="kosh-ledger-terminal" data-ledger-terminal>
      <header className="lt-top">
        <Link to="/" className="lt-brand" aria-label="Kosh home">
          <b>K</b>
          <span>Kosh</span>
        </Link>
        <span className="lt-muted">Ledger</span>
        <div className="lt-price">
          <strong>{name}</strong>
          <span className="lt-muted">{ohlc.data?.exchange || "NSE"}</span>
          <strong data-ledger-price>{price == null ? "—" : price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          {ohlc.data?.currency && ohlc.data.currency !== "INR" ? <span className="lt-muted">{ohlc.data.currency}</span> : null}
          <span className={move == null || move === 0 ? "lt-muted" : move > 0 ? "lt-up" : "lt-down"}>{fmtMove(move)}</span>
          <span className={pct == null || pct === 0 ? "lt-muted" : pct > 0 ? "lt-up" : "lt-down"}>{pct == null ? "—" : fmtPct(pct)}</span>
        </div>
        <span className="lt-muted" title={fresh.title} data-ledger-fresh={fresh.state}>
          {fresh.label}
        </span>
        <div className="lt-grow" />
        <div className="lt-search">
          <input
            ref={searchRef}
            aria-label="Search symbol or company"
            placeholder="Search symbol…"
            value={query}
            onChange={(e) => void onSearch(e.target.value)}
          />
          {hits.length ? (
            <div className="lt-hits">
              {hits.map((hit) => (
                <button key={hit.symbol} type="button" onClick={() => pick(hit.symbol, hit.name)}>
                  <b>{hit.symbol}</b>
                  <span className="lt-muted">{hit.name}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button type="button" className="lt-icon" aria-label={isWatched(symbol, watch) ? "Remove from watchlist" : "Add to watchlist"} title={isWatched(symbol, watch) ? "Remove from watchlist" : "Add to watchlist"} onClick={() => toggleWatch(symbol)}>
          {isWatched(symbol, watch) ? "★" : "☆"}
        </button>
        <button type="button" className="lt-bar" style={{ width: "auto" }} onClick={() => saveLedgerLayout(layout).ok ? setSave("saved") : setSave("failed")}>
          <span style={{ padding: "0 8px" }}>{saveLabel}</span>
        </button>
        <nav className="lt-links" aria-label="Leave the chart" style={{ display: "flex", gap: 8 }}>
          <Link to="/markets" search={{ view: "overview" }}>Overview</Link>
          <Link to="/markets/rotation">Rotation</Link>
          <Link to="/app">Books</Link>
        </nav>
        <LayoutSwitch />
      </header>
      <div className="lt-toolbar">
        <div className="lt-bar" aria-label="Interval">
          {LEDGER_INTERVALS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === spec.id}
              onClick={() =>
                setLayout((prev) => ({
                  ...prev,
                  interval: item.id,
                  range: rangesFor(item.id).length ? clampRange(item.id, prev.range) : prev.range,
                }))
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="lt-sep" />
        <div className="lt-bar" aria-label="Range">
          {LEDGER_RANGES.map((item) => {
            const enabled = allowedRanges.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                disabled={!enabled}
                title={enabled ? item.label : `${spec.label} history is ${intradayWindow(spec)}. This range is not available.`}
                aria-pressed={enabled && layout.range === item.id}
                onClick={() => enabled && setLayout((prev) => ({ ...prev, range: item.id as LedgerRangeId }))}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <span className="lt-sep" />
        <div className="lt-bar">
          <button type="button" aria-expanded={menu === "type"} onClick={() => setMenu(menu === "type" ? null : "type")}>
            {layout.chartType === "candle" ? "Candles" : layout.chartType === "bar" ? "Bars" : layout.chartType === "line" ? "Line" : "Area"}
          </button>
          <button type="button" aria-expanded={menu === "indicators"} onClick={() => setMenu(menu === "indicators" ? null : "indicators")}>
            Indicators
          </button>
          <button type="button" onClick={() => setLayout((prev) => ({ ...prev, logScale: !prev.logScale }))} aria-pressed={layout.logScale}>
            {layout.logScale ? "Log" : "Linear"}
          </button>
          <button
            type="button"
            onClick={() => {
              setViewNonce((n) => n + 1);
            }}
          >
            Fit
          </button>
          <button type="button" aria-expanded={menu === "alert"} onClick={() => setMenu(menu === "alert" ? null : "alert")}>
            Alert
          </button>
          <button type="button" aria-label="Chart settings" onClick={() => setMenu(menu === "settings" ? null : "settings")}>
            Settings
          </button>
          <button type="button" aria-label="Fullscreen" onClick={() => void toggleFullscreen()}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      {menu === "type" ? (
        <Panel onClose={() => setMenu(null)}>
          {(["candle", "bar", "line", "area"] as LedgerChartType[]).map((id) => (
            <button key={id} type="button" onClick={() => { setLayout((prev) => ({ ...prev, chartType: id })); setMenu(null); }}>
              {id === "candle" ? "Candles" : id === "bar" ? "OHLC bars" : id === "line" ? "Line" : "Area"}
            </button>
          ))}
        </Panel>
      ) : null}
      {menu === "indicators" ? (
        <Panel onClose={() => setMenu(null)}>
          {ADDABLE.map((item) => (
            <button key={item.kind} type="button" onClick={() => setIndicators(addIndicator(layout.indicators, item.kind))}>
              Add {item.label}
            </button>
          ))}
          {layout.indicators.map((ind) => (
            <label key={ind.id}>
              <span>
                {ind.kind === "macd" ? "MACD 12, 26, 9" : ind.kind === "vwap" ? "Session VWAP" : `${ind.kind.toUpperCase()}${ind.period ? ` ${ind.period}` : ""}`}
              </span>
              <span>
                {ind.kind === "sma" || ind.kind === "ema" || ind.kind === "rsi" || ind.kind === "atr" || ind.kind === "bb" ? (
                  <input
                    aria-label={`${ind.kind} period`}
                    type="number"
                    min={2}
                    max={400}
                    value={ind.period || 14}
                    onChange={(e) => {
                      const period = Math.max(2, Math.min(400, Math.round(Number(e.target.value) || ind.period)));
                      setIndicators(layout.indicators.map((row) => (row.id === ind.id ? { ...row, period } : row)));
                    }}
                    style={{ width: 58 }}
                  />
                ) : null}
                <button type="button" onClick={() => setIndicators(layout.indicators.map((row) => (row.id === ind.id ? { ...row, hidden: !row.hidden } : row)))}>
                  {ind.hidden ? "Show" : "Hide"}
                </button>
                <button type="button" onClick={() => setIndicators(layout.indicators.filter((row) => row.id !== ind.id))}>
                  Remove
                </button>
              </span>
            </label>
          ))}
          <p className="lt-muted">VWAP is the session typical-price average and is drawn only on an intraday interval that has volume. MACD stays 12, 26, 9.</p>
        </Panel>
      ) : null}
      {menu === "alert" ? (
        <Panel onClose={() => setMenu(null)}>
          <p className="lt-muted">Checked only while this browser has Kosh open. Not a server-side alert.</p>
          <label>
            Price
            <input aria-label="Alert price" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} placeholder={price ? String(price) : ""} />
          </label>
          <label>
            Direction
            <select aria-label="Alert direction" value={alertDir} onChange={(e) => setAlertDir(e.target.value === "below" ? "below" : "above")}>
              <option value="above">Crosses above</option>
              <option value="below">Crosses below</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              const level = Number(alertPrice || price);
              if (!(level > 0)) return;
              addAlert({ symbol, name, price: level, dir: alertDir, kind: "price" });
              setAlertPrice("");
            }}
          >
            Save price alert
          </button>
          {mine.map((alert) => (
            <button key={alert.id} type="button" onClick={() => removeAlert(alert.id)}>
              Remove {alert.dir} {alert.price}
            </button>
          ))}
        </Panel>
      ) : null}
      {menu === "settings" ? (
        <Panel onClose={() => setMenu(null)}>
          <p className="lt-muted">/ search · F fullscreen · Esc leaves a tool · Delete removes the selected drawing · Ctrl or Cmd Z undo.</p>
          <button type="button" onClick={() => setLayout((prev) => ({ ...prev, drawingsHidden: !prev.drawingsHidden }))}>
            {layout.drawingsHidden ? "Show drawings" : "Hide drawings"}
          </button>
          <button type="button" onClick={() => setLayout((prev) => ({ ...prev, logScale: !prev.logScale }))}>
            {layout.logScale ? "Use linear scale" : "Use log scale"}
          </button>
        </Panel>
      ) : null}
      <div className="lt-head">
        <b>
          {symbol} · {spec.label}
          {ohlc.data?.exchange ? ` · ${ohlc.data.exchange}` : ""}
        </b>
        <span>
          {bars.length ? `O ${fmtMove(bars[bars.length - 1].o).replace("+", "")} H ${fmtMove(bars[bars.length - 1].h).replace("+", "")} L ${fmtMove(bars[bars.length - 1].l).replace("+", "")} C ${fmtMove(bars[bars.length - 1].c).replace("+", "")}` : "No bar loaded"}
        </span>
      </div>
      <div className="lt-body">
        <aside className="lt-draw" aria-label="Drawing tools">
          {TOOLS.map((item) => (
            <button key={item.id} type="button" className="lt-tool" aria-label={item.label} title={item.label} aria-pressed={tool === item.id} onClick={() => setTool(item.id)}>
              {toolIcon(item.id)}
            </button>
          ))}
          <button type="button" className="lt-tool" aria-label="Undo drawing" title="Undo" disabled={!pastRef.current.length && hist >= 0 && pastRef.current.length === 0} onClick={undo}>
            <Undo2 size={15} />
          </button>
          <button type="button" className="lt-tool" aria-label="Redo drawing" title="Redo" onClick={redo}>
            <Redo2 size={15} />
          </button>
          <button type="button" className="lt-tool" aria-label="Delete selected drawing" title="Delete selected" disabled={!selected} onClick={() => selected && (commitDrawings(drawings.filter((row) => row.id !== selected.id)), setSelectedId(null))}>
            <Trash2 size={15} />
          </button>
          <button
            type="button"
            className="lt-tool"
            aria-label={selected?.locked ? "Unlock drawing" : "Lock drawing"}
            title={selected?.locked ? "Unlock" : "Lock"}
            disabled={!selected}
            onClick={() => selected && commitDrawings(drawings.map((row) => (row.id === selected.id ? { ...row, locked: !row.locked } : row)))}
          >
            <Lock size={15} />
          </button>
          <button type="button" className="lt-tool" aria-label={layout.drawingsHidden ? "Show drawings" : "Hide drawings"} title={layout.drawingsHidden ? "Show drawings" : "Hide drawings"} aria-pressed={layout.drawingsHidden} onClick={() => setLayout((prev) => ({ ...prev, drawingsHidden: !prev.drawingsHidden }))}>
            {layout.drawingsHidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </aside>
        <section className="lt-stage">
          <div style={{ position: "relative", minHeight: 0, flex: 1, display: "flex", flexDirection: "column" }}>
            {bars.length ? (
              <LedgerChart
                bars={bars}
                intra={spec.intra}
                chartType={layout.chartType}
                logScale={layout.logScale}
                range={layout.range}
                viewNonce={viewNonce}
                indicators={layout.indicators}
                drawings={drawings}
                drawingsHidden={layout.drawingsHidden}
                tool={tool}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDrawings={onDrawings}
                onContext={(info) => setContext(info)}
              />
            ) : (
              <div className="lt-chart" data-ledger-chart data-bars="0" />
            )}
            {ohlc.isPending ? <div className="lt-status">Loading {symbol} {spec.label} bars…</div> : null}
            {ohlc.isError ? (
              <div className={ohlc.data ? "lt-banner" : "lt-status"}>
                <p>{ohlc.error instanceof Error ? ohlc.error.message : "The history request failed."}</p>
                <button type="button" onClick={() => void ohlc.refetch()}>
                  Retry
                </button>
              </div>
            ) : null}
            {!ohlc.isPending && !ohlc.isError && !bars.length ? (
              <div className="lt-status">No bars were returned for {symbol} at {spec.label}. Nothing was invented to fill the gap.</div>
            ) : null}
            {collapsed ? <div className="lt-banner">This response has a close and no separate open, high, or low. Switch to Line if a candle is misleading.</div> : null}
          </div>
          <footer className="lt-foot">
            <span>
              {spec.label}
              {spec.intra ? ` · ${intradayWindow(spec)}` : ` · ${layout.range}`}
              {spec.note ? ` · ${spec.note}` : ""}
            </span>
            <span className="lt-grow" />
            <span title="Yahoo Finance chart endpoint. Not a licensed exchange feed.">{ohlc.isFetching ? "Refreshing" : "Yahoo Finance · not a live exchange feed"}</span>
          </footer>
        </section>
        <LedgerWatch
          active={symbol}
          open={watchShown}
          onPick={pick}
          onMenu={(info) => setContext({ x: info.x, y: info.y, price: info.price, time: null, symbol: info.symbol, name: info.name })}
        />
      </div>
      <nav className="lt-bottom" aria-label="Terminal">
        <button type="button" onClick={() => setMobileWatch(false)}>
          Chart
        </button>
        <button type="button" onClick={() => setMobileWatch(true)}>
          Watch
        </button>
        <Link to="/markets" search={{ view: "overview" }}>
          Overview
        </Link>
        <Link to="/app">Books</Link>
      </nav>
      {loaded.recovered ? <div className="lt-banner">A saved chart layout could not be read. This is the default Reliance daily chart.</div> : null}
      {notice ? <div className="lt-banner">{notice}</div> : null}
      {context ? (
        <div className="lt-menu" style={{ left: Math.min(context.x, window.innerWidth - 240), top: Math.min(context.y, window.innerHeight - 220) }}>
          <button type="button" onClick={() => { setViewNonce((n) => n + 1); setContext(null); }}>
            Reset chart view
          </button>
          {context.price != null ? (
            <button
              type="button"
              onClick={() => {
                const row: LedgerDraw = {
                  id: crypto.randomUUID(),
                  kind: "hline" as DrawKind,
                  t0: context.time || bars.at(-1)?.t || 0,
                  p0: context.price as number,
                  color: "#4c8dff",
                  locked: false,
                  hidden: false,
                };
                commitDrawings([...drawings, row]);
                setSelectedId(row.id);
                setContext(null);
              }}
            >
              Add horizontal line at {context.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </button>
          ) : null}
          {context.price != null ? (
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(String(context.price)).then(
                  () => setNotice(""),
                  () => setNotice("Could not copy that price."),
                );
                setContext(null);
              }}
            >
              Copy price
            </button>
          ) : null}
          <button type="button" onClick={() => { setLayout((prev) => ({ ...prev, drawingsHidden: !prev.drawingsHidden })); setContext(null); }}>
            {layout.drawingsHidden ? "Show drawings" : "Hide drawings"}
          </button>
          <button type="button" onClick={() => { toggleWatch(context.symbol || symbol); setContext(null); }}>
            {isWatched(context.symbol || symbol, watch) ? "Remove from watchlist" : "Add to watchlist"}
          </button>
          {canOpenStock(context.symbol || symbol) ? (
            <Link to="/s/$symbol" params={{ symbol: bareSymbol(context.symbol || symbol) }} onClick={() => setContext(null)}>
              Open research page
            </Link>
          ) : null}
          <button type="button" onClick={() => setContext(null)}>
            Close
          </button>
        </div>
      ) : null}
      <span className="lt-sr" data-hist={hist} hidden />
    </div>
  );
}

function Panel({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <>
      <button type="button" aria-label="Close menu" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 24, background: "transparent", border: 0 }} />
      <div className="lt-pop" style={{ position: "fixed", top: 92, right: 12, zIndex: 26 }}>
        {children}
      </div>
    </>
  );
}
