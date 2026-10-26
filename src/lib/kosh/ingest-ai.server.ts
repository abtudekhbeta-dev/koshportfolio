import {
  acceptProposals,
  classifyAiFailure,
  parseAiBody,
  shouldRetryAi,
  type Proposal,
} from "./ingest-review.ts";
import type { AiFailureClass } from "./types.ts";

export type IngestAiResult = {
  ok: boolean;
  status: "ok" | "unconfigured" | "failed";
  aiClass?: AiFailureClass;
  proposals: Proposal[];
  rejected: number;
  fallback: boolean;
};

const SYSTEM = `You interpret broker-file labels. You do not calculate money.
Return JSON only, no markdown:
{"proposals":[{"kind":"symbol"|"date"|"side"|"header"|"classify","row":number,"field":string,"from":string,"to":string,"reason":string}]}
Rules:
- Do not include quantity, price, average, value, fees, tax, weight, or XIRR.
- kind symbol: "to" must be a ticker already written in that same row. Never invent a ticker.
- kind date: "to" is YYYY-MM-DD only when the row makes the day and month unambiguous.
- kind side: "to" is buy or sell only when the row says so.
- kind header: "from" is the header text, "to" is symbol, name, qty, price, date, side, or isin.
- kind classify: holding, buy, sell, dividend, charge, opening, or closing, only when that word is in the row.
- If nothing is wrong, return {"proposals":[]}.`;

function empty(status: IngestAiResult["status"], aiClass?: AiFailureClass): IngestAiResult {
  return { ok: status === "ok", status, aiClass, proposals: [], rejected: 0, fallback: true };
}

function hint(status: number, raw: string) {
  if (status === 429) return "rate limit";
  if (status === 402 || /credit|quota|exhaust/i.test(raw)) return "credits exhausted";
  if (status === 401) return "invalid api key";
  return `status ${status}`;
}

async function complete(key: string, user: string) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0,
      max_tokens: 700,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(12_000),
  });
  const raw = await res.text();
  return { ok: res.ok, status: res.status, raw };
}

function fromContent(content: string, sources: string[]): IngestAiResult {
  const parsed = parseAiBody(content);
  if (!parsed.ok) return empty("failed", parsed.aiClass);
  const got = acceptProposals(sources, parsed.proposals);
  return { ok: true, status: "ok", proposals: got.proposals, rejected: got.rejected, fallback: false };
}

/** Optional label check. Parser output is unchanged when this returns fallback. */
export async function interpretIngest(input: { headers: string[]; rows: string[][]; filename?: string }): Promise<IngestAiResult> {
  const key = process.env.XAI_API_KEY;
  if (!key) return { ...empty("unconfigured", "unconfigured") };
  const rows = (input.rows || []).slice(0, 12).map((r) => r.slice(0, 8).map((c) => String(c).slice(0, 60)));
  const sources = rows.map((r) => r.join(" | "));
  const user = JSON.stringify({
    filename: String(input.filename || "").slice(0, 80),
    headers: (input.headers || []).slice(0, 12),
    rows,
  }).slice(0, 12_000);

  const read = async (hit: { ok: boolean; status: number; raw: string }): Promise<IngestAiResult | null> => {
    if (!hit.ok) return null;
    try {
      const json = JSON.parse(hit.raw) as { choices?: { message?: { content?: string } }[] };
      return fromContent(json.choices?.[0]?.message?.content || "", sources);
    } catch {
      return empty("failed", "malformed");
    }
  };

  try {
    let hit = await complete(key, user);
    if (!hit.ok) {
      const aiClass = classifyAiFailure({ status: hit.status, message: hint(hit.status, hit.raw) });
      if (shouldRetryAi(aiClass, false)) hit = await complete(key, user);
      if (!hit.ok) {
        const again = classifyAiFailure({ status: hit.status, message: hint(hit.status, hit.raw) });
        console.error("[ingest] ai", again, hit.status);
        return empty("failed", again);
      }
    }
    return (await read(hit)) || empty("failed", "malformed");
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    const message = err instanceof Error ? err.message : "";
    const aiClass = classifyAiFailure({ name, message });
    if (shouldRetryAi(aiClass, false)) {
      try {
        const hit = await complete(key, user);
        if (hit.ok) return (await read(hit)) || empty("failed", "malformed");
        const again = classifyAiFailure({ status: hit.status, message: hint(hit.status, hit.raw) });
        console.error("[ingest] ai", again, hit.status);
        return empty("failed", again);
      } catch (err2) {
        const name2 = err2 instanceof Error ? err2.name : "";
        const message2 = err2 instanceof Error ? err2.message : "";
        const again = classifyAiFailure({ name: name2, message: message2 });
        console.error("[ingest] ai", again);
        return empty("failed", again);
      }
    }
    console.error("[ingest] ai", aiClass);
    return empty("failed", aiClass);
  }
}
