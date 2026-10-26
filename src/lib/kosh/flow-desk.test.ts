import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { foreignClaim } from "./flow-brief.ts";
import { buildFlowDesk, deskWindowPoints, type DeskRow } from "./flow-desk.ts";

function row(date: string, fii: number, dii: number, start: number | null, end: number | null, ret: number | null = null): DeskRow {
  return { date, fiiNet: fii, diiNet: dii, indexStart: start, indexEnd: end, indexReturn: ret };
}

describe("flow desk", () => {
  it("sums a complete window and withholds a short one instead of using zero", () => {
    const desk = buildFlowDesk([
      row("2026-10-21", 10, 5, 100, 101, 1),
      row("2026-10-22", -4, 2, 101, 99, -2),
      row("bad", 99, 99, 1, 1),
      row("2026-10-22", 999, 999, 1, 1),
    ]);
    assert.equal(desk.sessions, 2);
    assert.equal(desk.windows[5].complete, false);
    assert.equal(desk.windows[5].fii, null);
    assert.equal(desk.windows[5].have, 2);
    assert.equal(desk.points[1].cumFii, 6);
    assert.equal(desk.points[1].cumDii, 7);
    assert.equal(desk.points[0].roll5Fii, null);
    assert.equal(desk.percentile.fii, null);
  });

  it("compounds the index from endpoints and leaves a missing close empty", () => {
    const rows = [1, 2, 3, 4, 5].map((day) => row(`2026-10-${20 + day}`, day, 1, 100 + day, 100 + day + 1, 0.2));
    const open = buildFlowDesk(rows);
    const five = open.windows[5];
    assert.equal(five.complete, true);
    assert.equal(five.fii, 15);
    assert.equal(five.dii, 5);
    assert.ok(Math.abs((five.indexReturn || 0) - ((106 / 101 - 1) * 100)) < 1e-9);
    const gap = buildFlowDesk(rows.map((item, index) => (index === 4 ? { ...item, indexEnd: null } : item)));
    assert.equal(gap.windows[5].indexReturn, null);
    assert.equal(gap.windows[5].fii, 15);
    const points = deskWindowPoints(open, 5);
    assert.equal(points?.length, 5);
    assert.equal(points?.[0].cumFii, 1);
    assert.equal(deskWindowPoints(open, 10), null);
  });

  it("ranks only when forty sessions exist and rejects a figure that was not calculated", () => {
    const rows = Array.from({ length: 40 }, (_, index) => row(`2026-01-${String(index + 1).padStart(2, "0")}`, index - 20, 3, 100, 101, 0.1));
    const desk = buildFlowDesk(rows);
    assert.ok(desk.percentile.fii != null);
    assert.ok(desk.zscore.fii != null);
    assert.equal(desk.points[3].roll5Fii, null);
    assert.ok(desk.points[4].roll5Fii != null);
    const brief = { allowedNumbers: desk.allowedNumbers, dates: desk.dates, returnNumbers: desk.returnNumbers };
    assert.equal(foreignClaim("Gross buying was ₹9,642 Cr.", brief), "9,642");
    assert.equal(foreignClaim(`FII z-score ${desk.zscore.fii?.toFixed(2)}.`, brief), null);
  });
});
