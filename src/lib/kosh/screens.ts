import type { ScreenRow } from "./types";
import type { FundBlock, QualBlock } from "./note-shape";
import { NIFTY50 } from "./universe.ts";
import { sectorOf } from "./sectors.ts";

export type SortKey =
  | "name"
  | "price"
  | "changePct"
  | "ret1m"
  | "ret3m"
  | "ret1y"
  | "offHigh"
  | "rsi"
  | "vol"
  | "pe"
  | "pb"
  | "roe"
  | "de"
  | "mcapCr"
  | "divYield"
  | "salesYoY"
  | "profitYoY"
  | "promoters"
  | "fii"
  | "dii"
  | "fiiDelta"
  | "diiDelta"
  | "vcpLastPct"
  | "vcpDays"
  | "vcpN"
  | "vcpVolX";

export type ScreenId =
  | "nifty"
  | "up"
  | "down"
  | "hot"
  | "high"
  | "stretch"
  | "oversold"
  | "above200"
  | "cheap"
  | "quality"
  | "growers"
  | "value"
  | "highdiv"
  | "macd"
  | "lowdebt"
  | "overbought"
  | "nr7"
  | "gapup"
  | "breakout"
  | "squeeze"
  | "retest"
  | "athretest"
  | "soundmb"
  | "turnmb"
  | "qgrowth"
  | "stake"
  | "vcp"
  | "vcpbo";

export type ScreenFilter = {
  name: string;
  hint: string;
  changePctMin?: number | null;
  changePctMax?: number | null;
  ret1mMin?: number | null;
  ret1mMax?: number | null;
  ret3mMin?: number | null;
  ret3mMax?: number | null;
  ret1yMin?: number | null;
  ret1yMax?: number | null;
  offHighMin?: number | null;
  offHighMax?: number | null;
  rsiMin?: number | null;
  rsiMax?: number | null;
  volRatioMin?: number | null;
  above50?: boolean | null;
  above200?: boolean | null;
  peMin?: number | null;
  peMax?: number | null;
  pbMin?: number | null;
  pbMax?: number | null;
  roeMin?: number | null;
  roeMax?: number | null;
  deMin?: number | null;
  deMax?: number | null;
  mcapMin?: number | null;
  mcapMax?: number | null;
  divMin?: number | null;
  divMax?: number | null;
  salesYoYMin?: number | null;
  salesYoYMax?: number | null;
  macdBull?: boolean | null;
  bbLow?: boolean | null;
  sectors?: string[];
  sort: SortKey;
  sortDir: "asc" | "desc";
};

export const SCREEN_PRESETS: { id: ScreenId; label: string; hint: string }[] = [
  { id: "soundmb", label: "Sound multibagger", hint: "3Y/5Y growth, promoter >50%, DE ≤0.5, ROCE ≥20%, OPM ≥12%, PEG ≤2" },
  { id: "turnmb", label: "Turnaround multibagger", hint: "Profit turn, 1Y profit ≥100%, sales ≥15%, DE ≤1, ROCE ≥12%, promoter ≥40%" },
  { id: "qgrowth", label: "Quality growth", hint: "ROE ≥15%, sales 1Y ≥12%, profit growth available, debt/equity ≤1" },
  { id: "retest", label: "Breakout retest", hint: "Broke a major high, came back to the level, and still holds" },
  { id: "athretest", label: "ATH retest", hint: "All-time high broken, then retested" },
  { id: "breakout", label: "Breakout", hint: "Near 52-week high with volume ≥ 1.5×" },
  { id: "high", label: "Near high", hint: "Within 5% of the 52-week high" },
  { id: "stretch", label: "Off high", hint: "At least 15% below the 52-week high" },
  { id: "growers", label: "Sales growers", hint: "Latest-year sales growth above 15%" },
  { id: "quality", label: "High ROE", hint: "ROE above 15% and debt/equity under 1" },
  { id: "highdiv", label: "Dividend", hint: "Dividend yield above 2%" },
  { id: "stake", label: "FII / DII stake", hint: "Latest reported quarter vs the one before. Sort FII or DII." },
  { id: "vcp", label: "VCP", hint: "Volatility contraction — still inside the base" },
  { id: "vcpbo", label: "Breakout + VCP", hint: "VCP pivot broken recently on volume" },
];

