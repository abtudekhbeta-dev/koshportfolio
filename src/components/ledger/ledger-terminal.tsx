import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  type DrawDash,
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
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { clampWatchWidth, placeMenu } from "@/lib/kosh/ledger-chrome";
import { LedgerChart } from "./ledger-chart";
import { LedgerImportDialog } from "./ledger-import-dialog";
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

const PENS = ["#4c8dff", "#e6b85c", "#0f8a52", "#c63737", "#9b8af5", "#3f3c37"];

export function LedgerTerminal({ host = "overlay" }: { host?: "overlay" | "embed" }) {
  const search = route.useSearch();
  const navigate = useNavigate();
  const loaded = useMemo(() => loadLedgerLayout(), []);
  const [layout, setLayout] = useState<LedgerLayout>(loaded.layout);
  const [viewNonce, setViewNonce] = useState(0);
  const [tool, setTool] = useState<LedgerTool>("cursor");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menu, setMenu] = useState<"indicators" | "type" | "settings" | "alert" | null>(null);
  const [context, setContext] = useState<{ source: "chart" | "watch"; x: number; y: number; price: number | null; time: number | null; symbol?: string; name?: string } | null>(null);
  const [pen, setPen] = useState<{ color: string; width: number; dash: DrawDash }>({ color: "#4c8dff", width: 2, dash: "solid" });
  const [notice, setNotice] = useState("");
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [mobileWatch, setMobileWatch] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<{ symbol: string; name: string }[]>([]);
  const [alertPrice, setAlertPrice] = useState("");
  const [alertDir, setAlertDir] = useState<"above" | "below">("above");
  const [importOpen, setImportOpen] = useState(false);
  const [indQuery, setIndQuery] = useState("");
  const [menuBox, setMenuBox] = useState<DOMRect | null>(null);
  const [resizing, setResizing] = useState(false);
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
  const theme = useKosh((s) => (s.theme === "light" ? "light" : "dark"));

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
        if (e.key === "Escape") {
          setImportOpen(false);
          setMenu(null);
          (e.target as HTMLElement).blur();
        }
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
        setImportOpen(false);
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
  const addable = ADDABLE.filter((item) => item.label.toLowerCase().includes(indQuery.trim().toLowerCase()));

  function openMenu(id: "indicators" | "type" | "settings" | "alert", button: HTMLButtonElement) {
    if (menu === id) {
      setMenu(null);
      setMenuBox(null);
      return;
    }
    setMenu(id);
    setMenuBox(button.getBoundingClientRect());
  }

  function startResize(event: { clientX: number; preventDefault: () => void }) {
    if (narrow) return;
    event.preventDefault();
    const startX = event.clientX;
    const startW = layoutRef.current.watchWidth;
    setResizing(true);
    const move = (ev: PointerEvent) => {
      const next = clampWatchWidth(startW - (ev.clientX - startX));
      setLayout((prev) => (prev.watchWidth === next ? prev : { ...prev, watchWidth: next }));
    };
    const stop = () => {
      setResizing(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  return (
    <div
      ref={rootRef}
      className={`kosh-ledger-terminal${host === "embed" ? " is-embed" : ""}${resizing ? " is-resizing" : ""}`}
      data-ledger-terminal
      data-host={host}
      data-theme={theme}
      style={{ ["--lt-watch" as string]: `${layout.watchWidth}px` }}
      data-resizing={resizing ? "true" : "false"}
    >
      <header className="lt-top">
        <Link to="/" className="lt-brand" aria-label="Kosh home">
          <b>K</b>
          <span>Kosh</span>
        </Link>
        <span className="lt-muted lt-ledger-label">Ledger</span>
        <div className="lt-price">
          <strong>{name}</strong>
          <span className="lt-muted">{ohlc.data?.exchange || "NSE"}</span>
          <strong data-ledger-price>{price == null ? "—" : price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          {ohlc.data?.currency && ohlc.data.currency !== "INR" ? <span className="lt-muted">{ohlc.data.currency}</span> : null}
          <span className={move == null || move === 0 ? "lt-muted" : move > 0 ? "lt-up" : "lt-down"}>{fmtMove(move)}</span>
          <span className={pct == null || pct === 0 ? "lt-muted" : pct > 0 ? "lt-up" : "lt-down"}>{pct == null ? "—" : fmtPct(pct)}</span>
        </div>
        <Tip text={fresh.title}>
          <span className="lt-muted" data-ledger-fresh={fresh.state}>
            {fresh.label}
          </span>
        </Tip>
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
        <Tip text={isWatched(symbol, watch) ? "Remove from watchlist" : "Add to watchlist"}>
          <button type="button" className="lt-icon" aria-label={isWatched(symbol, watch) ? "Remove from watchlist" : "Add to watchlist"} onClick={() => toggleWatch(symbol)}>
            {isWatched(symbol, watch) ? "★" : "☆"}
          </button>
        </Tip>
        <Tip text="Save layout">
          <button type="button" className="lt-bar" style={{ width: "auto" }} onClick={() => (saveLedgerLayout(layout).ok ? setSave("saved") : setSave("failed"))}>
            <span style={{ padding: "0 8px" }}>{saveLabel}</span>
          </button>
        </Tip>
        <nav className="lt-links lt-leave" aria-label="Leave the chart" style={{ display: "flex", gap: 8 }}>
          <Link to="/markets" search={{ view: "overview" }}>Overview</Link>
          <Link to="/markets/rotation">Rotation</Link>
          <Link to="/app">Books</Link>
        </nav>
        <span className="lt-layout-host">
          <LayoutSwitch />
        </span>
        {host === "overlay" ? <ThemeToggle /> : null}
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
        <div className="lt-bar">
          <Tip text="Chart type">
            <button type="button" aria-expanded={menu === "type"} aria-haspopup="menu" onClick={(e) => openMenu("type", e.currentTarget)}>
              {layout.chartType === "candle" ? "Candles" : layout.chartType === "bar" ? "Bars" : layout.chartType === "line" ? "Line" : "Area"}
            </button>
          </Tip>
          <Tip text="Indicators">
            <button type="button" aria-expanded={menu === "indicators"} aria-haspopup="menu" onClick={(e) => openMenu("indicators", e.currentTarget)}>
              Indicators
            </button>
          </Tip>
          <Tip text={layout.logScale ? "Logarithmic scale" : "Linear scale"}>
            <button type="button" onClick={() => setLayout((prev) => ({ ...prev, logScale: !prev.logScale }))} aria-pressed={layout.logScale}>
              {layout.logScale ? "Log" : "Linear"}
            </button>
          </Tip>
          <Tip text="Fit chart">
            <button type="button" onClick={() => setViewNonce((n) => n + 1)}>
              Fit
            </button>
          </Tip>
          <Tip text="Price alert">
            <button type="button" aria-expanded={menu === "alert"} aria-haspopup="dialog" onClick={(e) => openMenu("alert", e.currentTarget)}>
              Alert
            </button>
          </Tip>
          <Tip text="Settings">
            <button type="button" aria-label="Chart settings" aria-expanded={menu === "settings"} aria-haspopup="menu" onClick={(e) => openMenu("settings", e.currentTarget)}>
              Settings
            </button>
          </Tip>
          <Tip text="Fullscreen · F">
            <button type="button" aria-label="Fullscreen" onClick={() => void toggleFullscreen()}>
              <Maximize2 size={14} />
            </button>
          </Tip>
        </div>
      </div>
      <AnchoredMenu open={menu === "type"} anchor={menuBox} label="Chart type" onClose={() => setMenu(null)}>
        {(["candle", "bar", "line", "area"] as LedgerChartType[]).map((id) => (
          <button
            key={id}
            type="button"
            role="menuitemradio"
            aria-checked={layout.chartType === id}
            onClick={() => {
              setLayout((prev) => ({ ...prev, chartType: id }));
              setMenu(null);
            }}
          >
            {id === "candle" ? "Candlesticks" : id === "bar" ? "OHLC bars" : id === "line" ? "Line" : "Area"}
          </button>
        ))}
      </AnchoredMenu>
      <AnchoredMenu open={menu === "indicators"} anchor={menuBox} label="Indicators" wide onClose={() => setMenu(null)}>
        <input aria-label="Filter indicators" placeholder="Search indicators" value={indQuery} onChange={(e) => setIndQuery(e.target.value)} />
        {(
          [
            ["Moving averages", ["sma", "ema"]],
            ["Volatility", ["bb", "atr"]],
            ["Momentum", ["rsi", "macd"]],
            ["Volume", ["volume", "vwap"]],
          ] as const
        ).map(([title, kinds]) => {
          const rows = addable.filter((item) => (kinds as readonly string[]).includes(item.kind));
          if (!rows.length) return null;
          return (
            <div key={title}>
              <div className="lt-group">{title}</div>
              {rows.map((item) => (
                <button key={item.kind} type="button" onClick={() => setIndicators(addIndicator(layout.indicators, item.kind))}>
                  Add {item.label}
                  {layout.indicators.some((row) => row.kind === item.kind) ? " · on chart" : ""}
                </button>
              ))}
            </div>
          );
        })}
        {layout.indicators.map((ind) => (
          <div className="lt-ind" key={ind.id}>
            <span>
              {ind.kind === "macd" ? "MACD 12, 26, 9" : ind.kind === "vwap" ? "Session VWAP" : `${ind.kind.toUpperCase()}${ind.period ? ` ${ind.period}` : ""}`}
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
            </span>
            <span>
              <button type="button" onClick={() => setIndicators(layout.indicators.map((row) => (row.id === ind.id ? { ...row, hidden: !row.hidden } : row)))}>
                {ind.hidden ? "Show" : "Hide"}
              </button>
              <button type="button" onClick={() => setIndicators(layout.indicators.filter((row) => row.id !== ind.id))}>
                Remove
              </button>
            </span>
          </div>
        ))}
        <p className="lt-muted">VWAP is the session typical-price average and is drawn only on an intraday interval that has volume. MACD stays 12, 26, 9.</p>
      </AnchoredMenu>
      <AnchoredMenu open={menu === "alert"} anchor={menuBox} label="Price alert" onClose={() => setMenu(null)}>
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
            setMenu(null);
          }}
        >
          Save price alert
        </button>
        {mine.map((alert) => (
          <button key={alert.id} type="button" onClick={() => removeAlert(alert.id)}>
            Remove {alert.dir} {alert.price}
          </button>
        ))}
      </AnchoredMenu>
      <AnchoredMenu open={menu === "settings"} anchor={menuBox} label="Chart settings" wide onClose={() => setMenu(null)}>
        <div className="lt-group">Visible history</div>
        {allowedRanges.length ? (
          <div className="lt-range" role="group" aria-label="Visible history">
            {LEDGER_RANGES.filter((item) => allowedRanges.includes(item.id)).map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={layout.range === item.id}
                onClick={() => setLayout((prev) => ({ ...prev, range: item.id as LedgerRangeId }))}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="lt-muted">{spec.label} loads {intradayWindow(spec)}. Pan and zoom inside that window.</p>
        )}
        <p className="lt-muted">/ search · F fullscreen · Esc leaves a tool · Delete removes the selected drawing · Ctrl or Cmd Z undo · Ctrl or Cmd Shift Z, or Ctrl or Cmd Y, redo.</p>
        <button type="button" onClick={() => setLayout((prev) => ({ ...prev, drawingsHidden: !prev.drawingsHidden }))}>
          {layout.drawingsHidden ? "Show drawings" : "Hide drawings"}
        </button>
        <button type="button" onClick={() => setLayout((prev) => ({ ...prev, logScale: !prev.logScale }))}>
          {layout.logScale ? "Use linear scale" : "Use log scale"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMenu(null);
            setImportOpen(true);
          }}
        >
          Import from TradingView
        </button>
      </AnchoredMenu>
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
            <Tip key={item.id} text={item.label}>
              <button type="button" className="lt-tool" aria-label={item.label} aria-pressed={tool === item.id} onClick={() => setTool(item.id)}>
                {toolIcon(item.id)}
              </button>
            </Tip>
          ))}
          <Tip text="Undo · Ctrl/Cmd Z">
            <button type="button" className="lt-tool" aria-label="Undo drawing" disabled={pastRef.current.length === 0} onClick={undo}>
              <Undo2 size={15} />
            </button>
          </Tip>
          <Tip text="Redo · Ctrl/Cmd Shift Z or Ctrl/Cmd Y">
            <button type="button" className="lt-tool" aria-label="Redo drawing" disabled={futureRef.current.length === 0} onClick={redo}>
              <Redo2 size={15} />
            </button>
          </Tip>
          <Tip text="Delete selected drawing · Delete">
            <button type="button" className="lt-tool" aria-label="Delete selected drawing" disabled={!selected} onClick={() => selected && (commitDrawings(drawings.filter((row) => row.id !== selected.id)), setSelectedId(null))}>
              <Trash2 size={15} />
            </button>
          </Tip>
          <Tip text={selected?.locked ? "Unlock drawing" : "Lock drawing"}>
            <button
              type="button"
              className="lt-tool"
              aria-label={selected?.locked ? "Unlock drawing" : "Lock drawing"}
              disabled={!selected}
              onClick={() => selected && commitDrawings(drawings.map((row) => (row.id === selected.id ? { ...row, locked: !row.locked } : row)))}
            >
              <Lock size={15} />
            </button>
          </Tip>
          <Tip text={layout.drawingsHidden ? "Show drawings" : "Hide drawings"}>
            <button type="button" className="lt-tool" aria-label={layout.drawingsHidden ? "Show drawings" : "Hide drawings"} aria-pressed={layout.drawingsHidden} onClick={() => setLayout((prev) => ({ ...prev, drawingsHidden: !prev.drawingsHidden }))}>
              {layout.drawingsHidden ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </Tip>
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
                onContext={(info) => setContext({ ...info, source: "chart", symbol, name })}
                theme={theme}
                pen={pen}
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
            {selected ? (
              <div className="lt-style" role="toolbar" aria-label="Drawing style">
                {PENS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="lt-swatch"
                    style={{ background: color }}
                    aria-label={`Colour ${color}`}
                    aria-pressed={selected.color === color}
                    onClick={() => {
                      setPen((prev) => ({ ...prev, color }));
                      commitDrawings(drawings.map((row) => (row.id === selected.id ? { ...row, color } : row)));
                    }}
                  />
                ))}
                {[1, 2, 3, 4].map((width) => (
                  <button
                    key={width}
                    type="button"
                    aria-label={`Width ${width}`}
                    aria-pressed={(selected.width || 2) === width}
                    onClick={() => {
                      setPen((prev) => ({ ...prev, width }));
                      commitDrawings(drawings.map((row) => (row.id === selected.id ? { ...row, width } : row)));
                    }}
                  >
                    {width}
                  </button>
                ))}
                {selected.kind !== "text"
                  ? (["solid", "dashed", "dotted"] as DrawDash[]).map((dash) => (
                      <button
                        key={dash}
                        type="button"
                        aria-label={`${dash} line`}
                        aria-pressed={(selected.dash || "solid") === dash}
                        onClick={() => {
                          setPen((prev) => ({ ...prev, dash }));
                          commitDrawings(drawings.map((row) => (row.id === selected.id ? { ...row, dash } : row)));
                        }}
                      >
                        {dash === "solid" ? "—" : dash === "dashed" ? "- -" : "···"}
                      </button>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
          <footer className="lt-foot">
            <span>
              {spec.label}
              {spec.intra ? ` · ${intradayWindow(spec)}` : ` · ${layout.range}`}
              {spec.note ? ` · ${spec.note}` : ""}
            </span>
            <span className="lt-grow" />
            <span>{ohlc.isFetching ? "Refreshing" : "Yahoo Finance · not a live exchange feed"}</span>
          </footer>
        </section>
        <button
          type="button"
          className="lt-split"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize watchlist"
          aria-valuemin={220}
          aria-valuemax={480}
          aria-valuenow={layout.watchWidth}
          tabIndex={0}
          onPointerDown={startResize}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              setLayout((prev) => ({ ...prev, watchWidth: clampWatchWidth(prev.watchWidth + 16) }));
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              setLayout((prev) => ({ ...prev, watchWidth: clampWatchWidth(prev.watchWidth - 16) }));
            }
          }}
        />
        <LedgerWatch
          active={symbol}
          open={watchShown}
          onPick={pick}
          onMenu={(info) => setContext({ source: "watch", x: info.x, y: info.y, price: info.price, time: null, symbol: info.symbol, name: info.name })}
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
        <>
          <button type="button" className="lt-menu-back" aria-label="Close menu" onClick={() => setContext(null)} />
          <div
            className="lt-menu"
            role="menu"
            data-context={context.source}
            aria-label={context.source === "chart" ? "Chart menu" : "Watchlist menu"}
            style={(() => {
              const placed = placeMenu(
                { left: context.x, right: context.x + 1, top: context.y, bottom: context.y + 1 },
                { width: window.innerWidth, height: window.innerHeight },
                { width: 240, height: context.source === "watch" ? 180 : 260 },
              );
              return { left: placed.left, top: placed.top };
            })()}
          >
            {context.source === "chart" ? (
              <button type="button" onClick={() => { setViewNonce((n) => n + 1); setContext(null); }}>
                Reset chart view
              </button>
            ) : (
              <button type="button" onClick={() => { pick(context.symbol || symbol, context.name); setContext(null); }}>
                Open {context.symbol || symbol}
              </button>
            )}
            {context.source === "chart" && context.price != null ? (
              <button
                type="button"
                onClick={() => {
                  const row: LedgerDraw = {
                    id: crypto.randomUUID(),
                    kind: "hline" as DrawKind,
                    t0: context.time || bars.at(-1)?.t || 0,
                    p0: context.price as number,
                    color: pen.color,
                    width: pen.width,
                    dash: pen.dash,
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
            ) : (
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(context.symbol || symbol).then(
                    () => setNotice(""),
                    () => setNotice("Could not copy that symbol."),
                  );
                  setContext(null);
                }}
              >
                Copy symbol
              </button>
            )}
            {context.source === "chart" ? (
              <button type="button" onClick={() => { setLayout((prev) => ({ ...prev, drawingsHidden: !prev.drawingsHidden })); setContext(null); }}>
                {layout.drawingsHidden ? "Show drawings" : "Hide drawings"}
              </button>
            ) : null}
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
        </>
      ) : null}
      <span className="lt-sr" data-hist={hist} hidden />
      <LedgerImportDialog
        open={importOpen}
        symbol={symbol}
        drawings={layout.drawings}
        onClose={() => setImportOpen(false)}
        onCommit={(next, symbols) => {
          setLayout((prev) => ({ ...prev, drawings: next }));
          for (const item of symbols) {
            const current = useKosh.getState().watch;
            if (item && !isWatched(item, current)) useKosh.getState().toggleWatch(item);
          }
        }}
        onRollback={(restored) => setLayout((prev) => ({ ...prev, drawings: restored }))}
      />
    </div>
  );
}

