import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  announcementRole,
  applyExpectations,
  buildResultsCalendar,
  meetingDateFromNotice,
  membershipOf,
  nextMonthBounds,
  periodEndFromText,
  periodLabel,
  reconcileExchanges,
  rollingBounds,
  weekBounds,
} from "./results-calendar.ts";

describe("results calendar", () => {
  it("does not treat a press release or a US macro label as a filing", () => {
    assert.equal(announcementRole("Press Release", "Press release pertaining to the financial results of the quarter"), "ignore");
    assert.equal(announcementRole("Newspaper Publication", "unaudited financial results"), "ignore");
    assert.equal(announcementRole("Financial Results", "Outcome of the board meeting. Unaudited financial results."), "filing");
  });

  it("reads a stated period end and leaves an unstated one blank", () => {
    assert.equal(periodEndFromText("Half Yearly ended September 2026"), "2026-09-30");
    assert.equal(periodEndFromText("quarter ended September 30, 2026"), "2026-09-30");
    assert.equal(periodEndFromText("Board meeting intimation"), null);
  });

  it("marks a filing as reported and keeps the original meeting date", () => {
    const rows = buildResultsCalendar(
      [
        {
          symbol: "INFY",
          name: "Infosys",
          date: "12-Nov-2026",
          purpose: "Financial Results",
          desc: "To consider unaudited financial results for the quarter ended September 30, 2026",
        },
      ],
      [
        {
          symbol: "INFY",
          name: "Infosys Limited",
          filedAt: "2026-11-12",
          filedStamp: "12-Nov-2026 16:05",
          periodEnd: "2026-09-30",
          quarter: "Second Quarter",
          url: "https://nsearchives.nseindia.com/corporate/xbrl/example.xml",
          source: "NSE financial results",
        },
      ],
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].status, "reported");
    assert.equal(rows[0].meetingDate, "2026-11-12");
    assert.equal(rows[0].filedAt, "2026-11-12");
    assert.equal(rows[0].links[0]?.url.includes("nsearchives.nseindia.com"), true);
    assert.equal(rows.some((row) => /payroll|united states|non-farm/i.test(row.purpose + row.name)), false);
  });

  it("keeps one row when the same meeting is published twice", () => {
    const rows = buildResultsCalendar(
      [
        {
          symbol: "ABC",
          name: "Abc Ltd",
          date: "05-Nov-2026",
          purpose: "Financial Results",
          desc: "To consider and approve the financial results for the period ended September 30, 2026",
        },
        {
          symbol: "ABC",
          name: "ABC",
          date: "05-Nov-2026",
          purpose: "Board Meeting",
          desc: "ABC has informed the Exchange about a Board Meeting to consider financial results",
          attachment: "https://nsearchives.nseindia.com/corporate/abc.pdf",
        },
      ],
      [],
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].status, "scheduled-confirmed");
    assert.equal(rows[0].links.length, 1);
    assert.equal(rows[0].periodEnd, "2026-09-30");
  });

  it("keeps a future meeting scheduled when no filing exists", () => {
    const rows = buildResultsCalendar(
      [
        {
          symbol: "TCS",
          name: "TCS",
          date: "10-Jan-2027",
          purpose: "Board Meeting Intimation",
          desc: "To approve the unaudited financial results for the quarter ended December 2026",
        },
      ],
      [],
    );
    assert.equal(rows[0].status, "scheduled-confirmed");
    assert.equal(rows[0].filedAt, null);
    assert.equal(rows[0].periodEnd, "2026-12-31");
  });

  it("marks postponement and cancellation from the notice text", () => {
    const rows = buildResultsCalendar(
      [
        {
          symbol: "ABC",
          name: "Abc",
          date: "02-Nov-2026",
          proposedDate: "09-Nov-2026",
          purpose: "Financial Results",
          desc: "The board meeting to consider financial results has been postponed",
        },
        {
          symbol: "XYZ",
          name: "Xyz",
          date: "03-Nov-2026",
          purpose: "Financial Results",
          desc: "The board meeting to consider financial results is cancelled",
        },
      ],
      [],
    );
    const abc = rows.find((row) => row.symbol === "ABC");
    const xyz = rows.find((row) => row.symbol === "XYZ");
    assert.equal(abc?.status, "rescheduled");
    assert.equal(abc?.date, "2026-11-09");
    assert.equal(abc?.meetingDate, "2026-11-02");
    assert.deepEqual(abc?.history.map((item) => item.date), ["2026-11-02", "2026-11-09"]);
    assert.equal(xyz?.status, "cancelled");
  });

  it("keeps a postponement postponed when the exchange did not give a new date", () => {
    const rows = buildResultsCalendar(
      [
        {
          symbol: "DEF",
          name: "Def",
          date: "04-Nov-2026",
          purpose: "Financial Results",
          desc: "The board meeting to consider financial results has been postponed",
        },
      ],
      [],
    );
    assert.equal(rows[0]?.status, "postponed");
    assert.equal(rows[0]?.date, "2026-11-04");
    assert.deepEqual(rows[0]?.history, []);
  });

  it("merges a dual-listed ISIN across exchanges and leaves a different period alone", () => {
    const notice = {
      name: "Infosys",
      isin: "INE009A01021",
      date: "12-Nov-2026",
      purpose: "Financial Results",
      desc: "To consider financial results for the quarter ended September 2026",
    };
    const nse = buildResultsCalendar([{ ...notice, symbol: "INFY" }], [], "NSE");
    const bse = buildResultsCalendar([{ ...notice, symbol: "500209" }], [], "BSE");
    const other = buildResultsCalendar(
      [
        {
          ...notice,
          symbol: "INFY",
          date: "14-Jan-2027",
          desc: "To consider financial results for the quarter ended December 2026",
        },
      ],
      [],
      "NSE",
    );
    const merged = reconcileExchanges([...nse, ...bse, ...other]);
    const sept = merged.filter((row) => row.periodEnd === "2026-09-30");
    assert.equal(sept.length, 1);
    assert.equal(sept[0]?.symbol, "INFY");
    assert.match(sept[0]?.source || "", /NSE/);
    assert.match(sept[0]?.source || "", /BSE/);
    assert.equal(merged.filter((row) => row.periodEnd === "2026-12-31").length, 1);
  });

  it("does not merge an older filing into a later quarter", () => {
    const rows = buildResultsCalendar(
      [
        {
          symbol: "INFY",
          name: "Infosys",
          date: "12-Jan-2027",
          purpose: "Financial Results",
          desc: "To consider financial results for the quarter ended December 2026",
        },
      ],
      [
        {
          symbol: "INFY",
          name: "Infosys",
          filedAt: "2026-10-16",
          periodEnd: "2026-09-30",
          quarter: "Second Quarter",
          url: "https://nsearchives.nseindia.com/corporate/xbrl/old.xml",
          source: "NSE financial results",
        },
      ],
    );
    assert.equal(rows.length, 2);
    assert.equal(rows.find((row) => row.status === "scheduled-confirmed")?.meetingDate, "2027-01-12");
    assert.equal(rows.find((row) => row.status === "reported")?.periodEnd, "2026-09-30");
  });

  it("weeks start on Monday", () => {
    assert.deepEqual(weekBounds("2026-10-31"), { from: "2026-10-26", to: "2026-11-01" });
  });

  it("reads the meeting day from a notice and ignores the filing timestamp", () => {
    assert.equal(
      meetingDateFromNotice("The board meeting will be held on Thursday, 8th November, 2026 to consider the unaudited financial results"),
      "2026-11-08",
    );
    assert.equal(
      meetingDateFromNotice("The board meeting to consider financial results has been postponed to 9 November 2026"),
      "2026-11-09",
    );
    assert.equal(meetingDateFromNotice("Outcome of the board meeting"), null);
  });

  it("shows a future official meeting as confirmed and keeps it when another feed is empty", () => {
    const rows = buildResultsCalendar(
      [
        {
          symbol: "RELIANCE",
          name: "Reliance Industries",
          date: "08-Nov-2026",
          purpose: "Board Meeting Intimation",
          desc: "To consider the unaudited financial results for the quarter ended September 30, 2026",
        },
      ],
      [],
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.status, "scheduled-confirmed");
    assert.equal(rows[0]?.date, "2026-11-08");
    assert.equal(rows[0]?.periodEnd, "2026-09-30");
    assert.equal(periodLabel(rows[0]), "Q2 FY27");
  });

  it("marks a portfolio symbol and a watchlist symbol without using quantities", () => {
    assert.equal(membershipOf("RELIANCE", ["RELIANCE.NS"], []), "portfolio");
    assert.equal(membershipOf("TCS", ["RELIANCE"], ["TCS.NS"]), "watchlist");
    assert.equal(membershipOf("INFY.NS", ["INFY"], ["INFY"]), "portfolio");
    assert.equal(membershipOf("HDFCBANK", [], []), null);
  });

  it("keeps a secondary date as expected until an official notice exists", () => {
    const rows = applyExpectations([], [
      {
        symbol: "TCS",
        name: "Tata Consultancy Services",
        date: "2026-11-10",
        periodEnd: "2026-09-30",
        source: "Secondary calendar",
        sourceUrl: "https://example.com/tcs",
      },
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.status, "expected");
    assert.equal(rows[0]?.date, "2026-11-10");
    assert.equal(rows[0]?.source, "Secondary calendar");
  });

  it("keeps the official date when a secondary source disagrees and records the conflict", () => {
    const official = buildResultsCalendar(
      [
        {
          symbol: "TCS",
          name: "TCS",
          isin: "INE467B01029",
          date: "08-Nov-2026",
          purpose: "Financial Results",
          desc: "To consider financial results for the quarter ended September 30, 2026",
        },
      ],
      [],
    );
    const rows = applyExpectations(official, [
      {
        symbol: "TCS",
        name: "TCS",
        isin: "INE467B01029",
        date: "2026-11-10",
        periodEnd: "2026-09-30",
        source: "Secondary calendar",
      },
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.date, "2026-11-08");
    assert.equal(rows[0]?.status, "needs-verification");
    assert.equal(rows[0]?.history.some((item) => item.date === "2026-11-10"), true);
  });

  it("does not downgrade a confirmed date when the secondary source agrees", () => {
    const official = buildResultsCalendar(
      [
        {
          symbol: "TCS",
          name: "TCS",
          date: "08-Nov-2026",
          purpose: "Financial Results",
          desc: "To consider financial results for the quarter ended September 30, 2026",
        },
      ],
      [],
    );
    const rows = applyExpectations(official, [
      { symbol: "TCS", date: "2026-11-08", periodEnd: "2026-09-30", source: "Secondary calendar" },
    ]);
    assert.equal(rows[0]?.status, "scheduled-confirmed");
    assert.equal(rows[0]?.date, "2026-11-08");
  });

  it("keeps a BSE-only company when there is no NSE row", () => {
    const rows = reconcileExchanges(
      buildResultsCalendar(
        [
          {
            symbol: "543210",
            name: "Only On BSE",
            isin: "INE000X01010",
            date: "18-Nov-2026",
            purpose: "Financial Results",
            desc: "To consider financial results for the quarter ended September 30, 2026",
          },
        ],
        [],
        "BSE",
      ),
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.exchange, "BSE");
    assert.equal(rows[0]?.symbol, "543210");
    assert.equal(rows[0]?.status, "scheduled-confirmed");
  });

  it("labels the next month and a 60-day window from the anchor", () => {
    assert.deepEqual(nextMonthBounds("2026-11-01"), { from: "2026-12-01", to: "2026-12-31" });
    assert.deepEqual(rollingBounds("2026-11-01", 60), { from: "2026-11-01", to: "2026-12-31" });
    assert.equal(periodLabel({ periodEnd: "2027-03-31", purpose: "year ended" }), "FY27");
  });
});