export const TRADE_SCANS: { id: ScreenId; label: string; hint: string }[] = [
  { id: "breakout", label: "Breakout", hint: "Near high + volume" },
  { id: "hot", label: "Volume", hint: "≥ 1.4× 20-day volume" },
  { id: "high", label: "Near high", hint: "Within 5% of 52-week high" },
  { id: "nr7", label: "NR7", hint: "Tightest range in 7 days" },
  { id: "oversold", label: "RSI < 40", hint: "Oversold" },
  { id: "macd", label: "MACD up", hint: "Histogram flip with 50-day" },
  { id: "gapup", label: "Gap up", hint: "Open ≥ 1.5% above prior close" },
  { id: "squeeze", label: "Squeeze", hint: "Quiet Bollinger, waiting" },
];

const NIFTY = new Set(NIFTY50.map((x) => x.symbol.toUpperCase()));

function passNum(v: number | null | undefined, min: number | null | undefined, max: number | null | undefined) {
  if (min != null && Number.isFinite(min)) {
    if (v == null || v < min) return false;
  }
  if (max != null && Number.isFinite(max)) {
    if (v == null || v > max) return false;
  }
  return true;
}

function numOf(r: ScreenRow, key: SortKey) {
  if (key === "name") return null;
  if (key === "vol") return r.vol;
  const v = r[key as keyof ScreenRow];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function sortRows(rows: ScreenRow[], key: SortKey, dir: "asc" | "desc") {
  const mul = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (key === "name") return mul * a.name.localeCompare(b.name);
    const av = numOf(a, key);
    const bv = numOf(b, key);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return mul * (av - bv);
  });
}

export function filterSector(rows: ScreenRow[], sector: string) {
  if (!sector || sector === "All") return rows;
  return rows.filter((r) => r.sector === sector);
}

export function applyFilter(rows: ScreenRow[], f: ScreenFilter) {
  return sortRows(
    rows.filter((r) => r.price > 0).filter((r) => {
      if (!passNum(r.changePct, f.changePctMin, f.changePctMax)) return false;
      if (!passNum(r.ret1m, f.ret1mMin, f.ret1mMax)) return false;
      if (!passNum(r.ret3m, f.ret3mMin, f.ret3mMax)) return false;
      if (!passNum(r.ret1y, f.ret1yMin, f.ret1yMax)) return false;
      if (!passNum(r.offHigh, f.offHighMin, f.offHighMax)) return false;
      if (!passNum(r.rsi, f.rsiMin, f.rsiMax)) return false;
      if (f.volRatioMin != null && Number.isFinite(f.volRatioMin) && (r.volRatio == null || r.volRatio < f.volRatioMin)) return false;
      if (f.above50 === true && r.above50 !== true) return false;
      if (f.above50 === false && r.above50 !== false) return false;
      if (f.above200 === true && r.above200 !== true) return false;
      if (f.above200 === false && r.above200 !== false) return false;
      if (!passNum(r.pe, f.peMin, f.peMax)) return false;
      if (!passNum(r.pb, f.pbMin, f.pbMax)) return false;
      if (!passNum(r.roe, f.roeMin, f.roeMax)) return false;
      if (!passNum(r.de, f.deMin, f.deMax)) return false;
      if (!passNum(r.mcapCr, f.mcapMin, f.mcapMax)) return false;
      if (!passNum(r.divYield, f.divMin, f.divMax)) return false;
      if (!passNum(r.salesYoY, f.salesYoYMin, f.salesYoYMax)) return false;
      if (f.macdBull === true && !(r.macdHist != null && r.macdHist > 0)) return false;
      if (f.macdBull === false && !(r.macdHist != null && r.macdHist <= 0)) return false;
      if (f.bbLow === true && !(r.bbPos != null && r.bbPos < 20)) return false;
      if (f.sectors?.length && !f.sectors.includes(r.sector)) return false;
      return true;
    }),
    f.sort || "changePct",
    f.sortDir || "desc",
  );
}

