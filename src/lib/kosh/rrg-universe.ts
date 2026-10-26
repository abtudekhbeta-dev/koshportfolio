/** Series that passed Stage 1 validation. Nothing else is offered on the RRG page. */

export type RrgKind = "index" | "sector" | "stock";

export type RrgInstrument = {
  symbol: string;
  name: string;
  kind: RrgKind;
  limited: boolean;
  notes: string[];
};

export const RRG_UNIVERSE: RrgInstrument[] = [
  { symbol: "NIFTY 50", name: "Nifty 50", kind: "index", limited: false, notes: [] },
  { symbol: "NIFTY BANK", name: "Nifty Bank", kind: "sector", limited: false, notes: [] },
  { symbol: "NIFTY IT", name: "Nifty IT", kind: "sector", limited: false, notes: [] },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    kind: "stock",
    limited: false,
    notes: ["Stored price-return series. Bonus ratios on 2017-09-07 and 2024-10-28 are already in the file."],
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    kind: "stock",
    limited: false,
    notes: ["Stored price-return series. The 2019-09-19 split and the 2025-08-26 bonus are already in the file."],
  },
  { symbol: "ICICIBANK", name: "ICICI Bank", kind: "stock", limited: false, notes: ["Stored price-return series."] },
  {
    symbol: "INFY",
    name: "Infosys",
    kind: "stock",
    limited: false,
    notes: ["Stored price-return series. The 2018-09-04 bonus is already in the file."],
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors",
    kind: "stock",
    limited: false,
    notes: [
      "Stored price-return series. It ends 2025-10-23.",
      "29 Oct 2019 rose about 36% and has no matching row in the 2019 action file.",
      "14 Oct 2025 fell about 40%. A demerger is recorded that day under TMPV, not under this symbol.",
    ],
  },
  {
    symbol: "TMPV",
    name: "Tata Motors Passenger Vehicles",
    kind: "stock",
    limited: true,
    notes: ["Limited history from 2025-10-24. Not merged with TATAMOTORS or TMCV. Raw close."],
  },
  {
    symbol: "TMCV",
    name: "Tata Motors Commercial Vehicles",
    kind: "stock",
    limited: true,
    notes: ["Limited history from 2025-11-12. Separate ISIN. The first sessions are series BE. Raw close."],
  },
];

export const RRG_PRIMARY_BENCHMARKS = [
  { symbol: "NIFTY 50", name: "Nifty 50" },
  { symbol: "SENSEX", name: "Sensex" },
  { symbol: "NIFTY 500", name: "Nifty 500" },
  { symbol: "NIFTY BANK", name: "Nifty Bank" },
] as const;

/** Primary benchmarks, plus Nifty IT for the small fallback universe. The live registry decides the rest. */
export const RRG_BENCHMARKS = ["NIFTY 50", "SENSEX", "NIFTY 500", "NIFTY BANK", "NIFTY IT"] as const;

export function rrgInstrument(symbol: string) {
  return RRG_UNIVERSE.find((item) => item.symbol === symbol) || null;
}

export function resolveSymbols(requested: string[], allowed: string[]) {
  const known = new Set(allowed);
  const ok: string[] = [];
  const missing: string[] = [];
  for (const symbol of requested) {
    if (!known.has(symbol)) missing.push(symbol);
    else if (!ok.includes(symbol)) ok.push(symbol);
  }
  return { ok, missing };
}
