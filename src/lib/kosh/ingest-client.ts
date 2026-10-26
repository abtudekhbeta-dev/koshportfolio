import type { IngestAiResult } from "./ingest-ai.server.ts";
import { classifyAiFailure } from "./ingest-review.ts";
import type { ReviewPayload } from "./ingest-review.ts";

/** One read for the current import attempt. A failure leaves the parser result in place. */
export async function requestIngestReview(payload: ReviewPayload): Promise<IngestAiResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch("/api/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const body = (await res.json().catch(() => null)) as IngestAiResult | null;
    if (!body || typeof body !== "object" || !Array.isArray(body.proposals)) {
      return {
        ok: false,
        status: "failed",
        aiClass: res.status === 429 ? "rate" : "malformed",
        proposals: [],
        rejected: 0,
        fallback: true,
      };
    }
    return body;
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    const message = err instanceof Error ? err.message : "";
    return {
      ok: false,
      status: "failed",
      aiClass: classifyAiFailure({ name, message }),
      proposals: [],
      rejected: 0,
      fallback: true,
    };
  } finally {
    clearTimeout(timer);
  }
}
