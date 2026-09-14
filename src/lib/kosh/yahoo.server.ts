import type { HistoryPack, OhlcBar, OhlcPack, Quote, TapeRow } from "./types";
import { TAPE } from "./benchmarks.ts";
import { YF_ALIAS, tickerName } from "./names.ts";
import {
  TROY_OZ_G,
  isCommodity,
  metalKey,
  METALS,
  etfToGramPrice,
  mcxToGram,
  parseGrowwMcx,
  parseGrowwLive,
  pickMcxSpot,
  type MetalId,
} from "./commodities.ts";
import { istDay } from "./engine.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

type ChartBar = { t: number; c: number; raw: number };
type ChartPack = Omit<HistoryPack, "bars"> & { bars: ChartBar[]; marketCap?: number };

const qCache = new Map<string, { at: number; data: Quote }>();
const hCache = new Map<string, { at: number; data: ChartPack }>();
const oCache = new Map<string, { at: number; data: OhlcPack }>();
const Q_TTL = 2_500;
const H_TTL = 60 * 60 * 1000;

type McxSpot = { display: number; prev: number; changePct: number; gram: number };
let mcxCache: { at: number; GOLD: McxSpot | null; SILVER: McxSpot | null } = {
  at: 0,
  GOLD: null,
  SILVER: null,
};

function chartTtl(range: string, interval = "1d") {
  if (interval === "1m" || interval === "2m" || interval === "5m") return 12_000;
  if (range === "1d" || range === "5d") return 2_500;
  if (range === "1mo" || range === "3mo") return 30_000;
  return H_TTL;
}

async function yahoo(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(35_000),
  });
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  return res.json();
}

function chartUrl(symbol: string, range = "max", interval = "1d") {
  const base = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
  const common = `interval=${interval}&includePrePost=false&events=div%7Csplit`;
  if (range === "max") {
    const period2 = Math.floor(Date.now() / 1000);
    const period1 = 315532800;
    return `${base}?${common}&period1=${period1}&period2=${period2}`;
  }
  return `${base}?${common}&range=${range}`;
}

function parseChart(data: unknown): ChartPack | null {
  const root = data as {
    chart?: {
      result?: Array<{
        meta?: Record<string, unknown>;
        timestamp?: number[];
        indicators?: { quote?: Array<{ close?: (number | null)[] }>; adjclose?: Array<{ adjclose?: (number | null)[] }> };
      }>;
    };
  };
  const r = root?.chart?.result?.[0];
  if (!r) return null;
  const m = r.meta || {};
  const ts = r.timestamp || [];
  const close = r.indicators?.quote?.[0]?.close || [];
  const adj = r.indicators?.adjclose?.[0]?.adjclose || [];
  const bars: { t: number; c: number; raw: number }[] = [];
  for (let i = 0; i < ts.length; i++) {
    const a = adj[i];
    const c = close[i];
    const px = a != null && a > 0 ? Number(a) : c != null && c > 0 ? Number(c) : null;
    if (px != null) bars.push({ t: ts[i], c: px, raw: c != null && c > 0 ? Number(c) : px });
  }
  const price = Number(m.regularMarketPrice || 0) || bars.at(-1)?.raw || 0;
  const prev = Number(m.chartPreviousClose || m.previousClose || 0);
  let changePct = Number(m.regularMarketChangePercent || 0);
  if (!Number.isFinite(changePct)) changePct = 0;
  return {
    input: String(m.symbol || ""),
    symbol: String(m.symbol || ""),
    name: String(m.longName || m.shortName || m.symbol || ""),
    price,
    previousClose: prev,
    changePct,
    high52: Number(m.fiftyTwoWeekHigh || 0),
    low52: Number(m.fiftyTwoWeekLow || 0),
    first: bars[0]?.t || null,
    last: bars.at(-1)?.t || null,
    sessions: bars.length,
    bars,
    missing: false,
    marketCap: Number(m.marketCap || 0) || undefined,
  };
}

