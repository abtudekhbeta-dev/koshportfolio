/** Exchange filings (NSE XBRL + shareholding) fill blanks on the company card. Never invent a number. */

import type { FinPoint, Fundamentals, ShPoint } from "./types.ts";
import { sortShareholding } from "./shareholding.ts";
import { fetchFundamentals } from "./fundamentals.server.ts";
import { pickPeg } from "./portfolio-stats.ts";
import { fillFundamentals } from "./fund-merge.ts";
import { parsePeriod } from "./fin-series.ts";
export { fillFundamentals } from "./fund-merge.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

type XbrlContext = {
  id: string;
  start?: string;
  end?: string;
  instant?: string;
  members: string[];
  days: number;
};

type XbrlFact = { name: string; context: string; value: number; unit: string };

const xmlCache = new Map<string, { at: number; xml: string | null }>();
const deepCache = new Map<string, { at: number; fund: Fundamentals | null; sources: string[] }>();
const XML_TTL = 24 * 60 * 60 * 1000;
const DEEP_TTL = 12 * 60 * 60 * 1000;

let nseCookies = "";
let nseCookieAt = 0;

async function nseSession(): Promise<string> {
  if (nseCookies && Date.now() - nseCookieAt < 8 * 60 * 1000) return nseCookies;
  try {
    const res = await fetch("https://www.nseindia.com/", {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    const parts =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : [res.headers.get("set-cookie") || ""];
    nseCookies = parts.filter(Boolean).map((c) => c.split(";")[0]).join("; ");
    nseCookieAt = Date.now();
  } catch {
    nseCookies = nseCookies || "";
  }
  return nseCookies;
}

async function nseJson(path: string): Promise<unknown> {
  const cookie = await nseSession();
  const res = await fetch("https://www.nseindia.com" + path, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json,text/plain,*/*",
      Referer: "https://www.nseindia.com/",
      Cookie: cookie,
    },
    signal: AbortSignal.timeout(16_000),
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

async function fetchXml(url: string): Promise<string | null> {
  const hit = xmlCache.get(url);
  if (hit && Date.now() - hit.at < XML_TTL) return hit.xml;
  try {
    const cookie = await nseSession();
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/xml,text/xml,*/*", Referer: "https://www.nseindia.com/", Cookie: cookie },
      signal: AbortSignal.timeout(18_000),
    });
    if (!res.ok) {
      xmlCache.set(url, { at: Date.now(), xml: null });
      return null;
    }
    const xml = await res.text();
    if (!xml.includes("<") || xml.length < 200) {
      xmlCache.set(url, { at: Date.now(), xml: null });
      return null;
    }
    xmlCache.set(url, { at: Date.now(), xml });
    return xml;
  } catch {
    xmlCache.set(url, { at: Date.now(), xml: null });
    return null;
  }
}

function localName(tag: string) {
  return tag.replace(/^.*:/, "");
}

export function parseXbrl(xml: string): { contexts: XbrlContext[]; facts: XbrlFact[] } {
  const contexts: XbrlContext[] = [];
  const ctxRe = /<([A-Za-z0-9_]+:)?context\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/\1?context>/gi;
  let m: RegExpExecArray | null;
  while ((m = ctxRe.exec(xml))) {
    const id = m[2];
    const body = m[3];
    const start = body.match(/<([A-Za-z0-9_]+:)?startDate>([^<]+)</i)?.[2];
    const end = body.match(/<([A-Za-z0-9_]+:)?endDate>([^<]+)</i)?.[2];
    const instant = body.match(/<([A-Za-z0-9_]+:)?instant>([^<]+)</i)?.[2];
    const members = [...body.matchAll(/<([A-Za-z0-9_]+:)?explicitMember[^>]*>([^<]+)</gi)].map((x) => localName(x[2].trim()));
    let days = 0;
    if (start && end) {
      const a = Date.parse(start);
      const b = Date.parse(end);
      if (Number.isFinite(a) && Number.isFinite(b) && b >= a) days = Math.round((b - a) / 86400000) + 1;
    }
    contexts.push({ id, start, end, instant, members, days });
  }
  const facts: XbrlFact[] = [];
  const factRe = /<([A-Za-z0-9_-]+:[A-Za-z0-9_-]+)\s([^>]*)>([^<]*)<\/\1>/g;
  while ((m = factRe.exec(xml))) {
    const name = localName(m[1]);
    const attrs = m[2];
    const raw = m[3].replace(/,/g, "").trim();
    if (!raw || raw === "true" || raw === "false") continue;
    const n = Number(raw);
    if (!Number.isFinite(n)) continue;
    const context = attrs.match(/contextRef="([^"]+)"/)?.[1] || "";
    const unit = attrs.match(/unitRef="([^"]+)"/)?.[1] || "";
    facts.push({ name, context, value: n, unit });
  }
  return { contexts, facts };
}

