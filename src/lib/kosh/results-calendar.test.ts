import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  announcementRole,
  buildResultsCalendar,
  periodEndFromText,
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
    assert.equal(abc?.status, "postponed");
    assert.equal(abc?.date, "2026-11-09");
    assert.equal(xyz?.status, "cancelled");
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
});
