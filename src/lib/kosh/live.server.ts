import { sectorOf } from "./sectors.ts";
import { fetchOhlc, fetchQuotes, fetchQuoteSnaps } from "./yahoo.server.ts";
import { lastBbPos, lastMacdHist, lastRsi, retFrom, sma, volAvg, ema, isNr7, detectRetest } from "./ohlc.ts";
import { DEEP_UNIVERSE, SCREEN_UNIVERSE, universeName } from "./universe.ts";
import { TICKER_NAMES } from "./names.ts";
import { fetchFundamentals } from "./fundamentals.server.ts";
import { listedEquities } from "./master.server.ts";
import { newsAboutCompany, newsMaterial } from "./news.ts";
import { stakeDelta } from "./shareholding.ts";
import { detectVcp } from "./vcp.ts";
import type { Fundamentals, NewsItem, OhlcPack, ScreenRow, WikiCard } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function getText(url: string, timeout = 12_000): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
}

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
}

const newsCache = new Map<string, { at: number; data: NewsItem[] }>();
const wikiCache = new Map<string, { at: number; data: WikiCard | null }>();
const screenCache = new Map<string, { at: number; data: ScreenRow[] }>();
let uniInflight: Promise<ScreenRow[]> | null = null;
let deepInflight: Promise<ScreenRow[]> | null = null;

export async function fetchNews(symbol: string, name?: string): Promise<NewsItem[]> {
  const q = (name || universeName(symbol) || symbol).replace(/\.(NS|BO)$/i, "");
  const key = q.toLowerCase();
  const hit = newsCache.get(key);
  if (hit && Date.now() - hit.at < 3 * 60 * 1000) return hit.data;
  const queries = [
    q + " stock NSE",
    q + " stock site:moneycontrol.com",
    q + " stock site:economictimes.indiatimes.com",
    q + " stock site:business-standard.com",
  ];
  try {
    const chunks = await Promise.all(
      queries.map(async (query) => {
        const url =
          "https://news.google.com/rss/search?q=" +
          encodeURIComponent(query) +
          "&hl=en-IN&gl=IN&ceid=IN:en";
        const xml = await getText(url);
        const items: NewsItem[] = [];
        for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
          const block = m[1];
          const rawTitle = tag(block, "title");
          if (!rawTitle) continue;
          const dash = rawTitle.lastIndexOf(" - ");
          const title = dash > 12 ? rawTitle.slice(0, dash) : rawTitle;
          const publisher = dash > 12 ? rawTitle.slice(dash + 3) : tag(block, "source") || "News";
          const link = tag(block, "link");
          const date = tag(block, "pubDate");
          const ts = date ? Date.parse(date) / 1000 : 0;
          items.push({ title, publisher, link, ts: Number.isFinite(ts) ? ts : 0, material: newsMaterial(title) });
          if (items.length >= 8) break;
        }
        return items;
      }),
    );
    const seen = new Set<string>();
    const items: NewsItem[] = [];
    for (const row of chunks.flat().sort((a, b) => (b.ts || 0) - (a.ts || 0))) {
      const k = row.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (!k || seen.has(k)) continue;
      if (!newsAboutCompany(row.title, symbol, name || q)) continue;
      seen.add(k);
      items.push(row);
      if (items.length >= 20) break;
    }
    newsCache.set(key, { at: Date.now(), data: items });
    return items;
  } catch {
    newsCache.set(key, { at: Date.now(), data: [] });
    return [];
  }
}

export async function fetchWiki(name: string): Promise<WikiCard | null> {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  const hit = wikiCache.get(key);
  if (hit && Date.now() - hit.at < 24 * 60 * 60 * 1000) return hit.data;
  const title = name.replace(/\s+/g, "_");
  try {
    const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title), {
      headers: { "User-Agent": "Kosh/1.0 (Indian portfolio reader)", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      wikiCache.set(key, { at: Date.now(), data: null });
      return null;
    }
    const d = (await res.json()) as { title?: string; extract?: string; content_urls?: { desktop?: { page?: string } }; type?: string };
    if (d.type === "disambiguation" || !d.extract) {
      wikiCache.set(key, { at: Date.now(), data: null });
      return null;
    }
    const card: WikiCard = {
      title: d.title || name,
      extract: d.extract,
      url: d.content_urls?.desktop?.page || "",
    };
    wikiCache.set(key, { at: Date.now(), data: card });
    return card;
  } catch {
    wikiCache.set(key, { at: Date.now(), data: null });
    return null;
  }
}

