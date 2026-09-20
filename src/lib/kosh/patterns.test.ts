import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectDouble, detectFlag, detectPatterns, detectRange, detectTriangle } from "./patterns.ts";
import type { OhlcBar } from "./types.ts";

function bar(i: number, c: number, extra?: Partial<OhlcBar>): OhlcBar {
  return {
    t: 1_700_000_000 + i * 86400,
    o: c,
    h: c * 1.01,
    l: c * 0.99,
    c,
    v: 1_000_000,
    ...extra,
  };
}

function series(closes: number[]): OhlcBar[] {
  return closes.map((c, i) => bar(i, c));
}

/** Explicit fractal swing: k=2 high/low at `i`. Neighbours must not steal the pivot. */
function withSwing(bars: OhlcBar[], i: number, kind: "H" | "L", price: number) {
  const k = 2;
  if (kind === "H") {
    bars[i].h = price;
    bars[i].c = price * 0.995;
    bars[i].o = price * 0.99;
    bars[i].l = price * 0.985;
    for (let j = i - k; j <= i + k; j++) {
      if (j < 0 || j >= bars.length || j === i) continue;
      bars[j].h = Math.min(bars[j].h, price * 0.97);
    }
  } else {
    bars[i].l = price;
    bars[i].c = price * 1.005;
    bars[i].o = price * 1.01;
    bars[i].h = price * 1.015;
    for (let j = i - k; j <= i + k; j++) {
      if (j < 0 || j >= bars.length || j === i) continue;
      bars[j].l = Math.max(bars[j].l, price * 1.03);
      bars[j].h = Math.max(bars[j].h, price * 1.05);
    }
  }
}

describe("detectPatterns", () => {
  it("returns nothing on a short series", () => {
    assert.equal(detectPatterns([bar(0, 100), bar(1, 101)]).length, 0);
  });

  it("returns nothing on insufficient data under 24 bars", () => {
    assert.equal(detectPatterns(Array.from({ length: 20 }, (_, i) => bar(i, 100 + i))).length, 0);
  });

  it("caps at three hits", () => {
    const src: OhlcBar[] = [];
    for (let i = 0; i < 80; i++) src.push(bar(i, 100 + (i % 6) * 0.4));
    assert.ok(detectPatterns(src).length <= 3);
  });

  it("does not invent a pattern on a quiet uptrend", () => {
    const src = series(Array.from({ length: 40 }, (_, i) => 100 + i * 0.2));
    const hits = detectPatterns(src);
    assert.ok(!hits.some((h) => h.kind === "double-top" || h.kind === "flag"));
  });

  it("does not crash on noisy data and never exceeds MAX", () => {
    const src = series(Array.from({ length: 90 }, (_, i) => 100 + Math.sin(i * 1.7) * 8 + (i % 3) * 0.4));
    const hits = detectPatterns(src);
    assert.ok(hits.length <= 3);
    const kinds = hits.map((h) => h.kind);
    assert.equal(new Set(kinds).size, kinds.length);
  });
});

describe("detectFlag", () => {
  function poleAndCoil(up: boolean) {
    const closes: number[] = [];
    let px = 100;
    for (let i = 0; i < 20; i++) {
      px *= up ? 1.012 : 0.988;
      closes.push(px);
    }
    const end = px;
    for (let i = 0; i < 12; i++) {
      closes.push(end * (1 + (i % 2 === 0 ? 0.008 : -0.008)));
    }
    return series(closes);
  }

  it("flags a bull pole then a tight coil as forming", () => {
    const hit = detectFlag(poleAndCoil(true));
    assert.ok(hit);
    assert.equal(hit!.kind, "flag");
    assert.equal(hit!.label, "Bull flag");
    assert.equal(hit!.status, "forming");
  });

  it("flags a bear pole then a tight coil", () => {
    const hit = detectFlag(poleAndCoil(false));
    assert.ok(hit);
    assert.equal(hit!.label, "Bear flag");
  });

  it("rejects a coil that is as wide as the pole", () => {
    const closes: number[] = [];
    let px = 100;
    for (let i = 0; i < 16; i++) {
      px *= 1.012;
      closes.push(px);
    }
    const end = px;
    for (let i = 0; i < 12; i++) closes.push(end * (i % 2 === 0 ? 1.12 : 0.88));
    assert.equal(detectFlag(series(closes)), null);
  });

  it("rejects a last print that has already left the coil", () => {
    const src = poleAndCoil(true);
    const last = src[src.length - 1];
    last.c = last.h * 1.2;
    last.h = last.c * 1.01;
    assert.equal(detectFlag(src), null);
  });
});

