import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mergeFlowNotes, type FlowNote } from "./flow-notes.ts";

function note(key: string, changes: string): FlowNote {
  return {
    id: key,
    at: "2026-10-26T00:00:00.000Z",
    latestDate: "2026-10-23",
    materialKey: key,
    model: "grok-4.5",
    takeaway: "t",
    changes,
    alignment: "a",
    history: "h",
    price: "p",
    risks: "r",
    watch: "w",
  };
}

describe("flow notes", () => {
  it("replaces the same session and keeps an older one", () => {
    const next = mergeFlowNotes([note("a", "first"), note("b", "older")], note("a", "rewrite"));
    assert.equal(next.length, 2);
    assert.equal(next[0].changes, "rewrite");
    assert.equal(next[1].materialKey, "b");
  });
});
