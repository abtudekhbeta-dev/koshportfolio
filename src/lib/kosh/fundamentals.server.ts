/** Groww company card — PE, ROE, book, D/E, sales. Cached. Server-only. */

import type { Fundamentals, FinPoint } from "./types";
import { pickPeg } from "./portfolio-stats.ts";
import { universeName } from "./universe.ts";
import { sortShareholding } from "./shareholding.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const idCache = new Map<string, { at: number; id: string | null }>();
const fundCache = new Map<string, { at: number; data: Fundamentals | null }>();
const ID_TTL = 24 * 60 * 60 * 1000;
const FUND_TTL = 12 * 60 * 60 * 1000;

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(18_000),
  });
  if (!res.ok) throw new Error(`Groww ${res.status}`);
  return res.json();
}

function parseNum(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return null;
  let t = raw.replace(/₹/g, "").replace(/,/g, "").trim();
  if (!t || t === "-" || t === "NA" || t === "n/a") return null;
  t = t.replace(/\s*cr$/i, "").replace(/%$/i, "").trim();
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function yoy(series: Record<string, number> | undefined): number | null {
  if (!series) return null;
  const keys = Object.keys(series).sort();
  if (keys.length < 2) return null;
  const a = series[keys[keys.length - 2]];
  const b = series[keys[keys.length - 1]];
  if (!(a > 0) || b == null) return null;
  return ((b / a - 1) * 100);
}

function points(series: Record<string, number> | undefined): FinPoint[] {
  if (!series) return [];
  return Object.entries(series)
    .map(([period, value]) => ({ period, value }))
    .filter((x) => Number.isFinite(x.value));
}

function lastYear(series: Record<string, number> | undefined): number | null {
  if (!series) return null;
  const keys = Object.keys(series).sort();
  if (!keys.length) return null;
  const v = series[keys[keys.length - 1]];
  return Number.isFinite(v) ? v : null;
}

function interestCoverFrom(cons: Array<{ title?: string; yearly?: Record<string, number> }>): number | null {
  const ebit = cons.find((x) => /operating profit|\bebit\b|\bpbit\b/i.test(x.title || "") && !/margin|ebitda/i.test(x.title || ""));
  const interest = cons.find((x) => /interest(?! coverage)|finance cost/i.test(x.title || ""));
  const e = lastYear(ebit?.yearly);
  const i = lastYear(interest?.yearly);
  if (e == null || i == null || !(Math.abs(i) > 0)) return null;
  const c = e / Math.abs(i);
  return Number.isFinite(c) && c > 0 && c < 800 ? c : null;
}

function cagrFrom(pts: FinPoint[], years: number): number | null {
  const rows = (pts || []).filter((p) => p.value > 0);
  if (rows.length < 2) return null;
  const last = rows[rows.length - 1];
  const idx = rows.length - 1 - years;
  const first = idx >= 0 ? rows[idx] : rows[0];
  const n = Math.max(1, years);
  if (!(first.value > 0) || first === last) return null;
  const span = idx >= 0 ? years : Math.max(1, rows.length - 1);
  if (span < Math.min(years, 2) && years >= 3) return null;
  return (Math.pow(last.value / first.value, 1 / (idx >= 0 ? n : span)) - 1) * 100;
}

function cleanUrl(raw: unknown): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  try {
    const u = new URL(s.startsWith("http") ? s : "https://" + s);
    if (u.hostname && !/wikipedia\.org$/i.test(u.hostname)) return u.origin;
  } catch {
    return null;
  }
  return null;
}

async function searchGroww(q: string): Promise<
  Array<{ search_id?: string; entity_type?: string; nse_scrip_code?: string; bse_scrip_code?: string | number }>
> {
  try {
    const data = (await getJson(
      "https://groww.in/v1/api/search/v2/query/global/st_p_query?page=0&size=8&web=true&q=" + encodeURIComponent(q),
    )) as {
      data?: {
        content?: Array<{
          search_id?: string;
          entity_type?: string;
          nse_scrip_code?: string;
          bse_scrip_code?: string | number;
        }>;
      };
    };
    return data?.data?.content || [];
  } catch {
    return [];
  }
}