export function applyScreen(rows: ScreenRow[], id: ScreenId) {
  const src = rows.filter((r) => r.price > 0);
  if (id === "nifty") return src.filter((r) => NIFTY.has(r.symbol.toUpperCase()));
  if (id === "up") return sortRows(src, "changePct", "desc");
  if (id === "down") return sortRows(src, "changePct", "asc");
  if (id === "hot") return sortRows(src.filter((r) => (r.volRatio ?? 0) >= 1.4), "vol", "desc");
  if (id === "high") return sortRows(src.filter((r) => r.offHigh != null && r.offHigh >= -5), "offHigh", "desc");
  if (id === "stretch") return sortRows(src.filter((r) => r.offHigh != null && r.offHigh <= -15), "offHigh", "asc");
  if (id === "oversold") return sortRows(src.filter((r) => r.rsi != null && r.rsi < 40), "rsi", "asc");
  if (id === "overbought") return sortRows(src.filter((r) => r.rsi != null && r.rsi > 70), "rsi", "desc");
  if (id === "above200") return src.filter((r) => r.above200 === true);
  if (id === "cheap") return sortRows(src.filter((r) => r.pe != null && r.pe > 0 && r.pe < 20), "pe", "asc");
  if (id === "quality") return sortRows(src.filter((r) => r.roe != null && r.roe >= 15 && (r.de == null || r.de < 1)), "roe", "desc");
  if (id === "growers") return sortRows(src.filter((r) => r.salesYoY != null && r.salesYoY >= 15), "salesYoY", "desc");
  if (id === "value")
    return sortRows(src.filter((r) => r.pe != null && r.pe > 0 && r.pe < 18 && r.pb != null && r.pb > 0 && r.pb < 3), "pe", "asc");
  if (id === "highdiv") return sortRows(src.filter((r) => r.divYield != null && r.divYield >= 2), "divYield", "desc");
  if (id === "lowdebt") return sortRows(src.filter((r) => r.de != null && r.de >= 0 && r.de < 0.5), "de", "asc");
  if (id === "macd") return sortRows(src.filter((r) => r.macdHist != null && r.macdHist > 0 && r.above50 === true), "changePct", "desc");
  if (id === "nr7") return sortRows(src.filter((r) => r.nr7 === true), "changePct", "desc");
  if (id === "gapup") return sortRows(src.filter((r) => (r.gapPct ?? 0) >= 1.5), "changePct", "desc");
  if (id === "breakout") return sortRows(src.filter((r) => r.offHigh != null && r.offHigh >= -2 && (r.volRatio ?? 0) >= 1.5), "vol", "desc");
  if (id === "squeeze")
    return sortRows(src.filter((r) => r.bbPos != null && r.bbPos > 35 && r.bbPos < 65 && (r.volRatio ?? 1) < 0.9), "rsi", "asc");
  if (id === "retest") return sortRows(src.filter((r) => r.retest === true), "offHigh", "desc");
  if (id === "athretest") return sortRows(src.filter((r) => r.athRetest === true), "offHigh", "desc");
  if (id === "soundmb") return rankMultibagger(src, SOUND_RULES, "roe");
  if (id === "turnmb") return rankMultibagger(src, TURN_RULES, "salesYoY");
  if (id === "qgrowth")
    return sortRows(
      src.filter(
        (r) =>
          r.roe != null &&
          r.roe >= 15 &&
          r.salesYoY != null &&
          r.salesYoY >= 12 &&
          (r.de == null || r.de <= 1) &&
          ((r.profitYoY != null && r.profitYoY >= 12) || (r.profitCagr3 != null && r.profitCagr3 >= 12)),
      ),
      "roe",
      "desc",
    );
  if (id === "stake")
    return sortRows(
      src.filter((r) => (r.fiiDelta != null && r.fiiDelta > 0) || (r.diiDelta != null && r.diiDelta > 0)),
      "fiiDelta",
      "desc",
    );
  if (id === "vcp") return sortRows(src.filter((r) => r.vcp === true && r.vcpBreak !== true), "vcpLastPct", "asc");
  if (id === "vcpbo") return sortRows(src.filter((r) => r.vcpBreak === true), "vcpDays", "asc");
  return src;
}

