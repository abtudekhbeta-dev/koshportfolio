import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useChartFullscreen } from "@/components/charts/use-fullscreen";
import { MarketsSwitch } from "@/components/terminal/markets-switch";
import { RrgChart } from "@/components/terminal/rrg-chart";
import { filterReadings, quadrantLabel, rotationBrief, sortReadings, viewState, type RrgReading, type SortKey, type Timeframe } from "@/lib/kosh/rrg-frame";
import { selectHoldings, type PlottedHolding } from "@/lib/kosh/rrg-holdings";
import { classifyVerdicts, keepIfSameBenchmark, rotationRequest, type NoteKey, type RotationNote, type StockVerdict } from "@/lib/kosh/rrg-note";
import type { StrokePref } from "@/lib/kosh/rrg-plot";
import type { buildPack } from "@/lib/kosh/rrg-pack";
import type { Quadrant } from "@/lib/kosh/rrg";
import { resolveMembers, type SectorStatus } from "@/lib/kosh/rrg-sectors";
import { RRG_PRIMARY_BENCHMARKS } from "@/lib/kosh/rrg-universe";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

type Pack = Exclude<ReturnType<typeof buildPack>, { error: string }>;
type Mode = "sector" | "stock";
type Group = "sector" | "size" | "broad";
type Universe = Group | "stock";
type MemberRow = { symbol: string; name: string; weight: number | null; history: "stored" | "missing" };
type Basket = {
  name: string;
  label?: string;
  source: string | null;
  asOf: string | null;
  benchmark?: string | null;
  feed?: string;
  rows: MemberRow[];
  counts?: { members: number; stored: number; missing: number; unnamed: number; duplicates: number };
  unavailable: string | null;
};

const STOCK_DEFAULT = ["RELIANCE", "HDFCBANK", "ICICIBANK", "INFY"];
const SECTOR_DEFAULT = ["NIFTY BANK", "NIFTY IT", "NIFTY PHARMA"];
const TAILS = [4, 6, 8, 12, 16];
const PREFS = "kosh-rrg-view";
const fieldClass = "h-8 rounded-sm border border-border bg-surface px-1.5 text-[12px] text-fg";

type CatalogItem = {
  symbol: string;
  name: string;
  category: string;
  sector: string | null;
  benchmark: boolean;
  limited: boolean;
  status: string;
  from: string | null;
  to: string | null;
  rows: number;
  exchange?: string | null;
  notes?: string[];
};

