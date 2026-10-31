/** Portfolio characteristics weighted by current holding weight. Not factor betas. */

export type ExposureHolding = {
  symbol: string;
  name: string;
  weight: number;
  sector: string;
  cap: string;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  roce: number | null;
  de: number | null;
  salesCagr3: number | null;
  profitCagr3: number | null;
  ret1y: number | null;
};

export type ExposureSlice = { label: string; weight: number };

export type ExposurePack = {
  sectors: ExposureSlice[];
  caps: ExposureSlice[];
  earningsYield: number | null;
  portfolioPe: number | null;
  peCoverage: number;
  peExcluded: number;
  pb: number | null;
  pbCoverage: number;
  roe: number | null;
  roce: number | null;
  salesCagr: number | null;
  profitCagr: number | null;
  momentum: number | null;
  qualityWeight: number;
  growthWeight: number;
  cheapWeight: number;
  richWeight: number;
  negativeEarningsWeight: number;
  missingWeight: number;
  top1: number;
  top5: number;
  top10: number;
  largest: { symbol: string; name: string; weight: number } | null;
  sectorHhi: number | null;
  notes: string[];
};

function num(v: number | null | undefined): number | null {
  return v != null && Number.isFinite(v) ? v : null;
}

function weighted(rows: ExposureHolding[], pick: (row: ExposureHolding) => number | null): { value: number | null; coverage: number } {
  let acc = 0;
  let w = 0;
  for (const row of rows) {
    const v = pick(row);
    if (v == null || !(row.weight > 0)) continue;
    acc += row.weight * v;
    w += row.weight;
  }
  return { value: w > 0 ? acc / w : null, coverage: w };
}

function buckets(rows: ExposureHolding[], key: (row: ExposureHolding) => string): ExposureSlice[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const label = key(row) || "Unclassified";
    map.set(label, (map.get(label) || 0) + row.weight);
  }
  return [...map.entries()]
    .map(([label, weight]) => ({ label, weight }))
    .sort((a, b) => b.weight - a.weight);
}

export function portfolioExposure(rows: ExposureHolding[]): ExposurePack {
  const clean = rows.filter((row) => row.weight > 0 && row.symbol);
  const total = clean.reduce((sum, row) => sum + row.weight, 0) || 1;
  const norm = clean.map((row) => ({ ...row, weight: row.weight / total }));
  const ordered = [...norm].sort((a, b) => b.weight - a.weight);
  const sumTop = (n: number) => ordered.slice(0, n).reduce((sum, row) => sum + row.weight, 0);

  let yieldAcc = 0;
  let yieldW = 0;
  let excluded = 0;
  let missing = 0;
  let cheap = 0;
  let rich = 0;
  let quality = 0;
  let growth = 0;
  for (const row of norm) {
    const pe = num(row.pe);
    if (pe == null) missing += row.weight;
    else if (pe <= 0) excluded += row.weight;
    else {
      yieldAcc += row.weight * (1 / pe);
      yieldW += row.weight;
      if (pe < 15) cheap += row.weight;
      if (pe > 35) rich += row.weight;
    }
    const roe = num(row.roe);
    const de = num(row.de);
    if (roe != null && roe >= 15 && (de == null || de <= 1)) quality += row.weight;
    const sales = num(row.salesCagr3);
    if (sales != null && sales >= 12) growth += row.weight;
  }
  const earningsYield = yieldW > 0 ? (yieldAcc / yieldW) * 100 : null;
  const pb = weighted(norm, (row) => {
    const v = num(row.pb);
    return v != null && v > 0 ? v : null;
  });
  const roe = weighted(norm, (row) => num(row.roe));
  const roce = weighted(norm, (row) => num(row.roce));
  const sales = weighted(norm, (row) => num(row.salesCagr3));
  const profit = weighted(norm, (row) => num(row.profitCagr3));
  const momentum = weighted(norm, (row) => num(row.ret1y));
  const sectors = buckets(norm, (row) => row.sector);
  const sectorHhi = sectors.length ? sectors.reduce((sum, row) => sum + row.weight * row.weight, 0) : null;

  return {
    sectors,
    caps: buckets(norm, (row) => row.cap || "Unclassified"),
    earningsYield,
    portfolioPe: earningsYield != null && earningsYield > 0 ? 100 / earningsYield : null,
    peCoverage: yieldW,
    peExcluded: excluded,
    pb: pb.value,
    pbCoverage: pb.coverage,
    roe: roe.value,
    roce: roce.value,
    salesCagr: sales.value,
    profitCagr: profit.value,
    momentum: momentum.value,
    qualityWeight: quality,
    growthWeight: growth,
    cheapWeight: cheap,
    richWeight: rich,
    negativeEarningsWeight: excluded,
    missingWeight: missing,
    top1: sumTop(1),
    top5: sumTop(5),
    top10: sumTop(10),
    largest: ordered[0] ? { symbol: ordered[0].symbol, name: ordered[0].name, weight: ordered[0].weight } : null,
    sectorHhi,
    notes: [
      "Portfolio P/E is the inverse of the weight of 1/P/E. Names with missing or non-positive earnings are left out and their weight is shown.",
      "ROE, growth and P/B are weighted averages of the names that have that figure. They are not statistical factor betas.",
      "A dash means the holding weight covered by that figure is zero.",
    ],
  };
}
