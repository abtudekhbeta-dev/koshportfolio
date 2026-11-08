/** Which listings a liquidity scan is allowed to name. No invented symbols. */

export type BookName = { symbol: string; name: string; exchange: "NSE" | "BSE" };

export type ListedBook = {
  symbols: BookName[];
  nse: number;
  bse: number;
  bseOnly: number;
  dualSkipped: number;
  bseReady: boolean;
  note: string;
};

function stem(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
}

function bseId(symbol: string): string {
  return `${stem(symbol)}.BO`;
}

/**
 * All listed = every NSE line plus BSE lines whose ticker is not already on NSE.
 * BSE = every BSE line, including the dual-listed ones, so that listing can be inspected.
 * A shared ticker is not an ISIN match.
 */
export function composeListedBook(input: {
  nse: { symbol: string; name: string }[];
  bse: { symbol: string; name: string }[];
  mode: "all" | "nse" | "bse";
  bseReady: boolean;
  bseError?: string;
}): ListedBook {
  const nseRows: BookName[] = [];
  const nseStems = new Set<string>();
  for (const row of input.nse) {
    const symbol = stem(row.symbol);
    if (!symbol || nseStems.has(symbol)) continue;
    nseStems.add(symbol);
    nseRows.push({ symbol, name: row.name || symbol, exchange: "NSE" });
  }
  const bseRows: BookName[] = [];
  const bseSeen = new Set<string>();
  let bseOnly = 0;
  let dualSkipped = 0;
  for (const row of input.bse) {
    const symbol = bseId(row.symbol);
    if (bseSeen.has(symbol)) continue;
    bseSeen.add(symbol);
    const bare = stem(symbol);
    const dual = nseStems.has(bare);
    if (dual) dualSkipped += 1;
    else bseOnly += 1;
    bseRows.push({ symbol, name: row.name || bare, exchange: "BSE" });
  }
  const bseNote = input.bseReady
    ? `Yahoo's BSE equity screener returned ${bseRows.length} lines. ${bseOnly} tickers are not on the NSE master. ${dualSkipped} share an NSE ticker and are not repeated on All listed. That match is the ticker, not an ISIN, so a company with different codes can still appear twice.${input.bseError ? ` ${input.bseError}.` : ""}`
    : `The BSE list did not answer${input.bseError ? ` (${input.bseError})` : ""}. BSE-only names are not in this scan. This is not full coverage.`;
  if (input.mode === "nse") {
    return {
      symbols: nseRows,
      nse: nseRows.length,
      bse: bseRows.length,
      bseOnly,
      dualSkipped,
      bseReady: input.bseReady,
      note: `NSE equity master, ${nseRows.length} names. ${bseNote}`,
    };
  }
  if (input.mode === "bse") {
    return {
      symbols: bseRows,
      nse: nseRows.length,
      bse: bseRows.length,
      bseOnly,
      dualSkipped,
      bseReady: input.bseReady,
      note: input.bseReady
        ? `BSE lines only, ${bseRows.length} names, including dual-listed names. ${bseNote}`
        : bseNote,
    };
  }
  const symbols = nseRows.concat(bseRows.filter((row) => !nseStems.has(stem(row.symbol))));
  return {
    symbols,
    nse: nseRows.length,
    bse: bseRows.length,
    bseOnly,
    dualSkipped,
    bseReady: input.bseReady,
    note: input.bseReady
      ? `All listed is ${symbols.length} names: ${nseRows.length} NSE and ${bseOnly} BSE-only. ${bseNote}`
      : `All listed fell back to ${nseRows.length} NSE names. ${bseNote}`,
  };
}
