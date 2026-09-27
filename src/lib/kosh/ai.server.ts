import { fetchOhlc, fetchTape } from "./yahoo.server";
import { fetchNews, fetchScreener, snapshotStats } from "./live.server";
import { fetchFundamentals, fundLines } from "./fundamentals.server";
import { sectorOf, capOf } from "./sectors";
import { universeName } from "./universe";
import { fmtPx, fmtPct } from "./engine";
import { fmtVol } from "./ohlc";
import { businessOf } from "./business";
import type { ScreenFilter } from "./screens";
import { fundSystem, qualSystem, COMBINE_SKILL, IMPROVE_SKILL } from "./skills";
import {
  asFund,
  asMix,
  asPulse,
  asQual,
  asQuality,
  asSpark,
  asStructure,
  fundText,
  qualityText,
  qualText,
  skillOutputReady,
  sparkText,
  structureText,
  type FundBlock,
  type MixBlock,
  type PulseBlock,
  type QualBlock,
  type QualityBlock,
  type SparkBlock,
  type StructureBlock,
} from "./note-shape";
import {
  classifySkillError,
  correctivePrompt,
  skillCacheKey,
  SKILL_CACHE_PREFIX,
  validateFund,
  validateQual,
  type SkillStatus,
} from "./skill-engine";
import { screenMetricGap } from "./evidence";
import { metalKey, METALS } from "./commodities";

const cache = new Map<string, { at: number; text: string }>();
const DAY = 6 * 60 * 60 * 1000;

export type NoteKind = "quality" | "spark" | "ask" | "pulse" | "book" | "desk" | "holdings" | "fund" | "qual" | "structure" | "picks" | "combine" | "improve";

export type BookBrief = {
  name: string;
  bench: string;
  names: {
    symbol: string;
    weight: number;
    sector: string;
    fundTag?: string;
    fundRating?: string;
    fundVerdict?: string;
    qualTag?: string;
    qualPotential?: string;
    qualVerdict?: string;
    fundApproved?: string;
    qualApproved?: string;
    fundStatus?: string;
    qualStatus?: string;
  }[];
};

export type NoteInput = {
  symbol?: string;
  kind: NoteKind;
  question?: string;
  book?: BookBrief;
  chart?: {
    interval?: string;
    lookback?: string;
    last?: number;
    rsi?: number | null;
    swings?: { label: string; price: number; t?: number }[];
    levels?: { price: number; n: number; labels: string[] }[];
    mtf?: { price: number; n: number; labels: string[] }[];
    mode?: string;
  };
  prior?: { fund?: string; qual?: string };
  fresh?: number;
};

function n(v: number | null | undefined, f: (x: number) => string) {
  return v == null || !Number.isFinite(v) ? "n/a" : f(v);
}

async function stockFacts(symbol: string) {
  const pack = await fetchOhlc(symbol, "max", "1d");
  const name = pack.name || universeName(symbol);
  const [news, fund] = await Promise.all([
    fetchNews(symbol, name),
    fetchFundamentals(symbol),
  ]);
  const s = snapshotStats(pack);
  const listed = pack.firstTrade ? new Date(pack.firstTrade * 1000).toISOString().slice(0, 10) : "n/a";
  const biz = businessOf(symbol);
  const metal = metalKey(symbol);
  const lastUnit = metal ? " " + METALS[metal].displayLabel : "";
  const lines = [
    `Ticker: ${symbol.replace(/\.(NS|BO)$/i, "")}`,
    `Name: ${name}`,
    `Exchange: ${pack.exchange || "NSE"} ${pack.currency}`,
    `Sector (our map): ${sectorOf(symbol)} · ${capOf(symbol)}`,
    `Last: ${fmtPx(pack.price)}${lastUnit} (${fmtPct(pack.changePct)} vs prev close)`,
    `Day range: ${fmtPx(pack.dayLow)} – ${fmtPx(pack.dayHigh)}`,
    `52w: ${fmtPx(pack.low52)} – ${fmtPx(pack.high52)} · off high ${n(s.offHigh, (x) => x.toFixed(1) + "%")}`,
    `Volume: ${fmtVol(pack.volume)} vs 20d avg ${fmtVol(s.volAvg)}`,
    `Returns: 1W ${n(s.ret1w, (x) => x.toFixed(1) + "%")} · 1M ${n(s.ret1m, (x) => x.toFixed(1) + "%")} · 3M ${n(s.ret3m, (x) => x.toFixed(1) + "%")} · 1Y ${n(s.ret1y, (x) => x.toFixed(1) + "%")}`,
    `RSI14 ${n(s.rsi, (x) => x.toFixed(1))} · MA20 ${n(s.ma20, fmtPx)} · MA50 ${n(s.ma50, fmtPx)} · MA200 ${n(s.ma200, fmtPx)}`,
    pack.firstTrade ? `First listed print on file: ${listed}` : "First listed print: Not reliably available",
    biz
      ? `Business on file: ${biz.what} ${biz.makes} ${biz.cycle}${biz.products ? " Products: " + biz.products : ""}`
      : "Business on file: none — pull from primary sources",
    fundLines(fund),
    "Headlines on file:",
    ...(news.slice(0, 8).map((x) => `- ${x.title} (${x.publisher})`) || ["- none"]),
  ];
  return lines.join("\n");
}