function fundFields(f?: Fundamentals | null): Pick<
  ScreenRow,
  | "pe"
  | "pb"
  | "roe"
  | "de"
  | "mcapCr"
  | "divYield"
  | "eps"
  | "book"
  | "salesYoY"
  | "profitYoY"
  | "promoters"
  | "roce"
  | "peg"
  | "opm"
  | "salesCagr3"
  | "profitCagr3"
  | "profitCagr5"
  | "fii"
  | "fiiPrev"
  | "fiiDelta"
  | "dii"
  | "diiPrev"
  | "diiDelta"
  | "shLabel"
> {
  const sh = stakeDelta(f?.shareholding);
  return {
    pe: f?.pe ?? null,
    pb: f?.pb ?? null,
    roe: f?.roe ?? null,
    de: f?.de ?? null,
    mcapCr: f?.mcapCr ?? null,
    divYield: f?.divYield ?? null,
    eps: f?.eps ?? null,
    book: f?.book ?? null,
    salesYoY: f?.salesYoY ?? null,
    profitYoY: f?.profitYoY ?? null,
    promoters: f?.promoters ?? null,
    roce: f?.roce ?? null,
    peg: f?.peg ?? null,
    opm: f?.opm ?? null,
    salesCagr3: f?.salesCagr3 ?? null,
    profitCagr3: f?.profitCagr3 ?? null,
    profitCagr5: f?.profitCagr5 ?? null,
    fii: sh?.fii ?? f?.fii ?? null,
    fiiPrev: sh?.fiiPrev ?? null,
    fiiDelta: sh?.fiiDelta ?? null,
    dii: sh?.dii ?? f?.dii ?? null,
    diiPrev: sh?.diiPrev ?? null,
    diiDelta: sh?.diiDelta ?? null,
    shLabel: sh?.label ?? null,
  };
}

function toRow(pack: OhlcPack, input: string, fund?: Fundamentals | null): ScreenRow {
  const bars = pack.bars;
  const last = bars.at(-1);
  const closes = bars.map((b) => b.c);
  const ma50 = sma(closes, 50);
  const ma200 = sma(closes, 200);
  const last50 = [...ma50].reverse().find((x) => x != null) ?? null;
  const last200 = [...ma200].reverse().find((x) => x != null) ?? null;
  const px = pack.price || last?.c || 0;
  const avg = volAvg(bars, 20);
  const vol = pack.volume || last?.v || 0;
  const off = pack.high52 ? ((px / pack.high52 - 1) * 100) : null;
  const bare = input.replace(/\.(NS|BO)$/i, "").toUpperCase();
  const retest = detectRetest(bars);
  const vcp = detectVcp(bars);
  const retBars = bars.map((b) => ({ ...b, c: b.adj && b.adj > 0 ? b.adj : b.c }));
  const thin = (pack.mcapCr != null && pack.mcapCr < 500) || (avg > 0 && avg < 50_000);
  return {
    symbol: bare,
    name: pack.name || TICKER_NAMES[bare] || universeName(bare),
    sector: sectorOf(bare, fund?.industry),
    price: px,
    changePct: pack.changePct,
    high52: pack.high52,
    low52: pack.low52,
    offHigh: off,
    ret1m: retFrom(retBars, 31),
    ret3m: retFrom(retBars, 93),
    ret1y: retFrom(retBars, 365),
    vol,
    volAvg: avg,
    volRatio: avg > 0 ? vol / avg : null,
    rsi: lastRsi(bars),
    above50: last50 != null && px > 0 ? px >= last50 : null,
    above200: last200 != null && px > 0 ? px >= last200 : null,
    macdHist: lastMacdHist(bars),
    bbPos: lastBbPos(bars),
    nr7: isNr7(bars),
    gapPct: last && bars.at(-2)?.c ? ((last.o / bars[bars.length - 2].c - 1) * 100) : null,
    above21: (() => {
      const e = ema(closes, 21);
      const lastE = [...e].reverse().find((x) => x != null) ?? null;
      return lastE != null && px > 0 ? px >= lastE : null;
    })(),
    ...fundFields(fund),
    mcapCr: fund?.mcapCr ?? pack.mcapCr ?? null,
    retest: retest.hit,
    retestLevel: retest.level,
    athRetest: retest.hit && retest.ath,
    vcp: vcp ? vcp.forming || vcp.breakout : null,
    vcpBreak: vcp?.breakout ?? null,
    vcpN: vcp?.n ?? null,
    vcpLastPct: vcp?.lastPct ?? null,
    vcpDays: vcp?.days ?? null,
    vcpVolX: vcp?.volX ?? null,
    vcpPivot: vcp?.pivot ?? null,
    depth: "full",
    thin,
  };
}