function exactId(
  rows: Array<{ search_id?: string; entity_type?: string; nse_scrip_code?: string; bse_scrip_code?: string | number }>,
  bare: string,
) {
  const hit = rows.find((r) => {
    if (r.entity_type !== "Stocks" || !r.search_id) return false;
    const nse = String(r.nse_scrip_code || "").toUpperCase();
    const bse = String(r.bse_scrip_code || "").toUpperCase();
    return nse === bare || bse === bare;
  });
  return hit?.search_id || null;
}

async function searchId(symbol: string): Promise<string | null> {
  const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
  if (!bare || bare === "GOLD" || bare === "SILVER") return null;
  const hit = idCache.get(bare);
  if (hit && Date.now() - hit.at < ID_TTL) return hit.id;
  const fromTicker = exactId(await searchGroww(bare), bare);
  if (fromTicker) {
    idCache.set(bare, { at: Date.now(), id: fromTicker });
    return fromTicker;
  }
  const name = universeName(bare);
  if (name && name.toUpperCase() !== bare) {
    const fromName = exactId(await searchGroww(name), bare);
    if (fromName) {
      idCache.set(bare, { at: Date.now(), id: fromName });
      return fromName;
    }
  }
  idCache.set(bare, { at: Date.now(), id: null });
  return null;
}

function pick(list: Array<{ name?: string; shortName?: string; value?: string }>, ...names: string[]) {
  const lower = names.map((n) => n.toLowerCase());
  const row = list.find((x) => lower.includes(String(x.name || "").toLowerCase()) || lower.includes(String(x.shortName || "").toLowerCase()));
  return parseNum(row?.value);
}

export function sharePct(node: unknown): number | null {
  if (node == null) return null;
  if (typeof node === "number" && Number.isFinite(node)) return node;
  if (typeof node !== "object") return null;
  const o = node as Record<string, unknown>;
  if (typeof o.percent === "number" && Number.isFinite(o.percent)) return o.percent;
  let sum = 0;
  let found = false;
  for (const v of Object.values(o)) {
    if (!v || typeof v !== "object") continue;
    const inner = v as Record<string, unknown>;
    if (typeof inner.percent === "number" && Number.isFinite(inner.percent)) {
      sum += inner.percent;
      found = true;
    }
  }
  return found ? sum : null;
}

export function diiPct(sh: {
  mutualFunds?: unknown;
  otherDomesticInstitutions?: unknown;
  domesticInstitutions?: unknown;
} | undefined): number | null {
  if (!sh) return null;
  const parts = [sharePct(sh.mutualFunds), sharePct(sh.otherDomesticInstitutions), sharePct(sh.domesticInstitutions)].filter(
    (n): n is number => n != null,
  );
  if (!parts.length) return null;
  const s = parts.reduce((a, b) => a + b, 0);
  return s > 0 ? s : null;
}

