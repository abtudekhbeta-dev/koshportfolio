import type { Holding, Portfolio } from "./types";

export const SAMPLE_HOLDINGS: Holding[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", qty: 20, avg: 1100, date: null },
  { symbol: "TCS", name: "Tata Consultancy Services", qty: 8, avg: 2100, date: null },
  { symbol: "HDFCBANK", name: "HDFC Bank", qty: 25, avg: 650, date: null },
  { symbol: "INFY", name: "Infosys", qty: 15, avg: 1050, date: null },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", qty: 30, avg: 1500, date: null },
  { symbol: "ITC", name: "ITC", qty: 80, avg: 250, date: null },
  { symbol: "LT", name: "Larsen & Toubro", qty: 6, avg: 3600, date: null },
  { symbol: "SUNPHARMA", name: "Sun Pharma", qty: 10, avg: 1650, date: null },
];

export function samplePortfolio(): Portfolio {
  return {
    id: "sample",
    name: "Sample · core",
    holdings: SAMPLE_HOLDINGS,
    bench: "nifty",
    includeCommodities: true,
  };
}
