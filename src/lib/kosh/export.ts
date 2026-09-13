import * as XLSX from "xlsx";
import type { Book, Holding, Portfolio } from "./types";

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function slug(name: string) {
  return name.replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "") || "portfolio";
}

function sheet(wb: XLSX.WorkBook, name: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: "No rows" }]);
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
}

export function downloadHoldingsExcel(name: string, holdings: Holding[]) {
  const wb = XLSX.utils.book_new();
  sheet(
    wb,
    "Holdings",
    holdings.map((h) => ({
      Ticker: h.symbol,
      Name: h.name,
      ISIN: h.isin || "",
      Qty: h.qty,
      "Avg cost": h.avg ?? "",
      Invested: h.avg ? +(h.qty * h.avg).toFixed(2) : "",
      Sector: h.sector || "",
    })),
  );
  XLSX.writeFile(wb, `kosh-${slug(name)}-holdings-${stamp()}.xlsx`);
}

export function downloadBookExcel(name: string, book: Book, portfolio?: Portfolio) {
  const wb = XLSX.utils.book_new();
  sheet(wb, "Summary", [
    {
      Portfolio: name,
      Benchmark: book.benchName,
      "Current value": book.value,
      Invested: book.invested,
      Unrealised: book.unreal,
      "Day P&L": book.dayAbs,
      "Day %": book.dayPct,
      CAGR: book.cagr,
      Coverage: book.coverage,
      From: book.firstDay || "",
      To: book.lastDay || "",
      "Price history": book.hxRange,
      AsOf: book.asOf || "",
    },
  ]);
  sheet(
    wb,
    "Holdings",
    book.rows.map((r) => ({
      Ticker: r.symbol,
      Name: r.name,
      ISIN: r.isin || "",
      Qty: r.qty,
      "Avg cost": r.avg ?? "",
      Price: r.px,
      Value: r.value,
      Invested: r.invested,
      Unrealised: r.unreal,
      "Unreal %": r.unrealPct,
      "Weight %": +(r.weight * 100).toFixed(2),
      Sector: r.sector,
      Cap: r.cap,
      "1D %": r.changePct,
      "1M %": r.periods.m1,
      "1Y %": r.periods.y1,
      CAGR: r.periods.cagr,
    })),
  );
  sheet(wb, "Windows", [
    { Window: "1W", "Portfolio %": book.windows.w1.port, "Index %": book.windows.w1.bench },
    { Window: "1M", "Portfolio %": book.windows.m1.port, "Index %": book.windows.m1.bench },
    { Window: "3M", "Portfolio %": book.windows.m3.port, "Index %": book.windows.m3.bench },
    { Window: "6M", "Portfolio %": book.windows.m6.port, "Index %": book.windows.m6.bench },
    { Window: "1Y", "Portfolio %": book.windows.y1.port, "Index %": book.windows.y1.bench },
    { Window: "YTD", "Portfolio %": book.windows.ytd.port, "Index %": book.windows.ytd.bench },
  ]);
  sheet(wb, "Risk", [
    { Metric: "CAGR %", Value: book.cagr },
    { Metric: "Sharpe", Value: book.risk.sharpe },
    { Metric: "Sortino", Value: book.risk.sortino },
    { Metric: "Alpha %", Value: book.risk.alpha },
    { Metric: "Beta", Value: book.risk.beta },
    { Metric: "Correlation", Value: book.risk.corr },
    { Metric: "Ann. vol %", Value: book.risk.vol },
    { Metric: "Max drawdown %", Value: book.risk.maxDd },
    { Metric: "Up capture", Value: book.risk.upCap },
    { Metric: "Down capture", Value: book.risk.downCap },
    { Metric: "Info ratio", Value: book.risk.info },
    { Metric: "Calmar", Value: book.risk.calmar },
  ]);
  sheet(
    wb,
    "Sectors",
    book.sleeves.map((s) => ({
      Sector: s.sector,
      Names: s.names,
      Value: s.value,
      "Weight %": book.value ? +((s.value / book.value) * 100).toFixed(2) : "",
      "1M sleeve %": s.windows.m1,
      "1M index %": s.index.m1,
      "1Y sleeve %": s.windows.y1,
      "1Y index %": s.index.y1,
      Index: s.indexName,
      Stocks: s.symbols.join(", "),
    })),
  );
  sheet(
    wb,
    "Monthly",
    book.months.map((m) => ({
      Month: m.key,
      "Portfolio %": m.port,
      "Index %": m.bench,
    })),
  );
  sheet(
    wb,
    "Path",
    book.mix.nav.map((p) => ({
      Day: p.day,
      Portfolio: p.port,
      Benchmark: p.bench,
      Coverage: p.wAvail,
    })),
  );
  if (portfolio) {
    sheet(
      wb,
      "Raw lots",
      portfolio.holdings.map((h) => ({
        Ticker: h.symbol,
        Name: h.name,
        ISIN: h.isin || "",
        Qty: h.qty,
        "Avg cost": h.avg ?? "",
        Sector: h.sector || "",
        "Buy date": h.date || "",
      })),
    );
  }
  XLSX.writeFile(wb, `kosh-${slug(name)}-${stamp()}.xlsx`);
}
