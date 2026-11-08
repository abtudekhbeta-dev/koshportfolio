/** Which listings a liquidity scan is allowed to name. No invented symbols. */

export type BookName = { symbol: string; name: string; exchange: "NSE" | "BSE"; isin: string | null };

export type ListedBook = {
  symbols: BookName[];
  nse: number;
  bse: number;
  bseOnly: number;
  isinMatched: number;
  /** Same ticker on both exchanges, but no ISIN on at least one side, so they were not merged. */
  tickerOnly: number;
  isinConflict: number;
  bseReady: boolean;
  bseComplete: boolean;
  fingerprint: string;
  note: string;
};

export type BookInput = { symbol: string; name: string; isin?: string | null };

function stem(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
}

function bseId(symbol: string): string {
  return `${stem(symbol)}.BO`;
}

function cleanIsin(value: string | null | undefined): string | null {
  const isin = String(value || "").trim().toUpperCase();
  return /^IN[A-Z0-9]{10}$/.test(isin) ? isin : null;
}

/** Stable identity for a book. A changed membership or a partial BSE pull must not reuse an old run. */
export function bookFingerprint(symbols: { symbol: string }[], extra: string): string {
  let hash = 2166136261;
  const text = `${extra}|${symbols.map((row) => row.symbol).sort().join(",")}`;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function bseRetrievalStatus(input: { received: number; unique: number; total: number | null; pagesFailed: number; capped: boolean }): { complete: boolean; note: string } {
  if (input.total == null) return { complete: false, note: "Yahoo did not report a BSE total, so this book is not complete." };
  if (input.capped) return { complete: false, note: `The page cap stopped the BSE pull at ${input.unique} unique lines. Yahoo reported ${input.total}. This is not the full book.` };
  if (input.pagesFailed > 0) return { complete: false, note: `${input.pagesFailed} BSE pages failed. ${input.unique} unique lines came back against a reported ${input.total}. This is not the full book.` };
  if (input.received < input.total) return { complete: false, note: `BSE pages returned ${input.received} rows against a reported ${input.total}. This is not the full book.` };
  if (input.unique < input.total) return { complete: false, note: `BSE pages returned ${input.received} rows but only ${input.unique} unique lines against a reported ${input.total}. This is not the full book.` };
  const dup = input.received - input.unique;
  return {
    complete: true,
    note: dup > 0 ? `Every BSE page came back. ${input.unique} unique lines after ${dup} duplicate quotes. Yahoo reported ${input.total}.` : `Every BSE page came back. ${input.unique} lines, matching the reported total.`,
  };
}

/**
 * All listed keeps both exchange lines unless an ISIN on each side is the same.
 * A shared ticker without an ISIN is not treated as one security.
 */
export function composeListedBook(input: {
  nse: BookInput[];
  bse: BookInput[];
  mode: "all" | "nse" | "bse";
  bseReady: boolean;
  bseComplete?: boolean;
  bseError?: string;
}): ListedBook {
  const nseRows: BookName[] = [];
  const nseByStem = new Map<string, BookName>();
  const nseByIsin = new Map<string, BookName>();
  for (const row of input.nse) {
    const symbol = stem(row.symbol);
    if (!symbol || nseByStem.has(symbol)) continue;
    const item: BookName = { symbol, name: row.name || symbol, exchange: "NSE", isin: cleanIsin(row.isin) };
    nseByStem.set(symbol, item);
    if (item.isin && !nseByIsin.has(item.isin)) nseByIsin.set(item.isin, item);
    nseRows.push(item);
  }
  const bseRows: BookName[] = [];
  const bseSeen = new Set<string>();
  let isinMatched = 0;
  let tickerOnly = 0;
  let isinConflict = 0;
  let bseOnly = 0;
  for (const row of input.bse) {
    const symbol = bseId(row.symbol);
    if (bseSeen.has(symbol)) continue;
    bseSeen.add(symbol);
    const isin = cleanIsin(row.isin);
    const bare = stem(symbol);
    const item: BookName = { symbol, name: row.name || bare, exchange: "BSE", isin };
    bseRows.push(item);
    const sameIsin = isin ? nseByIsin.get(isin) : undefined;
    const sameStem = nseByStem.get(bare);
    if (sameIsin) isinMatched += 1;
    else if (sameStem && isin && sameStem.isin && sameStem.isin !== isin) isinConflict += 1;
    else if (sameStem && (!isin || !sameStem.isin)) tickerOnly += 1;
    else bseOnly += 1;
  }
  const complete = input.bseComplete === true;
  const status = complete ? "The BSE pull included every page." : "The BSE pull is not complete.";
  const identity = `ISIN matched ${isinMatched} dual listings, so the NSE line is the one on All listed. ${tickerOnly} shared a ticker but had no ISIN on at least one side, so both listings stay. ${isinConflict} shared a ticker and carried different ISINs, so both stay. A missing ISIN is not treated as a match.`;
  const bseNote = input.bseReady
    ? `${status} ${bseRows.length} BSE lines are in hand. ${identity}${input.bseError ? ` ${input.bseError}` : ""}`
    : `The BSE list did not answer${input.bseError ? ` (${input.bseError})` : ""}. BSE-only names are not in this scan. This is not full coverage.`;
  const allSymbols = nseRows.concat(
    bseRows.filter((row) => {
      if (row.isin && nseByIsin.has(row.isin)) return false;
      return true;
    }),
  );
  const chosen = input.mode === "nse" ? nseRows : input.mode === "bse" ? bseRows : allSymbols;
  const fingerprint = bookFingerprint(chosen, `${input.mode}|${complete ? "bse-full" : "bse-partial"}|${nseRows.length}`);
  const lead =
    input.mode === "nse"
      ? `NSE equity master, ${nseRows.length} names.`
      : input.mode === "bse"
        ? complete
          ? `BSE lines only, ${bseRows.length} names, including names that also list on NSE.`
          : `BSE lines only. ${bseRows.length} names were retrieved. This is not a complete BSE book.`
        : complete
          ? `All listed is ${chosen.length} names: ${nseRows.length} NSE and ${chosen.length - nseRows.length} BSE lines that were not the same ISIN.`
          : `All listed is ${chosen.length} names from the NSE master plus the BSE lines that arrived. The BSE side is not complete, so this is not the full listed book.`;
  return {
    symbols: chosen,
    nse: nseRows.length,
    bse: bseRows.length,
    bseOnly,
    isinMatched,
    tickerOnly,
    isinConflict,
    bseReady: input.bseReady,
    bseComplete: complete,
    fingerprint,
    note: `${lead} ${bseNote}`,
  };
}
