import type { Fundamentals, HistoryPack, MacroPack, NewsItem, OhlcPack, Quote, ScreenRow, TapeRow, WikiCard } from "./types";
import type { BookBrief, FundBlock, HoldingNote, MixBlock, NoteKind, PulseBlock, QualBlock, QualityBlock, SparkBlock, StructureBlock, ChartFactsIn, PickNote } from "./ai-kinds";
import type { ScreenFilter, SkillRead } from "./screens";

function friendlyHttp(status: number, t: string) {
  if (/<!DOCTYPE|Gateway time-out|Error code 504|cf-error/i.test(t) || status === 504 || status === 502) {
    return "The analysis took too long. Retry — a second pass is usually faster.";
  }
  const s = t.replace(/\s+/g, " ").trim().slice(0, 180);
  if (status === 429) return "Too many reads. Try again in a few minutes.";
  return s || `Request failed (${status})`;
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, init);
  const t = await r.text().catch(() => "");
  if (/<!DOCTYPE|Gateway time-out|cf-error/i.test(t)) {
    throw new Error(friendlyHttp(r.status || 504, t));
  }
  if (!r.ok) {
    throw new Error(friendlyHttp(r.status, t));
  }
  try {
    return JSON.parse(t) as T;
  } catch {
    throw new Error(friendlyHttp(r.status, t));
  }
}

export async function apiTape() {
  const d = await json<{ rows: TapeRow[] }>("/api/tape");
  return d.rows || [];
}

export async function apiQuotes(symbols: string[]) {
  if (!symbols.length) return [] as Quote[];
  const d = await json<{ quotes: Quote[] }>("/api/quote?symbols=" + encodeURIComponent(symbols.join(",")));
  return d.quotes || [];
}

export async function apiHistories(symbols: string[], range = "max") {
  if (!symbols.length) return [] as HistoryPack[];
  const d = await json<{ rows: HistoryPack[]; range: string; asOf: string }>("/api/histories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbols, range }),
  });
  return d.rows || [];
}

export async function apiHistory(symbol: string, range = "max") {
  return json<HistoryPack>("/api/history?symbol=" + encodeURIComponent(symbol) + "&range=" + encodeURIComponent(range));
}

export async function apiSearch(q: string) {
  const d = await json<{ quotes: { symbol: string; name: string; exch: string }[] }>(
    "/api/search?q=" + encodeURIComponent(q),
  );
  return d.quotes || [];
}

export async function apiCloseOn(symbol: string, day: string) {
  return json<{ day: string; price: number; name?: string }>(
    "/api/close?symbol=" + encodeURIComponent(symbol) + "&day=" + encodeURIComponent(day),
  );
}

export async function apiOhlc(symbol: string, range = "1y", interval = "1d") {
  return json<OhlcPack>(
    "/api/ohlc?symbol=" +
      encodeURIComponent(symbol) +
      "&range=" +
      encodeURIComponent(range) +
      "&interval=" +
      encodeURIComponent(interval),
  );
}

export async function apiNews(symbol: string, name?: string) {
  const d = await json<{ items: NewsItem[] }>(
    "/api/news?symbol=" + encodeURIComponent(symbol) + (name ? "&name=" + encodeURIComponent(name) : ""),
  );
  return d.items || [];
}

export async function apiWiki(name: string) {
  const d = await json<{ card: WikiCard | null }>("/api/wiki?name=" + encodeURIComponent(name));
  return d.card;
}

export async function apiScreener() {
  const d = await json<{ rows: ScreenRow[]; asOf: string }>("/api/screener");
  return d;
}

export async function apiScreenerDeep() {
  const d = await json<{ rows: ScreenRow[]; asOf: string }>("/api/screener?depth=full");
  return d;
}

export async function apiScreenerAdd(add: string[]) {
  const qs = add.length ? "?add=" + encodeURIComponent(add.join(",")) : "";
  const d = await json<{ rows: ScreenRow[]; asOf: string }>("/api/screener" + qs);
  return d;
}

export async function apiScreenerOne(symbol: string) {
  const d = await apiScreenerAdd([symbol]);
  const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
  return (d.rows || []).find((r) => r.symbol.toUpperCase() === bare) || null;
}

export async function apiSkillBoard() {
  return json<{
    status: "idle" | "running" | "done" | "error";
    total: number;
    done: number;
    error: string;
    reads: SkillRead[];
  }>("/api/skill-board");
}

export async function apiSkillKick() {
  return json<{
    status: "idle" | "running" | "done" | "error";
    total: number;
    done: number;
    error: string;
    reads: SkillRead[];
  }>("/api/skill-board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kick: true }),
  });
}

export async function apiSkillPut(read: SkillRead) {
  return json<{
    status: string;
    total: number;
    done: number;
    error: string;
    reads: SkillRead[];
  }>("/api/skill-board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(read),
  });
}

export async function apiFundamentals(symbol: string, deep = false) {
  const d = await json<{ fund: Fundamentals | null; sources?: string[] }>(
    "/api/fundamentals?symbol=" + encodeURIComponent(symbol) + (deep ? "&deep=1" : ""),
  );
  return d.fund;
}

export async function apiEnrich(symbols: string[]) {
  if (!symbols.length) return { funds: {} as Record<string, Fundamentals>, sources: {} as Record<string, string[]> };
  return json<{ funds: Record<string, Fundamentals>; sources: Record<string, string[]> }>("/api/enrich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbols }),
  });
}

export async function apiMacro() {
  return json<MacroPack>("/api/macro");
}

export type NoteResult =
  | {
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
      pickNotes?: PickNote[];
      notes?: HoldingNote[];
    }
  | { ok: false; error: string };

export async function apiNote(body: {
  symbol?: string;
  kind: NoteKind;
  question?: string;
  book?: BookBrief;
  chart?: ChartFactsIn;
  prior?: { fund?: string; qual?: string };
  fresh?: number;
}) {
  return json<NoteResult>("/api/note", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
}

export async function apiScreenBuild(body: { prompt: string; image?: string }) {
  return json<{ ok: true; filter: ScreenFilter; cached: boolean } | { ok: false; error: string }>("/api/screen-build", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
}
