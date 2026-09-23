import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyDrag, channelOffFromThird, hitTest, magnetPrice, positionMetrics, shapePoints } from "./draw-hit.ts";
import type { DrawShape } from "../store.ts";
import type { OhlcBar } from "./types.ts";

function bars(n = 20): OhlcBar[] {
  return Array.from({ length: n }, (_, i) => ({
    t: 1_700_000_000 + i * 86400,
    o: 100 + i,
    h: 102 + i,
    l: 98 + i,
    c: 101 + i,
    v: 10,
  }));
}

const xOf = (i: number) => 50 + i * 10;
const yOf = (v: number) => 400 - v;

describe("draw-hit", () => {
  it("selects a horizontal line near the price", () => {
    const src = bars();
    const s: DrawShape = { id: "h1", kind: "hline", t0: src[5].t, y0: 110 };
    const p = shapePoints(s, src, xOf, yOf, 50, 250, 10, 400);
    const hit = hitTest([s], (p.x0 + p.x1) / 2, p.y0, src, xOf, yOf, 50, 250, 10, 400);
    assert.equal(hit?.id, "h1");
    assert.ok(hit?.mode === "body" || hit?.mode === "p0");
  });

  it("body-drag moves a trend by dt and dy", () => {
    const s: DrawShape = { id: "t1", kind: "trend", t0: 10, y0: 100, t1: 20, y1: 110 };
    const next = applyDrag(s, "body", 5, -3, 15, 97);
    assert.equal(next.t0, 15);
    assert.equal(next.y0, 97);
    assert.equal(next.t1, 25);
    assert.equal(next.y1, 107);
  });

  it("magnet snaps to the nearest OHLC", () => {
    const b: OhlcBar = { t: 1, o: 100, h: 108, l: 95, c: 102, v: 1 };
    assert.equal(magnetPrice(b, 107.2, true), 108);
    assert.equal(magnetPrice(b, 107.2, false), 107.2);
  });
});

describe("parallel channel", () => {
  it("offset is the third-click distance from the first line, not 1.2% of price", () => {
    const s = { t0: 0, y0: 100, t1: 10, y1: 110 };
    const off = channelOffFromThird(s, 5, 115);
    assert.equal(off, 10);
    assert.notEqual(off, Math.abs(100) * 0.012);
  });

  it("keeps the second line parallel after an off-drag", () => {
    const s: DrawShape = { id: "c1", kind: "channel", t0: 0, y0: 100, t1: 10, y1: 120, off: 8 };
    const next = applyDrag(s, "off", 0, 0, 5, 118);
    assert.ok(next.off != null);
    const expected = channelOffFromThird(s, 5, 118);
    assert.equal(next.off, expected);
    assert.equal(next.y1! - next.y0, 20);
  });

  it("does not invent an offset when off is missing", () => {
    const src = bars();
    const s: DrawShape = { id: "c2", kind: "channel", t0: src[2].t, y0: 110, t1: src[8].t, y1: 120 };
    const p = shapePoints(s, src, xOf, yOf, 50, 250, 10, 400);
    const hit = hitTest([s], (p.x0 + p.x1) / 2, p.y0, src, xOf, yOf, 50, 250, 10, 400);
    assert.ok(!hit || hit.mode !== "off");
  });
});

describe("long / short position", () => {
  it("computes R:R, % risk and % reward from three levels", () => {
    const s: DrawShape = { id: "l1", kind: "long", t0: 1, y0: 100, t1: 5, y1: 130, y2: 90 };
    const m = positionMetrics(s);
    assert.equal(m.risk, 10);
    assert.equal(m.reward, 30);
    assert.equal(m.rr, 3);
    assert.equal(m.riskPct, -10);
    assert.equal(m.rewardPct, 30);
  });

  it("short is inverted: stop above, target below", () => {
    const s: DrawShape = { id: "s1", kind: "short", t0: 1, y0: 100, t1: 5, y1: 80, y2: 110 };
    const m = positionMetrics(s);
    assert.equal(m.risk, 10);
    assert.equal(m.reward, 20);
    assert.equal(m.rr, 2);
    assert.ok(m.stop > m.entry);
    assert.ok(m.target < m.entry);
  });

  it("p2 handle moves the stop only", () => {
    const s: DrawShape = { id: "l2", kind: "long", t0: 1, y0: 100, t1: 5, y1: 130, y2: 90 };
    const next = applyDrag(s, "p2", 0, 0, 3, 85);
    assert.equal(next.y2, 85);
    assert.equal(next.y0, 100);
    assert.equal(next.y1, 130);
  });
});