function stemVariants(raw: string): string[] {
  const s = String(raw || "")
    .trim()
    .toUpperCase();
  if (!s) return [];
  const bare = s.replace(/\.(NS|BO)$/i, "");
  const aliased = String(YF_ALIAS[bare] || bare).replace(/\.(NS|BO)$/i, "");
  const out: string[] = [];
  const push = (x: string) => {
    const t = String(x || "")
      .replace(/\.(NS|BO)$/i, "")
      .trim();
    if (t && !out.includes(t)) out.push(t);
  };
  push(aliased);
  push(bare);
  for (const x of [...out]) {
    const stripped = x.replace(/[-_](SM|X|BE|EQ|T|XT)$/i, "");
    if (stripped) push(stripped);
    if (x.includes("-")) push(x.replace(/-/g, "_"));
    if (x.includes("_")) push(x.replace(/_/g, "-"));
  }
  return out;
}

export function suffixTries(raw: string): string[] {
  const s = String(raw || "").trim().toUpperCase();
  if (!s) return [];
  const metal = metalKey(s);
  if (metal) return [METALS[metal].yfInr, METALS[metal].yfUsd];
  if (s.startsWith("^") || s.includes("=") || s.includes("_FIN_SERVICE")) return [s];
  const out: string[] = [];
  if (/\.(NS|BO)$/.test(s)) out.push(s);
  for (const st of stemVariants(s)) {
    out.push(st + ".NS", st + ".BO");
  }
  return [...new Set(out)];
}

function searchQueries(symbol: string): string[] {
  const raw = String(symbol || "").replace(/\.(NS|BO)$/i, "");
  const stripped = raw.replace(/[-_](SM|X|BE|EQ|T|XT)$/i, "");
  const name = tickerName(symbol) || tickerName(stripped);
  return [...new Set([raw, stripped, name].map((x) => String(x || "").trim()).filter((x) => x.length >= 2))];
}

async function fetchChart(symbol: string, range = "max"): Promise<ChartPack> {
  const key = `${symbol}|${range}`;
  const hit = hCache.get(key);
  if (hit && Date.now() - hit.at < chartTtl(range)) return hit.data;
  const data = parseChart(await yahoo(chartUrl(symbol, range)));
  if (!data) throw new Error("no chart");
  hCache.set(key, { at: Date.now(), data });
  return data;
}