async function pulseFacts() {
  const [tape, screen, news] = await Promise.all([
    fetchTape(),
    fetchScreener(),
    fetchNews("NIFTY", "Nifty Sensex Indian stock market"),
  ]);
  const up = [...screen].sort((a, b) => b.changePct - a.changePct).slice(0, 8);
  const down = [...screen].sort((a, b) => a.changePct - b.changePct).slice(0, 8);
  const hot = [...screen].filter((r) => (r.volRatio ?? 0) >= 1.4).sort((a, b) => (b.volRatio ?? 0) - (a.volRatio ?? 0)).slice(0, 6);
  const high = screen.filter((r) => r.offHigh != null && r.offHigh >= -5).sort((a, b) => (b.offHigh ?? 0) - (a.offHigh ?? 0)).slice(0, 6);
  const green = screen.filter((r) => r.changePct >= 0).length;
  const lines = [
    "Indices:",
    ...tape.map((t) => `- ${t.label}: ${fmtPx(t.price)}${t.unit ? " " + t.unit : ""} (${fmtPct(t.changePct)})`),
    `Breadth on these names: ${green}/${screen.length} green`,
    "Winners:",
    ...up.map((r) => `- ${r.symbol} ${r.name} ${fmtPct(r.changePct)} RSI ${n(r.rsi, (x) => x.toFixed(0))}`),
    "Losers:",
    ...down.map((r) => `- ${r.symbol} ${r.name} ${fmtPct(r.changePct)}`),
    "Volume spike:",
    ...hot.map((r) => `- ${r.symbol} vol ${n(r.volRatio, (x) => x.toFixed(1) + "×")}`),
    "Near 52w high:",
    ...high.map((r) => `- ${r.symbol} off high ${n(r.offHigh, (x) => x.toFixed(1) + "%")}`),
    "Headlines:",
    ...news.slice(0, 10).map((x) => `- ${x.title} (${x.publisher})`),
  ];
  return lines.join("\n");
}

async function bookFacts(book: BookBrief) {
  const screen = await fetchScreener().catch(() => []);
  const map = new Map(screen.map((r) => [r.symbol.toUpperCase(), r]));
  const byStem = new Map(screen.map((r) => [r.symbol.toUpperCase().replace(/[-_]SM$/i, ""), r]));

  const lineFor = async (h: BookBrief["names"][0]) => {
    const key = h.symbol.toUpperCase();
    const stem = key.replace(/[-_]SM$/i, "");
    const r = map.get(key) || map.get(stem) || byStem.get(stem);
    const w = `${(h.weight * 100).toFixed(1)}%`;
    const fundLabel = h.fundApproved || h.fundTag;
    const qualLabel = h.qualApproved || h.qualTag;
    const fundState = String(h.fundStatus || "");
    const qualState = String(h.qualStatus || "");
    const fundText =
      fundLabel
        ? `Fundamental: ${fundLabel}${h.fundRating ? ` (${h.fundRating})` : ""}${h.fundVerdict ? ` — ${h.fundVerdict.replace(/\s+/g, " ").slice(0, 220)}` : ""}`
        : fundState && fundState !== "Not started" && fundState !== "Done"
          ? `Fundamental: ${fundState}`
          : "Fundamental: Not run";
    const qualText =
      qualLabel
        ? `Qualitative: ${qualLabel}${h.qualPotential ? ` (${h.qualPotential})` : ""}${h.qualVerdict ? ` — ${h.qualVerdict.replace(/\s+/g, " ").slice(0, 220)}` : ""}`
        : qualState && qualState !== "Not started" && qualState !== "Done"
          ? `Qualitative: ${qualState}`
          : "Qualitative: Not run";
    const skills = `${fundText} · ${qualText}`;
    if (r) {
      return `- ${h.symbol} ${w} · ${h.sector} · last ${fmtPx(r.price)} ${fmtPct(r.changePct)} 1M ${n(r.ret1m, (x) => x.toFixed(1) + "%")} 1Y ${n(r.ret1y, (x) => x.toFixed(1) + "%")} PE ${n(r.pe, (x) => x.toFixed(1))} ROE ${n(r.roe, (x) => x.toFixed(0) + "%")} D/E ${n(r.de, (x) => x.toFixed(2))} sales ${n(r.salesYoY, (x) => x.toFixed(0) + "%")} · ${skills}`;
    }
    try {
      const [ohlc, fund] = await Promise.all([
        fetchOhlc(h.symbol, "1y", "1d").catch(() => null),
        fetchFundamentals(h.symbol).catch(() => null),
      ]);
      const px =
        ohlc && ohlc.price > 0
          ? `last ${fmtPx(ohlc.price)} ${fmtPct(ohlc.changePct)}`
          : "last n/a";
      const f = fund
        ? `PE ${n(fund.pe, (x) => x.toFixed(1))} ROE ${n(fund.roe, (x) => x.toFixed(0) + "%")} D/E ${n(fund.de, (x) => x.toFixed(2))} sales ${n(fund.salesYoY, (x) => x.toFixed(0) + "%")}`
        : "";
      return `- ${h.symbol} ${w} · ${h.sector} · ${px}${f ? " · " + f : ""} · ${skills}`;
    } catch {
      return `- ${h.symbol} ${w} · ${h.sector} · ${skills}`;
    }
  };

  const names = book.names;
  const body: string[] = [];
  for (let i = 0; i < names.length; i += 6) {
    const chunk = names.slice(i, i + 6);
    body.push(...(await Promise.all(chunk.map(lineFor))));
  }
  return [
    `Portfolio: ${book.name}`,
    `Benchmark preference: ${book.bench}`,
    "Current portfolio (weights only — no quantities or cost).",
    "Skill labels in FACTS are already-run outputs — copy them. If a skill was not run, write Not run in the holdings table only. Never write Unscreened, book, or Not on file. Do not centre the Portfolio verdict on missing qualitative reads.",
    ...body,
  ].join("\n");
}