function ctxById(ctx: XbrlContext[]) {
  const m = new Map<string, XbrlContext>();
  for (const c of ctx) m.set(c.id, c);
  return m;
}

function pickDuration(ctx: XbrlContext[], kind: "year" | "quarter") {
  const plain = ctx.filter((c) => !c.members.length && c.days > 0);
  if (kind === "year") {
    const hit = plain.filter((c) => c.days >= 300).sort((a, b) => b.days - a.days)[0];
    return hit?.id || ctx.find((c) => /^FourD$/i.test(c.id))?.id || null;
  }
  const hit = plain.filter((c) => c.days >= 70 && c.days <= 120).sort((a, b) => a.days - b.days)[0];
  return hit?.id || ctx.find((c) => /^OneD$/i.test(c.id))?.id || null;
}

function pickInstant(ctx: XbrlContext[]) {
  const named = ctx.find((c) => /^OneI$/i.test(c.id) && !c.members.length);
  if (named) return named.id;
  const plain = ctx.filter((c) => !c.members.length && c.instant);
  return plain[0]?.id || null;
}

function factAt(facts: XbrlFact[], names: string[], contextId: string | null): number | null {
  if (!contextId) return null;
  for (const n of names) {
    const hit = facts.find((f) => f.name === n && f.context === contextId);
    if (hit && Number.isFinite(hit.value)) return hit.value;
  }
  return null;
}

function toCr(v: number | null, unit: string | undefined) {
  if (v == null || !Number.isFinite(v)) return null;
  if (/pure|shares|eps|inrPerShare/i.test(unit || "")) return v;
  if (Math.abs(v) >= 10_000) return v / 1e7;
  return v;
}

function periodLabel(end?: string, start?: string, days?: number) {
  if (!end) return start || "";
  const d = end.slice(0, 10);
  const [y, m] = d.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[Number(m) - 1] || m;
  if (days && days >= 300) return `Mar ${y}`;
  return `${mon} ${y}`;
}

const REV = ["RevenueFromOperations", "Income", "InterestEarned", "RevenueFromSaleOfProductsAndServices"];
const PAT = [
  "ProfitOrLossAttributableToOwnersOfParent",
  "ProfitLossForPeriod",
  "ProfitLossForPeriodFromContinuingOperations",
];
const CFO = ["CashFlowsFromUsedInOperatingActivities"];
const WORTH = ["EquityAttributableToOwnersOfParent", "Equity", "NetWorth"];
const DE = ["DebtEquityRatio"];
const FACE = ["FaceValueOfEquityShareCapital"];
const EPS = [
  "BasicEarningsLossPerShareFromContinuingAndDiscontinuedOperations",
  "BasicEarningsLossPerShareFromContinuingOperations",
];
const OP_MARGIN = ["OperatingProfitMargin", "OperatingMargin"];
const OP_PROFIT = ["OperatingProfit", "ProfitFromOperations", "ProfitLossFromOperatingActivities"];
const EBITDA = ["EarningsBeforeInterestTaxDepreciationAndAmortisation", "EBITDA"];
const FINANCE = ["FinanceCosts"];
const BORROW_C = ["BorrowingsCurrent"];
const BORROW_N = ["BorrowingsNoncurrent"];