export async function fetchFundamentals(symbol: string): Promise<Fundamentals | null> {
  const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
  const cached = fundCache.get(bare);
  if (cached && Date.now() - cached.at < FUND_TTL) return cached.data;
  const id = await searchId(bare);
  if (!id) {
    fundCache.set(bare, { at: Date.now(), data: null });
    return null;
  }
  try {
    const g = (await getJson(
      "https://groww.in/v1/api/stocks_data/v1/company/search_id/" + encodeURIComponent(id),
    )) as {
      header?: { nseScriptCode?: string; displayName?: string; industryName?: string };
      details?: { ceo?: string; foundedYear?: string; businessSummary?: string; websiteUrl?: string; website?: string; companyWebsite?: string };
      fundamentals?: Array<{ name?: string; shortName?: string; value?: string }>;
      financialStatement?: Array<{ title?: string; yearly?: Record<string, number>; quarterly?: Record<string, number> }>;
      financialStatementV2?: {
        CONSOLIDATED?: Array<{ title?: string; yearly?: Record<string, number>; quarterly?: Record<string, number> }>;
      };
      shareHoldingPattern?: Record<
        string,
        {
          promoters?: unknown;
          foreignInstitutions?: unknown;
          mutualFunds?: unknown;
          otherDomesticInstitutions?: unknown;
          domesticInstitutions?: unknown;
        }
      >;
    };
    const list = g.fundamentals || [];
    const cons = g.financialStatementV2?.CONSOLIDATED || [];
    const rev = cons.find((x) => /revenue/i.test(x.title || ""));
    const profit = cons.find((x) => /profit/i.test(x.title || "") && !/operating|ebit/i.test(x.title || ""));
    const worth = cons.find((x) => /net worth/i.test(x.title || "")) || (g.financialStatement || []).find((x: { title?: string }) => /net worth/i.test(x.title || ""));
    const ebitdaLine = cons.find((x) => /ebitda/i.test(x.title || "") && !/margin/i.test(x.title || ""));
    const cfoLine = cons.find((x) => /cash from operat|operating cash|cash flow from operat|\bcfo\b/i.test(x.title || ""));
    const shKeys = Object.keys(g.shareHoldingPattern || {});
    const shareholding = sortShareholding(
      shKeys.map((period) => {
        const sh = g.shareHoldingPattern?.[period];
        return {
          period,
          promoters: sharePct(sh?.promoters),
          fii: sharePct(sh?.foreignInstitutions),
          dii: diiPct(sh),
        };
      }),
    );
    const latestSh = shareholding.length ? g.shareHoldingPattern?.[shareholding[shareholding.length - 1].period] : undefined;
    const out: Fundamentals = {
      symbol: bare,
      searchId: id,
      name: g.header?.displayName || bare,
      industry: g.header?.industryName || "",
      ceo: g.details?.ceo || "",
      founded: g.details?.foundedYear || "",
      summary: g.details?.businessSummary || "",
      mcapCr: pick(list, "Market Cap", "Mkt Cap"),
      pe: pick(list, "P/E Ratio(TTM)", "P/E Ratio", "PE"),
      pb: pick(list, "P/B Ratio", "PB"),
      roe: pick(list, "ROE"),
      de: pick(list, "Debt to Equity", "D/E", "Debt/Equity", "Debt Equity Ratio", "DE Ratio", "Debt to equity"),
      divYield: pick(list, "Dividend Yield", "Div Yield"),
      eps: pick(list, "EPS(TTM)", "EPS"),
      book: pick(list, "Book Value"),
      face: pick(list, "Face Value"),
      industryPe: pick(list, "Industry P/E"),
      salesYoY: yoy(rev?.yearly),
      profitYoY: yoy(profit?.yearly),
      sales: points(rev?.yearly),
      profits: points(profit?.yearly),
      qSales: points(rev?.quarterly),
      qProfits: points(profit?.quarterly),
      netWorth: points(worth?.yearly),
      qNetWorth: points(worth?.quarterly),
      shareholding,
      promoters: sharePct(latestSh?.promoters),
      fii: sharePct(latestSh?.foreignInstitutions),
      dii: diiPct(latestSh),
      roce: pick(list, "ROCE", "Return on Capital Employed", "ROCE %"),
      peg: pick(list, "PEG", "PEG Ratio", "PEG ratio"),
      forwardPe: pick(list, "Forward PE", "Forward P/E", "Fwd PE", "Forward P/E Ratio", "Forward PE Ratio", "Forward PE(x)"),
      forwardEps: pick(list, "Forward EPS", "Fwd EPS", "Estimated EPS", "EPS Forward"),
      forwardPeg: pick(list, "Forward PEG", "Fwd PEG", "Forward PEG Ratio"),
      opm: pick(list, "OPM", "Operating Profit Margin", "OPM %", "Operating Margin", "EBIT Margin"),
      salesCagr3: cagrFrom(points(rev?.yearly), 3),
      profitCagr3: cagrFrom(points(profit?.yearly), 3),
      profitCagr5: cagrFrom(points(profit?.yearly), 5),
      website: cleanUrl(g.details?.websiteUrl || g.details?.website || g.details?.companyWebsite),
      interestCover: pick(list, "Interest Coverage", "Interest Coverage Ratio", "Interest Cover") ?? interestCoverFrom(cons),
      pegVia: null,
      ebitda: points(ebitdaLine?.yearly),
      cfo: points(cfoLine?.yearly),
      qCfo: points(cfoLine?.quarterly),
      cfoPat: null,
      finPeriod: points(rev?.yearly).at(-1)?.period || points(profit?.yearly).at(-1)?.period || null,
      shPeriod: shareholding.at(-1)?.period || null,
      retrievedAt: Date.now(),
    };
    const lastCfo = out.cfo.at(-1)?.value;
    const lastPat = out.profits.at(-1)?.value;
    out.cfoPat = lastCfo != null && lastPat != null && lastPat !== 0 && Number.isFinite(lastCfo / lastPat) ? lastCfo / lastPat : null;
    const picked = pickPeg(out.peg, out.pe, out.profitCagr5, out.profitCagr3);
    out.peg = picked?.peg ?? null;
    out.pegVia = picked?.via ?? null;
    fundCache.set(bare, { at: Date.now(), data: out });
    return out;
  } catch {
    fundCache.set(bare, { at: Date.now(), data: null });
    return null;
  }
}

