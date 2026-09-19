import type { Holding, Portfolio, TradeLine } from "./types";

export const SAMPLE_HOLDINGS: Holding[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", qty: 20, avg: 1100, date: "2020-03-23" },
  { symbol: "TCS", name: "Tata Consultancy Services", qty: 8, avg: 2100, date: "2019-08-16" },
  { symbol: "HDFCBANK", name: "HDFC Bank", qty: 25, avg: 650, date: "2020-04-07" },
  { symbol: "INFY", name: "Infosys", qty: 15, avg: 1050, date: "2018-10-15" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", qty: 30, avg: 1500, date: "2021-01-18" },
  { symbol: "ITC", name: "ITC", qty: 80, avg: 220, date: "2019-01-14" },
  { symbol: "LT", name: "Larsen & Toubro", qty: 6, avg: 3600, date: "2022-02-07" },
  { symbol: "SUNPHARMA", name: "Sun Pharma", qty: 10, avg: 1650, date: "2021-06-14" },
];

function t(symbol: string, name: string, qty: number, price: number, date: string, side: 1 | -1): TradeLine {
  return { symbol, name, qty, price, date, boughtAt: date + "T00:00:00.000Z", side };
}

export const SAMPLE_TRADES: TradeLine[] = [
  t("INFY", "Infosys", 15, 1050, "2018-10-15", 1),
  t("ITC", "ITC", 100, 220, "2019-01-14", 1),
  t("TCS", "Tata Consultancy Services", 8, 2100, "2019-08-16", 1),
  t("RELIANCE", "Reliance Industries", 20, 1100, "2020-03-23", 1),
  t("HDFCBANK", "HDFC Bank", 25, 650, "2020-04-07", 1),
  t("BHARTIARTL", "Bharti Airtel", 30, 1500, "2021-01-18", 1),
  t("SUNPHARMA", "Sun Pharma", 10, 1650, "2021-06-14", 1),
  t("LT", "Larsen & Toubro", 6, 3600, "2022-02-07", 1),
  t("ITC", "ITC", 20, 430, "2024-06-03", -1),
];

export function samplePortfolio(): Portfolio {
  return {
    id: "sample",
    name: "Sample · core",
    holdings: SAMPLE_HOLDINGS,
    bench: "nifty",
    includeCommodities: true,
    trades: SAMPLE_TRADES,
  };
}