export function RrgDesk() {
  const saved = useMemo(loadPrefs, []);
  const [universe, setUniverse] = useState<Universe>(saved.universe);
  const [benchmark, setBenchmark] = useState(saved.benchmark);
  const [symbols, setSymbols] = useState<string[]>(saved.universe === "stock" ? STOCK_DEFAULT : SECTOR_DEFAULT);
  const [search, setSearch] = useState("");
  const [exchange, setExchange] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>(saved.timeframe);
  const [asOf, setAsOf] = useState("");
  const [tail, setTail] = useState(saved.tail);
  const [sortKey, setSortKey] = useState<SortKey>("rsRatio");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [quadrant, setQuadrant] = useState<"all" | Quadrant>("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [tableOpen, setTableOpen] = useState(true);
  const [arrows, setArrows] = useState(saved.arrows);
  const [labels, setLabels] = useState(true);
  const [stroke, setStroke] = useState<StrokePref>("standard");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(saved.speed);
  const [ai, setAi] = useState<RotationNote | null>(null);
  const [aiError, setAiError] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [chipQuery, setChipQuery] = useState("");
  const [books, setBooks] = useState<Record<string, PlottedHolding>>({});
  const [bookLabel, setBookLabel] = useState("");
  const [focusSector, setFocusSector] = useState("NIFTY BANK");
  const [basket, setBasket] = useState<Basket | null>(null);
  const [memberQuery, setMemberQuery] = useState("");
  const [membersBusy, setMembersBusy] = useState(false);
  const [pickedMembers, setPickedMembers] = useState<string[]>([]);
  const [memberSector, setMemberSector] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const sessionsRef = useRef<string[]>([]);
  const asking = useRef(false);
  const fs = useChartFullscreen(box);
  const lists = useKosh((state) => state.watchlists);
  const portfolios = useKosh((state) => state.portfolios);
  const mode: Mode = universe === "stock" ? "stock" : "sector";
  const group: Group = universe === "stock" ? "sector" : universe;

  useEffect(() => {
    savePrefs({ universe, benchmark, timeframe, tail, arrows, speed });
  }, [universe, benchmark, timeframe, tail, arrows, speed]);

  useEffect(() => {
    setAi(null);
    setAiError("");
  }, [benchmark, timeframe, asOf, symbols.join("|")]);

  const catalog = useQuery({
    queryKey: ["rrg-summary"],
    queryFn: async () => {
      const response = await fetch("/api/rrg?catalog=summary");
      return (await response.json()) as { indices?: CatalogItem[] };
    },
  });
  const sectorQuery = useQuery({
    queryKey: ["rrg-sectors"],
    queryFn: async () => {
      const response = await fetch("/api/rrg?catalog=sectors");
      return (await response.json()) as { sectors?: SectorStatus[] };
    },
  });
  const foundQuery = useQuery({
    queryKey: ["rrg-search", search, exchange, mode, group],
    queryFn: async () => {
      const params = new URLSearchParams({ catalog: "search", q: search.trim(), category: mode === "stock" ? "stock" : group });
      if (mode === "stock" && exchange) params.set("exchange", exchange);
      const response = await fetch(`/api/rrg?${params}`);
      const body = (await response.json()) as { items?: CatalogItem[] };
      return body.items || [];
    },
    enabled: search.trim().length > 0,
  });
  const pack = useQuery({
    queryKey: ["rrg", mode, group, benchmark, symbols.join("|"), timeframe, asOf, tail],
    queryFn: () => loadPack({ mode, group, benchmark, symbols, timeframe, asOf, tail }),
    placeholderData: (previous, previousQuery) => (previous && keepIfSameBenchmark(previousQuery?.queryKey, benchmark) ? previous : undefined),
  });
  const data = pack.data && !pack.data.error ? pack.data : null;
  const sessions = data?.sessions || [];
  sessionsRef.current = sessions;
  const items = catalog.data?.indices || [];
  const benchmarks = items.filter((item) => item.benchmark && (item.status === "imported" || item.status === "limited" || item.status === "stale"));
  const addable = (mode === "sector" ? items.filter((item) => item.category === group) : foundQuery.data || []).filter((item) => item.symbol !== benchmark && !symbols.includes(item.symbol));
  const rows = useMemo(() => sortReadings(filterReadings(data?.readings || [], quadrant, query), sortKey, sortDir), [data, quadrant, query, sortKey, sortDir]);
  const brief = useMemo(() => (data ? rotationBrief(data.readings, data.cross) : null), [data]);
  const verdicts = useMemo(() => (data ? classifyVerdicts(data.readings, data.cross) : []), [data]);
  const state = viewState({ pending: pack.isPending && !data, error: pack.isError, selected: symbols.length });
  const cursor = asOf ? sessions.findIndex((date) => date >= asOf) : Math.max(0, sessions.length - 1);
  const historical = Boolean(asOf && data?.benchmark.asOf && data.range.to && data.benchmark.asOf < data.range.to);
  const primary = RRG_PRIMARY_BENCHMARKS.filter((item) => benchmarks.some((row) => row.symbol === item.symbol) || !benchmarks.length);
  const secondary = benchmarks.filter((item) => !RRG_PRIMARY_BENCHMARKS.some((row) => row.symbol === item.symbol));
  const shownSymbols = symbols.slice(0, 8);
  const extraSymbols = symbols.slice(8).filter((symbol) => symbol.toLowerCase().includes(chipQuery.trim().toLowerCase()));
  const focus = data?.readings.find((row) => row.symbol === selected) || null;
  const sectoral = (sectorQuery.data?.sectors || []).filter((row) => row.klass === "sectoral");
  const thematic = (sectorQuery.data?.sectors || []).filter((row) => row.klass === "thematic");
  const focused = (sectorQuery.data?.sectors || []).find((row) => row.registrySymbol === focusSector) || sectoral[0] || null;
  const visibleMembers = (basket?.rows || []).filter((row) => `${row.symbol} ${row.name}`.toLowerCase().includes(memberQuery.trim().toLowerCase()));

  useEffect(() => {
    let cancel = false;
    setMembersBusy(true);
    fetch(`/api/rrg?catalog=members&symbol=${encodeURIComponent(focusSector)}`)
      .then((response) => response.json())
      .then((body: Basket) => {
        if (!cancel) setBasket(body);
      })
      .catch(() => {
        if (!cancel) setNotice("The constituent source did not answer. A saved basket is kept when one exists.");
      })
      .finally(() => {
        if (!cancel) setMembersBusy(false);
      });
    return () => {
      cancel = true;
    };
  }, [focusSector]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const list = sessionsRef.current;
      if (list.length < 2) return;
      const amount = timeframe === "monthly" ? 21 : timeframe === "weekly" ? 5 : 1;
      setAsOf((current) => {
        const index = current ? list.findIndex((date) => date >= current) : list.length - 1;
        const start = index < 0 ? list.length - 1 : index;
        const next = Math.min(list.length - 1, start + amount);
        if (next >= list.length - 1) {
          setPlaying(false);
          return "";
        }
        return list[next] || "";
      });
    }, speed);
    return () => window.clearInterval(timer);
  }, [playing, speed, timeframe]);

  function chooseUniverse(next: Universe) {
    setUniverse(next);
    setPlaying(false);
    setSelected(null);
    setHidden([]);
    setNotice("");
    setBooks({});
    setBookLabel("");
    if (next !== "sector") setMemberSector(null);
    if (next === "stock") {
      setSymbols(STOCK_DEFAULT.filter((symbol) => symbol !== benchmark));
      return;
    }
    if (next === "sector") {
      const plottable = sectoral.filter((row) => row.plottable).map((row) => row.registrySymbol);
      const ordered = [...SECTOR_DEFAULT.filter((symbol) => plottable.includes(symbol)), ...plottable.filter((symbol) => !SECTOR_DEFAULT.includes(symbol))];
      setSymbols((ordered.length ? ordered : SECTOR_DEFAULT).filter((symbol) => symbol !== benchmark).slice(0, 24));
      return;
    }
    const picks = items.filter((item) => item.category === next && item.symbol !== benchmark && (item.status === "imported" || item.status === "limited")).map((item) => item.symbol);
    setSymbols((picks.length ? picks : SECTOR_DEFAULT).filter((symbol) => symbol !== benchmark).slice(0, 12));
  }

  function toggle(symbol: string) {
    setSymbols((current) => {
      if (current.includes(symbol)) return current.filter((item) => item !== symbol);
      if (current.length >= 24) {
        setNotice("24 series is the limit for one chart.");
        return current;
      }
      return [...current, symbol];
    });
  }

  function jump(days: number | null) {
    setPlaying(false);
    if (days == null || !sessions.length) {
      setAsOf("");
      return;
    }
    const end = sessions[sessions.length - 1] || "";
    const target = shiftDate(end, -days);
    const hit = [...sessions].reverse().find((date) => date <= target) || sessions[0] || "";
    setAsOf(hit === end ? "" : hit);
  }

  function play() {
    if (!sessions.length) return;
    if (!asOf || cursor >= sessions.length - 1) {
      const back = timeframe === "monthly" ? 63 : timeframe === "weekly" ? 40 : 60;
      setAsOf(sessions[Math.max(0, sessions.length - 1 - back)] || "");
    }
    setPlaying(true);
  }

  function step(direction: -1 | 1) {
    if (!sessions.length) return;
    setPlaying(false);
    const amount = timeframe === "monthly" ? 21 : timeframe === "weekly" ? 5 : 1;
    const index = asOf ? sessions.findIndex((date) => date >= asOf) : sessions.length - 1;
    const next = Math.min(sessions.length - 1, Math.max(0, (index < 0 ? sessions.length - 1 : index) + direction * amount));
    setAsOf(next >= sessions.length - 1 ? "" : sessions[next] || "");
  }

  function useList(name: string, raw: string[]) {
    const hit = [...new Set(raw.map((symbol) => symbol.toUpperCase()))].filter((symbol) => symbol && symbol !== benchmark);
    setUniverse("stock");
    setMemberSector(null);
    setBooks({});
    setBookLabel("");
    setSymbols(hit.slice(0, 24));
    setNotice(hit.length > 24 ? `${name}: showing 24 of ${hit.length}. This is the watchlist, not a sector constituent list. The saved list is unchanged.` : hit.length ? `${name}. Watchlist, not a sector constituent list. A name appears only when its stored history is long enough.` : `${name} is empty.`);
  }

  function usePortfolio(id: string) {
    const portfolio = portfolios.find((item) => item.id === id);
    if (!portfolio) return;
    const picked = selectHoldings(portfolio.holdings.filter((row) => row.kind !== "commodity").map((row) => ({ symbol: row.symbol, name: row.name, qty: row.qty, avg: row.avg })), 24);
    setUniverse("stock");
    setMemberSector(null);
    setSymbols(picked.plotted.map((row) => row.symbol).filter((symbol) => symbol !== benchmark));
    setBooks(Object.fromEntries(picked.plotted.map((row) => [row.symbol, row])));
    setBookLabel(portfolio.name);
    const overflow = picked.overflow.length ? ` ${picked.overflow.length} more are over the 24-name chart limit.` : "";
    setNotice(`Chart source: portfolio ${portfolio.name}, not the sector constituent list.${overflow} This uses today's holdings with historical prices. It is not the portfolio as it was on the selected date.`);
  }

  function openSector(symbol: string) {
    setFocusSector(symbol);
    setMemberSector(null);
    setPickedMembers([]);
    setBookLabel("");
    const row = (sectorQuery.data?.sectors || []).find((item) => item.registrySymbol === symbol);
    if (!row) return;
    if (row.plottable) {
      setUniverse("sector");
      setSymbols([symbol]);
      setNotice("");
    } else {
      setUniverse("sector");
      setNotice(`${row.name} has no stored index history. ${row.reason || "It is listed so it is not silently replaced."}`);
    }
  }

  function plotMembers(only?: string[]) {
    if (!basket?.rows.length || !focused) return;
    const stored = basket.rows.filter((row) => row.history === "stored" && row.symbol !== benchmark);
    const chosen = only?.length ? stored.filter((row) => only.includes(row.symbol)) : stored;
    if (!chosen.length) {
      setNotice(stored.length ? "None of the selected names have a stored history." : "No constituent in this basket has a stored history.");
      return;
    }
    const picked = resolveMembers(chosen.map((row) => ({ symbol: row.symbol, name: row.name, weight: row.weight })), 24);
    setUniverse("stock");
    setBooks({});
    setBookLabel("");
    setMemberSector(focused.registrySymbol);
    setSymbols(picked.plotted.map((row) => row.symbol));
    const missing = basket.counts?.missing ?? basket.rows.filter((row) => row.history === "missing").length;
    const unnamed = basket.counts?.unnamed ?? 0;
    const over = picked.overflow.length ? `${picked.overflow.length} over the 24-name limit` : "none over the 24-name limit";
    setNotice(`${basket.label || "Current constituents — historical price rotation"}. ${focused.name}: ${picked.plotted.length} plotted, ${over}, ${missing} excluded for missing history${unnamed ? `, ${unnamed} without a symbol` : ""}. Weights are not used in the rotation. Source: ${basket.source || "not stated"}${basket.asOf ? `, ${basket.asOf}` : ""}.`);
  }

  async function ask() {
    if (!data || asking.current) return;
    const request = rotationRequest({ benchmark: data.benchmark.name, timeframe, asOf, readings: data.readings, cross: data.cross });
    if ("error" in request) {
      setAiError(request.error);
      return;
    }
    asking.current = true;
    setAiBusy(true);
    setAiError("");
    try {
      const response = await fetch("/api/rrg", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ request }) });
      const body = (await response.json()) as { ok?: boolean; error?: string; note?: RotationNote };
      if (!body.ok || !body.note) setAiError(body.error || "The model did not answer.");
      else setAi(body.note);
    } catch {
      setAiError("The model did not answer.");
    } finally {
      asking.current = false;
      setAiBusy(false);
    }
  }

  return (
    <div className={cn("pb-6", fs.fallback && "fixed inset-0 z-40 overflow-auto bg-bg")} ref={box}>
      <MarketsSwitch view="rotation" />
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-3 py-2 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-[18px] font-semibold tracking-tight">Sector Rotation</h1>
          <p className="text-[12px] text-muted">Compare sector performance and relative strength.</p>
          <p className="text-[12px] text-muted">{historical ? `Historical snapshot ${data?.benchmark.asOf}` : `Latest ${data?.benchmark.asOf || "—"}`} · {data?.benchmark.name || "Benchmark"} {data?.benchmark.close == null ? "" : data.benchmark.close.toFixed(2)}</p>
          <button type="button" className="text-[12px] text-muted hover:text-fg" onClick={() => void fs.toggle()}>{fs.fs ? "Exit full screen" : "Full screen"}</button>
        </div>
        <p className="text-[11px] text-muted">Kosh rotation, 10/30/10 weighted averages. Not a StockCharts or JdK reproduction. {timeframe === "monthly" ? "A monthly point is the last real close in that month, including a month that has not finished." : timeframe === "weekly" ? "A weekly point is the last real close in that ISO week." : "A daily point is that session's close. Missing sessions are not filled."} Dividends are not removed.</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Field label="Universe">
            <select className={fieldClass} value={universe} onChange={(event) => chooseUniverse(event.target.value as Universe)}>
              <option value="sector">Sectors</option>
              <option value="broad">Broad</option>
              <option value="size">Size</option>
              <option value="stock">Stocks</option>
            </select>
          </Field>
          {universe === "sector" ? (
            <Field label="Sector">
              <select className={fieldClass} value={focusSector} onChange={(event) => openSector(event.target.value)}>
                <optgroup label="With stored history">
                  {sectoral.filter((row) => row.plottable).map((row) => <option key={row.registrySymbol} value={row.registrySymbol}>{row.name}</option>)}
                </optgroup>
                <optgroup label="No stored index history">
                  {sectoral.filter((row) => !row.plottable).map((row) => <option key={row.registrySymbol} value={row.registrySymbol}>{row.name}</option>)}
                </optgroup>
                {thematic.some((row) => row.plottable) ? <optgroup label="Thematic, not a sector">{thematic.filter((row) => row.plottable).map((row) => <option key={row.registrySymbol} value={row.registrySymbol}>{row.name}</option>)}</optgroup> : null}
              </select>
            </Field>
          ) : null}
          <Field label="Benchmark">
            <select className={fieldClass} value={benchmark} onChange={(event) => { setBenchmark(event.target.value); setSymbols((current) => current.filter((symbol) => symbol !== event.target.value)); }}>
              <optgroup label="Primary">
                {primary.map((item) => <option key={item.symbol} value={item.symbol}>{item.name}</option>)}
              </optgroup>
              {secondary.length ? <optgroup label="Other indices">{secondary.map((item) => <option key={item.symbol} value={item.symbol}>{item.name}</option>)}</optgroup> : null}
            </select>
          </Field>
          <Seg value={timeframe} options={[{ id: "daily", label: "D" }, { id: "weekly", label: "W" }, { id: "monthly", label: "M" }]} onChange={(value) => setTimeframe(value as Timeframe)} />
          <Field label="Tail">
            <select className={fieldClass} value={TAILS.includes(tail) ? String(tail) : "custom"} onChange={(event) => { if (event.target.value !== "custom") setTail(Number(event.target.value)); }}>
              {TAILS.map((value) => <option key={value} value={value}>{value}</option>)}
              <option value="custom">Custom</option>
            </select>
          </Field>
          <input className="h-8 w-12 rounded-sm border border-border bg-surface px-1.5 text-[12px]" aria-label="Custom tail" inputMode="numeric" value={tail} onChange={(event) => setTail(Math.min(60, Math.max(2, Number(event.target.value) || 2)))} />
          <button type="button" className="h-8 rounded-sm border border-border bg-surface px-2 text-[12px]" onClick={() => (playing ? setPlaying(false) : play())}>{playing ? "Pause" : "Play"}</button>
          <button type="button" className="h-8 rounded-sm border border-border px-2 text-[12px] text-muted" onClick={() => step(-1)}>Back</button>
          <button type="button" className="h-8 rounded-sm border border-border px-2 text-[12px] text-muted" onClick={() => step(1)}>Forward</button>
          <button type="button" className="h-8 rounded-sm border border-border px-2 text-[12px] text-muted" onClick={() => jump(null)}>Latest</button>
          <Field label="Speed"><select className={fieldClass} value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={900}>Slow</option><option value={450}>Normal</option><option value={220}>Fast</option></select></Field>
          <Field label="Lines"><select className={fieldClass} value={stroke} onChange={(event) => setStroke(event.target.value as StrokePref)}><option value="thin">Thin</option><option value="standard">Standard</option><option value="bold">Bold</option></select></Field>
          <label className="flex h-8 items-center gap-1 text-[12px] text-muted"><input type="checkbox" checked={arrows} onChange={(event) => setArrows(event.target.checked)} /> Arrows</label>
          <label className="flex h-8 items-center gap-1 text-[12px] text-muted"><input type="checkbox" checked={labels} onChange={(event) => setLabels(event.target.checked)} /> Labels</label>
          <input className="h-8 w-36 rounded-sm border border-border bg-surface px-2 text-[12px]" placeholder={mode === "stock" ? "Add a stock" : "Add an index"} value={search} onChange={(event) => setSearch(event.target.value)} />
          {mode === "stock" ? (
            <select className={fieldClass} aria-label="Exchange" value={exchange} onChange={(event) => setExchange(event.target.value)}>
              <option value="">NSE+BSE</option>
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          ) : null}
          <select className="h-8 max-w-36 rounded-sm border border-border bg-surface px-1.5 text-[12px]" aria-label="Add symbol" value="" onChange={(event) => { if (event.target.value) toggle(event.target.value); }}>
            <option value="">Add</option>
            {addable.slice(0, 40).map((item) => <option key={item.symbol} value={item.symbol}>{item.name}</option>)}
          </select>
          <select className="h-8 max-w-44 rounded-sm border border-border bg-surface px-1.5 text-[12px]" aria-label="Watchlist or portfolio" value="" onChange={(event) => {
            const [kind, id] = event.target.value.split(":");
            if (kind === "watch") {
              const list = lists.find((item) => item.id === id);
              if (list) useList(list.name, list.symbols);
            }
            if (kind === "book") usePortfolio(id || "");
          }}>
            <option value="">Watchlist or portfolio</option>
            {lists.length ? <optgroup label="Watchlists">{lists.map((list) => <option key={list.id} value={`watch:${list.id}`}>{list.name}</option>)}</optgroup> : null}
            {portfolios.length ? <optgroup label="Portfolios">{portfolios.map((item) => <option key={item.id} value={`book:${item.id}`}>{item.name}</option>)}</optgroup> : null}
          </select>
        </div>
        {(universe === "sector" || memberSector) && focused ? (
          <section className="rounded-sm border border-border bg-surface px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[13px] font-semibold">{focused.klass === "thematic" ? "Thematic index" : "Sector constituents"} — {focused.name}</h2>
                <p className="text-[12px] text-muted">{focused.registrySymbol} · {focused.plottable ? `index history ${focused.from} to ${focused.to}` : "index history unavailable"} · {sectoral.filter((row) => row.plottable).length} of {sectoral.length} sector indices can be plotted</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="h-8 rounded-sm border border-border px-2 text-[12px]" disabled={!focused.plottable} onClick={() => openSector(focused.registrySymbol)}>Sector RRG</button>
                <button type="button" className="h-8 rounded-sm bg-fg px-2 text-[12px] text-bg disabled:opacity-50" disabled={membersBusy || !basket?.rows.length} onClick={() => plotMembers(pickedMembers.length ? pickedMembers : undefined)}>{pickedMembers.length ? `Plot ${pickedMembers.length} selected` : "View stocks in this sector"}</button>
                <button type="button" className="h-8 rounded-sm border border-border px-2 text-[12px]" onClick={() => { const plottable = sectoral.filter((row) => row.plottable).map((row) => row.registrySymbol); const ordered = [...SECTOR_DEFAULT.filter((symbol) => plottable.includes(symbol)), ...plottable.filter((symbol) => !SECTOR_DEFAULT.includes(symbol))]; setUniverse("sector"); setMemberSector(null); setSymbols(ordered.slice(0, 24)); }}>All sector indices</button>
                {memberSector ? <button type="button" className="h-8 rounded-sm px-2 text-[12px] text-muted" onClick={() => openSector(memberSector)}>Back to sector RRG</button> : null}
              </div>
            </div>
            {basket ? (
              <div className="mt-2">
                <p className="text-[12px] text-muted">{basket.label || "Current constituents — historical price rotation"}. {basket.counts ? `${basket.counts.members} constituents, ${basket.counts.stored} with history, ${basket.counts.missing} excluded for missing history` : `${basket.rows.length} names`}. {basket.source || "Source not stated"}{basket.asOf ? `, ${basket.asOf}` : ""}{basket.benchmark ? `. Fund benchmark: ${basket.benchmark}` : ""}. Not the index as it stood on an earlier date. Weights are shown and are not used in the chart.{membersBusy ? " Refreshing…" : ""}</p>
                {basket.unavailable && !basket.rows.length ? <p className="mt-1 text-[12px] text-warn">{basket.unavailable}</p> : null}
                {basket.rows.length ? <input className="mt-2 h-8 w-full max-w-xs rounded-sm border border-border bg-bg px-2 text-[12px]" placeholder="Find a constituent" value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} /> : null}
                <div className="mt-2 flex max-h-24 flex-wrap gap-1 overflow-auto">
                  {visibleMembers.map((row) => (
                    <button key={row.symbol} type="button" disabled={row.history !== "stored"} title={row.history === "stored" ? row.name : `${row.name} — no stored history`} className={cn("rounded-sm border px-1.5 py-0.5 text-[11px] disabled:opacity-40", pickedMembers.includes(row.symbol) ? "border-fg bg-fg text-bg" : "border-border")} onClick={() => setPickedMembers((current) => current.includes(row.symbol) ? current.filter((item) => item !== row.symbol) : [...current, row.symbol])}>{row.symbol}{row.weight == null ? "" : ` ${row.weight.toFixed(1)}%`}{row.history === "stored" ? "" : " · no history"}</button>
                  ))}
                </div>
              </div>
            ) : <p className="mt-2 text-[12px] text-muted">{membersBusy ? "Loading constituents…" : "No constituent basket yet."}</p>}
            {focused.reason ? <p className="mt-2 text-[12px] text-warn">{focused.reason}</p> : null}
            {thematic.length ? <p className="mt-2 text-[11px] text-muted">Thematic, not plotted as sectors: {thematic.map((row) => row.name).join(", ")}.</p> : null}
          </section>
        ) : null}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] text-muted">{symbols.length} / 24</span>
          {shownSymbols.map((symbol) => <Chip key={symbol} symbol={symbol} selected={selected === symbol} hidden={hidden.includes(symbol)} onSelect={() => setSelected(symbol)} onHide={() => setHidden((current) => current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol])} onRemove={() => toggle(symbol)} />)}
          {symbols.length > 8 ? (
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-sm border border-border px-2 py-1 text-[11px] text-muted">+{symbols.length - 8} more</summary>
              <div className="absolute z-20 mt-1 max-h-48 w-56 overflow-auto rounded-sm border border-border bg-surface p-2">
                <input className="mb-2 h-7 w-full rounded-sm border border-border bg-bg px-2 text-[12px]" placeholder="Find a ticker" value={chipQuery} onChange={(event) => setChipQuery(event.target.value)} />
                {extraSymbols.map((symbol) => <Chip key={symbol} symbol={symbol} selected={selected === symbol} hidden={hidden.includes(symbol)} onSelect={() => setSelected(symbol)} onHide={() => setHidden((current) => current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol])} onRemove={() => toggle(symbol)} />)}
              </div>
            </details>
          ) : null}
          {(search.trim() ? foundQuery.data || [] : []).filter((item) => !symbols.includes(item.symbol) && item.symbol !== benchmark).slice(0, 6).map((item) => {
            const plottable = item.status === "imported" || item.status === "limited" || item.status === "stale";
            return <button key={item.symbol} type="button" disabled={!plottable} title={plottable ? item.name : item.notes?.[0] || "No stored history"} className="h-7 rounded-sm border border-border px-1.5 text-[11px] text-muted disabled:opacity-40" onClick={() => plottable && toggle(item.symbol)}>{item.symbol}{plottable ? "" : " · unavailable"}</button>;
          })}
        </div>
        {notice ? <p className="text-[12px] text-warn">{notice}</p> : null}
        {data?.missing.length ? <p className="text-[12px] text-warn">Not plotted: {data.missing.join(", ")}. No stored history was long enough, or the symbol is the benchmark.</p> : null}
        {state === "loading" ? <div className="h-64 animate-pulse rounded-sm bg-surface" /> : null}
        {state === "error" ? <p className="rounded-sm border border-border bg-surface px-3 py-4 text-[13px] text-down">{pack.error instanceof Error ? pack.error.message : "The stored histories could not be read."}</p> : null}
        {state === "empty" ? <p className="rounded-sm border border-border bg-surface px-3 py-4 text-[13px] text-muted">Select at least one series.</p> : null}
        {data ? (
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-2">
              <div className="order-1 flex min-w-0 flex-col gap-2 lg:order-none">
                <RrgChart readings={data.readings} height={fs.fs ? 640 : "min(460px, 54vh)"} selected={selected} hidden={hidden} showLabels={labels} arrows={arrows} locked={playing} stroke={stroke} onSelect={setSelected} />
                <div className="rounded-sm border border-border bg-surface px-3 py-2">
                  <input type="range" className="w-full" min={0} max={Math.max(0, sessions.length - 1)} value={Math.max(0, cursor)} disabled={!sessions.length} onChange={(event) => {
                    setPlaying(false);
                    const date = sessions[Number(event.target.value)] || "";
                    setAsOf(date === sessions[sessions.length - 1] ? "" : date);
                  }} />
                  <div className="mt-1 flex flex-wrap gap-2 text-[12px] text-muted">
                    <span className="font-medium text-fg">{data.benchmark.asOf || "—"}</span>
                    <button type="button" onClick={() => jump(7)}>1w</button>
                    <button type="button" onClick={() => jump(30)}>1m</button>
                    <button type="button" onClick={() => jump(90)}>3m</button>
                    <button type="button" onClick={() => jump(null)}>Latest</button>
                  </div>
                </div>
                {focus ? <Detail row={focus} cross={data.cross.find((item) => item.symbol === focus.symbol)} stock={mode === "stock"} /> : null}
              </div>
              <div className="order-3 min-w-0 lg:order-none">
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-[14px] font-semibold">Sector Rotation table</h2>
                  <input className="h-8 rounded-sm border border-border bg-surface px-2 text-[12px]" placeholder="Filter" value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>
                <div className="overflow-x-auto rounded-sm border border-border">
                  <table className="w-full min-w-[980px] text-left text-[13px]">
                    <thead className="bg-surface text-[11px] uppercase tracking-wide text-muted">
                      <tr>
                        <Th label="Symbol" k="symbol" sortKey={sortKey} dir={sortDir} onSort={flip} />
                        <Th label="Quadrant" k="quadrant" sortKey={sortKey} dir={sortDir} onSort={flip} />
                        <Th label="RS-Ratio" k="rsRatio" sortKey={sortKey} dir={sortDir} onSort={flip} />
                        <th className="px-2 py-2 font-medium">Δ Ratio</th>
                        <Th label="RS-Momentum" k="rsMomentum" sortKey={sortKey} dir={sortDir} onSort={flip} />
                        <th className="px-2 py-2 font-medium">Δ Momentum</th>
                        <th className="px-2 py-2 font-medium">Trail</th>
                        <Th label="Relative" k="relativeReturn" sortKey={sortKey} dir={sortDir} onSort={flip} />
                        <Th label="Price" k="absoluteReturn" sortKey={sortKey} dir={sortDir} onSort={flip} />
                        <th className="px-2 py-2 font-medium">Timeframes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const cross = data.cross.find((item) => item.symbol === row.symbol);
                        return (
                          <tr key={row.symbol} className={cn("cursor-pointer border-t border-border hover:bg-surface", selected === row.symbol && "bg-surface", hidden.includes(row.symbol) && "opacity-40")} onClick={() => setSelected(row.symbol)}>
                            <td className="px-2 py-2"><div className="font-medium">{row.symbol}</div><div className="text-[11px] text-muted">{row.name}{books[row.symbol] ? ` · qty ${books[row.symbol]?.qty}` : ""}</div></td>
                            <td className="px-2 py-2"><Quad name={row.quadrant} /></td>
                            <td className="px-2 py-2 text-right tabular-nums">{num(row.rsRatio)}</td>
                            <td className="px-2 py-2 text-right tabular-nums">{signed(delta(row, "rsRatio"))}</td>
                            <td className="px-2 py-2 text-right tabular-nums">{num(row.rsMomentum)}</td>
                            <td className="px-2 py-2 text-right tabular-nums">{signed(delta(row, "rsMomentum"))}</td>
                            <td className="max-w-56 px-2 py-2 text-[12px] text-muted">{trail(row)}</td>
                            <td className="px-2 py-2 text-right tabular-nums">{ret(row.relativeReturn)}</td>
                            <td className="px-2 py-2 text-right tabular-nums">{ret(row.absoluteReturn)}</td>
                            <td className="px-2 py-2 text-[12px] text-muted">{cross ? `${short(cross.daily)} / ${short(cross.weekly)} / ${short(cross.monthly)}` : "—"}</td>
                          </tr>
                        );
                      })}
                      {rows.length === 0 ? <tr><td colSpan={10} className="px-2 py-4 text-muted">Nothing matches this filter.</td></tr> : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {tableOpen ? (
              <aside className="order-2 lg:order-none">
                <section className="rounded-sm border border-border bg-surface px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-[15px] font-semibold">Sector Rotation watchlist</h2>
                      <p className="text-[12px] text-muted">{universe === "stock" ? "Stocks" : "Indices"} versus {data.benchmark.name}</p>
                      <p className="text-[12px] font-medium text-fg">Snapshot {data.benchmark.asOf || "—"} · {data.readings.length} plotted{bookLabel ? ` · ${bookLabel}` : ""}</p>
                    </div>
                    <button type="button" className="text-[12px] text-muted" onClick={() => setTableOpen(false)}>Hide</button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {(["leading", "improving", "weakening", "lagging"] as const).map((name) => (
                      <button key={name} type="button" className={cn("rounded-sm border px-2 py-1 text-left text-[12px]", quadrant === name ? "border-fg bg-bg" : "border-border")} onClick={() => setQuadrant((current) => current === name ? "all" : name)}>
                        <Quad name={name} /> <span className="tabular-nums text-fg">{data.readings.filter((row) => row.quadrant === name).length}</span>
                      </button>
                    ))}
                  </div>
                  {brief ? <Brief brief={brief} /> : null}
                  <div className="mt-3 border-t border-border pt-3">
                    <h3 className="text-[14px] font-semibold">Sector Rotation analysis</h3>
                    <button type="button" className="mt-2 h-9 w-full rounded-sm bg-fg text-[13px] font-medium text-bg disabled:opacity-60" disabled={aiBusy} onClick={() => void ask()}>{aiBusy ? "Analysing this snapshot…" : "Analyse Sector Rotation"}</button>
                    {aiError ? <p className="mt-2 text-[12px] text-warn">{aiError} <button type="button" className="underline" onClick={() => void ask()}>Retry</button></p> : null}
                    {ai ? <AiSections note={ai} /> : <p className="mt-2 text-[12px] text-muted">The note uses this snapshot only. It is not a buy or sell instruction.</p>}
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <h3 className="text-[14px] font-semibold">Stock verdict</h3>
                    <p className="mt-1 text-[12px] text-muted">Good means worth more research. Bad means relatively weak. Snapshot {data.benchmark.asOf || "—"}.</p>
                    <VerdictGroup title="Good / relatively strong" tone="good" rows={verdicts.filter((row) => row.verdict === "good")} />
                    <VerdictGroup title="Bad / relatively weak" tone="bad" rows={verdicts.filter((row) => row.verdict === "bad")} />
                    <VerdictGroup title="Neutral / mixed" tone="mixed" rows={verdicts.filter((row) => row.verdict === "mixed")} />
                  </div>
                </section>
              </aside>
            ) : <button type="button" className="order-2 self-start text-[12px] text-muted lg:order-none" onClick={() => setTableOpen(true)}>Show Sector Rotation notes</button>}
          </div>
        ) : null}
      </div>
    </div>
  );

  function flip(key: SortKey) {
    if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "symbol" ? "asc" : "desc");
    }
  }
}