async function pool<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
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

function emptyRow(u: { symbol: string; name: string }): ScreenRow {
  return {
    symbol: u.symbol,
    name: u.name,
    sector: sectorOf(u.symbol),
    price: 0,
    changePct: 0,
    high52: 0,
    low52: 0,
    offHigh: null,
    ret1m: null,
    ret3m: null,
    ret1y: null,
    vol: 0,
    volAvg: 0,
    volRatio: null,
    rsi: null,
    above50: null,
    above200: null,
    macdHist: null,
    bbPos: null,
    nr7: null,
    gapPct: null,
    above21: null,
    ...fundFields(null),
    retest: null,
    retestLevel: null,
    athRetest: null,
    vcp: null,
    vcpBreak: null,
    vcpN: null,
    vcpLastPct: null,
    vcpDays: null,
    vcpVolX: null,
    vcpPivot: null,
    depth: "name" as const,
    thin: null,
  };
}

export async function fetchScreener(): Promise<ScreenRow[]> {
  const hit = screenCache.get("deep-v9");
  if (hit && Date.now() - hit.at < 15 * 60 * 1000) return hit.data;
  if (deepInflight) return deepInflight;
  deepInflight = (async () => {
    const rows = await pool(DEEP_UNIVERSE, 14, async (u) => {
      try {
        const [pack, fund] = await Promise.all([
          fetchOhlc(u.symbol, "2y", "1d"),
          fetchFundamentals(u.symbol).catch(() => null),
        ]);
        if (pack.missing || pack.price <= 0) return emptyRow(u);
        return toRow(pack, u.symbol, fund);
      } catch {
        return emptyRow(u);
      }
    });
    const ok = rows.filter((r) => r.price > 0);
    if (ok.length) screenCache.set("deep-v9", { at: Date.now(), data: ok });
    return ok;
  })().finally(() => {
    deepInflight = null;
  });
  return deepInflight;
}