describe("detectDouble", () => {
  it("detects two similar highs with a 4%+ trough as a forming double top", () => {
    const src = series(Array.from({ length: 50 }, () => 100));
    withSwing(src, 12, "H", 120);
    withSwing(src, 18, "L", 108);
    withSwing(src, 28, "H", 119.5);
    src[src.length - 1].c = 112;
    src[src.length - 1].h = 113;
    src[src.length - 1].l = 111;
    const hit = detectDouble(src);
    assert.ok(hit);
    assert.equal(hit!.kind, "double-top");
    assert.equal(hit!.status, "forming");
  });

  it("marks a double top reached when the last print is through the trough", () => {
    const src = series(Array.from({ length: 50 }, () => 100));
    withSwing(src, 12, "H", 120);
    withSwing(src, 18, "L", 108);
    withSwing(src, 28, "H", 119.5);
    src[src.length - 1].c = 100;
    src[src.length - 1].l = 99;
    const hit = detectDouble(src);
    assert.ok(hit);
    assert.equal(hit!.status, "reached");
  });

  it("detects two similar lows with a peak as a double bottom", () => {
    const src = series(Array.from({ length: 50 }, () => 110));
    withSwing(src, 12, "L", 90);
    withSwing(src, 18, "H", 102);
    withSwing(src, 28, "L", 90.4);
    const hit = detectDouble(src);
    assert.ok(hit);
    assert.equal(hit!.kind, "double-bottom");
  });

  it("rejects highs that are more than 1.5% apart", () => {
    const src = series(Array.from({ length: 50 }, () => 100));
    withSwing(src, 12, "H", 120);
    withSwing(src, 18, "L", 108);
    withSwing(src, 28, "H", 130);
    const hit = detectDouble(src);
    assert.ok(!hit || hit.kind !== "double-top");
  });
});

describe("detectTriangle", () => {
  it("detects converging lower highs and higher lows", () => {
    const src = series(Array.from({ length: 60 }, () => 100));
    withSwing(src, 10, "H", 130);
    withSwing(src, 16, "L", 80);
    withSwing(src, 24, "H", 122);
    withSwing(src, 30, "L", 88);
    withSwing(src, 40, "H", 114);
    withSwing(src, 46, "L", 96);
    const hit = detectTriangle(src);
    assert.ok(hit);
    assert.equal(hit!.label, "Triangle");
    assert.equal(hit!.status, "forming");
  });

  it("detects a descending triangle (lower highs, lower lows)", () => {
    const src = series(Array.from({ length: 60 }, () => 100));
    withSwing(src, 10, "H", 130);
    withSwing(src, 16, "L", 100);
    withSwing(src, 24, "H", 122);
    withSwing(src, 30, "L", 94);
    withSwing(src, 40, "H", 114);
    withSwing(src, 46, "L", 88);
    const hit = detectTriangle(src);
    assert.ok(hit);
    assert.equal(hit!.label, "Descending triangle");
  });

  it("detects an ascending triangle (higher highs, higher lows)", () => {
    const src = series(Array.from({ length: 60 }, () => 100));
    withSwing(src, 10, "H", 110);
    withSwing(src, 16, "L", 80);
    withSwing(src, 24, "H", 118);
    withSwing(src, 30, "L", 88);
    withSwing(src, 40, "H", 126);
    withSwing(src, 46, "L", 96);
    const hit = detectTriangle(src);
    assert.ok(hit);
    assert.equal(hit!.label, "Ascending triangle");
  });

  it("returns null without three highs and three lows", () => {
    const src = series(Array.from({ length: 30 }, (_, i) => 100 + i));
    assert.equal(detectTriangle(src), null);
  });
});

describe("detectRange", () => {
  it("detects a tight two-sided range", () => {
    const src = series(Array.from({ length: 50 }, () => 100));
    withSwing(src, 10, "H", 110);
    withSwing(src, 16, "L", 100);
    withSwing(src, 24, "H", 110.5);
    withSwing(src, 30, "L", 100.2);
    withSwing(src, 38, "H", 109.6);
    withSwing(src, 44, "L", 99.8);
    const hit = detectRange(src);
    assert.ok(hit);
    assert.equal(hit!.kind, "range");
    assert.equal(hit!.status, "forming");
  });

  it("rejects a range that is too wide", () => {
    const src = series(Array.from({ length: 50 }, () => 100));
    withSwing(src, 10, "H", 140);
    withSwing(src, 16, "L", 80);
    withSwing(src, 24, "H", 139);
    withSwing(src, 30, "L", 81);
    assert.equal(detectRange(src), null);
  });
});

describe("detectPatterns status over time", () => {
  it("relabels a double top from forming to reached when the last print leaves the trough", () => {
    const src = series(Array.from({ length: 50 }, () => 100));
    withSwing(src, 12, "H", 120);
    withSwing(src, 18, "L", 108);
    withSwing(src, 28, "H", 119.5);
    src[src.length - 1].c = 112;
    src[src.length - 1].h = 113;
    src[src.length - 1].l = 111;
    const forming = detectDouble(src);
    assert.equal(forming?.status, "forming");
    src.push(bar(src.length, 100));
    src[src.length - 1].c = 100;
    src[src.length - 1].l = 99;
    const reached = detectDouble(src);
    assert.equal(reached?.kind, "double-top");
    assert.equal(reached?.status, "reached");
  });
});