const JSON_RULES = `Return STRICT JSON only. No markdown fences. Short, crisp sentences. One idea per bullet. Do not invent PE, ROE, promoter %, book value, or last-quarter sales — if a number is not in FACTS, omit it. Cite FACTS numbers when you use them. Not advice. INR. No emoji. No hedging filler. Never write the word "tape" — say last price, chart, or session. Never write the word "mix" — say portfolio or holdings.`;

const QUALITY = `You are Quality — a 30-second desk note on an Indian listed company. Simpler than the full fundamental skill.
${JSON_RULES}
{"headline":"one-line business verdict","business":"2 short sentences: what it sells and how cash is made","industry":"1 short sentence","moat":"1 short sentence, or 'No obvious moat.'","price":["1-2 bullets: last, 1M/1Y or 52w place from FACTS"],"cycle":"1 sentence","changeMind":["1-2 concrete facts that would change the read"],"risks":["2 open risks"]}
Keep it scannable. Full depth lives in Fundamental analysis.`;

const SPARK = `You are Spark — a 30-second catalyst note. Simpler than the full qualitative skill.
${JSON_RULES}
{"headline":"what is actually happening today","today":"2 short sentences on last move and volume — cite FACTS","headlines":["only headlines that fit this ticker, or one item: none that fit"],"catalysts":["1-2 things that would be a real move"],"pricedIn":"one short sentence on what the price already knows","noise":"one short sentence on what to ignore"}
Full qualitative depth lives in Qualitative analysis.`;

const ASK = `You are Kosh. Answer the question about this Indian listed name.
Use FACTS for live numbers and fundamentals. Do not invent numbers that are not in FACTS.
Write 2-5 short paragraphs. One idea per paragraph. Not advice. INR. No emoji. No JSON.`;

const PULSE = `You are Pulse, Kosh's morning desk for the Indian cash market.
${JSON_RULES}
{"headline":"one line on the session","market":"2 sentences on indices and gold/silver if in FACTS","breadth":"one sentence with the green/total number from FACTS","names":["3-6 names that actually moved, with the FACTS number"],"headlines":["headlines vs last price, or none"],"watch":["2-4 things into the next session"]}`;

const BOOK = `You are Quality reading an Indian portfolio. FACTS has today's weights only.
${JSON_RULES}
{"headline":"one line on what this portfolio is","mix":"2 sentences on the actual weights","concentration":["2-4 bullets on sector/name bets"],"largeWeights":["what the live prices are doing on the large weights, cite FACTS"],"vsIndex":"how this kind of portfolio usually behaves versus Nifty","risks":["2-4 open risks"]}`;

const DESK = `You are Quality and Spark in one pass — two short 30-second cards for an Indian listed name.
${JSON_RULES}
{"quality":{"headline":"","business":"2 short sentences","industry":"1 sentence","moat":"1 sentence","price":["1-2 FACTS bullets"],"cycle":"1 sentence","changeMind":["1 item"],"risks":["2 items"]},"spark":{"headline":"","today":"2 short sentences","headlines":[],"catalysts":["1-2 items"],"pricedIn":"1 sentence","noise":"1 sentence"}}
Quality is the business. Spark is what is moving it now. Keep each field short. No empty filler.`;

const HOLDINGS = `You are Quality and Spark for each name in an Indian portfolio. FACTS has today's weights only.
${JSON_RULES}
{"notes":[{"symbol":"TCS","quality":{"headline":"","business":"","industry":"","moat":"","price":[],"cycle":"","changeMind":[],"risks":[]},"spark":{"headline":"","today":"","headlines":[],"catalysts":[],"pricedIn":"","noise":""}}]}
One object per ticker in FACTS. Headline + short fields. Price bullets 2. Risks 2. Spark today is 1-2 sentences.`;

const FUND = fundSystem();

const QUAL = qualSystem();

const COMBINE = COMBINE_SKILL;

const IMPROVE = IMPROVE_SKILL;

const STRUCTURE = `You read the chart structure of an Indian listed name. MODE in FACTS is one of Intraday, Swing, Positional, or Chart TF. Read THAT horizon only. Think of the header as "{Mode} · {interval}". SHORT. Two-word call first. Not a buy/sell. Not advice.
${JSON_RULES}
Use the CHART FACTS: mode, interval, lookback, last, RSI, fractal swings (HH/HL/LH/LL), clustered support/resistance, and weekly confluence. Do not invent prices. Comment on the listed levels. If a level is not in FACTS, omit it. Do not mix timeframes.
{"tag":"EXACTLY two words. Capitalise each. Examples: Trend intact, Range bound, Breakout watch, Weak close, Tight coil, Support holding","bias":"up, down, or range","setup":"1-2 sentences citing FACTS last / RSI / HH-HL on this mode and timeframe","support":[{"price":0,"note":"why this level from FACTS"}],"resistance":[{"price":0,"note":"why this level from FACTS"}],"swings":[{"label":"HH","price":0}],"mtf":["one line on weekly confluence from FACTS"],"levels":["short FACTS levels"],"invalidation":"1 sentence what would kill this read","verdict":"2 sentences max. Not a buy/sell."}
tag is the first thing the reader sees. Make it the actual call. Tables not paragraphs.`;