async function searchYahoo(q: string) {
  try {
    const data = (await yahoo(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=16&newsCount=0`,
    )) as { quotes?: Array<{ symbol?: string; quoteType?: string; shortname?: string; longname?: string; exchDisp?: string; exchange?: string }> };
    return (data.quotes || []).filter((x) => x.quoteType === "EQUITY" || x.quoteType === "INDEX" || x.quoteType === "CURRENCY" || x.quoteType === "FUTURE");
  } catch {
    return [];
  }
}

function scaleLinear(pack: ChartPack, factor: number, name: string, input: string): ChartPack {
  if (!(factor > 0) || factor === 1) {
    return { ...pack, input, name, symbol: input };
  }
  const bars = pack.bars.map((b) => ({ ...b, c: b.c * factor, raw: (b.raw || b.c) * factor }));
  const lastT = bars.at(-1)?.t || 0;
  const win = lastT ? bars.filter((b) => b.t >= lastT - 365 * 86400) : bars;
  const pxs = win.map((b) => b.raw || b.c).filter((x) => x > 0);
  return {
    ...pack,
    input,
    name,
    symbol: input,
    price: pack.price * factor,
    previousClose: pack.previousClose * factor,
    high52: pxs.length ? Math.max(...pxs) : pack.high52 * factor,
    low52: pxs.length ? Math.min(...pxs) : pack.low52 * factor,
    bars,
    sessions: bars.length,
    first: bars[0]?.t || null,
    last: bars.at(-1)?.t || null,
  };
}

function scaleOzToGram(pack: ChartPack, name: string, input: string): ChartPack {
  return scaleLinear(pack, 1 / TROY_OZ_G, name, input);
}

function multiplySeries(a: ChartPack, fx: ChartPack, name: string, input: string): ChartPack {
  const fxMap = new Map<string, number>();
  for (const b of fx.bars) fxMap.set(istDay(b.t), b.c);
  let lastFx = fx.bars.at(-1)?.c || 0;
  const bars: { t: number; c: number; raw: number }[] = [];
  for (const b of a.bars) {
    const d = istDay(b.t);
    const f = fxMap.get(d);
    if (f && f > 0) lastFx = f;
    if (!(lastFx > 0) || !(b.c > 0)) continue;
    const px = b.c * lastFx;
    bars.push({ t: b.t, c: px, raw: px });
  }
  const last = bars.at(-1)?.c || 0;
  const prev = bars.length >= 2 ? bars[bars.length - 2].c : last;
  return {
    input,
    symbol: input,
    name,
    price: last,
    previousClose: prev,
    changePct: prev ? ((last / prev - 1) * 100) : 0,
    high52: last,
    low52: last,
    first: bars[0]?.t || null,
    last: bars.at(-1)?.t || null,
    sessions: bars.length,
    bars,
    missing: false,
  };
}

async function growwHtml(path: string): Promise<string> {
  const res = await fetch("https://groww.in" + path, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
}

function asSpot(kind: MetalId, parsed: { display: number; prev: number }): McxSpot {
  const gram = mcxToGram(kind, parsed.display);
  const prevG = mcxToGram(kind, parsed.prev);
  return {
    display: parsed.display,
    prev: parsed.prev,
    changePct: prevG > 0 ? ((gram / prevG - 1) * 100) : 0,
    gram,
  };
}

export async function fetchMcxSpots(): Promise<{ GOLD: McxSpot | null; SILVER: McxSpot | null }> {
  if (Date.now() - mcxCache.at < 45_000 && (mcxCache.GOLD || mcxCache.SILVER)) {
    return { GOLD: mcxCache.GOLD, SILVER: mcxCache.SILVER };
  }
  const out: { GOLD: McxSpot | null; SILVER: McxSpot | null } = { GOLD: null, SILVER: null };
  try {
    const [list, goldPage, silverPage] = await Promise.all([
      growwHtml("/commodities").catch(() => ""),
      growwHtml("/commodities/futures/mcx_gold").catch(() => ""),
      growwHtml("/commodities/futures/mcx_silver").catch(() => ""),
    ]);
    const gold = pickMcxSpot("GOLD", parseGrowwMcx(list, "Gold"), [parseGrowwLive(goldPage)]);
    const silver = pickMcxSpot("SILVER", parseGrowwMcx(list, "Silver"), [parseGrowwLive(silverPage)]);
    if (gold) out.GOLD = asSpot("GOLD", gold);
    if (silver) out.SILVER = asSpot("SILVER", silver);
  } catch {
    /* scrape missed */
  }
  if (out.GOLD || out.SILVER) mcxCache = { at: Date.now(), ...out };
  return { GOLD: out.GOLD || mcxCache.GOLD, SILVER: out.SILVER || mcxCache.SILVER };
}

async function metalHistory(kind: MetalId, range: string): Promise<ChartPack | null> {
  const spec = METALS[kind];
  for (const etf of spec.etfs) {
    try {
      const pack = await fetchChart(etf, range);
      if (pack.bars.length >= 2 && pack.price > 0) {
        const factor = etfToGramPrice(kind, pack.price) / pack.price;
        return scaleLinear(pack, factor, spec.name, spec.symbol);
      }
    } catch {
      /* next Indian ETF */
    }
  }
  try {
    const [usd, fx] = await Promise.all([fetchChart(spec.yfUsd, range), fetchChart("INR=X", range)]);
    if (usd.bars.length >= 2 && fx.bars.length >= 2 && usd.price > 0 && fx.price > 0) {
      const mixed = multiplySeries(usd, fx, spec.name, spec.symbol);
      if (mixed.bars.length >= 2) return scaleOzToGram(mixed, spec.name, spec.symbol);
    }
  } catch {
    /* INR pair next */
  }
  try {
    const inr = await fetchChart(spec.yfInr, range);
    if (inr.bars.length >= 2 && inr.price > 0) return scaleOzToGram(inr, spec.name, spec.symbol);
  } catch {
    /* miss */
  }
  return null;
}

async function resolveMetal(kind: MetalId, range: string): Promise<ChartPack | null> {
  const spec = METALS[kind];
  const [hx, spots] = await Promise.all([metalHistory(kind, range), fetchMcxSpots()]);
  const spot = spots[kind];
  const gram = spot?.gram || hx?.price || 0;
  if (!(gram > 0) && !hx) return null;
  if (!hx) {
    return {
      input: spec.symbol,
      symbol: spec.symbol,
      name: spec.name,
      price: gram,
      previousClose: spot ? mcxToGram(kind, spot.prev) : gram,
      changePct: spot?.changePct || 0,
      high52: gram,
      low52: gram,
      first: null,
      last: Math.floor(Date.now() / 1000),
      sessions: 1,
      bars: [{ t: Math.floor(Date.now() / 1000), c: gram, raw: gram }],
      missing: false,
    };
  }
  const last = hx.price || hx.bars.at(-1)?.c || 0;
  const factor = last > 0 && gram > 0 ? gram / last : 1;
  const scaled = scaleLinear(hx, factor, spec.name, spec.symbol);
  if (spot) {
    scaled.price = gram;
    scaled.previousClose = mcxToGram(kind, spot.prev);
    scaled.changePct = spot.changePct;
  }
  return scaled;
}

export async function resolveHistory(symbol: string, range = "max"): Promise<ChartPack | null> {
  const metal = metalKey(symbol);
  if (metal) {
    const m = await resolveMetal(metal, range);
    if (m) return m;
  }
  const tried = new Set<string>();
  const tryOne = async (y: string): Promise<ChartPack | null> => {
    if (!y || tried.has(y)) return null;
    tried.add(y);
    try {
      const got = await fetchChart(y, range);
      if (got?.bars?.length >= 2) return { ...got, input: symbol };
    } catch {
      /* next */
    }
    return null;
  };
  for (const y of suffixTries(symbol)) {
    const hit = await tryOne(y);
    if (hit) return hit;
  }
  for (const q of searchQueries(symbol)) {
    const hits = await searchYahoo(q);
    for (const h of hits) {
      if (!h.symbol) continue;
      if (!/\.(NS|BO)$/i.test(h.symbol) && !String(h.symbol).startsWith("^") && !String(h.symbol).includes("=")) continue;
      const hit = await tryOne(h.symbol);
      if (hit) return { ...hit, name: h.longname || h.shortname || hit.name };
    }
  }
  return null;
}

async function resolveQuote(raw: string): Promise<Quote> {
  const ck = "q:" + raw.toUpperCase();
  const cached = qCache.get(ck);
  if (cached && Date.now() - cached.at < Q_TTL) return cached.data;

  const metal = metalKey(raw);
  if (metal) {
    const d = await resolveMetal(metal, "max");
    if (d && d.price > 0) {
      const out: Quote = {
        input: raw,
        symbol: metal,
        name: d.name,
        price: d.price,
        previousClose: d.previousClose,
        changePct: d.changePct,
        high52: d.high52,
        low52: d.low52,
        mcapCr: null,
      };
      qCache.set(ck, { at: Date.now(), data: out });
      return out;
    }
  }

  const tried = new Set<string>();
  const tryChart = async (y: string): Promise<Quote | null> => {
    if (tried.has(y)) return null;
    tried.add(y);
    try {
      const d = await fetchChart(y, "5d");
      if (d && d.price > 0) {
        const out: Quote = {
          input: raw,
          symbol: d.symbol,
          name: d.name,
          price: d.price,
          previousClose: d.previousClose,
          changePct: d.changePct,
          high52: d.high52,
          low52: d.low52,
          mcapCr: d.marketCap && d.marketCap > 0 ? d.marketCap / 1e7 : null,
        };
        qCache.set(ck, { at: Date.now(), data: out });
        return out;
      }
    } catch {
      /* next */
    }
    return null;
  };

  for (const y of suffixTries(raw)) {
    const hit = await tryChart(y);
    if (hit) return hit;
  }

  for (const q of searchQueries(raw)) {
    const hits = await searchYahoo(q);
    for (const h of hits) {
      if (!h.symbol) continue;
      if (!/\.(NS|BO)$/i.test(h.symbol) && !String(h.symbol).startsWith("^")) continue;
      const hit = await tryChart(h.symbol);
      if (hit) return { ...hit, name: h.longname || h.shortname || hit.name };
    }
  }

  const out: Quote = {
    input: raw,
    symbol: raw,
    name: raw,
    price: 0,
    previousClose: 0,
    changePct: 0,
    high52: 0,
    low52: 0,
    error: "unresolved",
  };
  qCache.set(ck, { at: Date.now(), data: out });
  return out;
}

async function poolMap<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const uniq = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))].slice(0, 80);
  return poolMap(uniq, 6, resolveQuote);
}

export async function fetchHistories(symbols: string[], range = "max"): Promise<HistoryPack[]> {
  const uniq = [...new Set(symbols.map((s) => String(s).trim()).filter(Boolean))].slice(0, 80);
  return poolMap(uniq, 6, async (s) => {
    const d = await resolveHistory(s, range);
    return d
      ? {
          input: s,
          symbol: d.symbol,
          name: d.name,
          price: d.price,
          previousClose: d.previousClose,
          changePct: d.changePct,
          high52: d.high52,
          low52: d.low52,
          first: d.first,
          last: d.last,
          sessions: d.sessions,
          bars: d.bars.map((b) => ({ t: b.t, c: b.c })),
          missing: false,
        }
      : {
          input: s,
          symbol: s,
          name: s,
          price: 0,
          previousClose: 0,
          changePct: 0,
          high52: 0,
          low52: 0,
          first: null,
          last: null,
          sessions: 0,
          bars: [],
          missing: true,
        };
  });
}

export async function fetchTape(): Promise<TapeRow[]> {
  const spots = await fetchMcxSpots();
  const rows = await poolMap(TAPE, 6, async (i) => {
    try {
      const metal = metalKey(i.symbol);
      if (metal) {
        const spec = METALS[metal];
        const spot = spots[metal];
        if (spot && spot.display > 0) {
          return {
            ...i,
            label: spec.name.toUpperCase(),
            price: spot.display,
            changePct: spot.changePct,
            unit: spec.displayLabel,
          };
        }
        const d = await resolveMetal(metal, "5d");
        if (d && d.price > 0) {
          return {
            ...i,
            label: spec.name.toUpperCase(),
            price: d.price * spec.displayG,
            changePct: d.changePct,
            unit: spec.displayLabel,
          };
        }
        return { ...i, price: 0, changePct: 0, unit: spec.displayLabel };
      }
      const d = await fetchChart(i.symbol, "5d");
      return { ...i, price: d.price, changePct: d.changePct };
    } catch {
      return { ...i, price: 0, changePct: 0 };
    }
  });
  return rows;
}

export async function searchSymbols(q: string) {
  const lower = q.trim().toLowerCase();
  const extras: { symbol: string; name: string; exch: string }[] = [];
  if (/gold|xau|bullion/.test(lower)) extras.push({ symbol: "GOLD", name: "Gold (MCX ₹/10g)", exch: "MCX" });
  if (/silver|xag/.test(lower)) extras.push({ symbol: "SILVER", name: "Silver (MCX ₹/kg)", exch: "MCX" });
  const data = (await yahoo(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=16&newsCount=0`,
  ).catch(() => ({ quotes: [] }))) as { quotes?: Array<{ symbol?: string; quoteType?: string; shortname?: string; longname?: string; exchDisp?: string; exchange?: string }> };
  const rest = (data.quotes || [])
    .filter((x) => x.quoteType === "EQUITY" || x.quoteType === "INDEX")
    .map((x) => ({
      symbol: x.symbol || "",
      name: x.shortname || x.longname || x.symbol || "",
      exch: x.exchDisp || x.exchange || "",
    }));
  const indian = rest.filter((x) => /\.(NS|BO)$/i.test(x.symbol) || /NSE|BSE|India/i.test(x.exch));
  const other = rest.filter((x) => !indian.includes(x) && !/\.KL$/i.test(x.symbol));
  return [...extras, ...indian, ...other].slice(0, 16);
}

export async function closeOnDay(symbol: string, day: string): Promise<{ day: string; price: number; name?: string } | null> {
  const d = await resolveHistory(symbol, "max");
  if (!d?.bars.length) return null;
  let hit: { t: number; c: number } | null = null;
  for (const b of d.bars) {
    const k = istDay(b.t);
    if (k <= day) hit = { t: b.t, c: b.c };
    if (k === day) break;
  }
  if (!hit) hit = d.bars[0];
  return { day: istDay(hit.t), price: hit.c, name: d.name };
}

export { isCommodity };

export async function fetchOhlc(symbol: string, range = "1y", interval = "1d"): Promise<OhlcPack> {
  const metal = metalKey(symbol);
  if (metal) {
    const d = await resolveHistory(symbol, range === "max" ? "max" : range);
    if (d && d.bars.length) {
      const spec = METALS[metal];
      const bars: OhlcBar[] = d.bars.map((b) => ({ t: b.t, o: b.c, h: b.c, l: b.c, c: b.c, v: 0 }));
      return {
        input: symbol,
        symbol: metal,
        name: `${spec.name} (${spec.displayLabel})`,
        price: d.price * spec.displayG,
        previousClose: d.previousClose * spec.displayG,
        changePct: d.changePct,
        high52: d.high52 * spec.displayG,
        low52: d.low52 * spec.displayG,
        dayHigh: d.price * spec.displayG,
        dayLow: d.price * spec.displayG,
        volume: 0,
        currency: "INR",
        exchange: "MCX",
        firstTrade: d.first,
        bars: bars.map((b) => ({ ...b, o: b.o * spec.displayG, h: b.h * spec.displayG, l: b.l * spec.displayG, c: b.c * spec.displayG })),
        missing: false,
      };
    }
  }
  const key = `o:${symbol}|${range}|${interval}`;
  const hit = oCache.get(key);
  if (hit && Date.now() - hit.at < chartTtl(range, interval)) return hit.data;
  const tried = new Set<string>();
  for (const y of suffixTries(symbol)) {
    tried.add(y);
    try {
      const raw = await yahoo(chartUrl(y, range, interval));
      const pack = parseOhlc(raw, symbol);
      if (pack && pack.bars.length >= 2) {
        oCache.set(key, { at: Date.now(), data: pack });
        return pack;
      }
    } catch {
      /* next */
    }
  }
  for (const q of searchQueries(symbol)) {
    const hits = await searchYahoo(q);
    for (const h of hits) {
      if (!h.symbol || tried.has(h.symbol)) continue;
      if (!/\.(NS|BO)$/i.test(h.symbol) && !String(h.symbol).startsWith("^")) continue;
      tried.add(h.symbol);
      try {
        const raw = await yahoo(chartUrl(h.symbol, range, interval));
        const pack = parseOhlc(raw, symbol);
        if (pack && pack.bars.length >= 2) {
          oCache.set(key, { at: Date.now(), data: pack });
          return pack;
        }
      } catch {
        /* next */
      }
    }
  }
  return {
    input: symbol,
    symbol,
    name: symbol,
    price: 0,
    previousClose: 0,
    changePct: 0,
    high52: 0,
    low52: 0,
    dayHigh: 0,
    dayLow: 0,
    volume: 0,
    currency: "INR",
    exchange: "",
    firstTrade: null,
    bars: [],
    missing: true,
  };
}

function parseOhlc(data: unknown, input: string): OhlcPack | null {
  const root = data as {
    chart?: {
      result?: Array<{
        meta?: Record<string, unknown>;
        timestamp?: number[];
        indicators?: {
          quote?: Array<{
            open?: (number | null)[];
            high?: (number | null)[];
            low?: (number | null)[];
            close?: (number | null)[];
            volume?: (number | null)[];
          }>;
          adjclose?: Array<{ adjclose?: (number | null)[] }>;
        };
      }>;
    };
  };
  const r = root?.chart?.result?.[0];
  if (!r) return null;
  const m = r.meta || {};
  const ts = r.timestamp || [];
  const q = r.indicators?.quote?.[0] || {};
  const adj = r.indicators?.adjclose?.[0]?.adjclose || [];
  const bars: OhlcBar[] = [];
  for (let i = 0; i < ts.length; i++) {
    const close = q.close?.[i];
    const open = q.open?.[i];
    const high = q.high?.[i];
    const low = q.low?.[i];
    const vol = q.volume?.[i];
    const a = adj[i];
    if (close == null || !(close > 0)) continue;
    const raw = Number(close);
    const adjC = a != null && a > 0 ? Number(a) : raw;
    const o = open != null && open > 0 ? Number(open) : raw;
    const h = high != null && high > 0 ? Number(high) : Math.max(o, raw);
    const l = low != null && low > 0 ? Number(low) : Math.min(o, raw);
    bars.push({ t: ts[i], o, h, l, c: raw, v: vol != null && vol > 0 ? Number(vol) : 0, adj: adjC });
  }
  const price = Number(m.regularMarketPrice || 0) || bars.at(-1)?.c || 0;
  const prev = Number(m.chartPreviousClose || m.previousClose || 0);
  let changePct = Number(m.regularMarketChangePercent || 0);
  if (!Number.isFinite(changePct) && prev > 0 && price > 0) changePct = (price / prev - 1) * 100;
  if (!Number.isFinite(changePct)) changePct = 0;
  return {
    input,
    symbol: String(m.symbol || input),
    name: String(m.longName || m.shortName || m.symbol || input),
    price,
    previousClose: prev,
    changePct,
    high52: Number(m.fiftyTwoWeekHigh || 0),
    low52: Number(m.fiftyTwoWeekLow || 0),
    dayHigh: Number(m.regularMarketDayHigh || 0),
    dayLow: Number(m.regularMarketDayLow || 0),
    volume: Number(m.regularMarketVolume || 0),
    currency: String(m.currency || "INR"),
    exchange: String(m.fullExchangeName || m.exchangeName || ""),
    firstTrade: m.firstTradeDate != null ? Number(m.firstTradeDate) : bars[0]?.t || null,
    bars,
    missing: bars.length < 2,
    mcapCr: Number(m.marketCap || 0) > 0 && String(m.currency || "INR") === "INR" ? Number(m.marketCap) / 1e7 : null,
  };
}

export type QuoteSnap = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  high52: number;
  low52: number;
  mcapCr: number | null;
  pe: number | null;
  pb: number | null;
  eps: number | null;
  book: number | null;
  divYield: number | null;
  vol: number;
  volAvg: number;
  ma50: number | null;
  ma200: number | null;
};

