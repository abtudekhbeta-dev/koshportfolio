import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  areaPath,
  buildRows,
  buildSvgDoc,
  countable,
  domain,
  extremes,
  seriesPath,
  smaRows,
  sparkHeights,
  svgDataUrl,
  thin,
} from "./plot.ts";
import type { NavPoint } from "./types";

function nav(n: number, port0 = 100, bench0 = 100, dp = 0.002, db = 0.001): NavPoint[] {
  const t0 = Date.UTC(2020, 0, 2) / 1000;
  const out: NavPoint[] = [];
  let p = port0;
  let b = bench0;
  for (let i = 0; i < n; i++) {
    out.push({
      t: t0 + i * 86400,
      day: new Date((t0 + i * 86400 + 19800) * 1000).toISOString().slice(0, 10),
      port: p,
      bench: b,
      covered: 1,
      names: 1,
      wAvail: 1,
    });
    p *= 1 + dp;
    b *= 1 + db;
  }
  return out;
}

describe("plot", () => {
  it("thins but keeps first and last", () => {
    const rows = Array.from({ length: 2000 }, (_, i) => ({ day: String(i), port: 100 + i, bench: 100 }));
    const t = thin(rows, 50);
    assert.ok(t.length <= 51);
    assert.equal(t[0].port, 100);
    assert.equal(t.at(-1)?.port, 100 + 1999);
  });

  it("buildRows growth has finite port on every session", () => {
    const { rows, bar } = buildRows(nav(80), "cum", "MAX");
    assert.equal(bar, false);
    assert.ok(rows.length >= 20);
    assert.equal(countable(rows, "port"), rows.length);
    assert.ok(countable(rows, "bench") >= 20);
    const { lo, hi } = domain(rows);
    assert.ok(hi > lo);
    const d = seriesPath(rows, "port", lo, hi);
    assert.match(d, /^M/);
    assert.match(d, /L/);
    assert.ok(d.length > 40);
    const a = areaPath(rows, lo, hi);
    assert.match(a, /Z$/);
  });

  it("5Y slice still has a drawable path", () => {
    const { rows } = buildRows(nav(1500), "cum", "5Y");
    assert.ok(rows.length >= 2);
    const { lo, hi } = domain(rows);
    const d = seriesPath(rows, "port", lo, hi);
    assert.ok(d.split("L").length > 5);
  });

  it("svg document paints a mix line with hardcoded hex", () => {
    const { rows, bar } = buildRows(nav(80), "cum", "MAX");
    const svg = buildSvgDoc({
      rows,
      bar,
      rupee: false,
      mixStroke: "#7aa2ff",
      sma: smaRows(rows, 8),
      years: [],
      peak: extremes(rows).peak,
      showSma: true,
    });
    assert.match(svg, /<svg /);
    assert.match(svg, /#7aa2ff/);
    assert.match(svg, / d="M/);
    assert.match(svg, / [LC]/);
    assert.match(svg, /data-kosh="plot"/);
    const url = svgDataUrl(svg);
    assert.ok(url.startsWith("data:image/svg+xml"));
    assert.ok(url.length > 400);
  });

  it("fill off skips the area path", () => {
    const { rows, bar } = buildRows(nav(40), "cum", "MAX");
    const withFill = buildSvgDoc({ rows, bar, rupee: false, mixStroke: "#7aa2ff", fill: true });
    const noFill = buildSvgDoc({ rows, bar, rupee: false, mixStroke: "#7aa2ff", fill: false });
    assert.match(withFill, /koshFill/);
    assert.equal(noFill.includes("koshFill"), false);
  });

  it("html mountain bars have height", () => {
    const { rows } = buildRows(nav(80), "cum", "MAX");
    const bars = sparkHeights(rows, 40);
    assert.ok(bars.length >= 20);
    assert.ok(bars.some((b) => b.h > 10));
    assert.ok(bars.every((b) => b.h >= 0 && b.h <= 100));
  });
});
