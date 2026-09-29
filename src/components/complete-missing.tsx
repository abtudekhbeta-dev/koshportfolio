import { useState } from "react";
import { AIButton } from "@/components/ui/ai-button";
import { apiEnrich, apiResearch } from "@/lib/kosh/api";
import {
  applyResearchToFund,
  explainGaps,
  pool,
  researchBatches,
  researchPlan,
  seedCompletion,
  type Gap,
} from "@/lib/kosh/complete";
import type { Fundamentals } from "@/lib/kosh/types";
import { useKosh } from "@/lib/store";

type Job = { symbol: string; missing: string[] };
type RowState = { symbol: string; phase: "queued" | "filings" | "researching" | "done" | "incomplete"; gaps: Gap[]; error?: string };

/**
 * One completion action for every incomplete name in the current result.
 * Filings first, formulas next, source research only for what is still blank.
 * Results are written into the company record and the screen reads them again.
 */
export function CompleteMissing({ jobs, noun = "stocks" }: { jobs: Job[]; noun?: string }) {
  const setDeepFunds = useKosh((s) => s.setDeepFunds);
  const queue = jobs.filter((j) => j.symbol && j.missing.length);
  const [busy, setBusy] = useState(false);
  const [batch, setBatch] = useState<Job[]>([]);
  const [rows, setRows] = useState<RowState[]>([]);
  const [open, setOpen] = useState(false);
  if (!queue.length && !rows.length) return null;

  async function finishOne(job: Job, mark: (row: RowState) => void): Promise<RowState> {
    mark({ symbol: job.symbol, phase: "filings", gaps: [] });
    const prev = useKosh.getState().deepFunds[job.symbol]?.fund || null;
    let fetched: Fundamentals | null = null;
    try {
      const det = await apiEnrich([job.symbol]);
      fetched = det.funds?.[job.symbol] || null;
    } catch {
      /* deterministic pass failed — research can still try */
    }
    let fund = seedCompletion(prev, fetched, job.symbol);
    const plan = researchPlan(fund, job.missing);
    let error = "";
    if (plan.ask.length) {
      mark({ symbol: job.symbol, phase: "researching", gaps: [] });
      const items = [];
      for (const ask of researchBatches(plan.ask)) {
        try {
          const res = await apiResearch(job.symbol, ask);
          if (res.ok && res.items?.length) items.push(...res.items);
          else error = res.error || "AI research unavailable";
        } catch {
          error = "AI research unavailable";
        }
      }
      if (items.length) fund = applyResearchToFund(fund, items);
    }
    const latest = useKosh.getState().deepFunds[job.symbol]?.fund || null;
    fund = seedCompletion(fund, latest, job.symbol);
    const gaps = explainGaps(fund, job.missing);
    setDeepFunds({ [job.symbol]: { fund, at: Date.now(), sources: ["complete"] } });
    return { symbol: job.symbol, phase: gaps.length ? "incomplete" : "done", gaps, error };
  }

  async function run() {
    const jobsNow = queue;
    setBatch(jobsNow);
    setBusy(true);
    setRows(jobsNow.map((j) => ({ symbol: j.symbol, phase: "queued", gaps: [] })));
    setOpen(false);
    await pool(jobsNow, 2, async (job) => {
      const row = await finishOne(job, (next) => {
        setRows((cur) => cur.map((r) => (r.symbol === next.symbol ? { ...r, ...next } : r)));
      });
      setRows((cur) => cur.map((r) => (r.symbol === row.symbol ? row : r)));
      return row;
    });
    setBusy(false);
    setOpen(true);
  }

  const shown = rows.length ? rows : [];
  const total = batch.length || queue.length;
  const done = shown.filter((r) => r.phase === "done" || r.phase === "incomplete").length;
  const pending = shown.filter((r) => r.phase === "incomplete");
  const finished = shown.filter((r) => r.phase === "done").length;
  const current = shown.find((r) => r.phase === "researching" || r.phase === "filings");

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] text-fg">
            {queue.length} {queue.length === 1 ? noun.replace(/s$/, "") : noun} {queue.length === 1 ? "has" : "have"} incomplete displayed data
          </p>
          <p className="mt-1 max-w-xl text-[12px] text-muted">
            Filings and formulas run first. Source research fills only what is still blank, with a citation. Every name in this result is included.
          </p>
        </div>
        <AIButton busy={busy} busyLabel={busy ? `Completing ${done} of ${total}…` : undefined} onClick={() => void run()}>
          {`Complete missing data for ${queue.length}`}
        </AIButton>
      </div>
      {busy || shown.length ? (
        <div className="mt-3">
          <div className="h-1 overflow-hidden rounded-full bg-bg">
            <div className="h-full bg-chart" style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }} />
          </div>
          <p className="mt-2 text-[12px] text-muted">
            {busy
              ? `Completing ${done} of ${total}${current ? ` · ${current.symbol} ${current.phase === "researching" ? "researching" : "checking filings"}` : ""}`
              : `${finished} completed${pending.length ? ` · ${pending.length} still unavailable` : ""}`}
          </p>
          {shown.length ? (
            <ul className="mt-2 grid gap-1 text-[12px] text-muted">
              {shown.slice(0, busy ? 8 : shown.length).map((r) => (
                <li key={r.symbol}>
                  <span className="text-fg">{r.symbol}</span>
                  {r.phase === "done" ? " · done" : r.phase === "researching" ? " · researching" : r.phase === "filings" ? " · filings" : r.phase === "queued" ? " · queued" : ""}
                  {r.error ? ` · ${r.error}` : ""}
                  {open && r.gaps.length ? ` · ${r.gaps.map((g) => `${g.label}: ${g.reason}`).join("; ")}` : ""}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
