/** Undervalued Growth. Every figure is computed from the screener card. A blank stays blank. */

import type { ScreenRow } from "./types.ts";

export type ValueLens = "operating" | "bank";

export type ScorePart = {
  id: "valuation" | "earnings" | "revenue" | "profitability" | "balance" | "cash";
  label: string;
  score: number | null;
  weight: number;
  note: string;
};

export type ValueTrap = { id: string; label: string };

export type GrowthRow = {
  symbol: string;
  name: string;
  sector: string;
  lens: ValueLens;
  price: number;
  mcapCr: number | null;
  pe: number | null;
  pb: number | null;
  peerPe: number | null;
  peerPb: number | null;
  peerCount: number;
  peerBasis: string;
  discount: number | null;
  earningsYield: number | null;
  salesYoY: number | null;
  salesCagr3: number | null;
  profitYoY: number | null;
  profitCagr3: number | null;
  profitCagr5: number | null;
  roe: number | null;
  roce: number | null;
  de: number | null;
  interestCover: number | null;
  cfoPat: number | null;
  pledge: number | null;
  parts: ScorePart[];
  traps: ValueTrap[];
  score: number | null;
  coveredWeight: number;
};

const BANK = /\b(bank|nbfc|hfc|housing finance|insurance|lending)\b/i;

export function isBankLens(sector: string, name: string): boolean {
  return BANK.test(`${sector} ${name}`);
}