export type MbRule = {
  id: string;
  label: string;
  has: (r: ScreenRow) => boolean;
  ok: (r: ScreenRow) => boolean;
};

export const SOUND_RULES: MbRule[] = [
  { id: "sales3", label: "Sales CAGR 3Y > 18%", has: (r) => r.salesCagr3 != null, ok: (r) => (r.salesCagr3 ?? 0) > 18 },
  { id: "pat3", label: "Profit CAGR 3Y > 35%", has: (r) => r.profitCagr3 != null, ok: (r) => (r.profitCagr3 ?? 0) > 35 },
  { id: "pat5", label: "Profit CAGR 5Y > 15%", has: (r) => r.profitCagr5 != null, ok: (r) => (r.profitCagr5 ?? 0) > 15 },
  { id: "prom", label: "Promoter > 50%", has: (r) => r.promoters != null, ok: (r) => (r.promoters ?? 0) > 50 },
  { id: "de", label: "D/E ≤ 0.5", has: (r) => r.de != null, ok: (r) => r.de != null && r.de <= 0.5 },
  { id: "sales1", label: "Sales 1Y ≥ 8%", has: (r) => r.salesYoY != null, ok: (r) => (r.salesYoY ?? 0) >= 8 },
  { id: "opm", label: "OPM ≥ 12%", has: (r) => r.opm != null, ok: (r) => (r.opm ?? 0) >= 12 },
  { id: "peg", label: "PEG ≤ 2", has: (r) => r.peg != null, ok: (r) => r.peg != null && r.peg <= 2 },
  { id: "roce", label: "ROCE ≥ 20%", has: (r) => r.roce != null, ok: (r) => (r.roce ?? 0) >= 20 },
];

export const TURN_RULES: MbRule[] = [
  { id: "pat", label: "Latest profit ≥ 0", has: (r) => r.eps != null, ok: (r) => r.eps != null && r.eps >= 0 },
  { id: "pat1", label: "Profit 1Y ≥ 100%", has: (r) => r.profitYoY != null, ok: (r) => (r.profitYoY ?? 0) >= 100 },
  { id: "sales1", label: "Sales 1Y ≥ 15%", has: (r) => r.salesYoY != null, ok: (r) => (r.salesYoY ?? 0) >= 15 },
  { id: "de", label: "D/E ≤ 1", has: (r) => r.de != null, ok: (r) => r.de != null && r.de <= 1 },
  { id: "roce", label: "ROCE ≥ 12%", has: (r) => r.roce != null, ok: (r) => (r.roce ?? 0) >= 12 },
  { id: "opm", label: "OPM ≥ 8%", has: (r) => r.opm != null, ok: (r) => (r.opm ?? 0) >= 8 },
  { id: "prom", label: "Promoter ≥ 40%", has: (r) => r.promoters != null, ok: (r) => (r.promoters ?? 0) >= 40 },
];

