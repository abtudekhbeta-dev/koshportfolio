import { getSql } from "@/lib/db";
import type { Fundamentals } from "./types.ts";

export type CachedFund = { fund: Fundamentals; sources: string[]; at: string };

function bare(s: string) {
  return String(s || "")
    .replace(/\.(NS|BO)$/i, "")
    .toUpperCase();
}

function parseRow(row: { symbol: string; fund: string; sources: string; at: string | Date }): CachedFund | null {
  try {
    const fund = JSON.parse(row.fund) as Fundamentals;
    if (!fund || typeof fund !== "object") return null;
    let sources: string[] = [];
    try {
      const s = JSON.parse(row.sources || "[]");
      if (Array.isArray(s)) sources = s.map(String);
    } catch {
      sources = [];
    }
    const at = typeof row.at === "string" ? row.at : row.at instanceof Date ? row.at.toISOString() : "";
    return { fund, sources, at };
  } catch {
    return null;
  }
}

/** Load cached filings for these tickers. Empty map on a quiet miss or a DB blip. */
export async function loadCompanyFunds(symbols: string[]): Promise<Map<string, CachedFund>> {
  const out = new Map<string, CachedFund>();
  const keys = [...new Set(symbols.map(bare).filter(Boolean))];
  if (!keys.length) return out;
  try {
    const sql = await getSql();
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const rows = await sql.query<{ symbol: string; fund: string; sources: string; at: string }>(
      `select symbol, fund, sources, at from company_funds where symbol in (${placeholders})`,
      keys,
    );
    for (const row of rows) {
      const parsed = parseRow(row);
      if (!parsed) continue;
      out.set(bare(row.symbol), parsed);
    }
  } catch {
    /* preview DB not ready, or a transient Neon blip — live card still works */
  }
  return out;
}

/** Upsert one company at a time. Never a bulk wipe. */
export async function upsertCompanyFunds(
  funds: Record<string, Fundamentals | null | undefined>,
  sources: Record<string, string[] | undefined> = {},
): Promise<void> {
  const entries = Object.entries(funds).filter(([, f]) => f && typeof f === "object") as [string, Fundamentals][];
  if (!entries.length) return;
  try {
    const sql = await getSql();
    for (const [sym, fund] of entries) {
      const key = bare(sym || fund.symbol);
      if (!key) continue;
      const src = sources[sym] || sources[key] || [];
      await sql.query(
        `insert into company_funds (symbol, fund, sources, at)
         values ($1, $2, $3, now())
         on conflict (symbol) do update set fund = excluded.fund, sources = excluded.sources, at = excluded.at`,
        [key, JSON.stringify(fund), JSON.stringify(src)],
      );
    }
  } catch {
    /* keep the live response even if the cache write fails */
  }
}
