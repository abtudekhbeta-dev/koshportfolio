/** Published index-basket weights and the treemap that sizes tiles by those weights. */

export type BasketRow = {
  symbol: string | null;
  name: string;
  weight: number;
  sector: string | null;
  searchId?: string | null;
};

export type ParsedBasket = {
  source: string;
  benchmark: string | null;
  asOf: string | null;
  rows: BasketRow[];
};

export type Tile = { x: number; y: number; w: number; h: number };

export function benchKey(raw: string) {
  let s = raw.toLowerCase();
  s = s.replace(/&/g, " and ");
  s = s.replace(/\btotal return\b/g, " ");
  s = s.replace(/\btri\b/g, " ");
  s = s.replace(/\bindex\b/g, " ");
  s = s.replace(/\binfra\b/g, "infrastructure");
  s = s.replace(/\bservices\b/g, "service");
  s = s.replace(/\bsector\b/g, " ");
  s = s.replace(/\band\b/g, " ");
  s = s.replace(/\bweighted\b/g, "weight");
  s = s.replace(/\blargemidcap\b/g, "large midcap");
  s = s.replace(/\bmidsmallcap\b/g, "mid small cap");
  s = s.replace(/\bsmallcap(\d+)/g, "smallcap $1");
  s = s.replace(/\bmidcap(\d+)/g, "midcap $1");
  s = s.replace(/\bindia\b/g, " ");
  s = s.replace(/[^a-z0-9]+/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export function benchmarkMatches(indexName: string, benchmark: string, aliases: string[] = []) {
  const bench = benchKey(benchmark);
  if (!bench) return false;
  return [indexName, ...aliases].some((name) => benchKey(name) === bench);
}

export function normCo(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(ltd|limited|inc|corp|corporation|company|co|plc)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildNameIndex(rows: { symbol: string; name: string }[]) {
  const map = new Map<string, string>();
  for (const row of rows) {
    const key = normCo(row.name);
    if (key && !map.has(key)) map.set(key, row.symbol.toUpperCase());
  }
  return map;
}

export function symbolForName(name: string, index: Map<string, string>) {
  const key = normCo(name);
  if (!key) return null;
  return index.get(key) || null;
}

export function weightSum(rows: { weight: number }[]) {
  return rows.reduce((sum, row) => sum + (Number.isFinite(row.weight) ? row.weight : 0), 0);
}

/** A full published basket, not a top-10 snippet and not an empty file. */
export function acceptBasket(rows: { weight: number }[]) {
  if (rows.length < 5) return false;
  const sum = weightSum(rows);
  return sum >= 90 && sum <= 105;
}

type EtfHeader = { nseScriptCode?: string | null; displayName?: string | null; industryName?: string | null };

export function parseEtfPayload(payload: unknown): ParsedBasket | null {
  if (!payload || typeof payload !== "object") return null;
  const page = payload as {
    etfData?: { header?: { displayName?: string } };
    etfInfoData?: { benchmarkIndex?: string };
    etfHoldingsData?: { holdings?: Array<{ isin?: string; holdingSharePercentage?: number }> };
    companyHeadersByIsin?: Record<string, EtfHeader>;
  };
  const holdings = page.etfHoldingsData?.holdings;
  if (!Array.isArray(holdings) || !holdings.length) return null;
  const headers = page.companyHeadersByIsin || {};
  const rows: BasketRow[] = [];
  for (const holding of holdings) {
    const weight = Number(holding.holdingSharePercentage);
    if (!(weight > 0)) continue;
    const header = holding.isin ? headers[holding.isin] : undefined;
    const symbol = String(header?.nseScriptCode || "").trim().toUpperCase() || null;
    const name = String(header?.displayName || holding.isin || "").trim();
    if (!name) continue;
    rows.push({
      symbol,
      name,
      weight,
      sector: header?.industryName ? String(header.industryName) : null,
    });
  }
  if (!rows.length) return null;
  rows.sort((a, b) => b.weight - a.weight);
  return {
    source: String(page.etfData?.header?.displayName || "Tracking ETF"),
    benchmark: page.etfInfoData?.benchmarkIndex ? String(page.etfInfoData.benchmarkIndex) : null,
    asOf: null,
    rows,
  };
}

export function parseEtfHtml(html: string): ParsedBasket | null {
  const marker = 'id="__NEXT_DATA__"';
  const at = html.indexOf(marker);
  if (at < 0) return null;
  const open = html.indexOf(">", at);
  const close = html.indexOf("</script>", open);
  if (open < 0 || close < 0) return null;
  let data: { props?: { pageProps?: unknown } };
  try {
    data = JSON.parse(html.slice(open + 1, close)) as { props?: { pageProps?: unknown } };
  } catch {
    return null;
  }
  return parseEtfPayload(data.props?.pageProps);
}

export function parseSchemePayload(payload: unknown): ParsedBasket | null {
  if (!payload || typeof payload !== "object") return null;
  const fund = payload as {
    scheme_name?: string;
    fund_name?: string;
    benchmark_name?: string;
    holdings?: unknown[];
  };
  if (!Array.isArray(fund.holdings)) return null;
  const rows: BasketRow[] = [];
  let asOf: string | null = null;
  for (const raw of fund.holdings) {
    if (!Array.isArray(raw) || raw.length < 9) continue;
    const asset = String(raw[3] || "");
    const instrument = String(raw[5] || "");
    if (asset !== "EQUITY" || instrument !== "Equity") continue;
    const weight = Number(raw[8]);
    if (!(weight > 0)) continue;
    const name = String(raw[2] || "").trim();
    if (!name) continue;
    const dated = String(raw[1] || "").trim();
    if (dated && (!asOf || dated > asOf)) asOf = dated;
    rows.push({
      symbol: null,
      name,
      weight,
      sector: raw[4] ? String(raw[4]) : null,
      searchId: raw[11] ? String(raw[11]) : null,
    });
  }
  if (!rows.length) return null;
  rows.sort((a, b) => b.weight - a.weight);
  return {
    source: String(fund.scheme_name || fund.fund_name || "Index fund"),
    benchmark: fund.benchmark_name ? String(fund.benchmark_name) : null,
    asOf,
    rows,
  };
}

type SquarifyItem = { i: number; area: number };

function worst(row: SquarifyItem[], side: number) {
  const sum = row.reduce((total, item) => total + item.area, 0);
  let max = 0;
  let min = Infinity;
  for (const item of row) {
    if (item.area > max) max = item.area;
    if (item.area < min) min = item.area;
  }
  const side2 = side * side;
  const sum2 = sum * sum;
  return Math.max((side2 * max) / sum2, sum2 / (side2 * min));
}

function placeRow(row: SquarifyItem[], rect: { x: number; y: number; w: number; h: number }, out: Tile[]) {
  const sum = row.reduce((total, item) => total + item.area, 0);
  if (rect.w >= rect.h) {
    const rowW = sum / rect.h;
    let y = rect.y;
    for (const item of row) {
      const h = item.area / rowW;
      out[item.i] = { x: rect.x, y, w: rowW, h };
      y += h;
    }
    rect.x += rowW;
    rect.w -= rowW;
  } else {
    const rowH = sum / rect.w;
    let x = rect.x;
    for (const item of row) {
      const w = item.area / rowH;
      out[item.i] = { x, y: rect.y, w, h: rowH };
      x += w;
    }
    rect.y += rowH;
    rect.h -= rowH;
  }
}

/** Squarified treemap. Tile area is proportional to weight. Coordinates are in the same space as width/height. */
export function treemap(weights: number[], width: number, height: number): Tile[] {
  const usable = weights.map((weight, i) => ({ i, weight: weight > 0 ? weight : 0 })).filter((row) => row.weight > 0);
  const out: Tile[] = weights.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
  if (!usable.length || !(width > 0) || !(height > 0)) return out;
  const total = usable.reduce((sum, row) => sum + row.weight, 0);
  const items: SquarifyItem[] = usable
    .map((row) => ({ i: row.i, area: (row.weight / total) * width * height }))
    .sort((a, b) => b.area - a.area);
  const rect = { x: 0, y: 0, w: width, h: height };
  let rest = items;
  while (rest.length) {
    const side = Math.min(rect.w, rect.h);
    const row: SquarifyItem[] = [];
    while (rest.length) {
      const next = rest[0];
      const trial = row.concat(next);
      if (!row.length || worst(trial, side) <= worst(row, side)) {
        row.push(next);
        rest = rest.slice(1);
      } else break;
    }
    placeRow(row, rect, out);
  }
  return out;
}