function AiSections({ note }: { note: RotationNote }) {
  const groups: { title: string; keys: NoteKey[] }[] = [
    { title: "Market rotation overview", keys: ["overview"] },
    { title: "Leading and improving", keys: ["leading", "improving"] },
    { title: "Fading leaders and lagging", keys: ["fading", "lagging", "transitions"] },
    { title: "Multi-timeframe confirmation", keys: ["timeframes"] },
    { title: "Risks and conflicting evidence", keys: ["shortlist"] },
  ];
  const visible = groups.filter((group) => group.keys.some((key) => note[key]));
  if (!visible.length) return null;
  return <div className="mt-3 space-y-3">{visible.map((group) => <section key={group.title}><h4 className="text-[12px] font-semibold text-fg">{group.title}</h4>{group.keys.filter((key) => note[key]).map((key) => <p key={key} className="mt-1 text-[12px] leading-relaxed text-muted">{note[key]}</p>)}</section>)}</div>;
}

function VerdictGroup({ title, tone, rows }: { title: string; tone: "good" | "bad" | "mixed"; rows: StockVerdict[] }) {
  if (!rows.length) return null;
  const toneClass = tone === "good" ? "text-up" : tone === "bad" ? "text-down" : "text-muted";
  return (
    <div className="mt-2">
      <h4 className={cn("text-[12px] font-semibold", toneClass)}>{title} · {rows.length}</h4>
      <div className="mt-1 space-y-1">
        {rows.map((row) => (
          <details key={row.symbol} className="rounded-sm border border-border px-2 py-1">
            <summary className="cursor-pointer text-[12px]"><span className={cn("font-semibold", toneClass)}>{tone === "good" ? "GOOD" : tone === "bad" ? "BAD" : "NEUTRAL"}</span> <span className="font-medium text-fg">{row.symbol}</span> <span className="text-muted">· {quadrantLabel(row.quadrant as Quadrant | null)} · {row.confidence}</span></summary>
            <p className="mt-1 text-[12px] tabular-nums text-muted">RS-Ratio {row.rsRatio.toFixed(2)} ({signed(row.ratioChange)}) · RS-Momentum {row.rsMomentum.toFixed(2)} ({signed(row.momentumChange)})</p>
            <p className="text-[12px] text-muted">Trail {row.trail}. Relative {ret(row.relativeReturn)}. Price {ret(row.absoluteReturn)}.</p>
            <p className="mt-1 text-[12px] leading-relaxed text-fg">{row.why}</p>
            <p className="text-[12px] leading-relaxed text-muted">Risk: {row.risk}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex items-center gap-1 text-[11px] text-muted">{label}{children}</label>;
}

function Chip({ symbol, selected, hidden, onSelect, onHide, onRemove }: { symbol: string; selected: boolean; hidden: boolean; onSelect: () => void; onHide: () => void; onRemove: () => void }) {
  return (
    <span className={cn("inline-flex h-7 items-center rounded-sm border text-[11px]", selected ? "border-fg bg-surface" : "border-border", hidden && "opacity-50")}>
      <button type="button" className="px-1.5" onClick={onSelect}>{symbol}</button>
      <button type="button" className="px-1 text-muted" aria-label={hidden ? `Show ${symbol}` : `Hide ${symbol}`} onClick={onHide}>{hidden ? "show" : "hide"}</button>
      <button type="button" className="px-1 text-muted" aria-label={`Remove ${symbol}`} onClick={onRemove}>×</button>
    </span>
  );
}

function Detail({ row, cross, stock }: { row: RrgReading; cross?: { daily: Quadrant | null; weekly: Quadrant | null; monthly: Quadrant | null }; stock: boolean }) {
  const held = row.warnings.filter((line) => /unresolved price break/i.test(line));
  return (
    <section className="rounded-sm border border-border bg-surface px-3 py-2 text-[12px]">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-[14px] font-semibold">{row.name}</h2><Quad name={row.quadrant} /></div>
      <p className="mt-1 tabular-nums text-muted">{row.asOf || "—"} · Close {row.close == null ? "—" : row.close.toFixed(2)} · Benchmark {row.benchmarkClose == null ? "—" : row.benchmarkClose.toFixed(2)} · RS-Ratio {num(row.rsRatio)} ({signed(delta(row, "rsRatio"))}) · RS-Momentum {num(row.rsMomentum)} ({signed(delta(row, "rsMomentum"))})</p>
      <p className="mt-1 text-muted">{row.direction} Price {ret(row.absoluteReturn)} from {row.returnFrom || "—"} to {row.returnTo || "—"}. Relative {ret(row.relativeReturn)}.</p>
      {held.map((line) => <p key={line} className="mt-1 text-warn">{line}</p>)}
      {cross ? <p className="mt-1 text-muted">Daily {quadrantLabel(cross.daily)}. Weekly {quadrantLabel(cross.weekly)}. Monthly {quadrantLabel(cross.monthly)}.</p> : null}
      {stock ? <Link to="/s/$symbol" params={{ symbol: row.symbol }} className="mt-2 inline-block text-muted hover:text-fg">Open chart</Link> : null}
    </section>
  );
}

function Brief({ brief }: { brief: ReturnType<typeof rotationBrief> }) {
  const lines = [brief.leaders.length ? `Leading: ${brief.leaders.join(", ")}.` : "", brief.emerging.length ? `Improving: ${brief.emerging.join(", ")}.` : "", brief.fading.length ? `Fading: ${brief.fading.join(", ")}.` : "", brief.laggards.length ? `Lagging: ${brief.laggards.join(", ")}.` : "", ...brief.transitions].filter(Boolean);
  if (!lines.length) return null;
  return <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-muted">{lines.slice(0, 5).map((line) => <li key={line}>{line}</li>)}</ul>;
}

function Quad({ name }: { name: Quadrant | null }) {
  const color = name === "leading" ? "text-up" : name === "weakening" ? "text-warn" : name === "lagging" ? "text-down" : name === "improving" ? "text-chart" : "text-muted";
  return <span className={color}>{quadrantLabel(name)}</span>;
}

function Seg({ value, options, onChange }: { value: string; options: { id: string; label: string }[]; onChange: (id: string) => void }) {
  return <div className="flex h-8 items-center rounded-sm border border-border bg-surface p-0.5">{options.map((option) => <button key={option.id} type="button" aria-pressed={value === option.id} className={cn("h-7 rounded-sm px-2 text-[12px]", value === option.id ? "bg-bg text-fg" : "text-muted")} onClick={() => onChange(option.id)}>{option.label}</button>)}</div>;
}

function Th({ label, k, sortKey, dir, onSort }: { label: string; k: SortKey; sortKey: SortKey; dir: "asc" | "desc"; onSort: (key: SortKey) => void }) {
  return <th className="px-2 py-2 font-medium"><button type="button" className={sortKey === k ? "text-fg" : ""} onClick={() => onSort(k)}>{label}{sortKey === k ? (dir === "asc" ? " ↑" : " ↓") : ""}</button></th>;
}

function delta(row: RrgReading, key: "rsRatio" | "rsMomentum") {
  const previous = row.tail.at(-2)?.[key];
  const latest = row.tail.at(-1)?.[key];
  if (previous == null || latest == null) return null;
  return latest - previous;
}

function trail(row: RrgReading) {
  const stops: string[] = [];
  for (const point of row.tail) {
    const label = quadrantLabel(point.quadrant);
    if (stops[stops.length - 1] !== label) stops.push(label);
  }
  return stops.length ? stops.slice(-4).join(" → ") : row.direction;
}

function short(value: Quadrant | null) {
  if (value === "leading") return "Lead";
  if (value === "weakening") return "Weak";
  if (value === "lagging") return "Lag";
  if (value === "improving") return "Imp";
  if (value === "boundary") return "100";
  return "—";
}

function num(value: number | null) {
  return value == null ? "—" : value.toFixed(2);
}
function signed(value: number | null) {
  if (value == null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}
function ret(value: number | null) {
  return value == null ? "—" : `${(value * 100).toFixed(1)}%`;
}
function shiftDate(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
function loadPrefs(): { universe: Universe; benchmark: string; timeframe: Timeframe; tail: number; arrows: boolean; speed: number } {
  const fallback = { universe: "sector" as Universe, benchmark: "NIFTY 50", timeframe: "weekly" as Timeframe, tail: 8, arrows: true, speed: 450 };
  if (typeof window === "undefined") return fallback;
  try {
    return { ...fallback, ...(JSON.parse(window.localStorage.getItem(PREFS) || "") as Partial<typeof fallback>) };
  } catch {
    return fallback;
  }
}
function savePrefs(value: { universe: Universe; benchmark: string; timeframe: Timeframe; tail: number; arrows: boolean; speed: number }) {
  try { window.localStorage.setItem(PREFS, JSON.stringify(value)); } catch { /* preferences are optional */ }
}

async function loadPack(input: { mode: Mode; group: Group; benchmark: string; symbols: string[]; timeframe: Timeframe; asOf: string; tail: number }): Promise<Pack> {
  const params = new URLSearchParams({
    mode: input.mode,
    group: input.mode === "stock" ? "stock" : input.group,
    benchmark: input.benchmark,
    symbols: input.symbols.join(","),
    tf: input.timeframe,
    tail: String(input.tail),
  });
  if (input.asOf) params.set("asOf", input.asOf);
  const response = await fetch(`/api/rrg?${params}`);
  const body = (await response.json()) as Pack & { error?: string | null };
  if (!response.ok || body.error) throw new Error(body.error || "The stored histories could not be read.");
  return body;
}