export async function fetchFundamentalsMany(symbols: string[]): Promise<Map<string, Fundamentals>> {
  const out = new Map<string, Fundamentals>();
  const uniq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()))];
  let i = 0;
  async function worker() {
    while (i < uniq.length) {
      const idx = i++;
      const f = await fetchFundamentals(uniq[idx]);
      if (f) out.set(uniq[idx], f);
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, uniq.length) }, () => worker()));
  return out;
}

export function fundLines(f: Fundamentals | null) {
  if (!f) return "Fundamentals: not on file for this ticker.";
  const n = (v: number | null | undefined, s: string) => (v == null || !Number.isFinite(v) ? null : `${s} ${v}`);
  return [
    "Fundamentals on file:",
    n(f.mcapCr, "Market cap ₹") && `Market cap: ₹${f.mcapCr} Cr`,
    n(f.pe, "PE") && `Stock P/E: ${f.pe}`,
    n(f.industryPe, "Industry PE") && `Industry P/E: ${f.industryPe}`,
    n(f.pb, "PB") && `P/B: ${f.pb}`,
    n(f.book, "Book") && `Book value: ₹${f.book}`,
    n(f.eps, "EPS") && `EPS (TTM): ₹${f.eps}`,
    n(f.roe, "ROE") && `ROE: ${f.roe}%`,
    n(f.roce, "ROCE") && `ROCE: ${f.roce}%`,
    n(f.de, "D/E") && `Debt/Equity: ${f.de}`,
    n(f.opm, "OPM") && `Operating margin (TTM): ${f.opm}%`,
    n(f.peg, "PEG") && `PEG: ${f.peg}${f.pegVia ? " (" + f.pegVia + ")" : ""}`,
    n(f.interestCover, "IntCover") && `Interest coverage: ${f.interestCover}`,
    n(f.divYield, "Div") && `Dividend yield: ${f.divYield}%`,
    n(f.face, "Face") && `Face value: ₹${f.face}`,
    n(f.salesYoY, "Sales") && `Sales growth (latest year): ${f.salesYoY?.toFixed(1)}%`,
    n(f.profitYoY, "Profit") && `Profit growth (latest year): ${f.profitYoY?.toFixed(1)}%`,
    n(f.salesCagr3, "Sales3") && `Sales CAGR 3Y: ${f.salesCagr3?.toFixed(1)}%`,
    n(f.profitCagr3, "Pat3") && `Profit CAGR 3Y: ${f.profitCagr3?.toFixed(1)}%`,
    n(f.profitCagr5, "Pat5") && `Profit CAGR 5Y: ${f.profitCagr5?.toFixed(1)}%`,
    f.cfoPat != null ? `CFO / profit: ${f.cfoPat.toFixed(2)}×` : null,
    f.cfo.length ? `Cash from operations (yearly, ₹ Cr): ${f.cfo.slice(-4).map((p) => `${p.period} ${p.value}`).join("; ")}` : null,
    f.promoters != null ? `Promoters: ${f.promoters.toFixed(1)}%` : null,
    f.fii != null ? `FII: ${f.fii.toFixed(1)}%` : null,
    f.dii != null ? `DII: ${f.dii.toFixed(1)}%` : null,
    f.website ? `Company website: ${f.website}` : null,
    f.summary ? `Company summary: ${f.summary}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