const snapCache = new Map<string, { at: number; data: QuoteSnap }>();
const SNAP_TTL = 15 * 60 * 1000;

function nPos(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function snapFromQuote(q: Record<string, unknown>, bare: string): QuoteSnap | null {
  const price = Number(q.regularMarketPrice || q.postMarketPrice || 0);
  if (!(price > 0)) return null;
  const prev = Number(q.regularMarketPreviousClose || 0);
  let changePct = Number(q.regularMarketChangePercent || 0);
  if (!Number.isFinite(changePct) && prev > 0) changePct = (price / prev - 1) * 100;
  if (!Number.isFinite(changePct)) changePct = 0;
  const mcap = Number(q.marketCap || 0);
  const vol = Number(q.regularMarketVolume || 0);
  const volAvg = Number(q.averageDailyVolume3Month || q.averageDailyVolume10Day || 0);
  const pe = nPos(q.trailingPE);
  const pb = nPos(q.priceToBook);
  const eps = Number.isFinite(Number(q.epsTrailingTwelveMonths)) ? Number(q.epsTrailingTwelveMonths) : null;
  const book = nPos(q.bookValue);
  let div = Number(q.trailingAnnualDividendYield || q.dividendYield || 0);
  if (div > 0 && div < 1) div = div * 100;
  if (!(div > 0) || div > 40) div = 0;
  return {
    symbol: bare,
    name: String(q.longName || q.shortName || q.displayName || bare),
    price,
    changePct,
    high52: Number(q.fiftyTwoWeekHigh || 0),
    low52: Number(q.fiftyTwoWeekLow || 0),
    mcapCr: mcap > 0 ? mcap / 1e7 : null,
    pe,
    pb,
    eps: eps != null && Number.isFinite(eps) ? eps : null,
    book,
    divYield: div > 0 ? div : null,
    vol: vol > 0 ? vol : 0,
    volAvg: volAvg > 0 ? volAvg : 0,
    ma50: nPos(q.fiftyDayAverage),
    ma200: nPos(q.twoHundredDayAverage),
  };
}

async function quoteBatch(tickers: string[]): Promise<Map<string, QuoteSnap>> {
  const out = new Map<string, QuoteSnap>();
  if (!tickers.length) return out;
  const url =
    "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" +
    tickers.map((s) => encodeURIComponent(s)).join(",");
  try {
    const data = (await yahoo(url)) as {
      quoteResponse?: { result?: Array<Record<string, unknown>> };
    };
    for (const q of data?.quoteResponse?.result || []) {
      const raw = String(q.symbol || "");
      const bare = raw.replace(/\.(NS|BO)$/i, "").toUpperCase();
      if (!bare) continue;
      const snap = snapFromQuote(q, bare);
      if (snap) out.set(bare, snap);
    }
  } catch {
    /* v7 often 401 — spark still prints */
  }
  return out;
}

function snapFromSpark(raw: unknown, fallbackBare: string): QuoteSnap | null {
  const o = (raw || {}) as {
    symbol?: string;
    fulldayPrice?: number;
    fulldayChangePercent?: number;
    chartPreviousClose?: number;
    close?: (number | null)[];
    previousClose?: number | null;
  };
  const close = Array.isArray(o.close) ? o.close.filter((x): x is number => x != null && x > 0) : [];
  const price = Number(o.fulldayPrice || close.at(-1) || 0);
  if (!(price > 0)) return null;
  const prev = Number(o.chartPreviousClose || o.previousClose || 0);
  let changePct = Number(o.fulldayChangePercent || 0);
  if (!Number.isFinite(changePct) && prev > 0) changePct = (price / prev - 1) * 100;
  if (!Number.isFinite(changePct)) changePct = 0;
  const bare = String(o.symbol || fallbackBare)
    .replace(/\.(NS|BO)$/i, "")
    .toUpperCase();
  if (!bare) return null;
  return {
    symbol: bare,
    name: tickerName(bare) || bare,
    price,
    changePct,
    high52: 0,
    low52: 0,
    mcapCr: null,
    pe: null,
    pb: null,
    eps: null,
    book: null,
    divYield: null,
    vol: 0,
    volAvg: 0,
    ma50: null,
    ma200: null,
  };
}

async function sparkChunk(tickers: string[]): Promise<Map<string, QuoteSnap>> {
  const out = new Map<string, QuoteSnap>();
  if (!tickers.length) return out;
  const url =
    "https://query1.finance.yahoo.com/v8/finance/spark?symbols=" +
    tickers.map((s) => encodeURIComponent(s)).join(",") +
    "&range=1d&interval=1d";
  try {
    const data = (await yahoo(url)) as Record<string, unknown>;
    const rows =
      data && typeof data === "object" && data.spark && typeof data.spark === "object"
        ? ((data.spark as { result?: unknown[] }).result || [])
        : Object.entries(data || {}).map(([sym, row]) =>
            row && typeof row === "object" ? { ...(row as object), symbol: (row as { symbol?: string }).symbol || sym } : null,
          );
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const raw = row as { symbol?: string };
      const bare = String(raw.symbol || "")
        .replace(/\.(NS|BO)$/i, "")
        .toUpperCase();
      const snap = snapFromSpark(row, bare);
      if (snap) out.set(snap.symbol, snap);
    }
  } catch {
    /* empty spark chunk */
  }
  return out;
}