/** Rank on the numbers we have. Missing fields are extra checks, not a fail. */
export function rankMultibagger(rows: ScreenRow[], rules: MbRule[], sortKey: SortKey) {
  const scored = rows
    .map((r) => {
      const have = rules.filter((x) => x.has(r));
      const pass = have.filter((x) => x.ok(r));
      const fail = have.filter((x) => !x.ok(r));
      const unchecked = rules.filter((x) => !x.has(r)).map((x) => x.label);
      const missed = fail.map((x) => x.label);
      return {
        r: { ...r, passCount: pass.length, missed, unchecked },
        nHave: have.length,
        nPass: pass.length,
        ratio: have.length ? pass.length / have.length : 0,
      };
    })
    .filter((x) => x.nHave >= 3 && x.ratio === 1);
  scored.sort((a, b) => {
    if (b.ratio !== a.ratio) return b.ratio - a.ratio;
    if (b.nPass !== a.nPass) return b.nPass - a.nPass;
    const av = a.r[sortKey];
    const bv = b.r[sortKey];
    const an = typeof av === "number" && Number.isFinite(av) ? av : null;
    const bn = typeof bv === "number" && Number.isFinite(bv) ? bv : null;
    if (an == null && bn == null) return 0;
    if (an == null) return 1;
    if (bn == null) return -1;
    return bn - an;
  });
  return scored.map((x) => x.r);
}

export function sectorPulse(rows: ScreenRow[]) {
  const map = new Map<string, { change: number; n: number; up: number }>();
  for (const r of rows) {
    if (!(r.price > 0)) continue;
    const cur = map.get(r.sector) || { change: 0, n: 0, up: 0 };
    cur.change += r.changePct;
    cur.n += 1;
    if (r.changePct >= 0) cur.up += 1;
    map.set(r.sector, cur);
  }
  return [...map.entries()]
    .map(([sector, s]) => {
      const avg = s.n ? s.change / s.n : 0;
      return { sector, avg, changePct: avg, up: s.up, n: s.n };
    })
    .sort((a, b) => b.avg - a.avg);
}

export function marketTemp(rows: ScreenRow[], focus?: string[]) {
  const want = new Set((focus || []).map((s) => s.toUpperCase().replace(/\.(NS|BO)$/i, "")));
  const mine = want.size ? rows.filter((r) => want.has(r.symbol.toUpperCase())) : [];
  const pool = mine.length >= 4 ? mine : rows.filter((r) => r.price > 0);
  const n = pool.length || 1;
  const green = pool.filter((r) => r.changePct >= 0).length / n;
  const rsiVals = pool.map((r) => r.rsi).filter((x): x is number => x != null);
  const avgRsi = rsiVals.length ? rsiVals.reduce((a, b) => a + b, 0) / rsiVals.length : 50;
  const above200 = pool.filter((r) => r.above200 === true).length / n;
  const hot = pool.filter((r) => (r.volRatio ?? 0) >= 1.4).length / n;
  let tag = "Mixed";
  if (green >= 0.62 && avgRsi >= 58) tag = "Broad bid";
  else if (green <= 0.38 && avgRsi <= 42) tag = "Risk off";
  else if (hot >= 0.28) tag = "Hot session";
  else if (green >= 0.55) tag = "Selective bid";
  else if (green <= 0.45) tag = "Soft session";
  const whose = mine.length >= 4 ? "Your names" : "This universe";
  return { tag, whose, green, avgRsi, above200, hot, n: pool.length };
}

export type SkillRead = {
  symbol: string;
  name: string;
  sector: string;
  fundTag: string;
  fundRating: "pass" | "fail";
  fundVerdict: string;
  qualTag: string;
  qualPotential: "yes" | "no";
  qualVerdict: string;
  at: number;
};

export function skillPass(r: SkillRead | null | undefined) {
  const fund = r?.fundRating === "pass";
  const qual = r?.qualPotential === "yes";
  return { fund, qual, both: Boolean(fund && qual) };
}

export function skillPeek(reads: Record<string, SkillRead> | undefined, symbol: string) {
  if (!reads) return undefined;
  const k = String(symbol || "")
    .replace(/\.(NS|BO)$/i, "")
    .toUpperCase();
  return reads[k] || reads[symbol];
}

export function skillOf(reads: Record<string, SkillRead> | undefined, symbol: string) {
  const r = skillPeek(reads, symbol);
  if (!r?.fundTag || !r?.qualTag) return undefined;
  return r;
}