const PICKS = `You tag Indian listed names for a quality board. Two-word fund tag and two-word qualitative tag each. SHORT.
${JSON_RULES}
{"notes":[{"symbol":"TCS","fund":"Cash compounder","qual":"Quiet compounder","why":"one sentence from FACTS"}]}
One object per ticker in FACTS. fund and qual are EXACTLY two words. Capitalise each. Do not invent PE, ROE, sales. If a number is missing, skip it. Not a buy/sell.`;

const SCREEN_BUILD = `You build a Kosh stock screener from the user's words and/or a screenshot of criteria.
Kosh can filter these live fields on a Nifty-heavy universe:
Price action: changePct, ret1m, ret3m, ret1y, offHigh (percent from 52w high, 0 = at high, -20 = 20% below), rsi (14), volRatio (today vs 20d avg), above50 (bool), above200 (bool), macdBull (bool, MACD histogram > 0), bbLow (bool, price in lower 20% of Bollinger).
Fundamentals when on file: pe, pb, peg, roe, roce, opm, de (debt/equity), interestCover, cfoPat, mcapCr (₹ Cr), divYield (%), salesYoY (%), salesCagr3, profitCagr3, profitCagr5, promoters, pledge, fii, dii.
Sectors: Financials, IT, Energy, Auto, FMCG, Healthcare, Telecom, Materials, Industrials, Consumer, Realty, Other, Commodities.
If a requested metric is not in this list, do not map it. Set "unsupported" to the metric name and "closest" to the nearest field above. Leave every filter null.
Return STRICT JSON only:
{"name":"short label","hint":"one sentence of what you built","unsupported":null,"closest":null,"changePctMin":null,"changePctMax":null,"ret1mMin":null,"ret1mMax":null,"ret3mMin":null,"ret3mMax":null,"ret1yMin":null,"ret1yMax":null,"offHighMin":null,"offHighMax":null,"rsiMin":null,"rsiMax":null,"volRatioMin":null,"above50":null,"above200":null,"peMin":null,"peMax":null,"pbMin":null,"pbMax":null,"roeMin":null,"roeMax":null,"deMin":null,"deMax":null,"mcapMin":null,"mcapMax":null,"divMin":null,"divMax":null,"salesYoYMin":null,"salesYoYMax":null,"macdBull":null,"bbLow":null,"sectors":[],"sort":"changePct","sortDir":"desc"}
Use numbers or null. above50/above200/macdBull/bbLow: true, false, or null. sort is one of name,price,changePct,ret1m,ret3m,ret1y,offHigh,rsi,vol,pe,pb,roe,de,mcapCr,divYield,salesYoY.
JSON only.`;

function systemFor(kind: NoteKind) {
  if (kind === "quality") return QUALITY;
  if (kind === "spark") return SPARK;
  if (kind === "pulse") return PULSE;
  if (kind === "book") return BOOK;
  if (kind === "desk") return DESK;
  if (kind === "holdings") return HOLDINGS;
  if (kind === "fund") return FUND;
  if (kind === "qual") return QUAL;
  if (kind === "combine") return COMBINE;
  if (kind === "improve") return IMPROVE;
  if (kind === "structure") return STRUCTURE;
  if (kind === "picks") return PICKS;
  return ASK;
}

function parseJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function chat(
  apiKey: string,
  system: string,
  user: unknown,
  maxTokens: number,
  temperature = 0.2,
  search = false,
) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const readAssistant = (json: Record<string, unknown>) => {
    if (typeof json.output_text === "string" && json.output_text.trim()) return json.output_text.trim();
    const output = json.output;
    if (Array.isArray(output)) {
      const chunks: string[] = [];
      for (const item of output) {
        const row = item as { type?: string; text?: string; content?: unknown };
        if (typeof row.text === "string") chunks.push(row.text);
        if (Array.isArray(row.content)) {
          for (const c of row.content) {
            const part = c as { text?: string };
            if (typeof part.text === "string") chunks.push(part.text);
          }
        }
      }
      if (chunks.length) return chunks.join("\n").trim();
    }
    const choices = json.choices as Array<{ message?: { content?: string } }> | undefined;
    return choices?.[0]?.message?.content?.trim() || "";
  };

  const post = async (url: string, body: Record<string, unknown>, ms = 90_000) => {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(ms),
    });
    const raw = await res.text();
    return { ok: res.ok, status: res.status, raw };
  };

  const messages = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];

  if (search) {
    // Current xAI live research: Responses API + built-in web_search (NOT retired search_parameters).
    let hit = await post(
      "https://api.x.ai/v1/responses",
      {
        model: "grok-4.5",
        temperature,
        max_output_tokens: maxTokens,
        input: messages,
        tools: [{ type: "web_search" }],
      },
      120_000,
    );
    if (!hit.ok && (hit.status === 400 || hit.status === 422 || hit.status === 404)) {
      hit = await post("https://api.x.ai/v1/chat/completions", {
        model: "grok-4.5",
        temperature,
        max_tokens: maxTokens,
        messages,
      });
    }
    if (!hit.ok) throw new Error(xaiError(hit.status, hit.raw));
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(hit.raw) as Record<string, unknown>;
    } catch {
      throw new Error("The analysis returned an unreadable reply.");
    }
    return readAssistant(parsed);
  }

  let hit = await post("https://api.x.ai/v1/chat/completions", {
    model: "grok-4.5",
    temperature,
    max_tokens: maxTokens,
    messages,
  });

  if (!hit.ok && (hit.status === 410 || hit.status === 404 || hit.status === 400 || hit.status === 422)) {
    hit = await post("https://api.x.ai/v1/responses", {
      model: "grok-4.5",
      temperature,
      max_output_tokens: maxTokens,
      input: messages,
    });
  }

  if (!hit.ok) throw new Error(xaiError(hit.status, hit.raw));
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(hit.raw) as Record<string, unknown>;
  } catch {
    throw new Error("Grok returned an unreadable reply.");
  }
  return readAssistant(parsed);
}