export type FilingSlice = {
  period: string;
  sales?: number | null;
  profits?: number | null;
  cfo?: number | null;
  netWorth?: number | null;
  ebitda?: number | null;
  de?: number | null;
  face?: number | null;
  eps?: number | null;
  opm?: number | null;
  roce?: number | null;
  interestCover?: number | null;
};

export function filingFromXbrl(xml: string, kind: "year" | "quarter"): FilingSlice | null {
  const { contexts, facts } = parseXbrl(xml);
  const id = pickDuration(contexts, kind);
  if (!id) return null;
  const ctx = contexts.find((c) => c.id === id);
  const unitOf = (names: string[]) => facts.find((f) => names.includes(f.name) && f.context === id)?.unit || "";
  const sales = toCr(factAt(facts, REV, id), unitOf(REV));
  const profits = toCr(factAt(facts, PAT, id), unitOf(PAT));
  const cfo = toCr(factAt(facts, CFO, id), unitOf(CFO));
  const netWorth = toCr(factAt(facts, WORTH, id), unitOf(WORTH));
  const ebitda = toCr(factAt(facts, EBITDA, id), unitOf(EBITDA));
  const deFiled = factAt(facts, DE, id);
  const face = factAt(facts, FACE, id);
  const eps = factAt(facts, EPS, id);
  const pbt = toCr(factAt(facts, ["ProfitBeforeExceptionalItemsAndTax", "ProfitBeforeTax"], id), unitOf(["ProfitBeforeExceptionalItemsAndTax", "ProfitBeforeTax"]));
  const finance = toCr(factAt(facts, FINANCE, id), unitOf(FINANCE));
  const marginFact = factAt(facts, OP_MARGIN, id);
  const opProfit = toCr(factAt(facts, OP_PROFIT, id), unitOf(OP_PROFIT));
  let opm: number | null = null;
  if (marginFact != null && Number.isFinite(marginFact) && marginFact > -5 && marginFact < 150) {
    opm = marginFact <= 1.5 ? marginFact * 100 : marginFact;
  } else if (opProfit != null && sales && sales !== 0) {
    const m = (opProfit / sales) * 100;
    opm = Number.isFinite(m) && m > -50 && m < 150 ? m : null;
  }
  const ebit = pbt != null ? pbt + (finance && finance > 0 ? finance : 0) : null;
  let interestCover: number | null = null;
  if (kind === "year" && ebit != null && finance != null && finance > 0.01) {
    const c = ebit / finance;
    interestCover = Number.isFinite(c) && c > 0 && c < 800 ? c : null;
  }
  const instId = kind === "year" ? pickInstant(contexts) : null;
  let roce: number | null = null;
  let de = deFiled;
  if (instId) {
    const equity = toCr(factAt(facts, WORTH, instId), facts.find((f) => WORTH.includes(f.name) && f.context === instId)?.unit || "");
    const bc = toCr(factAt(facts, BORROW_C, instId), "INR");
    const bn = toCr(factAt(facts, BORROW_N, instId), "INR");
    const debt =
      bc == null && bn == null ? null : (bc || 0) + (bn || 0);
    if (de == null && equity != null && equity > 0 && debt != null) de = debt / equity;
    const capital = (equity || 0) + (debt || 0);
    if (kind === "year" && ebit != null && capital > 0) {
      const r = (ebit / capital) * 100;
      roce = Number.isFinite(r) && r > -50 && r < 400 ? r : null;
    }
    if (netWorth == null && equity != null) {
      /* use year-end equity as net worth when the duration context has none */
    }
  }
  const worth = netWorth ?? (instId ? toCr(factAt(facts, WORTH, instId), "INR") : null);
  if (sales == null && profits == null && cfo == null && worth == null) return null;
  return {
    period: periodLabel(ctx?.end, ctx?.start, ctx?.days),
    sales,
    profits,
    cfo,
    netWorth: worth,
    ebitda,
    de,
    face,
    eps,
    opm,
    roce,
    interestCover,
  };
}

