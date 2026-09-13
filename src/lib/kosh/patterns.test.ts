import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectPatterns } from "./patterns.ts";
import type { OhlcBar } from "./types.ts";

function bar(i: number, c: number, v = 1_000_000): OhlcBar {
  return { t: 1_700_000_000 + i * 86400, o: c, h: c * 1.01, l: c * 0.99, c, v };
}

describe("detectPatterns", () => {
  it("returns nothing on a short series", () => {
    assert.equal(detectPatterns([bar(0, 100), bar(1, 101)]).length, 0);
  });

  it("caps at three hits", () => {
    const src: OhlcBar[] = [];
    for (let i = 0; i < 80; i++) src.push(bar(i, 100 + (i % 6) * 0.4));
    assert.ok(detectPatterns(src).length <= 3);
  });
});
