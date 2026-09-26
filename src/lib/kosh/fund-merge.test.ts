import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fillFundamentals } from "./fund-merge.ts";
import { filingFromXbrl, parseShpPercents } from "./deep.server.ts";
import type { Fundamentals } from "./types.ts";

function fund(p: Partial<Fundamentals> = {}): Fundamentals {
  return {
    symbol: "X",
    searchId: "x",
    name: "X",
    industry: "",
    ceo: "",
    founded: "",
    summary: "",
    mcapCr: null,
    pe: 18,
    pb: null,
    roe: null,
    de: null,
    divYield: null,
    eps: null,
    book: null,
    face: null,
    industryPe: null,
    salesYoY: null,
    profitYoY: null,
    sales: [{ period: "Mar 2024", value: 100 }],
    profits: [{ period: "Mar 2024", value: 10 }],
    qSales: [],
    qProfits: [],
    netWorth: [],
    qNetWorth: [],
    shareholding: [],
    promoters: 50,
    fii: null,
    dii: null,
    roce: null,
    peg: null,
    opm: null,
    salesCagr3: null,
    profitCagr3: null,
    profitCagr5: null,
    website: null,
    interestCover: null,
    ebitda: [],
    cfo: [],
    qCfo: [],
    cfoPat: null,
    ...p,
  };
}

describe("fillFundamentals", () => {
  it("does not invent CFO when the overlay has none", () => {
    const out = fillFundamentals(fund(), { cfo: [], pledge: null });
    assert.equal(out.cfo.length, 0);
    assert.equal(out.pe, 18);
    assert.equal(out.promoters, 50);
  });

  it("fills blank CFO and does not overwrite PE", () => {
    const out = fillFundamentals(fund(), {
      pe: 99,
      cfo: [{ period: "Mar 2024", value: 12 }],
      fii: 17.2,
    });
    assert.equal(out.pe, 18);
    assert.equal(out.cfo[0]?.value, 12);
    assert.equal(out.fii, 17.2);
  });

  it("keeps the live year and fills older years from the filing", () => {
    const out = fillFundamentals(
      fund({
        sales: [
          { period: "Mar 2025", value: 200 },
          { period: "Mar 2026", value: 240 },
        ],
        finPeriod: "Mar 2025",
      }),
      {
        sales: [
          { period: "Mar 2023", value: 140 },
          { period: "Mar 2024", value: 160 },
          { period: "Mar 2025", value: 199 },
          { period: "Mar 2026", value: 111 },
        ],
        finPeriod: "Mar 2026",
      },
    );
    assert.equal(out.sales.length, 4);
    assert.equal(out.sales.find((p) => p.period === "Mar 2026")?.value, 240);
    assert.equal(out.sales.find((p) => p.period === "Mar 2023")?.value, 140);
    assert.equal(out.finPeriod, "Mar 2026");
  });

  it("fills blank forward P/E and does not invent a dash", () => {
    const out = fillFundamentals(fund({ pe: 18 }), { forwardPe: 22.4, forwardPeg: 1.8, peg: 2.1 });
    assert.equal(out.pe, 18);
    assert.equal(out.forwardPe, 22.4);
    assert.equal(out.forwardPeg, 1.8);
    assert.equal(out.peg, 2.1);
    const keep = fillFundamentals(fund({ pe: 18, forwardPe: 20 }), { forwardPe: 99 });
    assert.equal(keep.forwardPe, 20);
  });
});

