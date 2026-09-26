/** Security-master filters. No invented listings — only classify what a file actually printed. */

export type SecurityKind = "equity" | "etf" | "pref" | "warrant" | "reit" | "invit" | "other";
export type Board = "main" | "sme" | "gsm";

export type Security = {
  symbol: string;
  name: string;
  isin: string | null;
  series: string;
  listedOn: string | null;
  exchange: "NSE" | "BSE";
  /** Present only when a source file printed a BSE code. Never invented. */
  bseCode?: string | null;
  board: Board;
  active: boolean;
  kind: SecurityKind;
};

/** NSE series that are listed ordinary equity (including illiquid T2T and GSM). */
const EQUITY_SERIES = new Set(["EQ", "BE", "SM", "ST", "BZ"]);

export function classifySecurity(series: string, name: string): {
  kind: SecurityKind;
  board: Board;
  screener: boolean;
} {
  const s = String(series || "")
    .trim()
    .toUpperCase();
  const n = String(name || "");
  if (/\b(etf|bees)\b/i.test(n)) return { kind: "etf", board: "main", screener: false };
  if (s === "IV" || /\binvit\b/i.test(n)) return { kind: "invit", board: "main", screener: false };
  if (s === "RE" || /\breit\b/i.test(n)) return { kind: "reit", board: "main", screener: false };
  if (/^W\d/.test(s) || s === "WR" || (/\bwarrant/i.test(n) && !/warranty/i.test(n))) {
    return { kind: "warrant", board: "main", screener: false };
  }
  if (/^P\d/.test(s) || /\bpreference/i.test(n)) return { kind: "pref", board: "main", screener: false };

  let board: Board = "main";
  if (s === "SM" || s === "ST") board = "sme";
  if (s === "BZ") board = "gsm";
  if (EQUITY_SERIES.has(s)) return { kind: "equity", board, screener: true };
  return { kind: "other", board: "main", screener: false };
}

export function isScreenerEquity(series: string, name: string): boolean {
  return classifySecurity(series, name).screener;
}

/** Prefer EQ over BE/BZ when the same ISIN appears twice. */
export function dedupeByIsin(list: Security[]): Security[] {
  const rank = (s: Security) => (s.series === "EQ" ? 3 : s.series === "BE" ? 2 : s.series === "SM" ? 1 : 0);
  const byIsin = new Map<string, Security>();
  const noIsin: Security[] = [];
  for (const row of list) {
    const k = row.isin ? row.isin.toUpperCase() : "";
    if (!k) {
      noIsin.push(row);
      continue;
    }
    const have = byIsin.get(k);
    if (!have || rank(row) > rank(have)) byIsin.set(k, row);
  }
  const out = [...byIsin.values(), ...noIsin];
  const seen = new Set<string>();
  const uniq: Security[] = [];
  for (const row of out) {
    const k = row.symbol.toUpperCase();
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(row);
  }
  return uniq;
}

export function parseListingDate(raw: string): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = s.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{2,4})$/);
  if (dmy) {
    const mon: Record<string, string> = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    const m = mon[dmy[2].toLowerCase()];
    if (!m) return s;
    const y = dmy[3].length === 2 ? "20" + dmy[3] : dmy[3];
    return `${y}-${m}-${dmy[1].padStart(2, "0")}`;
  }
  return s;
}
