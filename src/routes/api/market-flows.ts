import { createFileRoute } from "@tanstack/react-router";
import { loadFlowPack } from "@/lib/kosh/market-flows.server";

export const Route = createFileRoute("/api/market-flows")({
  server: {
    handlers: {
      GET: async () => Response.json(await loadFlowPack()),
      POST: async ({ request }) => {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) return Response.json({ ok: false, error: "AI is not available in this environment." });
        const pack = await loadFlowPack();
        if (pack.unavailable) return Response.json({ ok: false, error: pack.unavailable });
        const facts = {
          source: pack.source,
          nifty: pack.nifty,
          verdicts: pack.verdicts,
          analogue: pack.analogue,
          latestDaily: pack.daily.slice(-15),
          weekly: pack.weekly,
          monthly: pack.monthly,
        };
        const prompt = [
          "You are reading a verified flow pack for an Indian equity investor.",
          "Use only the JSON facts. Do not invent dates, flows, returns, events, or probabilities.",
          "Do not give a price target. Do not say who caused the move.",
          "Write four short parts: verdict, what the daily weekly and monthly windows agree on, what would change the reading, and what is not knowable.",
          "If analogue.ok is false, say there is not enough history. Do not invent similar periods.",
          JSON.stringify(facts),
        ].join("\n");
        try {
          const res = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "grok-4.5",
              temperature: 0.2,
              messages: [{ role: "user", content: prompt }],
            }),
            signal: AbortSignal.timeout(40_000),
          });
          if (!res.ok) return Response.json({ ok: false, error: "The model did not answer." });
          const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const text = data.choices?.[0]?.message?.content?.trim() || "";
          if (!text) return Response.json({ ok: false, error: "The model returned an empty note." });
          return Response.json({ ok: true, text });
        } catch {
          return Response.json({ ok: false, error: "The model did not answer." });
        }
      },
    },
  },
});
