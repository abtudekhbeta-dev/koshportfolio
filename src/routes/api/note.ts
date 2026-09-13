import { createFileRoute } from "@tanstack/react-router";
import { executeNote, type NoteKind } from "@/lib/kosh/ai.server";

const KINDS = new Set<NoteKind>(["quality", "spark", "ask", "pulse", "book", "desk", "holdings", "fund", "qual", "structure", "picks", "combine", "improve"]);

const hits = new Map<string, number[]>();
function limited(id: string, max = 80, windowMs = 10 * 60 * 1000) {
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

export const Route = createFileRoute("/api/note")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
        if (!limited(ip)) return Response.json({ ok: false, error: "Too many reads. Try again in a few minutes." }, { status: 429 });

        const body = (await request.json().catch(() => ({}))) as {
          symbol?: string;
          kind?: string;
          question?: string;
          book?: {
            name?: string;
            bench?: string;
            names?: {
              symbol?: string;
              weight?: number;
              sector?: string;
              fundTag?: string;
              fundRating?: string;
              fundVerdict?: string;
              qualTag?: string;
              qualPotential?: string;
              qualVerdict?: string;
            }[];
          };
          chart?: {
            interval?: string;
            lookback?: string;
            last?: number;
            rsi?: number | null;
            swings?: { label?: string; price?: number; t?: number }[];
            levels?: { price?: number; n?: number; labels?: string[] }[];
            mtf?: { price?: number; n?: number; labels?: string[] }[];
            mode?: string;
          };
          prior?: { fund?: string; qual?: string };
          fresh?: number;
        };
        const kind = (body.kind || "") as NoteKind;
        if (!KINDS.has(kind)) return Response.json({ ok: false, error: "Unknown desk" }, { status: 400 });

        const book = body.book
          ? {
              name: String(body.book.name || "Portfolio").slice(0, 80),
              bench: String(body.book.bench || "nifty").slice(0, 40),
              names: (body.book.names || []).slice(0, 40).map((h) => ({
                symbol: String(h.symbol || "").slice(0, 24),
                weight: Number(h.weight) || 0,
                sector: String(h.sector || "").slice(0, 40),
                fundTag: String(h.fundTag || "").slice(0, 80) || undefined,
                fundRating: String(h.fundRating || "").slice(0, 8) || undefined,
                fundVerdict: String(h.fundVerdict || "").slice(0, 400) || undefined,
                qualTag: String(h.qualTag || "").slice(0, 80) || undefined,
                qualPotential: String(h.qualPotential || "").slice(0, 8) || undefined,
                qualVerdict: String(h.qualVerdict || "").slice(0, 400) || undefined,
              })),
            }
          : undefined;

        const result = await executeNote({
          symbol: String(body.symbol || "").slice(0, 24),
          kind,
          question: String(body.question || "").slice(0, 400),
          fresh: Number(body.fresh) || undefined,
          book,
          prior:
            body.prior && (body.prior.fund || body.prior.qual)
              ? {
                  fund: String(body.prior.fund || "").slice(0, 14000),
                  qual: String(body.prior.qual || "").slice(0, 14000),
                }
              : undefined,
          chart: body.chart
            ? {
                interval: String(body.chart.interval || "").slice(0, 8),
                lookback: String(body.chart.lookback || "").slice(0, 8),
                last: Number(body.chart.last) || 0,
                rsi: body.chart.rsi == null ? null : Number(body.chart.rsi),
                mode: String(body.chart.mode || "").slice(0, 16) || undefined,
                swings: (body.chart.swings || []).slice(0, 16).map((s) => ({
                  label: String(s.label || "").slice(0, 8),
                  price: Number(s.price) || 0,
                  t: Number(s.t) || 0,
                })),
                levels: (body.chart.levels || []).slice(0, 10).map((l) => ({
                  price: Number(l.price) || 0,
                  n: Number(l.n) || 0,
                  labels: (l.labels || []).slice(0, 6).map((x) => String(x).slice(0, 12)),
                })),
                mtf: (body.chart.mtf || []).slice(0, 8).map((l) => ({
                  price: Number(l.price) || 0,
                  n: Number(l.n) || 0,
                  labels: (l.labels || []).slice(0, 6).map((x) => String(x).slice(0, 12)),
                })),
              }
            : undefined,
        });
        return Response.json(result);
      },
    },
  },
});
