import { useState } from "react";
import { AIButton } from "@/components/ui/ai-button";
import { apiResearch } from "@/lib/kosh/api";

type Item = {
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

/** User-initiated research. Results stay labeled researched — they are not written back as verified facts. */
export function ResearchMissing({
  jobs,
  label,
}: {
  jobs: { symbol: string; missing: string[] }[];
  label?: string;
}) {
  const queue = jobs.filter((j) => j.symbol && j.missing.length);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<{ symbol: string; items: Item[]; error?: string }[]>([]);
  if (!queue.length) return null;
  const nFields = queue.reduce((s, j) => s + j.missing.length, 0);

  async function run() {
    setBusy(true);
    const next: { symbol: string; items: Item[]; error?: string }[] = [];
    for (const job of queue) {
      try {
        const res = await apiResearch(job.symbol, job.missing);
        if (!res.ok) next.push({ symbol: job.symbol, items: [], error: res.error || "AI research unavailable" });
        else next.push({ symbol: job.symbol, items: res.items || [] });
      } catch {
        next.push({ symbol: job.symbol, items: [], error: "AI research unavailable" });
      }
    }
    setRows(next);
    setBusy(false);
  }

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[13px] text-muted">
          {label ||
            `${queue.length} ${queue.length === 1 ? "name has" : "names have"} unresolved fields. Research looks for evidence. It does not fill the screen and it is not verified.`}
        </p>
        <AIButton busy={busy} busyLabel={`Researching ${nFields} missing fields…`} onClick={() => void run()}>
          {queue.length > 1 ? `Research missing data for ${queue.length}` : "Research missing data"}
        </AIButton>
      </div>
      {rows.length ? (
        <ul className="mt-3 grid gap-2">
          {rows.map((row) => (
            <li key={row.symbol} className="text-[13px]">
              <div className="font-medium">{row.symbol}</div>
              {row.error ? <p className="text-muted">{row.error}</p> : null}
              {row.items.map((item) => (
                <p key={item.metric} className="text-muted">
                  <span className="text-fg">{item.metric}</span>
                  {item.status === "researched" && item.value != null
                    ? ` · ${item.value}${item.unit ? " " + item.unit : ""} · AI-researched`
                    : item.status === "inputs_only"
                      ? " · inputs only — not calculated here"
                      : " · not found"}
                  {item.period ? ` · ${item.period}` : ""}
                  {item.sourceName ? ` · ${item.sourceName}` : ""}
                  {item.sourceUrl ? (
                    <>
                      {" "}
                      ·{" "}
                      <a href={item.sourceUrl} className="text-chart hover:underline" target="_blank" rel="noreferrer">
                        source
                      </a>
                    </>
                  ) : null}
                  {item.evidence ? ` · ${item.evidence}` : ""}
                </p>
              ))}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
