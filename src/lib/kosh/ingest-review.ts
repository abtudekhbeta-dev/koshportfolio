/**
 * Review layer for holdings and Path uploads.
 * Interprets structure and classifies rows. It does not price a portfolio,
 * compute XIRR, or decide that a missing name was sold.
 */
import { baseSym, storedSymbol } from "./sectors.ts";
import { redactSensitive } from "./sanitize.ts";
import type { AiFailureClass, Holding, ImportAiStatus, ImportRecord, TradeLine } from "./types.ts";

const TICKER = /^[A-Z][A-Z0-9.&-]{0,20}$/;
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const BANNED_KEYS = new Set([
  "qty",
  "quantity",
  "price",
  "avg",
  "average",
  "value",
  "gross",
  "net",
  "fees",
  "tax",
  "taxes",
  "xirr",
  "pnl",
  "amount",
  "nav",
  "weight",
]);

export type ProposalKind = "symbol" | "date" | "side" | "header" | "classify";

export type Proposal = {
  kind: ProposalKind;
  row: number;
  field: string;
  from: string;
  to: string;
  reason: string;
};

/** qty × price. Null when either input is not a positive finite number. */
export function grossValue(qty: number, price: number): number | null {
  if (!Number.isFinite(qty) || !Number.isFinite(price) || !(qty > 0) || !(price > 0)) return null;
  return qty * price;
}

/**
 * Gross = quantity × price when the file omitted it.
 * A stated gross that disagrees is a conflict: neither figure is chosen.
 */
export function deriveGross(
  qty: number,
  price: number,
  stated?: number | null,
): { gross: number | null; derived: boolean; conflict: boolean } {
  const calc = grossValue(qty, price);
  const hasStated = stated != null && Number.isFinite(stated) && stated > 0;
  if (!hasStated) return { gross: calc, derived: calc != null, conflict: false };
  if (calc == null) return { gross: stated as number, derived: false, conflict: false };
  const conflict = Math.abs((stated as number) - calc) > Math.max(0.05, calc * 0.005);
  if (conflict) return { gross: null, derived: false, conflict: true };
  return { gross: calc, derived: false, conflict: false };
}

function normName(s: string) {
  return String(s || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
}

function stem(s: string) {
  return baseSym(s).replace(/_(SM|X|BE|EQ|T|XT)$/i, "");
}

export type HoldingChange = {
  symbol: string;
  name: string;
  beforeQty: number;
  afterQty: number;
  beforeAvg: number | null;
  afterAvg: number | null;
  qty: boolean;
  cost: boolean;
  large: boolean;
};

export type HoldingsDiff = {
  fresh: Holding[];
  changed: HoldingChange[];
  unchanged: number;
  /** In the portfolio, absent from this file. Never a delete list. */
  missingFromFile: Holding[];
  /** Two incoming rows claim the same existing name. */
  ambiguous: { symbol: string; rows: number }[];
};

function matchKey(existing: Holding[], incoming: Holding): string | null {
  const byStem = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const h of existing) {
    const k = baseSym(h.symbol);
    byStem.set(stem(h.symbol), k);
    const n = normName(h.name);
    if (n) byName.set(n, k);
  }
  const k = baseSym(incoming.symbol);
  if (existing.some((h) => baseSym(h.symbol) === k)) return k;
  return byStem.get(stem(incoming.symbol)) || byName.get(normName(incoming.name)) || null;
}

