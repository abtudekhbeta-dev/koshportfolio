import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cmpMissingLast, cycleSort, nextSortDir, sortEntities } from "./kosh-table.ts";

describe("kosh-table sort", () => {
  it("numeric desc then asc then reset", () => {
    assert.equal(nextSortDir(null), "desc");
    assert.equal(nextSortDir("desc"), "asc");
    assert.equal(nextSortDir("asc"), null);
    const c1 = cycleSort({ key: null, dir: null }, "px");
    assert.deepEqual(c1, { key: "px", dir: "desc" });
    const c2 = cycleSort(c1, "px");
    assert.deepEqual(c2, { key: "px", dir: "asc" });
    const c3 = cycleSort(c2, "px");
    assert.deepEqual(c3, { key: null, dir: null });
  });

  it("missing numbers sort last and are not treated as 0", () => {
    const rows = [
      { n: "a", v: 2 },
      { n: "b", v: null as number | null },
      { n: "c", v: 10 },
      { n: "d", v: 0 },
    ];
    const desc = sortEntities(rows, "v", "desc");
    assert.equal(desc[0].n, "c");
    assert.equal(desc[1].n, "a");
    assert.equal(desc[2].n, "d");
    assert.equal(desc[3].n, "b");
    const asc = sortEntities(rows, "v", "asc");
    assert.equal(asc[0].n, "d");
    assert.equal(asc.at(-1)?.n, "b");
  });

  it("text sort is alphabetical", () => {
    const rows = [{ n: "TCS" }, { n: "Reliance" }, { n: "HDFC" }];
    const asc = sortEntities(rows, "n", "asc");
    assert.deepEqual(
      asc.map((r) => r.n),
      ["HDFC", "Reliance", "TCS"],
    );
  });

  it("date sort is chronological", () => {
    const rows = [
      { d: new Date("2024-01-02") },
      { d: new Date("2023-12-01") },
      { d: new Date("2025-06-01") },
    ];
    const asc = sortEntities(rows, "d", "asc");
    assert.equal(asc[0].d.getFullYear(), 2023);
    assert.equal(asc.at(-1)?.d.getFullYear(), 2025);
  });

  it("cmpMissingLast never converts null to 0", () => {
    assert.equal(cmpMissingLast(null, 0, "asc"), 1);
    assert.equal(cmpMissingLast(0, null, "asc"), -1);
  });
});