function xaiError(status: number, body: string) {
  if (/<!DOCTYPE|Gateway time-out|Error code 504|cf-error/i.test(body)) {
    return "The analysis took too long. Retry — a second pass is usually faster.";
  }
  const snippet = body.replace(/\s+/g, " ").slice(0, 180);
  if (status === 504 || status === 502) return "The analysis took too long. Retry.";
  if (status === 410) return "The analysis endpoint is updating. Retry.";
  if (status === 429) return "Busy right now. Wait a minute and retry.";
  if (status === 402 || status === 403) return "Analysis credits are exhausted.";
  return snippet ? `Analysis error ${status}` : `Analysis error ${status}`;
}

export type NoteOk = {
  ok: true;
  text: string;
  cached: boolean;
  quality?: string;
  spark?: string;
  qualityBlock?: QualityBlock | null;
  sparkBlock?: SparkBlock | null;
  pulseBlock?: PulseBlock | null;
  mixBlock?: MixBlock | null;
  fundBlock?: FundBlock | null;
  qualBlock?: QualBlock | null;
  structureBlock?: StructureBlock | null;
  pickNotes?: { symbol: string; fund: string; qual: string; why: string }[];
  notes?: {
    symbol: string;
    quality: string;
    spark: string;
    qualityBlock?: QualityBlock | null;
    sparkBlock?: SparkBlock | null;
  }[];
};

function fromParsed(kind: NoteKind, parsed: Record<string, unknown> | null, raw: string): Omit<NoteOk, "ok" | "cached"> {
  let qualityBlock: QualityBlock | null = null;
  let sparkBlock: SparkBlock | null = null;
  let pulseBlock: PulseBlock | null = null;
  let mixBlock: MixBlock | null = null;
  let fundBlock: FundBlock | null = null;
  let qualBlock: QualBlock | null = null;
  let structureBlock: StructureBlock | null = null;
  let pickNotes: NoteOk["pickNotes"];
  let notes: NoteOk["notes"];

  if (kind === "desk" && parsed) {
    qualityBlock = asQuality(parsed.quality);
    sparkBlock = asSpark(parsed.spark);
  } else if (kind === "quality") {
    qualityBlock = asQuality(parsed || raw);
  } else if (kind === "spark") {
    sparkBlock = asSpark(parsed || raw);
  } else if (kind === "pulse") {
    pulseBlock = asPulse(parsed || raw);
  } else if (kind === "book") {
    mixBlock = asMix(parsed || raw);
  } else if (kind === "fund") {
    fundBlock = asFund(raw);
  } else if (kind === "qual") {
    qualBlock = asQual(raw);
  } else if (kind === "combine" || kind === "improve") {
    /* full prose — do not JSON-parse */
  } else if (kind === "structure") {
    structureBlock = asStructure(parsed || raw);
  } else if (kind === "picks" && parsed && Array.isArray(parsed.notes)) {
    pickNotes = parsed.notes
      .map((item) => {
        const o = item as { symbol?: string; fund?: string; qual?: string; why?: string };
        return {
          symbol: String(o.symbol || "").toUpperCase(),
          fund: String(o.fund || "").slice(0, 40),
          qual: String(o.qual || "").slice(0, 40),
          why: String(o.why || "").slice(0, 180),
        };
      })
      .filter((x) => x.symbol);
  } else if (kind === "holdings" && parsed && Array.isArray(parsed.notes)) {
    notes = parsed.notes
      .map((item) => {
        const o = item as { symbol?: string; quality?: unknown; spark?: unknown };
        const qb = asQuality(o.quality);
        const sb = asSpark(o.spark);
        return {
          symbol: String(o.symbol || ""),
          quality: qb ? qualityText(qb) : typeof o.quality === "string" ? o.quality : "",
          spark: sb ? sparkText(sb) : typeof o.spark === "string" ? o.spark : "",
          qualityBlock: qb,
          sparkBlock: sb,
        };
      })
      .filter((x) => x.symbol);
  }

  const quality = qualityBlock ? qualityText(qualityBlock) : undefined;
  const spark = sparkBlock ? sparkText(sparkBlock) : undefined;
  const readable =
    quality || spark
      ? [quality ? `Quality\n${quality}` : "", spark ? `Spark\n${spark}` : ""].filter(Boolean).join("\n\n")
      : notes?.length
        ? notes.map((x) => `${x.symbol}\nQuality: ${x.quality}\nSpark: ${x.spark}`).join("\n\n")
        : pulseBlock
          ? [pulseBlock.headline, pulseBlock.market, pulseBlock.breadth, ...pulseBlock.names].filter(Boolean).join("\n")
          : mixBlock
            ? [mixBlock.headline, mixBlock.mix, mixBlock.vsIndex].filter(Boolean).join("\n")
            : fundBlock
              ? fundBlock.prose || fundText(fundBlock)
              : qualBlock
                ? qualBlock.prose || qualText(qualBlock)
                : structureBlock
                  ? structureText(structureBlock)
                  : pickNotes?.length
                    ? pickNotes.map((x) => `${x.symbol}: ${x.fund} / ${x.qual}`).join("\n")
                : raw;
  return { text: readable, quality, spark, qualityBlock, sparkBlock, pulseBlock, mixBlock, fundBlock, qualBlock, structureBlock, pickNotes, notes };
}

