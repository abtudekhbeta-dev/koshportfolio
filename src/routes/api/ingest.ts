import { createFileRoute } from "@tanstack/react-router";
import { interpretIngest } from "@/lib/kosh/ingest-ai.server";
import { redactSensitive } from "@/lib/kosh/sanitize";

const hits = new Map<string, number[]>();
function limited(id: string, max = 20, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(id) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(id, arr);
    return false;
  }
  arr.push(now);
  hits.set(id, arr);
  return true;
}

function cell(v: unknown, n: number) {
  return redactSensitive(String(v ?? "")).slice(0, n);
}

export const Route = createFileRoute("/api/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
        if (!limited(ip)) {
          return Response.json(
            { ok: false, status: "failed", aiClass: "rate", proposals: [], rejected: 0, fallback: true },
            { status: 429 },
          );
        }
        const text = await request.text();
        if (text.length > 40_000) {
          return Response.json(
            { ok: false, status: "failed", aiClass: "schema", proposals: [], rejected: 0, fallback: true },
            { status: 413 },
          );
        }
        let body: { filename?: unknown; headers?: unknown; rows?: unknown } = {};
        try {
          body = JSON.parse(text) as typeof body;
        } catch {
          return Response.json(
            { ok: false, status: "failed", aiClass: "malformed", proposals: [], rejected: 0, fallback: true },
            { status: 400 },
          );
        }
        const headers = Array.isArray(body.headers) ? body.headers.slice(0, 12).map((h) => cell(h, 40)) : [];
        const rows = Array.isArray(body.rows)
          ? body.rows.slice(0, 12).map((row) => (Array.isArray(row) ? row.slice(0, 8).map((c) => cell(c, 60)) : []))
          : [];
        const result = await interpretIngest({
          filename: cell(body.filename, 80),
          headers,
          rows,
        });
        return Response.json(result);
      },
    },
  },
});
