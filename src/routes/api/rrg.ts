import { createFileRoute } from "@tanstack/react-router";
import type { Timeframe } from "@/lib/kosh/rrg-frame";
import { parseRotationNote, upstreamFailure, type RotationRequest } from "@/lib/kosh/rrg-note";
import { loadRegistry, loadRrgPack, registrySummary, searchRegistry } from "@/lib/kosh/rrg-read.server";
import { sectorMembers } from "@/lib/kosh/rrg-members.server";
import { sectorBoard } from "@/lib/kosh/rrg-sectors";

export const Route = createFileRoute("/api/rrg")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("catalog") === "summary") {
          const indices = loadRegistry().filter((item) => item.category !== "stock" && item.category !== "source" && (item.status === "imported" || item.status === "limited" || item.status === "stale"));
          return Response.json({ summary: registrySummary(), indices });
        }
        if (url.searchParams.get("catalog") === "sectors") {
          return Response.json({ sectors: sectorBoard(loadRegistry()), membership: "current-only" });
        }
        if (url.searchParams.get("catalog") === "members") {
          const symbol = (url.searchParams.get("symbol") || "").trim();
          if (!symbol) return Response.json({ unavailable: "Name the sector." }, { status: 400 });
          const basket = await sectorMembers(symbol);
          return Response.json(basket, { status: "unavailable" in basket && basket.unavailable && !("rows" in basket) ? 404 : 200 });
        }
        if (url.searchParams.get("catalog") === "search") {
          const items = searchRegistry(url.searchParams.get("q") || "", {
            exchange: url.searchParams.get("exchange") || undefined,
            category: url.searchParams.get("category") || undefined,
            status: url.searchParams.get("status") || undefined,
          });
          return Response.json({ items });
        }
        if (url.searchParams.get("catalog") === "1") {
          const items = loadRegistry().filter((item) => item.category !== "stock").slice(0, 40);
          return Response.json({ items });
        }
        const timeframe = url.searchParams.get("tf");
        const tf: Timeframe = timeframe === "weekly" || timeframe === "monthly" ? timeframe : "daily";
        const asOf = url.searchParams.get("asOf") || undefined;
        const rawSymbols = url.searchParams.get("symbols");
        const group = url.searchParams.get("group");
        const tail = Math.min(60, Math.max(2, Number(url.searchParams.get("tail")) || 12));
        try {
          const pack = loadRrgPack({
            mode: url.searchParams.get("mode") === "stock" ? "stock" : "sector",
            group: group === "size" || group === "broad" || group === "stock" || group === "sector" ? group : undefined,
            benchmark: url.searchParams.get("benchmark") || "NIFTY 50",
            symbols: rawSymbols == null ? [] : rawSymbols.split(",").map((item) => item.trim()).filter(Boolean),
            explicit: rawSymbols != null,
            timeframe: tf,
            asOf: asOf && /^\d{4}-\d{2}-\d{2}$/.test(asOf) ? asOf : undefined,
            tail,
          });
          return Response.json(pack, { status: pack.error ? 400 : 200 });
        } catch {
          return Response.json({ error: "The stored histories could not be read." }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) return Response.json({ ok: false, error: "AI is not available in this environment." }, { status: 503 });
        const body = (await request.json().catch(() => null)) as { request?: RotationRequest } | null;
        const facts = body?.request;
        if (!facts || !Array.isArray(facts.readings) || !facts.readings.length) {
          return Response.json({ ok: false, error: "Nothing on this date has both an RS-Ratio and RS-Momentum." }, { status: 400 });
        }
        const prompt = [
          "Write a rotation note from this snapshot only. Return JSON with keys overview, leading, improving, fading, lagging, transitions, timeframes, shortlist.",
          "Use an empty string for a section that the snapshot does not support. Do not invent news, breadth, a catalyst, a target, or a probability.",
          "Relative strength is not the same as the price going up. Do not give a buy or sell instruction.",
          "If historical is true, discuss that asOf date. Do not replace it with a later session.",
          "This is Kosh's own rotation calculation, not a claim that it reproduces another firm's formula.",
          JSON.stringify(facts),
        ].join("\n");
        try {
          const res = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "grok-4.5",
              temperature: 0.2,
              max_tokens: 700,
              response_format: { type: "json_object" },
              messages: [{ role: "user", content: prompt }],
            }),
            signal: AbortSignal.timeout(40_000),
          });
          if (!res.ok) {
            const failure = upstreamFailure(res.status);
            return Response.json({ ok: false, error: failure.error }, { status: failure.status });
          }
          const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const parsed = parseRotationNote(data.choices?.[0]?.message?.content?.trim() || "");
          if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 502 });
          return Response.json({ ok: true, note: parsed.note });
        } catch (error) {
          const timedOut = error instanceof Error && error.name === "TimeoutError";
          return Response.json({ ok: false, error: timedOut ? "The model took too long." : "The model did not answer." }, { status: timedOut ? 504 : 502 });
        }
      },
    },
  },
});
