/** Holdings treemap input. Missing prices stay missing. Area is market value, never a return. */

export type HeatInput = {
  bookId: string;
  bookName: string;
  symbol: string;
  name?: string | null;
  qty: number;
  price: number | null;
  changePct: number | null;
  sector?: string | null;
};

export type HeatTile = {
  key: string;
  symbol: string;
  name: string;
  value: number;
  /** Share of priced market value, 0–100. Not a share of the whole book when prices are missing. */
  weightOfPriced: number;
  /** Share of the whole book. Null when any position has no price, so a partial map is not presented as complete. */
  weightOfBook: number | null;
  dayPct: number | null;
  dayAbs: number | null;
  books: string[];
  positions: number;
  sector: string;
};

export type HeatUnpriced = {
  symbol: string;
  name: string;
  books: string[];
};

export type HeatModel = {
  tiles: HeatTile[];
  unpriced: HeatUnpriced[];
  totalPriced: number;
  positions: number;
  pricedPositions: number;
  complete: boolean;
  bookNames: string[];
};

export function bareSymbol(symbol: string) {
  return String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
}

function cleanName(name: string | null | undefined, symbol: string) {
  const text = (name || "").trim();
  return text || bareSymbol(symbol);
}

/** Same symbol across selected books is summed. A missing price is listed, not given a zero value. */
export function buildHoldingHeat(rows: HeatInput[]): HeatModel {
  const books = new Map<string, string>();
  type Bucket = {
    symbol: string;
    name: string;
    value: number;
    dayAbs: number;
    dayPctWeighted: number;
    dayKnown: number;
    dayMissing: number;
    books: Set<string>;
    positions: number;
    sector: string;
  };
  const priced = new Map<string, Bucket>();
  const missing = new Map<string, HeatUnpriced>();
  let positions = 0;

  for (const row of rows) {
    if (!(row.qty > 0)) continue;
    const symbol = bareSymbol(row.symbol);
    if (!symbol) continue;
    positions += 1;
    books.set(row.bookId, row.bookName);
    const book = row.bookName || "Portfolio";
    const price = row.price != null && row.price > 0 && Number.isFinite(row.price) ? row.price : null;
    if (price == null) {
      const prev = missing.get(symbol);
      if (prev) {
        if (!prev.books.includes(book)) prev.books.push(book);
        if ((row.name || "").trim().length > prev.name.length) prev.name = cleanName(row.name, symbol);
      } else {
        missing.set(symbol, { symbol, name: cleanName(row.name, symbol), books: [book] });
      }
      continue;
    }
    const value = row.qty * price;
    let bucket = priced.get(symbol);
    if (!bucket) {
      bucket = { symbol, name: cleanName(row.name, symbol), value: 0, dayAbs: 0, dayPctWeighted: 0, dayKnown: 0, dayMissing: 0, books: new Set(), positions: 0, sector: row.sector && row.sector !== "Other" ? row.sector : "Other" };
      priced.set(symbol, bucket);
    }
    if (row.sector && row.sector !== "Other" && bucket.sector === "Other") bucket.sector = row.sector;
    if ((row.name || "").trim().length > bucket.name.length) bucket.name = cleanName(row.name, symbol);
    bucket.value += value;
    bucket.books.add(book);
    bucket.positions += 1;
    if (row.changePct == null || !Number.isFinite(row.changePct)) bucket.dayMissing += 1;
    else {
      bucket.dayAbs += value * (row.changePct / 100);
      bucket.dayPctWeighted += value * row.changePct;
      bucket.dayKnown += 1;
    }
  }

  const totalPriced = [...priced.values()].reduce((sum, row) => sum + row.value, 0);
  const complete = missing.size === 0 && priced.size > 0;
  const tiles: HeatTile[] = [...priced.values()]
    .filter((row) => row.value > 0)
    .map((row) => {
      const dayKnown = row.dayMissing === 0 && row.dayKnown > 0;
      return {
        key: row.symbol,
        symbol: row.symbol,
        name: row.name,
        value: row.value,
        weightOfPriced: totalPriced > 0 ? (row.value / totalPriced) * 100 : 0,
        weightOfBook: complete && totalPriced > 0 ? (row.value / totalPriced) * 100 : null,
        dayPct: dayKnown ? row.dayPctWeighted / row.value : null,
        dayAbs: dayKnown ? row.dayAbs : null,
        books: [...row.books],
        positions: row.positions,
        sector: row.sector || "Other",
      };
    })
    .sort((a, b) => b.value - a.value || a.symbol.localeCompare(b.symbol));

  return {
    tiles,
    unpriced: [...missing.values()].sort((a, b) => a.symbol.localeCompare(b.symbol)),
    totalPriced,
    positions,
    pricedPositions: [...priced.values()].reduce((sum, row) => sum + row.positions, 0),
    complete,
    bookNames: [...books.values()],
  };
}