function num(v: number | null | undefined): number | null {
  return v != null && Number.isFinite(v) ? v : null;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

export function peerMedians(rows: ScreenRow[], sector: string, lens: ValueLens): { pe: number | null; pb: number | null; count: number } {
  const peers = rows.filter((row) => row.sector === sector && row.sector && row.sector !== "—");
  if (lens === "bank") {
    const pbs = peers.map((row) => num(row.pb)).filter((v): v is number => v != null && v > 0 && v < 20);
    return { pe: null, pb: pbs.length >= 4 ? median(pbs) : null, count: pbs.length };
  }
  const pes = peers.map((row) => num(row.pe)).filter((v): v is number => v != null && v > 0 && v < 150);
  return { pe: pes.length >= 4 ? median(pes) : null, pb: null, count: pes.length };
}

function part(id: ScorePart["id"], label: string, score: number | null, weight: number, note: string): ScorePart {
  return { id, label, score: score == null ? null : Math.round(score), weight, note };
}

export function scoreGrowthRow(row: ScreenRow, universe: ScreenRow[]): GrowthRow {
  const lens = isBankLens(row.sector || "", row.name || "") ? "bank" : "operating";
  const peers = peerMedians(universe, row.sector, lens);
  const pe = num(row.pe);
  const pb = num(row.pb);
  const earningsYield = pe != null && pe > 0 ? (1 / pe) * 100 : null;
  let discount: number | null = null;
  let valuation: ScorePart;
  if (lens === "bank") {
    if (pb != null && pb > 0 && peers.pb != null && peers.pb > 0) discount = 1 - pb / peers.pb;
    valuation = part(
      "valuation",
      "Price / book vs peers",
      discount == null ? null : clamp(50 + discount * 80),
      30,
      discount == null
        ? peers.count < 4
          ? "Fewer than 4 peers with a positive P/B in this sector."
          : "P/B missing, or earnings are not the lens used for a lender."
        : `Peer median P/B ${peers.pb?.toFixed(2)} from ${peers.count} names. Discount ${((discount || 0) * 100).toFixed(0)}%.`,
    );
  } else if (pe != null && pe <= 0) {
    valuation = part("valuation", "Relative P/E", null, 30, "Negative or zero earnings. Left out of the peer median and this discount.");
  } else if (pe != null && peers.pe != null && peers.pe > 0) {
    discount = 1 - pe / peers.pe;
    valuation = part(
      "valuation",
      "Relative P/E",
      clamp(50 + discount * 80),
      30,
      `Trailing P/E ${pe.toFixed(1)} vs sector median ${peers.pe.toFixed(1)} (${peers.count} positive-P/E peers). Same card period — not a forward multiple.`,
    );
  } else {
    valuation = part(
      "valuation",
      "Relative P/E",
      null,
      30,
      peers.count < 4 ? "Fewer than 4 peers with a positive trailing P/E in this sector." : "Trailing P/E is not on the card.",
    );
  }

  const profit = num(row.profitCagr3) ?? num(row.profitYoY);
  const profitNote = num(row.profitCagr3) != null ? "3-year profit CAGR" : num(row.profitYoY) != null ? "Latest-year profit growth" : "No profit growth on the card";
  const earnings = part(
    "earnings",
    "Earnings growth",
    profit == null ? null : clamp(profit * 2),
    25,
    profitNote + (profit == null ? "." : ` ${profit.toFixed(1)}%.`),
  );
  const sales = num(row.salesCagr3) ?? num(row.salesYoY);
  const revenue = part(
    "revenue",
    "Revenue growth",
    sales == null ? null : clamp(sales * 2.5),
    15,
    sales == null ? "No sales growth on the card." : `${num(row.salesCagr3) != null ? "3-year sales CAGR" : "Latest-year sales"} ${sales.toFixed(1)}%.`,
  );
  const roe = num(row.roe);
  const roce = num(row.roce);
  const qualityBase = lens === "bank" ? roe : roce ?? roe;
  const profitability = part(
    "profitability",
    lens === "bank" ? "ROE" : "ROCE / ROE",
    qualityBase == null ? null : clamp(qualityBase * 3),
    15,
    qualityBase == null ? "ROE and ROCE are not on the card." : `${qualityBase.toFixed(1)}%.`,
  );
  const de = num(row.de);
  const cover = num(row.interestCover);
  let balanceScore: number | null = null;
  if (de != null || cover != null) {
    const deScore = de == null ? 60 : de <= 0 ? 90 : de <= 0.5 ? 80 : de <= 1 ? 60 : de <= 2 ? 35 : 10;
    const coverScore = cover == null ? deScore : cover >= 8 ? 90 : cover >= 4 ? 70 : cover >= 2 ? 45 : 15;
    balanceScore = de == null ? coverScore : cover == null ? deScore : Math.round(deScore * 0.6 + coverScore * 0.4);
  }
  const balance = part(
    "balance",
    "Balance sheet",
    balanceScore,
    10,
    [de == null ? "D/E missing" : `D/E ${de.toFixed(2)}`, cover == null ? "interest cover missing" : `cover ${cover.toFixed(1)}×`].join(", ") + ".",
  );
  const cfo = num(row.cfoPat);
  const cash = part(
    "cash",
    "Cash conversion",
    cfo == null ? null : clamp(cfo * 80),
    5,
    cfo == null ? "CFO/PAT is not on the card." : `CFO/PAT ${cfo.toFixed(2)}.`,
  );

  const parts = [valuation, earnings, revenue, profitability, balance, cash];
  const used = parts.filter((item) => item.score != null);
  const coveredWeight = used.reduce((sum, item) => sum + item.weight, 0);
  const score = coveredWeight >= 40 ? Math.round(used.reduce((sum, item) => sum + (item.score || 0) * item.weight, 0) / coveredWeight) : null;

  const traps: ValueTrap[] = [];
  const py = num(row.profitYoY);
  if (roe != null && roe < 0) traps.push({ id: "roe", label: "ROE is negative" });
  if (py != null && py < 0) traps.push({ id: "profit-down", label: "Latest profit is down" });
  if (pe != null && pe <= 0) traps.push({ id: "loss", label: "Earnings are not positive" });
  if (cfo != null && cfo < 0.5) traps.push({ id: "cash", label: "Cash flow is thin versus profit" });
  if (de != null && de > 1.5) traps.push({ id: "debt", label: "Debt/equity is above 1.5" });
  if (cover != null && cover < 2) traps.push({ id: "cover", label: "Interest cover is under 2×" });
  const pledge = num(row.pledge);
  if (pledge != null && pledge > 20) traps.push({ id: "pledge", label: "Promoter pledge is above 20%" });
  const sy = num(row.salesYoY);
  if (sy != null && sy < 0 && py != null && py < 0) traps.push({ id: "shrink", label: "Sales and profit are both down" });

  return {
    symbol: row.symbol,
    name: row.name,
    sector: row.sector,
    lens,
    price: row.price,
    mcapCr: num(row.mcapCr),
    pe,
    pb,
    peerPe: lens === "operating" ? peers.pe : null,
    peerPb: lens === "bank" ? peers.pb : null,
    peerCount: peers.count,
    peerBasis: lens === "bank" ? "Same sector, positive P/B" : "Same sector, positive trailing P/E",
    discount,
    earningsYield,
    salesYoY: num(row.salesYoY),
    salesCagr3: num(row.salesCagr3),
    profitYoY: py,
    profitCagr3: num(row.profitCagr3),
    profitCagr5: num(row.profitCagr5),
    roe,
    roce,
    de,
    interestCover: cover,
    cfoPat: cfo,
    pledge,
    parts,
    traps,
    score,
    coveredWeight,
  };
}

export function rankGrowth(rows: ScreenRow[]): GrowthRow[] {
  return rows
    .filter((row) => row.symbol && row.price > 0)
    .map((row) => scoreGrowthRow(row, rows))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.symbol.localeCompare(b.symbol));
}