/** Compare a statement with the book. Missing names stay missing — they are not sales. */
export function holdingsDiff(existing: Holding[], incoming: Holding[]): HoldingsDiff {
  const have = new Map(existing.map((h) => [baseSym(h.symbol), h]));
  const claimed = new Map<string, number>();
  const fresh: Holding[] = [];
  const changed: HoldingChange[] = [];
  let unchanged = 0;
  for (const row of incoming) {
    const key = matchKey(existing, row);
    if (!key || !have.has(key)) {
      fresh.push(row);
      continue;
    }
    claimed.set(key, (claimed.get(key) || 0) + 1);
    const cur = have.get(key)!;
    const qty = cur.qty !== row.qty;
    const cost = (cur.avg ?? null) !== (row.avg ?? null) && row.avg != null && row.avg > 0 && cur.avg !== row.avg;
    const large = cur.qty > 0 && qty && Math.abs(row.qty - cur.qty) / cur.qty > 0.5;
    if (!qty && !cost) unchanged += 1;
    else {
      changed.push({
        symbol: cur.symbol,
        name: cur.name || row.name,
        beforeQty: cur.qty,
        afterQty: row.qty,
        beforeAvg: cur.avg ?? null,
        afterAvg: row.avg ?? null,
        qty,
        cost,
        large,
      });
    }
  }
  const missingFromFile = existing.filter((h) => !claimed.has(baseSym(h.symbol)));
  const ambiguous: HoldingsDiff["ambiguous"] = [];
  for (const [key, n] of claimed) {
    if (n > 1) {
      const h = have.get(key);
      ambiguous.push({ symbol: h?.symbol || key, rows: n });
    }
  }
  return { fresh, changed, unchanged, missingFromFile, ambiguous };
}

function priceKey(n: number) {
  if (!Number.isFinite(n)) return "";
  return String(Math.round(n * 10000) / 10000);
}

/** Instrument, side, calendar day, clock, quantity, and price. Date + symbol is not enough. */
export function tradeComposite(t: TradeLine): string {
  return [baseSym(t.symbol), t.side, (t.date || "").slice(0, 10), t.boughtAt || "", String(t.qty), priceKey(t.price)].join("|");
}

export type TradeReconcile = {
  fresh: TradeLine[];
  /** Same broker id and the same composite. mergeTradeLines will skip these. */
  brokerDuplicates: TradeLine[];
  /** Same broker id, different quantity, price, day, or side. Not overwritten. */
  conflicts: TradeLine[];
  /** Composite hit without a shared broker id. Not removed unless the user confirms. */
  ambiguous: TradeLine[];
  invalid: TradeLine[];
};

export function reconcileTrades(existing: TradeLine[], incoming: TradeLine[]): TradeReconcile {
  const byId = new Map<string, TradeLine>();
  for (const t of existing || []) {
    const id = String(t.id || "").trim();
    if (id && !byId.has(id)) byId.set(id, t);
  }
  const seenIncoming = new Set<string>();
  const composites = new Map<string, number>();
  for (const t of existing || []) {
    const c = tradeComposite(t);
    composites.set(c, (composites.get(c) || 0) + 1);
  }
  const fresh: TradeLine[] = [];
  const brokerDuplicates: TradeLine[] = [];
  const conflicts: TradeLine[] = [];
  const ambiguous: TradeLine[] = [];
  const invalid: TradeLine[] = [];
  for (const t of incoming || []) {
    if (!(t.qty > 0) || (t.side !== 1 && t.side !== -1) || !String(t.symbol || "").trim()) {
      invalid.push(t);
      continue;
    }
    const id = String(t.id || "").trim();
    if (id && (byId.has(id) || seenIncoming.has(id))) {
      const prev = byId.get(id);
      if (prev && tradeComposite(prev) !== tradeComposite(t)) conflicts.push(t);
      else brokerDuplicates.push(t);
      continue;
    }
    if (id) seenIncoming.add(id);
    const hit = composites.get(tradeComposite(t)) || 0;
    if (hit > 0 && !id) ambiguous.push(t);
    else fresh.push(t);
  }
  return { fresh, brokerDuplicates, conflicts, ambiguous, invalid };
}

/** Drop broker-id duplicates always. Drop composite matches only after an explicit confirm. */
export function tradesToCommit(incoming: TradeLine[], existing: TradeLine[], skipAmbiguous: boolean): TradeLine[] {
  const rec = reconcileTrades(existing, incoming);
  const drop = new Set<TradeLine>([...rec.brokerDuplicates, ...rec.conflicts, ...(skipAmbiguous ? rec.ambiguous : [])]);
  return incoming.filter((t) => !rec.invalid.includes(t) && !drop.has(t));
}