export function skillReadFrom(input: {
  symbol: string;
  name?: string;
  sector?: string;
  fund: FundBlock;
  qual: QualBlock;
}): SkillRead {
  const symbol = String(input.symbol || "")
    .replace(/\.(NS|BO)$/i, "")
    .toUpperCase();
  return {
    symbol,
    name: input.name || symbol,
    sector: input.sector || sectorOf(symbol),
    fundTag: input.fund.tag,
    fundRating: input.fund.rating,
    fundVerdict: input.fund.verdict,
    qualTag: input.qual.tag,
    qualPotential: input.qual.potential,
    qualVerdict: input.qual.verdict,
    at: Date.now(),
  };
}

export function skillReadMerge(
  existing: SkillRead | undefined,
  patch: {
    symbol: string;
    name?: string;
    sector?: string;
    fund?: FundBlock | null;
    qual?: QualBlock | null;
  },
): SkillRead {
  const symbol = String(patch.symbol || "")
    .replace(/\.(NS|BO)$/i, "")
    .toUpperCase();
  return {
    symbol,
    name: patch.name || existing?.name || symbol,
    sector: patch.sector || existing?.sector || sectorOf(symbol),
    fundTag: patch.fund?.tag || existing?.fundTag || "",
    fundRating: patch.fund?.rating || existing?.fundRating || "fail",
    fundVerdict: patch.fund?.verdict || existing?.fundVerdict || "",
    qualTag: patch.qual?.tag || existing?.qualTag || "",
    qualPotential: patch.qual?.potential || existing?.qualPotential || "no",
    qualVerdict: patch.qual?.verdict || existing?.qualVerdict || "",
    at: Date.now(),
  };
}

export function screenKey(symbol: string) {
  return String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
}

export function pickScreenRow(rows: ScreenRow[] | undefined, symbol: string) {
  const k = screenKey(symbol);
  if (!k || !rows?.length) return undefined;
  return rows.find((r) => screenKey(r.symbol) === k && r.price > 0);
}

export function blankScreenRow(symbol: string, name?: string): ScreenRow {
  const k = screenKey(symbol);
  return {
    symbol: k,
    name: name || k,
    sector: sectorOf(k),
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
    pe: null,
    pb: null,
    roe: null,
    de: null,
    mcapCr: null,
    divYield: null,
    eps: null,
    book: null,
    salesYoY: null,
    profitYoY: null,
    promoters: null,
    roce: null,
    peg: null,
    opm: null,
    salesCagr3: null,
    profitCagr3: null,
    profitCagr5: null,
    retest: null,
    retestLevel: null,
    athRetest: null,
    fii: null,
    fiiPrev: null,
    fiiDelta: null,
    dii: null,
    diiPrev: null,
    diiDelta: null,
    shLabel: null,
    vcp: null,
    vcpBreak: null,
    vcpN: null,
    vcpLastPct: null,
    vcpDays: null,
    vcpVolX: null,
    vcpPivot: null,
  };
}

export function screenRowFromQuote(q: {
  symbol: string;
  name?: string;
  price: number;
  changePct: number;
  high52?: number;
  low52?: number;
}): ScreenRow {
  const k = screenKey(q.symbol);
  const px = q.price;
  const high52 = q.high52 || 0;
  const low52 = q.low52 || 0;
  return {
    ...blankScreenRow(k, q.name),
    price: px,
    changePct: q.changePct,
    high52,
    low52,
    offHigh: high52 && px ? ((px / high52 - 1) * 100) : null,
  };
}

export function mergeScreenRows(base: ScreenRow[], extra: ScreenRow[]) {
  const map = new Map<string, ScreenRow>();
  for (const r of base) {
    if (r.price > 0) map.set(screenKey(r.symbol), r);
  }
  for (const r of extra) {
    const k = screenKey(r.symbol);
    const have = map.get(k);
    if (!have || have.price <= 0) map.set(k, r);
  }
  return [...map.values()];
}