export type ShownTile = HeatTile & { others?: HeatTile[]; members?: HeatTile[] };

/** Sector tiles. Area is the sum of member market values. Members stay inspectable. */
export function groupHeatSectors(tiles: HeatTile[]): ShownTile[] {
  const groups = new Map<string, HeatTile[]>();
  for (const tile of tiles) {
    const sector = tile.sector || "Other";
    const list = groups.get(sector) || [];
    list.push(tile);
    groups.set(sector, list);
  }
  const out: ShownTile[] = [];
  for (const [sector, members] of groups) {
    const value = members.reduce((sum, tile) => sum + tile.value, 0);
    if (!(value > 0)) continue;
    const dayMissing = members.some((tile) => tile.dayPct == null || tile.dayAbs == null);
    const weight = members.reduce((sum, tile) => sum + tile.weightOfPriced, 0);
    const bookWeight = members.every((tile) => tile.weightOfBook != null) ? members.reduce((sum, tile) => sum + (tile.weightOfBook || 0), 0) : null;
    out.push({
      key: `sector:${sector}`,
      symbol: sector,
      name: sector,
      sector,
      value,
      weightOfPriced: weight,
      weightOfBook: bookWeight,
      dayPct: dayMissing ? null : members.reduce((sum, tile) => sum + tile.value * (tile.dayPct || 0), 0) / value,
      dayAbs: dayMissing ? null : members.reduce((sum, tile) => sum + (tile.dayAbs || 0), 0),
      books: [...new Set(members.flatMap((tile) => tile.books))],
      positions: members.reduce((sum, tile) => sum + tile.positions, 0),
      members,
    });
  }
  return out.sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

/** Keeps the largest names readable. The tail stays in the weights; it is not dropped. */
export function foldHeatTail(tiles: HeatTile[], limit = 12): ShownTile[] {
  if (tiles.length <= limit) return tiles.map((tile) => ({ ...tile }));
  const head: ShownTile[] = tiles.slice(0, limit - 1).map((tile) => ({ ...tile }));
  const tail = tiles.slice(limit - 1);
  const value = tail.reduce((sum, tile) => sum + tile.value, 0);
  const dayMissing = tail.some((tile) => tile.dayPct == null || tile.dayAbs == null);
  const dayAbs = dayMissing ? null : tail.reduce((sum, tile) => sum + (tile.dayAbs || 0), 0);
  const dayPct = dayMissing ? null : tail.reduce((sum, tile) => sum + tile.value * (tile.dayPct || 0), 0) / value;
  const weight = tail.reduce((sum, tile) => sum + tile.weightOfPriced, 0);
  const bookWeight = tail.every((tile) => tile.weightOfBook != null) ? tail.reduce((sum, tile) => sum + (tile.weightOfBook || 0), 0) : null;
  head.push({
    key: "others",
    symbol: "Others",
    name: `${tail.length} smaller holdings`,
    value,
    weightOfPriced: weight,
    weightOfBook: bookWeight,
    dayPct,
    dayAbs,
    books: [...new Set(tail.flatMap((tile) => tile.books))],
    positions: tail.reduce((sum, tile) => sum + tile.positions, 0),
    sector: "Other",
    others: tail,
  });
  return head;
}

/** Unknown or fallback sectors stay out of a named industry. This is a label, not a guess. */
export function displaySector(sector: string | null | undefined) {
  const name = (sector || "").trim();
  if (!name || name === "Other") return "Unclassified";
  return name;
}