function tokens(source: string): string[] {
  return source
    .toUpperCase()
    .split(/[^A-Z0-9.&-]+/)
    .filter(Boolean);
}

function unambiguousDate(source: string, iso: string): boolean {
  const m = ISO.exec(iso);
  if (!m) return false;
  const y = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const dt = new Date(Date.UTC(y, month - 1, day));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) return false;
  if (source.includes(iso)) return true;
  const nums = (source.match(/\d+/g) || []).map((n) => Number(n));
  if (!nums.includes(y) || !nums.includes(month) || !nums.includes(day)) return false;
  if (month !== day && month <= 12 && day <= 12) return false;
  return true;
}

function sideWord(source: string): "buy" | "sell" | "both" | "none" {
  const s = source.toLowerCase();
  const buy = /\b(buy|bought|purchase|purchased)\b/.test(s);
  const sell = /\b(sell|sold)\b/.test(s);
  if (buy && sell) return "both";
  if (buy) return "buy";
  if (sell) return "sell";
  return "none";
}

export function validateProposal(sourceText: string, raw: unknown): { ok: true; proposal: Proposal } | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, reason: "Proposal is not an object." };
  const row = raw as Record<string, unknown>;
  for (const key of Object.keys(row)) {
    if (BANNED_KEYS.has(key.toLowerCase())) return { ok: false, reason: "A proposal cannot carry a calculated amount." };
  }
  const kind = String(row.kind || "");
  if (kind !== "symbol" && kind !== "date" && kind !== "side" && kind !== "header" && kind !== "classify") {
    return { ok: false, reason: "Unknown proposal kind." };
  }
  const field = String(row.field || kind).slice(0, 40);
  if (kind !== "header" && BANNED_KEYS.has(field.toLowerCase())) return { ok: false, reason: "That field is calculated, not interpreted." };
  const to = String(row.to ?? "").trim().slice(0, 40);
  const from = String(row.from ?? "").trim().slice(0, 80);
  const reason = String(row.reason ?? "").trim().slice(0, 180);
  const index = Number(row.row);
  if (!Number.isInteger(index) || index < 0 || index > 100000) return { ok: false, reason: "Row index is not valid." };
  if (!to) return { ok: false, reason: "Proposal has no value." };
  const source = String(sourceText || "");
  if (kind === "symbol") {
    const ticker = to.toUpperCase();
    if (!TICKER.test(ticker)) return { ok: false, reason: "Proposed symbol is not a ticker." };
    if (!tokens(source).includes(ticker)) return { ok: false, reason: "Proposed symbol is not in the source row." };
    return { ok: true, proposal: { kind, row: index, field, from, to: ticker, reason } };
  }
  if (kind === "date") {
    if (!unambiguousDate(source, to)) return { ok: false, reason: "Date is not in the source, or the day and month are ambiguous." };
    return { ok: true, proposal: { kind, row: index, field, from, to, reason } };
  }
  if (kind === "side") {
    const next = to.toLowerCase();
    if (next !== "buy" && next !== "sell") return { ok: false, reason: "Side must be buy or sell." };
    const word = sideWord(source);
    if (word === "none" || word === "both" || word !== next) return { ok: false, reason: "Side is not supported by the source row." };
    return { ok: true, proposal: { kind, row: index, field, from, to: next, reason } };
  }
  if (kind === "header") {
    const canon = to.toLowerCase();
    if (!["symbol", "name", "qty", "price", "date", "side", "isin"].includes(canon)) {
      return { ok: false, reason: "Header target is not a known field." };
    }
    if (!from || !source.toLowerCase().includes(from.toLowerCase())) return { ok: false, reason: "Header text is not in the source." };
    return { ok: true, proposal: { kind, row: index, field, from, to: canon, reason } };
  }
  const label = to.toLowerCase();
  if (!["holding", "buy", "sell", "dividend", "charge", "opening", "closing"].includes(label)) {
    return { ok: false, reason: "Classification is not a known row type." };
  }
  if (label === "buy" || label === "sell") {
    const word = sideWord(source);
    if (word !== label) return { ok: false, reason: "Classification is not supported by the source row." };
  } else if (!source.toLowerCase().includes(label)) {
    return { ok: false, reason: "Classification word is not in the source row." };
  }
  return { ok: true, proposal: { kind, row: index, field, from, to: label, reason } };
}

