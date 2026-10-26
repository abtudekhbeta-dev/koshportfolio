import { createFileRoute } from "@tanstack/react-router";
import { foreignClaim, withoutForeignSentences } from "@/lib/kosh/flow-brief";
import { buildFlowDesk, type FlowDesk } from "@/lib/kosh/flow-desk";
import { loadFlowPack } from "@/lib/kosh/market-flows.server";

const KEYS = ["takeaway", "changes", "alignment", "history", "price", "risks", "watch"] as const;
type NoteKey = (typeof KEYS)[number];

function notePrompt(desk: FlowDesk, stray: string | null) {
  return [
    "Interpret this verified Indian cash-market flow desk for someone who can already see the charts.",
    "Return only JSON with keys takeaway, changes, alignment, history, price, risks, watch.",
    "Each value is one or two sentences.",
    "takeaway: the single most useful reading. Do not restate every number.",
    "changes: what actually shifted. If the desk says nothing material changed, say that.",
    "alignment: whether FII and DII are buying together, selling together, or offsetting. Use the session counts below.",
    "history: only a comparison written below, including the percentile or z-score method when one is supplied. If a window was withheld, say it was not calculated.",
    "price: whether the index return confirms, contradicts, or cannot be compared. Do not say the flows caused the move.",
    "risks: a limitation that applies to this file, not a generic essay.",
    "watch: one measurable condition for the next published sessions. Not a price target.",
    "Cite only figures written below. Do not calculate a new total, average, percent, z-score, or ratio.",
    "Do not invent gross buy or sell, a cause, a probability, or a bullish or bearish score.",
    stray ? `The previous draft cited ${stray}, which is not an approved figure. Remove it and do not replace it with another number.` : "",
    desk.lines.join("\n"),
  ]
    .filter(Boolean)
    .join("\n");
}

async function askModel(apiKey: string, prompt: string) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) return { error: "The model did not answer." } as const;
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim() || "";
  if (!text) return { error: "The model returned an empty note." } as const;
  try {
    return { parsed: JSON.parse(text) as Record<string, unknown> };
  } catch {
    return { error: "The model did not return a readable note." } as const;
  }
}

function readNote(parsed: Record<string, unknown>, desk: FlowDesk) {
  const report = {} as Record<NoteKey, string>;
  let stray: string | null = null;
  let trimmed = false;
  const brief = { allowedNumbers: desk.allowedNumbers, dates: desk.dates, returnNumbers: desk.returnNumbers };
  for (const key of KEYS) {
    const value = parsed[key];
    if (typeof value !== "string" || !value.trim()) return { error: "The model left out part of the note." } as const;
    const found = foreignClaim(value, brief);
    if (!found) {
      report[key] = value.trim();
      continue;
    }
    const settled = withoutForeignSentences(value, brief);
    if (settled.stray && settled.text === value.trim()) {
      stray = stray || settled.stray;
      report[key] = value.trim();
      continue;
    }
    trimmed = true;
    stray = stray || settled.stray;
    report[key] = settled.text;
  }
  return { report, stray, trimmed };
}

export const Route = createFileRoute("/api/market-flows")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await loadFlowPack());
        } catch {
          return Response.json({
            unavailable: "The cash-flow file could not be read.",
            source: { name: "Stored cash-flow archive", url: "", page: "", note: "", status: "Provisional", retrievedAt: new Date().toISOString(), from: null, latest: null, sessions: 0 },
            coverage: null,
            nifty: { symbol: "^NSEI", source: "", missingSessions: 0, from: null, to: null, sessions: 0 },
            daily: [],
            weekly: [],
            monthly: [],
            verdicts: { daily: null, weekly: null, monthly: null },
            analogue: { ok: false, reason: "The cash-flow file could not be read." },
          });
        }
      },
      POST: async () => {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) return Response.json({ ok: false, error: "AI is not available in this environment." });
        const pack = await loadFlowPack();
        if (pack.unavailable) return Response.json({ ok: false, error: pack.unavailable });
        const desk = buildFlowDesk(
          pack.daily.map((bar) => ({
            date: bar.end,
            fiiNet: bar.fiiNet,
            diiNet: bar.diiNet,
            indexReturn: bar.indexReturn,
            indexStart: bar.indexStart,
            indexEnd: bar.indexEnd,
          })),
        );
        const brief = { allowedNumbers: desk.allowedNumbers, dates: desk.dates, returnNumbers: desk.returnNumbers };
        try {
          const first = await askModel(apiKey, notePrompt(desk, null));
          if ("error" in first) return Response.json({ ok: false, error: first.error });
          let read = readNote(first.parsed, desk);
          if ("error" in read) return Response.json({ ok: false, error: read.error });
          let report = read.report;
          let stray = read.stray;
          let trimmed = read.trimmed;
          if (stray && KEYS.some((key) => foreignClaim(report[key], brief))) {
            const second = await askModel(apiKey, notePrompt(desk, stray));
            if (!("error" in second)) {
              const again = readNote(second.parsed, desk);
              if (!("error" in again)) {
                report = again.report;
                stray = again.stray;
                trimmed = again.trimmed;
              }
            }
          }
          const blocked = KEYS.map((key) => foreignClaim(report[key], brief)).find((item) => item);
          if (blocked) {
            return Response.json({
              ok: false,
              error: `The model cited ${blocked}, which is not in the cash-flow file. The charts and totals are unchanged. Try again.`,
            });
          }
          return Response.json({
            ok: true,
            model: "grok-4.5",
            generatedAt: new Date().toISOString(),
            latestDate: desk.latestDate,
            materialKey: desk.materialKey,
            trimmed,
            report,
          });
        } catch {
          return Response.json({ ok: false, error: "The model did not answer. The charts and totals are unchanged." });
        }
      },
    },
  },
});