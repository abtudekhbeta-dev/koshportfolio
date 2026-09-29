/** Reject AI research that has no evidence, substitutes a metric, or is malformed. */

export type ResearchItem = {
  metric: string;
  status: "researched" | "not_found" | "inputs_only" | "conflicting";
  value: number | null;
  unit: string;
  period: string | null;
  sourceName: string;
  sourceUrl: string;
  evidence: string;
  methodology: string;
  inputs: { name: string; value: number; unit: string }[];
};

export type ResearchPack = {
  ok: true;
  symbol: string;
  items: ResearchItem[];
};

const STATUSES = new Set(["researched", "not_found", "inputs_only", "conflicting"]);

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function validateResearch(raw: unknown, requested: string[]): { ok: true; items: ResearchItem[] } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "AI research unavailable" };
  const items = (raw as { items?: unknown }).items;
  if (!Array.isArray(items)) return { ok: false, error: "AI research unavailable" };
  const want = new Set(requested.map((s) => s.toLowerCase()));
  const out: ResearchItem[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") return { ok: false, error: "AI research unavailable" };
    const o = item as Record<string, unknown>;
    const metric = String(o.metric || "").trim();
    const status = String(o.status || "");
    if (!metric || !STATUSES.has(status)) return { ok: false, error: "AI research unavailable" };
    if (want.size && ![...want].some((w) => metric.toLowerCase().includes(w) || w.includes(metric.toLowerCase()))) {
      return { ok: false, error: `AI returned ${metric}, which was not requested.` };
    }
    const value = num(o.value);
    const sourceUrl = String(o.sourceUrl || o.url || "").trim();
    const evidence = String(o.evidence || "").trim();
    const sourceName = String(o.sourceName || "").trim();
    const period = o.period == null ? null : String(o.period);
    const inputs = Array.isArray(o.inputs)
      ? o.inputs
          .map((row) => {
            const r = row as Record<string, unknown>;
            const v = num(r.value);
            if (!r.name || v == null) return null;
            return { name: String(r.name).slice(0, 80), value: v, unit: String(r.unit || "").slice(0, 24) };
          })
          .filter((x): x is { name: string; value: number; unit: string } => Boolean(x))
      : [];
    if (status === "researched") {
      if (value == null || !sourceUrl.startsWith("http") || evidence.length < 8 || !sourceName || !period) {
        return { ok: false, error: "AI research unavailable" };
      }
    }
    if (status === "conflicting") {
      if (evidence.length < 8 || !sourceName) return { ok: false, error: "AI research unavailable" };
      if (value != null && !sourceUrl.startsWith("http")) return { ok: false, error: "AI research unavailable" };
    }
    if (status === "inputs_only" && !inputs.length) return { ok: false, error: "AI research unavailable" };
    if (status === "not_found" && value != null) return { ok: false, error: "AI research unavailable" };
    out.push({
      metric: metric.slice(0, 80),
      status: status as ResearchItem["status"],
      value: status === "not_found" ? null : value,
      unit: String(o.unit || "").slice(0, 24),
      period,
      sourceName: sourceName.slice(0, 120),
      sourceUrl: sourceUrl.slice(0, 400),
      evidence: evidence.slice(0, 400),
      methodology: String(o.methodology || "").slice(0, 240),
      inputs,
    });
  }
  return { ok: true, items: out };
}