describe("XBRL filing parse", () => {
  it("reads annual revenue, profit and operating cash from FourD", () => {
    const xml = `<?xml version="1.0"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:in-bse-fin="http://www.bseindia.com/xbrl/fin">
  <xbrli:context id="OneD"><xbrli:period><xbrli:startDate>2024-01-01</xbrli:startDate><xbrli:endDate>2024-03-31</xbrli:endDate></xbrli:period></xbrli:context>
  <xbrli:context id="FourD"><xbrli:period><xbrli:startDate>2023-04-01</xbrli:startDate><xbrli:endDate>2024-03-31</xbrli:endDate></xbrli:period></xbrli:context>
  <in-bse-fin:RevenueFromOperations contextRef="OneD" unitRef="INR">100000000.00</in-bse-fin:RevenueFromOperations>
  <in-bse-fin:RevenueFromOperations contextRef="FourD" unitRef="INR">4000000000.00</in-bse-fin:RevenueFromOperations>
  <in-bse-fin:ProfitOrLossAttributableToOwnersOfParent contextRef="FourD" unitRef="INR">500000000.00</in-bse-fin:ProfitOrLossAttributableToOwnersOfParent>
  <in-bse-fin:CashFlowsFromUsedInOperatingActivities contextRef="FourD" unitRef="INR">700000000.00</in-bse-fin:CashFlowsFromUsedInOperatingActivities>
  <in-bse-fin:ProfitBeforeExceptionalItemsAndTax contextRef="FourD" unitRef="INR">600000000.00</in-bse-fin:ProfitBeforeExceptionalItemsAndTax>
  <in-bse-fin:FinanceCosts contextRef="FourD" unitRef="INR">50000000.00</in-bse-fin:FinanceCosts>
  <xbrli:context id="OneI"><xbrli:period><xbrli:instant>2024-03-31</xbrli:instant></xbrli:period></xbrli:context>
  <in-bse-fin:EquityAttributableToOwnersOfParent contextRef="OneI" unitRef="INR">2000000000.00</in-bse-fin:EquityAttributableToOwnersOfParent>
  <in-bse-fin:BorrowingsCurrent contextRef="OneI" unitRef="INR">100000000.00</in-bse-fin:BorrowingsCurrent>
  <in-bse-fin:BorrowingsNoncurrent contextRef="OneI" unitRef="INR">100000000.00</in-bse-fin:BorrowingsNoncurrent>
</xbrli:xbrl>`;
    const y = filingFromXbrl(xml, "year");
    assert.ok(y);
    assert.equal(y!.sales, 400);
    assert.equal(y!.profits, 50);
    assert.equal(y!.cfo, 70);
    assert.ok(y!.interestCover != null && Math.abs(y!.interestCover - 13) < 0.2);
    assert.ok(y!.roce != null && y!.roce > 20 && y!.roce < 40);
    assert.ok(y!.de != null && Math.abs(y!.de - 0.1) < 0.02);
    assert.equal(y!.opm, null);
    const q = filingFromXbrl(xml, "quarter");
    assert.equal(q?.sales, 10);
    assert.equal(q?.cfo, null);
  });
});