export function parseAiBody(raw: unknown): { ok: true; proposals: unknown[] } | { ok: false; aiClass: "malformed" | "schema" } {
  let body = raw;
  if (typeof raw === "string") {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) return { ok: false, aiClass: "malformed" };
    try {
      body = JSON.parse(raw.slice(start, end + 1));
    } catch {
      return { ok: false, aiClass: "malformed" };
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, aiClass: "malformed" };
  const proposals = (body as { proposals?: unknown }).proposals;
  if (!Array.isArray(proposals)) return { ok: false, aiClass: "schema" };
  return { ok: true, proposals };
}

export function acceptProposals(sources: string[], rawList: unknown[]): { proposals: Proposal[]; rejected: number } {
  const proposals: Proposal[] = [];
  let rejected = 0;
  for (const raw of rawList) {
    const index = raw && typeof raw === "object" ? Number((raw as { row?: unknown }).row) : NaN;
    const source = Number.isInteger(index) && index >= 0 && index < sources.length ? sources[index] : "";
    const got = validateProposal(source, raw);
    if (!got.ok) rejected += 1;
    else proposals.push(got.proposal);
  }
  return { proposals, rejected };
}

export function applySymbol(symbol: string, proposal: Proposal, source: string): string {
  const again = validateProposal(source, proposal);
  if (!again.ok || again.proposal.kind !== "symbol") return symbol;
  if (!proposal.from) return symbol;
  if (storedSymbol(proposal.from) !== storedSymbol(symbol) && baseSym(proposal.from) !== baseSym(symbol)) return symbol;
  return again.proposal.to;
}

export function applyDate(date: string | null, proposal: Proposal, source: string): string | null {
  const again = validateProposal(source, proposal);
  if (!again.ok || again.proposal.kind !== "date") return date;
  return again.proposal.to;
}

export function applySide(side: 1 | -1, proposal: Proposal, source: string): 1 | -1 {
  const again = validateProposal(source, proposal);
  if (!again.ok || again.proposal.kind !== "side") return side;
  return again.proposal.to === "sell" ? -1 : 1;
}

export function classifyAiFailure(input: { status?: number; message?: string; name?: string }): AiFailureClass {
  const msg = `${input.message || ""}`.toLowerCase();
  const name = input.name || "";
  const status = input.status;
  if (name === "AbortError" || name === "TimeoutError" || status === 408 || /timed out|timeout|aborted/.test(msg)) return "timeout";
  if (status === 401 || /unauthor|invalid api key|auth/.test(msg)) return "auth";
  if (status === 402 || /quota|credit|exhaust/.test(msg)) return "quota";
  if (status === 429 || /rate limit|too many/.test(msg)) return "rate";
  if (status === 403) return /quota|credit|exhaust/.test(msg) ? "quota" : "auth";
  if (/schema|proposal/.test(msg)) return "schema";
  if (/json|unreadable|malformed|unexpected token/.test(msg)) return "malformed";
  if ((status && status >= 500) || /network|fetch|econn|socket/.test(msg)) return "network";
  if (!status && /not available|unconfigured|missing api/.test(msg)) return "unconfigured";
  return "malformed";
}

/** One retry only for a timeout or a 5xx. Never for auth, quota, or 429. */
export function shouldRetryAi(aiClass: AiFailureClass, alreadyRetried: boolean): boolean {
  if (alreadyRetried) return false;
  return aiClass === "timeout" || aiClass === "network";
}

function clip(s: string, n: number) {
  return redactSensitive(s).replace(/\s+/g, " ").trim().slice(0, n);
}

export type ReviewPayload = {
  filename?: string;
  headers: string[];
  rows: string[][];
};