function jsonKindOk(kind: string, parsed: Record<string, unknown> | null): boolean {
  if (!parsed) return false;
  const head = (v: unknown) => {
    if (!v || typeof v !== "object") return false;
    const h = (v as { headline?: unknown }).headline;
    return typeof h === "string" && h.trim().length > 0;
  };
  if (kind === "pulse" || kind === "book" || kind === "quality" || kind === "spark") {
    return typeof parsed.headline === "string" && parsed.headline.trim().length > 0;
  }
  if (kind === "structure") {
    return typeof parsed.tag === "string" && parsed.tag.trim().length > 0 && typeof parsed.verdict === "string" && parsed.verdict.trim().length > 0;
  }
  if (kind === "desk") return head(parsed.quality) || head(parsed.spark);
  if (kind === "picks" || kind === "holdings") return Array.isArray(parsed.notes) && parsed.notes.length > 0;
  return true;
}

const JSON_KINDS = new Set(["quality", "spark", "pulse", "book", "desk", "holdings", "structure", "picks"]);

export async function executeNote(input: NoteInput): Promise<NoteOk | { ok: false; error: string; skillStatus?: SkillStatus }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available in this environment" };
  const kind = input.kind;
  const symbol = String(input.symbol || "").slice(0, 24);
  const question = String(input.question || "").slice(0, 400);
  if (kind !== "pulse" && kind !== "book" && kind !== "holdings" && kind !== "picks" && kind !== "combine" && kind !== "improve" && !symbol)
    return { ok: false, error: "No ticker" };
  if (kind === "combine" && !(input.prior?.fund && input.prior?.qual) && !symbol)
    return { ok: false, error: "Need both skill outputs" };
  if (kind === "combine") {
    const fundOk = skillOutputReady("fund", String(input.prior?.fund || ""));
    const qualOk = skillOutputReady("qual", String(input.prior?.qual || ""));
    if (!fundOk || !qualOk) return { ok: false, error: "Need both complete skill outputs" };
  }
  if ((kind === "book" || kind === "holdings" || kind === "picks" || kind === "improve") && !input.book?.names?.length) return { ok: false, error: "Empty portfolio" };

  const day = input.fresh ? "f" + String(input.fresh) : new Date().toISOString().slice(0, 10);
  const cacheKey =
    kind === "fund" || kind === "qual"
      ? skillCacheKey({ kind, symbol: symbol.toUpperCase(), date: day })
      : `${SKILL_CACHE_PREFIX}:` +
        (kind === "book" || kind === "holdings" || kind === "picks" || kind === "improve"
          ? `${kind}:${(input.book?.names || [])
              .map((h) =>
                kind === "improve"
                  ? `${h.symbol}:${h.weight}:${h.fundApproved || h.fundTag || ""}:${h.qualApproved || h.qualTag || ""}:${h.fundStatus || ""}:${h.qualStatus || ""}`
                  : `${h.symbol}:${h.weight}`,
              )
              .join(",")}:${day}`
          : kind === "pulse"
            ? `pulse:${new Date().toISOString().slice(0, 10)}`
            : kind === "structure"
              ? `structure:${symbol.toUpperCase()}:${input.chart?.mode || ""}:${input.chart?.interval || ""}:${input.chart?.lookback || ""}:${new Date().toISOString().slice(0, 10)}`
              : kind === "combine"
                ? `combine:${symbol.toUpperCase()}:${String(input.prior?.fund || "").length}:${String(input.prior?.qual || "").length}:${new Date().toISOString().slice(0, 10)}`
                : `${kind}:${symbol.toUpperCase()}:${kind === "ask" ? question : day}`);
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < DAY) {
    if ((kind === "fund" || kind === "qual") && !skillOutputReady(kind, hit.text)) {
      cache.delete(cacheKey);
    } else {
      const parsed = kind === "fund" || kind === "qual" || kind === "combine" || kind === "improve" ? null : parseJson(hit.text);
      return { ok: true, cached: true, ...fromParsed(kind, parsed, hit.text) };
    }
  }

  let blob = "";
  if (kind === "combine") {
    blob = `FUNDAMENTAL SKILL OUTPUT:\n${String(input.prior?.fund || "").slice(0, 12000)}\n\nQUALITATIVE SKILL OUTPUT:\n${String(input.prior?.qual || "").slice(0, 12000)}`;
  } else if (kind === "pulse") blob = await pulseFacts();
  else if ((kind === "book" || kind === "holdings" || kind === "picks" || kind === "improve") && input.book) blob = await bookFacts(input.book);
  else blob = await stockFacts(symbol);

  if (input.chart) {
    const c = input.chart;
    const swingLines = (c.swings || []).slice(0, 12).map((s) => `- ${s.label} ${s.price}`).join("\n");
    const levelLines = (c.levels || []).slice(0, 8).map((l) => `- ${l.price} n=${l.n} ${l.labels.join(",")}`).join("\n");
    const mtfLines = (c.mtf || []).slice(0, 6).map((l) => `- ${l.price} ${l.labels.join(",")}`).join("\n");
    blob += `\n\nCHART (read this horizon only — MODE ${c.mode || "chart"} · ${c.interval || "n/a"}):\nMode: ${c.mode || "chart"}\nInterval: ${c.interval || "n/a"}\nLast on this chart: ${c.last ?? "n/a"}\nRSI on this chart: ${c.rsi ?? "n/a"}\nFractal swings:\n${swingLines || "- none"}\nClustered S/R:\n${levelLines || "- none"}\nWeekly confluence:\n${mtfLines || "- none"}`;
  }

  const ticker = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
  const name = ticker ? universeName(ticker) : "";
  const user =
    kind === "ask"
      ? `QUESTION:\n${question || "What matters on this name?"}\n\nCompany data:\n${blob}`
      : kind === "fund"
        ? `Write the full equity-fundamental-analysis of ${name} (${ticker}) listed on NSE/BSE now. Do not describe a research process. Do not write a one-line status. The snapshot below is supplementary — research NSE/BSE filings, the company IR site, annual reports and quarterly results. Cite a number only if it is in the snapshot or in a primary document you name (title, period, URL). Do not invent figures. Distinguish a reported fact, company guidance, a media interpretation, and a Kosh calculation. Do not present guidance as achieved performance. If a figure is unavailable, say “Not reliably available.” Be direct: cut descriptive padding by at least half. Keep every required section, verdict label, factor, and number. One sentence of why per factor. Markdown tables only. Final verdict 3–6 sentences. Use exactly one approved verdict from the skill.\n\n${blob}`
        : kind === "qual"
          ? `Write the full qualitative-multibagger-catalyst analysis of ${name} (${ticker}) listed on NSE/BSE now. Do not describe a research process. Do not write a one-line status such as “Researching…”. Snapshot below is a supporting financial check — research primary filings and the company IR site. Distinguish reported fact, company guidance, and your interpretation. Do not invent a financial number. If a figure is unavailable, say “Not reliably available.” Be direct: cut descriptive padding by at least half. Keep every required section, verdict label, factor, and number. One sentence of why per factor. Markdown tables only. Final verdict 3–6 sentences. Use exactly one approved qualitative label and one financial classification.\n\n${blob}`
          : kind === "combine"
            ? `Connect the two skill outputs below. Do not rerun either skill. Be direct. Cut padding by half.\n\n${blob}`
            : kind === "improve"
              ? `Synthesise this Indian portfolio from weights, live numbers, and skill labels in FACTS. Do not rerun either skill. Do not invent labels. Use BOTH fundamental and qualitative labels when they are present. Concentration in a name that both skills back is an opportunity, not automatically a risk. Never write Unscreened, book, or Not on file. Never make "Qualitative Not run" the thesis of the Portfolio verdict — judge from weights and live numbers, and from whatever labels are in FACTS. Copy labels; if a skill is absent write Not run in the table only; if a skill Failed, write Failed — never pretend it was not attempted.\n\n${blob}`
              : `COMPANY DATA\n${blob}`;

  const maxTokens =
    kind === "holdings"
      ? 4000
      : kind === "improve"
        ? 3500
        : kind === "fund" || kind === "qual"
          ? 4500
          : kind === "combine"
            ? 2500
            : kind === "desk" || kind === "quality" || kind === "book"
              ? 2400
              : 1400;
  const temperature = kind === "fund" || kind === "qual" || kind === "combine" || kind === "improve" ? 0.3 : 0.2;

  const useSearch = kind === "fund" || kind === "qual";
  const run = async (u: string) => chat(apiKey, systemFor(kind), u, maxTokens, temperature, useSearch);

  let text = "";
  try {
    text = await run(user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Analysis error";
    return { ok: false, error: msg, skillStatus: classifySkillError(msg) };
  }
  if ((kind === "fund" || kind === "qual") && !skillOutputReady(kind, text)) {
    const missing = kind === "fund" ? validateFund(text).missing : validateQual(text).missing;
    try {
      text = await run(`${correctivePrompt(kind, missing)}\n\n${user}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis error";
      return { ok: false, error: msg, skillStatus: classifySkillError(msg) };
    }
  }
  if (!text) return { ok: false, error: "Empty reply", skillStatus: "Failed" };
  if ((kind === "fund" || kind === "qual") && !skillOutputReady(kind, text)) {
    return { ok: false, error: "The analysis did not finish. Retry.", skillStatus: "Failed" };
  }
  if (JSON_KINDS.has(kind)) {
    let parsedTry = parseJson(text);
    if (!jsonKindOk(kind, parsedTry)) {
      try {
        text = await run(
          `The last reply was not valid JSON for this skill. Return only the required JSON object. Do not omit required fields. Do not invent missing numbers. Do not add a buy or sell.\n\n${user}`,
        );
        parsedTry = parseJson(text);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Analysis error";
        return { ok: false, error: msg, skillStatus: classifySkillError(msg) };
      }
    }
    if (!jsonKindOk(kind, parsedTry)) {
      return { ok: false, error: "AI analysis unavailable", skillStatus: "Invalid" };
    }
  }
  cache.set(cacheKey, { at: Date.now(), text });
  const parsed = kind === "fund" || kind === "qual" || kind === "combine" || kind === "improve" ? null : parseJson(text);
  return { ok: true, cached: false, ...fromParsed(kind, parsed, text) };
}

export async function executeScreenBuild(input: {
  prompt: string;
  image?: string;
}): Promise<
  | { ok: true; filter: ScreenFilter; cached: boolean }
  | { ok: false; error: string; unsupported?: { metric: string; closest: string } }
> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available in this environment" };
  const prompt = String(input.prompt || "").slice(0, 1200);
  const image = String(input.image || "");
  if (!prompt && !image) return { ok: false, error: "Describe the screen, or attach a screenshot" };
  const gap = screenMetricGap(prompt);
  if (gap) return { ok: false, error: gap.message, unsupported: { metric: gap.metric, closest: gap.closest } };
  const cacheKey = `screen:v23:${prompt}:${image.slice(0, 40)}:${image.length}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < DAY) {
    const parsed = parseJson(hit.text);
    if (parsed && !parsed.unsupported) return { ok: true, filter: asFilter(parsed), cached: true };
  }
  const userContent: unknown = image
    ? [
        { type: "text", text: prompt || "Build a Kosh screener from this screenshot of criteria. If a metric is unsupported, say so. Do not substitute it." },
        { type: "image_url", image_url: { url: image.slice(0, 900_000) } },
      ]
    : `USER CRITERIA:\n${prompt}`;
  let text = "";
  try {
    text = await chat(apiKey, SCREEN_BUILD, userContent, 700);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "xAI error" };
  }
  const parsed = parseJson(text);
  if (!parsed) return { ok: false, error: "Could not read a screen from that. Try a shorter sentence." };
  if (typeof parsed.unsupported === "string" && parsed.unsupported.trim()) {
    const metric = parsed.unsupported.trim().slice(0, 80);
    const closest = String(parsed.closest || "a listed field").slice(0, 40);
    return {
      ok: false,
      error: `${metric} is not currently a supported screening field. Closest available: ${closest}. Use ${closest} instead?`,
      unsupported: { metric, closest },
    };
  }
  cache.set(cacheKey, { at: Date.now(), text });
  return { ok: true, filter: asFilter(parsed), cached: false };
}

function asFilter(p: Record<string, unknown>): ScreenFilter {
  const num = (k: string) => {
    const v = p[k];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  };
  const bool = (k: string) => {
    const v = p[k];
    return v === true ? true : v === false ? false : null;
  };
  const sectors = Array.isArray(p.sectors) ? p.sectors.map((s) => String(s)).filter(Boolean).slice(0, 8) : [];
  const sort = String(p.sort || "changePct");
  const sortOk = [
    "name",
    "price",
    "changePct",
    "ret1m",
    "ret3m",
    "ret1y",
    "offHigh",
    "rsi",
    "vol",
    "pe",
    "pb",
    "roe",
    "de",
    "mcapCr",
    "divYield",
    "salesYoY",
  ].includes(sort);
  return {
    name: String(p.name || "Custom").slice(0, 48),
    hint: String(p.hint || "").slice(0, 180),
    changePctMin: num("changePctMin"),
    changePctMax: num("changePctMax"),
    ret1mMin: num("ret1mMin"),
    ret1mMax: num("ret1mMax"),
    ret3mMin: num("ret3mMin"),
    ret3mMax: num("ret3mMax"),
    ret1yMin: num("ret1yMin"),
    ret1yMax: num("ret1yMax"),
    offHighMin: num("offHighMin"),
    offHighMax: num("offHighMax"),
    rsiMin: num("rsiMin"),
    rsiMax: num("rsiMax"),
    volRatioMin: num("volRatioMin"),
    above50: bool("above50"),
    above200: bool("above200"),
    peMin: num("peMin"),
    peMax: num("peMax"),
    pbMin: num("pbMin"),
    pbMax: num("pbMax"),
    roeMin: num("roeMin"),
    roeMax: num("roeMax"),
    deMin: num("deMin"),
    deMax: num("deMax"),
    mcapMin: num("mcapMin"),
    mcapMax: num("mcapMax"),
    divMin: num("divMin"),
    divMax: num("divMax"),
    salesYoYMin: num("salesYoYMin"),
    salesYoYMax: num("salesYoYMax"),
    macdBull: bool("macdBull"),
    bbLow: bool("bbLow"),
    sectors,
    sort: (sortOk ? sort : "changePct") as ScreenFilter["sort"],
    sortDir: p.sortDir === "asc" ? "asc" : "desc",
  };
}