describe("shareholding percents", () => {
  it("converts 0.5048 fraction to 50.48 and reads FII/DII", () => {
    const xml = `<?xml version="1.0"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:in-bse-shp="http://www.bseindia.com/xbrl/shp" xmlns:xbrldi="http://xbrl.org/2006/xbrldi">
  <xbrli:context id="P"><xbrli:entity><xbrli:identifier scheme="s">X</xbrli:identifier></xbrli:entity><xbrli:period><xbrli:instant>2026-06-30</xbrli:instant></xbrli:period><xbrli:scenario><xbrldi:explicitMember dimension="d">in-bse-shp:ShareholdingOfPromoterAndPromoterGroupMember</xbrldi:explicitMember></xbrli:scenario></xbrli:context>
  <xbrli:context id="F"><xbrli:entity><xbrli:identifier scheme="s">X</xbrli:identifier></xbrli:entity><xbrli:period><xbrli:instant>2026-06-30</xbrli:instant></xbrli:period><xbrli:scenario><xbrldi:explicitMember dimension="d">in-bse-shp:InstitutionsForeignMember</xbrldi:explicitMember></xbrli:scenario></xbrli:context>
  <xbrli:context id="D"><xbrli:entity><xbrli:identifier scheme="s">X</xbrli:identifier></xbrli:entity><xbrli:period><xbrli:instant>2026-06-30</xbrli:instant></xbrli:period><xbrli:scenario><xbrldi:explicitMember dimension="d">in-bse-shp:InstitutionsDomesticMember</xbrldi:explicitMember></xbrli:scenario></xbrli:context>
  <in-bse-shp:ShareholdingAsAPercentageOfTotalNumberOfShares contextRef="P" unitRef="pure">0.5048</in-bse-shp:ShareholdingAsAPercentageOfTotalNumberOfShares>
  <in-bse-shp:ShareholdingAsAPercentageOfTotalNumberOfShares contextRef="F" unitRef="pure">0.172</in-bse-shp:ShareholdingAsAPercentageOfTotalNumberOfShares>
  <in-bse-shp:ShareholdingAsAPercentageOfTotalNumberOfShares contextRef="D" unitRef="pure">0.2119</in-bse-shp:ShareholdingAsAPercentageOfTotalNumberOfShares>
  <in-bse-shp:WhetherAnySharesHeldByPromotersAreEncumberedUnderPledged contextRef="P">false</in-bse-shp:WhetherAnySharesHeldByPromotersAreEncumberedUnderPledged>
</xbrli:xbrl>`;
    const s = parseShpPercents(xml);
    assert.ok(Math.abs((s.promoters || 0) - 50.48) < 0.01);
    assert.ok(Math.abs((s.fii || 0) - 17.2) < 0.01);
    assert.ok(Math.abs((s.dii || 0) - 21.19) < 0.01);
    assert.equal(s.pledge, 0);
  });

  it("reads in-capmkt integrated filing tags the same way", () => {
    const xml = `<?xml version="1.0"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:in-capmkt="http://www.sebi.gov.in/xbrl/2026">
  <xbrli:context id="OneD"><xbrli:period><xbrli:startDate>2026-01-01</xbrli:startDate><xbrli:endDate>2026-03-31</xbrli:endDate></xbrli:period></xbrli:context>
  <xbrli:context id="FourD"><xbrli:period><xbrli:startDate>2025-04-01</xbrli:startDate><xbrli:endDate>2026-03-31</xbrli:endDate></xbrli:period></xbrli:context>
  <in-capmkt:RevenueFromOperations contextRef="FourD" unitRef="INR">1786500000000.00</in-capmkt:RevenueFromOperations>
  <in-capmkt:ProfitOrLossAttributableToOwnersOfParent contextRef="FourD" unitRef="INR">294400000000.00</in-capmkt:ProfitOrLossAttributableToOwnersOfParent>
  <in-capmkt:CashFlowsFromUsedInOperatingActivities contextRef="FourD" unitRef="INR">339860000000.00</in-capmkt:CashFlowsFromUsedInOperatingActivities>
</xbrli:xbrl>`;
    const y = filingFromXbrl(xml, "year");
    assert.ok(y);
    assert.equal(y!.sales, 178650);
    assert.equal(y!.profits, 29440);
    assert.equal(y!.cfo, 33986);
    assert.equal(y!.period, "Mar 2026");
    assert.equal(y!.opm, null);
  });

  it("uses operating profit for OPM and never profit before tax", () => {
    const xml = `<?xml version="1.0"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:in-bse-fin="http://www.bseindia.com/xbrl/fin">
  <xbrli:context id="FourD"><xbrli:period><xbrli:startDate>2023-04-01</xbrli:startDate><xbrli:endDate>2024-03-31</xbrli:endDate></xbrli:period></xbrli:context>
  <in-bse-fin:RevenueFromOperations contextRef="FourD" unitRef="INR">1000000000.00</in-bse-fin:RevenueFromOperations>
  <in-bse-fin:ProfitBeforeTax contextRef="FourD" unitRef="INR">400000000.00</in-bse-fin:ProfitBeforeTax>
  <in-bse-fin:OperatingProfit contextRef="FourD" unitRef="INR">200000000.00</in-bse-fin:OperatingProfit>
</xbrli:xbrl>`;
    const y = filingFromXbrl(xml, "year");
    assert.ok(y);
    assert.ok(y!.opm != null && Math.abs(y!.opm - 20) < 0.2);
  });
});
