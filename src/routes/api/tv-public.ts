import { createFileRoute } from "@tanstack/react-router";
import { classifyTvUrl, parseSharedChart, parseSharedWatchlist } from "@/lib/kosh/ledger-import";

const MAX_BYTES = 600_000;

export const Route = createFileRoute("/api/tv-public")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const target = new URL(request.url).searchParams.get("url") || "";
        const classified = classifyTvUrl(target);
        if ("error" in classified) return Response.json({ ok: false, error: classified.error }, { status: 400 });
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(classified.href, {
            redirect: "manual",
            signal: controller.signal,
            headers: { accept: "text/html", "user-agent": "Kosh/1.0" },
          });
          if (response.status >= 300 && response.status < 400) {
            return Response.json({ ok: false, error: "TradingView redirected that link. Kosh does not follow it." }, { status: 502 });
          }
          if (!response.ok) {
            return Response.json({ ok: false, error: `TradingView returned ${response.status}.` }, { status: 502 });
          }
          const type = response.headers.get("content-type") || "";
          if (!type.includes("text/html") && !type.includes("json")) {
            return Response.json({ ok: false, error: "The response was not an HTML page." }, { status: 502 });
          }
          const reader = response.body?.getReader();
          if (!reader) return Response.json({ ok: false, error: "The page had no body." }, { status: 502 });
          const chunks: Uint8Array[] = [];
          let size = 0;
          while (size < MAX_BYTES) {
            const step = await reader.read();
            if (step.done) break;
            size += step.value.byteLength;
            chunks.push(step.value);
          }
          await reader.cancel().catch(() => undefined);
          const html = new TextDecoder().decode(concat(chunks).slice(0, MAX_BYTES));
          if (classified.kind === "watchlist") {
            const list = parseSharedWatchlist(html);
            if (!list) {
              return Response.json({
                ok: false,
                error: "The public page did not include a shared watchlist. Private lists are not requested.",
              });
            }
            return Response.json({
              ok: true,
              kind: "watchlist",
              name: list.name,
              symbols: list.symbols,
              drawingsFound: false,
              note: "Symbols came from the public shared-watchlist page. This page does not include chart drawings.",
            });
          }
          const chart = parseSharedChart(html);
          return Response.json({
            ok: true,
            kind: "chart",
            symbols: chart.symbols,
            drawingsFound: chart.drawingObjects > 0,
            note: chart.note,
          });
        } catch {
          return Response.json({ ok: false, error: "The TradingView page could not be read." }, { status: 502 });
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});

function concat(chunks: Uint8Array[]): Uint8Array {
  const size = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}