/** Headers plus a short redacted sample. No quantities are invented here. */
export function reviewPayload(input: {
  filename?: string;
  headers?: string[];
  rows?: string[][];
  holdings?: Pick<Holding, "symbol" | "name" | "qty" | "avg" | "date">[];
  trades?: Pick<TradeLine, "symbol" | "name" | "qty" | "price" | "date" | "side">[];
}): ReviewPayload & { sources: string[] } {
  const headers = (input.headers || []).slice(0, 12).map((h) => clip(String(h), 40));
  const rawRows = (input.rows || []).slice(0, 8).map((r) => r.slice(0, 8).map((c) => clip(String(c), 60)));
  const parsed: string[][] = [];
  for (const h of (input.holdings || []).slice(0, 8)) {
    parsed.push([clip(h.symbol, 24), clip(h.name, 40), String(h.qty), h.avg != null ? String(h.avg) : "", h.date || ""].map((c) => clip(c, 60)));
  }
  for (const t of (input.trades || []).slice(0, 8)) {
    if (parsed.length >= 12) break;
    parsed.push(
      [clip(t.symbol, 24), clip(t.name, 40), t.side === -1 ? "sell" : "buy", String(t.qty), String(t.price), t.date || ""].map((c) => clip(c, 60)),
    );
  }
  const rows = [...rawRows, ...parsed].slice(0, 12);
  const head = headers.length ? headers : ["symbol", "name", "detail"];
  const sources = rows.map((r) => r.join(" | "));
  return { filename: input.filename ? clip(input.filename, 80) : undefined, headers: head, rows, sources };
}

export function makeImportRecord(
  partial: Omit<ImportRecord, "id" | "at"> & { id?: string; at?: number },
): ImportRecord {
  return {
    id: partial.id || `imp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: partial.at || Date.now(),
    kind: partial.kind,
    filename: partial.filename ? clip(partial.filename, 80) : undefined,
    rowsRead: Math.max(0, Math.floor(partial.rowsRead || 0)),
    accepted: Math.max(0, Math.floor(partial.accepted || 0)),
    ignored: Math.max(0, Math.floor(partial.ignored || 0)),
    duplicates: Math.max(0, Math.floor(partial.duplicates || 0)),
    ambiguous: Math.max(0, Math.floor(partial.ambiguous || 0)),
    missingPrices: Math.max(0, Math.floor(partial.missingPrices || 0)),
    unresolved: Math.max(0, Math.floor(partial.unresolved || 0)),
    aiStatus: partial.aiStatus,
    aiClass: partial.aiClass,
    fallback: Boolean(partial.fallback),
    applied: Math.max(0, Math.floor(partial.applied || 0)),
    note: partial.note ? clip(partial.note, 180) : undefined,
    detected: partial.detected != null ? Math.max(0, Math.floor(partial.detected)) : undefined,
    rejected: partial.rejected != null ? Math.max(0, Math.floor(partial.rejected)) : undefined,
    skipped: partial.skipped != null ? Math.max(0, Math.floor(partial.skipped)) : undefined,
    flagged: partial.flagged != null ? Math.max(0, Math.floor(partial.flagged)) : undefined,
    corrections: partial.corrections != null ? Math.max(0, Math.floor(partial.corrections)) : undefined,
    commit: partial.commit,
    affectedFrom: partial.affectedFrom,
    touches: partial.touches?.slice(0, 80),
  };
}

export function aiStatusLabel(status: ImportAiStatus, aiClass?: AiFailureClass, suggestions = 0): string {
  if (status === "not-run") return "AI interpretation has not run.";
  if (status === "ok") return suggestions > 0 ? "AI interpretation completed" : "No additional suggestions";
  if (status === "unconfigured" || status === "unavailable") return "AI unavailable — using standard parser";
  const why =
    aiClass === "quota"
      ? "credits are exhausted"
      : aiClass === "rate"
        ? "the service is rate-limited"
        : aiClass === "auth"
          ? "the service rejected the key"
          : aiClass === "timeout"
            ? "the review timed out"
            : aiClass === "schema" || aiClass === "malformed"
              ? "the reply was not usable"
              : "the review failed";
  return `AI unavailable — using standard parser (${why})`;
}