export function parseShpPercents(xml: string): {
  promoters: number | null;
  fii: number | null;
  dii: number | null;
  pledge: number | null;
  period: string | null;
} {
  const { contexts, facts } = parseXbrl(xml);
  const by = ctxById(contexts);
  const pctFacts = facts.filter((f) => f.name === "ShareholdingAsAPercentageOfTotalNumberOfShares");
  const pickMember = (members: string[]) => {
    for (const mem of members) {
      const hit = pctFacts.find((f) => (by.get(f.context)?.members || []).includes(mem));
      if (!hit) continue;
      const v = hit.value;
      return v <= 1.5 ? v * 100 : v;
    }
    return null;
  };
  const promoters = pickMember(["ShareholdingOfPromoterAndPromoterGroupMember"]);
  const fii = pickMember(["InstitutionsForeignMember", "ForeignPortfolioInvestorsMember"]);
  const dii = pickMember(["InstitutionsDomesticMember"]);
  let pledge: number | null = null;
  const flag = [...xml.matchAll(/WhetherAnySharesHeldByPromotersAreEncumberedUnderPledged[^>]*>([^<]+)</gi)];
  const pledged = flag.some((x) => /true/i.test(x[1]));
  if (flag.length && !pledged) pledge = 0;
  const enc = facts.find((f) => /Pledg|EncumberedAsAPercentage/i.test(f.name));
  if (enc) {
    const v = enc.value;
    pledge = v <= 1.5 ? v * 100 : v;
  }
  const inst = contexts.find((c) => c.instant)?.instant || null;
  return { promoters, fii, dii, pledge, period: inst ? periodLabel(inst) : null };
}

function yoyOf(pts: FinPoint[]) {
  if (pts.length < 2) return null;
  const a = pts[pts.length - 2].value;
  const b = pts[pts.length - 1].value;
  if (!(a > 0) || b == null) return null;
  return ((b / a - 1) * 100);
}

function cagrOf(pts: FinPoint[], years: number) {
  const rows = (pts || []).filter((p) => p.value > 0);
  if (rows.length < 2) return null;
  const last = rows[rows.length - 1];
  const idx = rows.length - 1 - years;
  const first = idx >= 0 ? rows[idx] : rows[0];
  if (!(first.value > 0) || first === last) return null;
  const span = idx >= 0 ? years : Math.max(1, rows.length - 1);
  if (span < Math.min(years, 2) && years >= 3) return null;
  return (Math.pow(last.value / first.value, 1 / (idx >= 0 ? years : span)) - 1) * 100;
}

function uniqPeriod(rows: FilingSlice[]) {
  const m = new Map<string, FilingSlice>();
  for (const r of rows) {
    if (!r.period) continue;
    const cur = m.get(r.period);
    if (!cur) m.set(r.period, r);
    else {
      m.set(r.period, {
        ...cur,
        sales: cur.sales ?? r.sales,
        profits: cur.profits ?? r.profits,
        cfo: cur.cfo ?? r.cfo,
        netWorth: cur.netWorth ?? r.netWorth,
        ebitda: cur.ebitda ?? r.ebitda,
        de: cur.de ?? r.de,
        face: cur.face ?? r.face,
        eps: cur.eps ?? r.eps,
        opm: cur.opm ?? r.opm,
        roce: cur.roce ?? r.roce,
        interestCover: cur.interestCover ?? r.interestCover,
      });
    }
  }
  return [...m.values()];
}

type NseFiling = { toDate?: string; consolidated?: string; xbrl?: string; period?: string; fromDate?: string };

