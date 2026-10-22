/** Index shares for sector indices that have no tracking ETF.
 * Weights are the free-float index weights reported by Tickertape on 14 Oct 2026.
 * They are not guessed, and they are not equal weights.
 */

export type SnapshotRow = { symbol: string; name: string; weight: number };

export type IndexSnapshot = {
  asOf: string;
  source: string;
  note: string;
  rows: SnapshotRow[];
};

const NOTE =
  "No tracking ETF publishes this basket. Tile size is the free-float index share reported on 14 Oct 2026.";

export const INDEX_SNAPSHOTS: Record<string, IndexSnapshot> = {
  "^CNXMEDIA": {
    asOf: "2026-10-14",
    source: "Tickertape Nifty Media index weights",
    note: NOTE,
    rows: [
      { symbol: "PVRINOX", name: "PVR INOX", weight: 22.08 },
      { symbol: "NAZARA", name: "Nazara Technologies", weight: 20.34 },
      { symbol: "ZEEL", name: "Zee Entertainment", weight: 15.83 },
      { symbol: "SUNTV", name: "Sun TV Network", weight: 12.42 },
      { symbol: "SAREGAMA", name: "Saregama India", weight: 7.8 },
      { symbol: "PFOCUS", name: "Prime Focus", weight: 7.27 },
      { symbol: "TIPSMUSIC", name: "Tips Music", weight: 6.95 },
      { symbol: "NETWORK18", name: "Network18 Media", weight: 3.48 },
      { symbol: "MPSLTD", name: "MPS", weight: 2.64 },
      { symbol: "DBCORP", name: "DB Corp", weight: 1.19 },
    ],
  },
  "^CNXFIN": {
    asOf: "2026-10-14",
    source: "Tickertape Nifty Financial Services 25/50 index weights",
    note: NOTE,
    rows: [
      { symbol: "HDFCBANK", name: "HDFC Bank", weight: 25.73 },
      { symbol: "ICICIBANK", name: "ICICI Bank", weight: 21.85 },
      { symbol: "AXISBANK", name: "Axis Bank", weight: 8.87 },
      { symbol: "SBIN", name: "State Bank of India", weight: 8.77 },
      { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", weight: 7.35 },
      { symbol: "BAJFINANCE", name: "Bajaj Finance", weight: 5.95 },
      { symbol: "SHRIRAMFIN", name: "Shriram Finance", weight: 4.14 },
      { symbol: "BSE", name: "BSE", weight: 3.23 },
      { symbol: "BAJAJFINSV", name: "Bajaj Finserv", weight: 2.35 },
      { symbol: "JIOFIN", name: "Jio Financial Services", weight: 1.68 },
      { symbol: "SBILIFE", name: "SBI Life Insurance", weight: 1.61 },
      { symbol: "CHOLAFIN", name: "Cholamandalam Investment", weight: 1.53 },
      { symbol: "HDFCLIFE", name: "HDFC Life Insurance", weight: 1.2 },
      { symbol: "PFC", name: "Power Finance Corporation", weight: 1.16 },
      { symbol: "MFSL", name: "Max Financial Services", weight: 1.04 },
      { symbol: "ICICIGI", name: "ICICI Lombard General Insurance", weight: 0.92 },
      { symbol: "RECLTD", name: "REC", weight: 0.89 },
      { symbol: "LICHSGFIN", name: "LIC Housing Finance", weight: 0.68 },
      { symbol: "MUTHOOTFIN", name: "Muthoot Finance", weight: 0.65 },
      { symbol: "SBICARD", name: "SBI Cards", weight: 0.4 },
    ],
  },
  "NIFTY_CONSR_DURBL.NS": {
    asOf: "2026-10-14",
    source: "Tickertape Nifty Consumer Durables index weights",
    note: NOTE,
    rows: [
      { symbol: "TITAN", name: "Titan Company", weight: 43.5 },
      { symbol: "DIXON", name: "Dixon Technologies", weight: 12.4 },
      { symbol: "HAVELLS", name: "Havells India", weight: 6.56 },
      { symbol: "KALYANKJIL", name: "Kalyan Jewellers", weight: 5.83 },
      { symbol: "VOLTAS", name: "Voltas", weight: 5.74 },
      { symbol: "BLUESTARCO", name: "Blue Star", weight: 5.48 },
      { symbol: "LGEINDIA", name: "LG Electronics India", weight: 4.75 },
      { symbol: "AMBER", name: "Amber Enterprises", weight: 3.8 },
      { symbol: "CROMPTON", name: "Crompton Greaves Consumer Electricals", weight: 3.67 },
      { symbol: "PGEL", name: "PG Electroplast", weight: 2.2 },
      { symbol: "KAJARIACER", name: "Kajaria Ceramics", weight: 1.94 },
      { symbol: "WHIRLPOOL", name: "Whirlpool of India", weight: 1.61 },
      { symbol: "THANGAMAYL", name: "Thangamayil Jewellery", weight: 1.48 },
      { symbol: "BATAINDIA", name: "Bata India", weight: 1.05 },
    ],
  },
};

export function indexSnapshot(symbol: string): IndexSnapshot | null {
  return INDEX_SNAPSHOTS[symbol] || null;
}
