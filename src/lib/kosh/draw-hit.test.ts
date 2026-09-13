import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyDrag, hitTest, magnetPrice, shapePoints } from "./draw-hit.ts";
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