/** Live prints for many NSE names. Quote v7 when it answers; spark otherwise. */
export async function fetchQuoteSnaps(symbols: string[]): Promise<QuoteSnap[]> {
  const uniq = [...new Set(symbols.map((s) => String(s || "").replace(/\.(NS|BO)$/i, "").toUpperCase()).filter(Boolean))];
  const now = Date.now();
  const need: string[] = [];
  const hits: QuoteSnap[] = [];
  for (const s of uniq) {
    const c = snapCache.get(s);
    if (c && now - c.at < SNAP_TTL) hits.push(c.data);
    else need.push(s);
  }
  const by = new Map<string, QuoteSnap>();
  for (const h of hits) by.set(h.symbol, h);

  const v7chunks: string[][] = [];
  for (let i = 0; i < need.length; i += 40) v7chunks.push(need.slice(i, i + 40));
  const v7 = await poolMap(v7chunks, 3, async (chunk) => quoteBatch(chunk.map((s) => `${s}.NS`)));
  for (const map of v7) {
    for (const [k, v] of map) {
      snapCache.set(k, { at: now, data: v });
      by.set(k, v);
    }
  }

  const missing = need.filter((s) => !by.has(s));
  if (missing.length) {
    const sparkChunks: string[][] = [];
    for (let i = 0; i < missing.length; i += 18) sparkChunks.push(missing.slice(i, i + 18));
    const sparks = await poolMap(sparkChunks, 6, async (chunk) => sparkChunk(chunk.map((s) => `${s}.NS`)));
    for (const map of sparks) {
      for (const [k, v] of map) {
        snapCache.set(k, { at: now, data: v });
        by.set(k, v);
      }
    }
  }

  return uniq.map((s) => by.get(s)).filter((x): x is QuoteSnap => Boolean(x));
}