function filingStamp(r: NseFiling) {
  const s = String(r.toDate || r.fromDate || "");
  const p = parsePeriod(s);
  return p ? p.t : 0;
}

function preferCons(rows: NseFiling[]) {
  const cons = rows.filter((r) => /^cons/i.test(String(r.consolidated || "")));
  const src = cons.length ? cons : rows;
  const sorted = [...src].sort((a, b) => filingStamp(b) - filingStamp(a));
  const byDate = new Map<string, NseFiling>();
  for (const r of sorted) {
    const k = String(r.toDate || r.fromDate || r.xbrl || "");
    if (!k || byDate.has(k)) continue;
    if (r.xbrl) byDate.set(k, r);
  }
  return [...byDate.values()];
}

async function poolMap<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => worker()));
  return out;
}

async function filingsFor(symbol: string, period: "Annual" | "Quarterly"): Promise<NseFiling[]> {
  try {
    const raw = await nseJson(
      `/api/corporates-financial-results?index=equities&symbol=${encodeURIComponent(symbol)}&period=${period}`,
    );
    return Array.isArray(raw) ? (raw as NseFiling[]) : [];
  } catch {
    return [];
  }
}

type IntegratedRow = {
  qe_Date?: string;
  consolidated?: string;
  xbrl?: string;
  type?: string;
};

async function integratedFor(symbol: string): Promise<NseFiling[]> {
  try {
    const raw = await nseJson(
      `/api/integrated-filing-results?index=equities&symbol=${encodeURIComponent(symbol)}&integratedType=integratedfilingfinancials`,
    );
    const rows = Array.isArray(raw)
      ? (raw as IntegratedRow[])
      : ((raw as { data?: IntegratedRow[] })?.data || []);
    return rows
      .filter((r) => /INDAS/i.test(String(r.xbrl || "")) && !/GOVERNANCE/i.test(String(r.xbrl || "")))
      .map((r) => ({
        toDate: r.qe_Date,
        consolidated: r.consolidated,
        xbrl: r.xbrl,
      }));
  } catch {
    return [];
  }
}

async function shareholdingFor(symbol: string): Promise<{ json: Array<Record<string, unknown>>; xml: string | null }> {
  try {
    const raw = await nseJson(`/api/corporate-share-holdings-master?index=equities&symbol=${encodeURIComponent(symbol)}`);
    const rows = Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : [];
    const xbrl = String(rows[0]?.xbrl || "");
    const xml = xbrl ? await fetchXml(xbrl) : null;
    return { json: rows, xml };
  } catch {
    return { json: [], xml: null };
  }
}

function emptyFund(symbol: string): Fundamentals {
  return {
    symbol,
    searchId: "",
    name: symbol,
    industry: "",
    ceo: "",
    founded: "",
    summary: "",
    mcapCr: null,
    pe: null,
    pb: null,
    roe: null,
    de: null,
    divYield: null,
    eps: null,
    book: null,
    face: null,
    industryPe: null,
    salesYoY: null,
    profitYoY: null,
    sales: [],
    profits: [],
    qSales: [],
    qProfits: [],
    netWorth: [],
    qNetWorth: [],
    shareholding: [],
    promoters: null,
    fii: null,
    dii: null,
    roce: null,
    peg: null,
    forwardPe: null,
    forwardEps: null,
    forwardPeg: null,
    opm: null,
    salesCagr3: null,
    profitCagr3: null,
    profitCagr5: null,
    website: null,
    interestCover: null,
    pegVia: null,
    ebitda: [],
    cfo: [],
    qCfo: [],
    cfoPat: null,
    finPeriod: null,
    shPeriod: null,
    retrievedAt: Date.now(),
    pledge: null,
  };
}

