import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextPending, noteFailure } from "./outbox.ts";

describe("sync outbox", () => {
  it("retries the same body under one id and starts a new id when the body changes", () => {
    const a = nextPending(null, "fp-a", 1);
    const b = nextPending(a, "fp-a", 2);
    const c = nextPending(b, "fp-a", 3);
    assert.equal(a.id, b.id);
    assert.equal(b.id, c.id);
    const next = nextPending(c, "fp-b", 4);
    assert.notEqual(next.id, c.id);
    const failed = noteFailure(c, c.id);
    assert.equal(failed?.attempts, 1);
    assert.equal(failed?.id, c.id);
    assert.equal(noteFailure(failed, "other"), failed);
  });
});