export async function fetchScreenerUniverse(): Promise<ScreenRow[]> {
  const hit = screenCache.get("uni-v10");
  if (hit && Date.now() - hit.at < 15 * 60 * 1000) return hit.data;
  if (uniInflight) return uniInflight;
  uniInflight = (async () => {
    const listed = await listedEquities().catch(() => [] as Awaited<ReturnType<typeof listedEquities>>);
    const universe =
      listed.length >= 1000
        ? listed.map((u) => ({ symbol: u.symbol, name: u.name, isin: u.isin, series: u.series, listedOn: u.listedOn, gsm: u.gsm }))
        : SCREEN_UNIVERSE.map((u) => ({ symbol: u.symbol, name: u.name, isin: null as string | null, series: "EQ", listedOn: null as string | null, gsm: false }));
    const meta = new Map(universe.map((u) => [u.symbol, u]));
    const snaps = await fetchQuoteSnaps(universe.map((u) => u.symbol));
    const bySnap = new Map(snaps.map((s) => [s.symbol, s]));
    const deep = screenCache.get("deep-v9")?.data || screenCache.get("deep-v8")?.data || [];
    const byDeep = new Map(deep.map((r) => [r.symbol, r]));
    const rows: ScreenRow[] = universe.map((u) => {
      const full = byDeep.get(u.symbol);
      const m = meta.get(u.symbol);
      const extra = { isin: m?.isin ?? null, series: m?.series ?? null, listedOn: m?.listedOn ?? null, gsm: m?.gsm ?? null };
      if (full && full.price > 0) return { ...full, ...extra };
      const s = bySnap.get(u.symbol);
      if (!s) return { ...emptyRow(u), name: u.name, ...extra };
      const px = s.price;
      const volRatio = s.volAvg > 0 ? s.vol / s.volAvg : null;
      const thin = (s.mcapCr != null && s.mcapCr < 500) || (s.volAvg > 0 && s.volAvg < 50_000) || extra.gsm === true;
      return {
        ...emptyRow(u),
        name: s.name || u.name,
        price: px,
        changePct: s.changePct,
        high52: s.high52,
        low52: s.low52,
        offHigh: s.high52 && px ? ((px / s.high52 - 1) * 100) : null,
        vol: s.vol,
        volAvg: s.volAvg,
        volRatio,
        pe: s.pe,
        pb: s.pb,
        eps: s.eps,
        book: s.book,
        divYield: s.divYield,
        mcapCr: s.mcapCr,
        above50: s.ma50 != null && px > 0 ? px >= s.ma50 : null,
        above200: s.ma200 != null && px > 0 ? px >= s.ma200 : null,
        depth: "quote" as const,
        thin,
        ...extra,
      };
    });
    const nPriced = rows.filter((r) => r.price > 0).length;
    if (nPriced > 0) screenCache.set("uni-v10", { at: Date.now(), data: rows });
    return rows;
  })().finally(() => {
    uniInflight = null;
  });
  return uniInflight;
}

export async function fetchScreenerOne(symbol: string): Promise<ScreenRow | null> {
  const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
  if (!bare) return null;
  try {
    const [pack, fund] = await Promise.all([
      fetchOhlc(bare, "2y", "1d"),
      fetchFundamentals(bare).catch(() => null),
    ]);
    if (!pack.missing && pack.price > 0) return toRow(pack, bare, fund);
    const quotes = await fetchQuotes([bare]).catch(() => []);
    const q = quotes.find((x) => x.price > 0);
    if (!q) return null;
    return {
      ...emptyRow({ symbol: bare, name: q.name || universeName(bare) }),
      price: q.price,
      changePct: q.changePct,
      high52: q.high52,
      low52: q.low52,
      offHigh: q.high52 && q.price ? ((q.price / q.high52 - 1) * 100) : null,
      ...fundFields(fund),
      name: q.name || universeName(bare),
      sector: sectorOf(bare, fund?.industry),
      depth: "quote",
    };
  } catch {
    return null;
  }
}

export function snapshotStats(pack: OhlcPack) {
  const bars = pack.bars;
  const closes = bars.map((b) => b.c);
  const ma20 = sma(closes, 20);
  const ma50 = sma(closes, 50);
  const ma200 = sma(closes, 200);
  const last = <T>(a: (T | null)[]) => [...a].reverse().find((x) => x != null) ?? null;
  const px = pack.price || bars.at(-1)?.c || 0;
  return {
    ret1w: retFrom(bars, 7),
    ret1m: retFrom(bars, 31),
    ret3m: retFrom(bars, 93),
    ret6m: retFrom(bars, 186),
    ret1y: retFrom(bars, 365),
    rsi: lastRsi(bars),
    ma20: last(ma20),
    ma50: last(ma50),
    ma200: last(ma200),
    volAvg: volAvg(bars, 20),
    offHigh: pack.high52 && px ? ((px / pack.high52 - 1) * 100) : null,
    offLow: pack.low52 && px ? ((px / pack.low52 - 1) * 100) : null,
  };
}