export async function fetchDeepFundamentals(symbol: string): Promise<{ fund: Fundamentals | null; sources: string[] }> {
  const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
  const cached = deepCache.get(bare);
  if (cached && Date.now() - cached.at < DEEP_TTL) return { fund: cached.fund, sources: cached.sources };
  const sources: string[] = [];
  let base = (await fetchFundamentals(bare).catch(() => null)) || emptyFund(bare);
  if (base.searchId) sources.push("company card");

  const extra: Partial<Fundamentals> = {};
  try {
    const [annual, quarterly, integrated, sh] = await Promise.all([
      filingsFor(bare, "Annual"),
      filingsFor(bare, "Quarterly"),
      integratedFor(bare),
      shareholdingFor(bare),
    ]);
    const seen = new Set<string>();
    const files: NseFiling[] = [];
    for (const r of [
      ...preferCons(integrated).slice(0, 8),
      ...preferCons(annual).slice(0, 8),
      ...preferCons(quarterly).slice(0, 6),
    ]) {
      const url = String(r.xbrl || "");
      if (!url || seen.has(url)) continue;
      seen.add(url);
      files.push(r);
    }
    const xmls = await poolMap(files, 2, (r) => fetchXml(String(r.xbrl)));
    const yearSlices: FilingSlice[] = [];
    const qtrSlices: FilingSlice[] = [];
    for (const xml of xmls) {
      if (!xml) continue;
      const y = filingFromXbrl(xml, "year");
      const q = filingFromXbrl(xml, "quarter");
      if (y) yearSlices.push(y);
      if (q) qtrSlices.push(q);
    }
    const years = uniqPeriod(yearSlices).sort((a, b) => (parsePeriod(a.period)?.t || 0) - (parsePeriod(b.period)?.t || 0));
    const qtrs = uniqPeriod(qtrSlices).sort((a, b) => (parsePeriod(a.period)?.t || 0) - (parsePeriod(b.period)?.t || 0));
    if (years.length) {
      sources.push("exchange filings");
      extra.sales = years.filter((y) => y.sales != null).map((y) => ({ period: y.period, value: y.sales as number }));
      extra.profits = years.filter((y) => y.profits != null).map((y) => ({ period: y.period, value: y.profits as number }));
      extra.cfo = years.filter((y) => y.cfo != null).map((y) => ({ period: y.period, value: y.cfo as number }));
      extra.netWorth = years.filter((y) => y.netWorth != null).map((y) => ({ period: y.period, value: y.netWorth as number }));
      extra.ebitda = years.filter((y) => y.ebitda != null).map((y) => ({ period: y.period, value: y.ebitda as number }));
      extra.salesYoY = yoyOf(extra.sales || []);
      extra.profitYoY = yoyOf(extra.profits || []);
      extra.salesCagr3 = cagrOf(extra.sales || [], 3);
      extra.profitCagr3 = cagrOf(extra.profits || [], 3);
      extra.profitCagr5 = cagrOf(extra.profits || [], 5);
      extra.de = years.map((y) => y.de).filter((n): n is number => n != null).at(-1) ?? null;
      extra.face = years.map((y) => y.face).filter((n): n is number => n != null).at(-1) ?? null;
      extra.eps = years.map((y) => y.eps).filter((n): n is number => n != null).at(-1) ?? null;
      extra.opm = years.map((y) => y.opm).filter((n): n is number => n != null).at(-1) ?? null;
      extra.roce = years.map((y) => y.roce).filter((n): n is number => n != null).at(-1) ?? null;
      extra.interestCover = years.map((y) => y.interestCover).filter((n): n is number => n != null).at(-1) ?? null;
      extra.finPeriod = extra.sales?.at(-1)?.period || extra.profits?.at(-1)?.period || null;
    }
    if (qtrs.length) {
      if (!sources.includes("exchange filings")) sources.push("exchange filings");
      extra.qSales = qtrs.filter((y) => y.sales != null).map((y) => ({ period: y.period, value: y.sales as number }));
      extra.qProfits = qtrs.filter((y) => y.profits != null).map((y) => ({ period: y.period, value: y.profits as number }));
      extra.qCfo = qtrs.filter((y) => y.cfo != null).map((y) => ({ period: y.period, value: y.cfo as number }));
      extra.qNetWorth = qtrs.filter((y) => y.netWorth != null).map((y) => ({ period: y.period, value: y.netWorth as number }));
    }

    if (sh.json.length) {
      sources.push("shareholding filing");
      const row = sh.json[0];
      const prom = Number(row.pr_and_prgrp);
      if (Number.isFinite(prom)) extra.promoters = prom;
      extra.shPeriod = String(row.date || "") || extra.shPeriod;
    }
    const shFiles = sh.json.filter((r) => r.xbrl).slice(0, 4);
    const shXmls = await poolMap(shFiles, 2, (r) => fetchXml(String(r.xbrl)));
    const points: ShPoint[] = [];
    let latestShp: ReturnType<typeof parseShpPercents> | null = null;
    for (let i = 0; i < shFiles.length; i++) {
      const r = shFiles[i];
      const xml = shXmls[i] || (i === 0 ? sh.xml : null);
      const shp = xml ? parseShpPercents(xml) : { promoters: null, fii: null, dii: null, pledge: null, period: null };
      if (i === 0) latestShp = shp;
      const period = String(r.date || shp.period || "");
      if (!period) continue;
      const promoters = Number(r.pr_and_prgrp);
      points.push({
        period,
        promoters: Number.isFinite(promoters) ? promoters : shp.promoters,
        fii: shp.fii,
        dii: shp.dii,
      });
    }
    if (latestShp) {
      if (latestShp.promoters != null) extra.promoters = extra.promoters ?? latestShp.promoters;
      if (latestShp.fii != null) extra.fii = latestShp.fii;
      if (latestShp.dii != null) extra.dii = latestShp.dii;
      if (latestShp.pledge != null) extra.pledge = latestShp.pledge;
      if (latestShp.period) extra.shPeriod = extra.shPeriod || latestShp.period;
    }
    if (points.length) extra.shareholding = sortShareholding(points);
  } catch {
    /* keep card */
  }

  let fund = fillFundamentals(base, extra);
  const lastCfo = fund.cfo.at(-1)?.value;
  const lastPat = fund.profits.at(-1)?.value;
  if (fund.cfoPat == null && lastCfo != null && lastPat != null && lastPat !== 0) {
    const r = lastCfo / lastPat;
    fund.cfoPat = Number.isFinite(r) ? r : null;
  }
  if (fund.salesCagr3 == null) fund.salesCagr3 = cagrOf(fund.sales, 3);
  if (fund.profitCagr3 == null) fund.profitCagr3 = cagrOf(fund.profits, 3);
  if (fund.profitCagr5 == null) fund.profitCagr5 = cagrOf(fund.profits, 5);
  const picked = pickPeg(fund.peg, fund.pe, fund.profitCagr5, fund.profitCagr3);
  if (fund.peg == null && picked) {
    fund.peg = picked.peg;
    fund.pegVia = picked.via;
  }
  fund.retrievedAt = Date.now();
  if (!fund.searchId && !fund.sales.length && !fund.profits.length && fund.promoters == null && !fund.cfo.length) {
    deepCache.set(bare, { at: Date.now(), fund: null, sources });
    return { fund: null, sources };
  }
  deepCache.set(bare, { at: Date.now(), fund, sources });
  return { fund, sources };
}

export async function fetchDeepMany(symbols: string[]): Promise<{ funds: Record<string, Fundamentals>; sources: Record<string, string[]> }> {
  const uniq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()))].slice(0, 40);
  const funds: Record<string, Fundamentals> = {};
  const sources: Record<string, string[]> = {};
  await poolMap(uniq, 2, async (s) => {
    const got = await fetchDeepFundamentals(s);
    if (got.fund) funds[s] = got.fund;
    sources[s] = got.sources;
  });
  return { funds, sources };
}