function Tip({ text, children }: { text: string; children: ReactElement }) {
  return (
    <Tooltip content={<span>{text}</span>}>
      <span className="lt-tip">{children}</span>
    </Tooltip>
  );
}

function AnchoredMenu({
  open,
  anchor,
  label,
  wide,
  onClose,
  children,
}: {
  open: boolean;
  anchor: DOMRect | null;
  label: string;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!open || !anchor || !node) return;
    const rect = node.getBoundingClientRect();
    const placed = placeMenu(
      { left: anchor.left, right: anchor.right, top: anchor.top, bottom: anchor.bottom },
      { width: window.innerWidth, height: window.innerHeight },
      { width: rect.width || (wide ? 340 : 260), height: rect.height || 180 },
    );
    setPos((prev) => (prev && prev.left === placed.left && prev.top === placed.top ? prev : { left: placed.left, top: placed.top }));
  }, [open, anchor, wide]);
  if (!open || !anchor || typeof document === "undefined") return null;
  const guess = placeMenu(
    { left: anchor.left, right: anchor.right, top: anchor.top, bottom: anchor.bottom },
    { width: window.innerWidth, height: window.innerHeight },
    { width: wide ? 340 : 260, height: 180 },
  );
  return createPortal(
    <>
      <button type="button" className="lt-menu-back" aria-label="Close menu" onClick={onClose} />
      <div
        ref={ref}
        className={wide ? "lt-pop lt-pop-wide" : "lt-pop"}
        role="menu"
        aria-label={label}
        style={{ left: pos?.left ?? guess.left, top: pos?.top ?? guess.top }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
