import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { actionFactor, adjustPriceReturn, compoundFromSubject } from "./rrg-adjust.ts";

describe("price-return adjustment", () => {
  it("halves prices before a 1:1 bonus and leaves the latest close", () => {
    const result = adjustPriceReturn(
      [
        { date: "2024-10-25", close: 200 },
        { date: "2024-10-28", close: 100 },
      ],
      [{ date: "2024-10-28", type: "bonus", ratioNum: 1, ratioDen: 1, subject: "Bonus 1:1" }],
    );
    assert.equal(actionFactor({ date: "2024-10-28", type: "bonus", ratioNum: 1, ratioDen: 1 }), 0.5);
    assert.deepEqual(result.rows.map((row) => row.close), [100, 100]);
    assert.equal(result.unexplained.length, 0);
  });

  it("compounds two bonuses and applies a face-value split", () => {
    const bonus = adjustPriceReturn(
      [
        { date: "2017-09-06", close: 400 },
        { date: "2017-09-07", close: 200 },
        { date: "2024-10-27", close: 200 },
        { date: "2024-10-28", close: 100 },
      ],
      [
        { date: "2017-09-07", type: "bonus", ratioNum: 1, ratioDen: 1 },
        { date: "2024-10-28", type: "bonus", ratioNum: 1, ratioDen: 1 },
      ],
    );
    assert.deepEqual(bonus.rows.map((row) => row.close), [100, 100, 100, 100]);
    const split = adjustPriceReturn(
      [
        { date: "2019-09-18", close: 200 },
        { date: "2019-09-19", close: 100 },
      ],
      [{ date: "2019-09-19", type: "split", faceFrom: 2, faceTo: 1, subject: "Face value split" }],
    );
    assert.deepEqual(split.rows.map((row) => row.close), [100, 100]);
  });

  it("does not invent a demerger factor or delete a listing that continued", () => {
    const rows = [
      { date: "2024-01-01", close: 100 },
      { date: "2024-01-02", close: 99 },
    ];
    const dividend = adjustPriceReturn(rows, [{ date: "2024-01-02", type: "dividend", subject: "Dividend Rs 10" }]);
    assert.deepEqual(dividend.rows, rows);
    assert.equal(dividend.dividendsIgnored, 1);
    const continuing = adjustPriceReturn(
      [
        { date: "2023-07-19", close: 250 },
        { date: "2023-07-20", close: 230 },
        { date: "2023-07-21", close: 232 },
      ],
      [{ date: "2023-07-20", type: "demerger", subject: "Demerger" }],
    );
    assert.equal(continuing.rows.length, 3);
    assert.equal(continuing.applied.length, 0);
    assert.equal(continuing.flagged[0]?.date, "2023-07-20");
    const closeRatio = adjustPriceReturn(
      [
        { date: "2025-11-11", close: 33.87 },
        { date: "2025-11-12", close: 11.88 },
        { date: "2026-10-23", close: 9.25 },
      ],
      [{ date: "2025-11-12", type: "demerger", priceFactor: 11.88 / 33.87, factorBasis: "close-ratio", subject: "Ex-close / previous close" }],
    );
    assert.equal(closeRatio.rows[0]?.close, 33.87);
    assert.equal(closeRatio.rows[2]?.close, 9.25);
    assert.equal(closeRatio.applied.length, 0);
    assert.equal(closeRatio.unexplained[0]?.date, "2025-11-12");
    const published = adjustPriceReturn(
      [
        { date: "2024-01-02", close: 100 },
        { date: "2024-01-03", close: 70 },
      ],
      [{ date: "2024-01-03", type: "demerger", priceFactor: 0.8, factorBasis: "published-ratio", subject: "Exchange adjustment factor 0.80" }],
    );
    assert.equal(published.rows[0]?.close, 80);
    assert.equal(published.rows[1]?.close, 70);
    assert.equal(published.applied[0]?.factor, 0.8);
    const predecessor = adjustPriceReturn(
      [
        { date: "2025-10-13", close: 700 },
        { date: "2025-10-14", close: 420 },
        { date: "2025-10-15", close: 430 },
      ],
      [],
      [{ date: "2025-10-14", reason: "Identity break" }],
    );
    assert.deepEqual(predecessor.rows.map((row) => row.date), ["2025-10-13"]);
    const successor = adjustPriceReturn(
      [
        { date: "2025-10-24", close: 400 },
        { date: "2025-10-27", close: 410 },
      ],
      [{ date: "2025-10-14", type: "demerger", subject: "Demerger" }],
    );
    assert.equal(successor.rows.length, 2);
    assert.equal(successor.breaks.length, 0);
  });

  it("compounds a bonus and a face-value split, and ignores a factor read off the closes", () => {
    const compound = actionFactor({
      date: "2015-03-19",
      type: "split",
      ratioNum: 1,
      ratioDen: 1,
      faceFrom: 10,
      faceTo: 5,
      subject: "Bonus 1:1 / Face Value Split - From Rs 10/- Per Share To Rs 5/- Per Share",
    });
    assert.equal(compound, 0.25);
    assert.deepEqual(compoundFromSubject("Bonus 1:1 / Face Value Split - From Rs 10/- Per Share To Rs 5/- Per Share"), { bonus: 0.5, face: 0.5, combined: 0.25 });
    const inferred = actionFactor({
      date: "2011-06-22",
      type: "split",
      faceFrom: 10,
      faceTo: 1,
      subject: "Derived from an unexplained price step; no exchange action was published: 160.10 to 15.13",
    });
    assert.equal(inferred, null);
    const rows = adjustPriceReturn(
      [
        { date: "2015-03-18", close: 2800 },
        { date: "2015-03-19", close: 700 },
      ],
      [{ date: "2015-03-19", type: "split", ratioNum: 1, ratioDen: 1, faceFrom: 10, faceTo: 5, subject: "Bonus 1:1 and face split" }],
    );
    assert.equal(rows.rows[0]?.close, 700);
    assert.equal(rows.rows[1]?.close, 700);
    assert.equal(rows.applied[0]?.factor, 0.25);
  });

  it("keeps an unexplained jump and does not change that close", () => {
    const result = adjustPriceReturn(
      [
        { date: "2019-10-28", close: 100 },
        { date: "2019-10-29", close: 136 },
      ],
      [],
    );
    assert.equal(result.rows[1]?.close, 136);
    assert.equal(result.unexplained[0]?.date, "2019-10-29");
    assert.equal(result.applied.length, 0);
  });
});
