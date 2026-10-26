import { useEffect, useMemo, useState } from "react";
import { buildFlowDesk, deskWindowPoints, DESK_WINDOWS, type DeskPoint, type DeskWindowSize, type FlowDesk } from "@/lib/kosh/flow-desk";
import { readFlowNotes, rememberFlowNote } from "@/lib/kosh/flow-notes";
import type { FlowBar } from "@/lib/kosh/market-flows";
import { cn } from "@/lib/utils";

type Report = {
  takeaway: string;
  changes: string;
  alignment: string;
  history: string;
  price: string;
  risks: string;
  watch: string;
};

const SECTIONS: { key: keyof Report; label: string; kind: string }[] = [
  { key: "changes", label: "What changed", kind: "Fact" },
  { key: "alignment", label: "Institutional alignment", kind: "Reading" },
  { key: "history", label: "Historical context", kind: "Comparison" },
  { key: "price", label: "Price confirmation", kind: "Not a cause" },
  { key: "watch", label: "What to monitor", kind: "Condition" },
  { key: "risks", label: "Limits of this file", kind: "Uncertainty" },
];

function cr(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  const body = Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: n !== 0 && Math.abs(n) < 100 ? 1 : 0 });
  if (n > 0) return "+₹" + body + " Cr";
  if (n < 0) return "−₹" + body + " Cr";
  return "₹0 Cr";
}

function tone(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n) || n === 0) return "text-muted";
  return n > 0 ? "text-up" : "text-down";
}

export function FlowDeskPanel({ daily, retrievedAt, sourceName }: { daily: FlowBar[]; retrievedAt: string; sourceName: string }) {
  const desk = useMemo(
    () =>
      buildFlowDesk(
        daily.map((bar) => ({
          date: bar.end,
          fiiNet: bar.fiiNet,
          diiNet: bar.diiNet,
          indexReturn: bar.indexReturn,
          indexStart: bar.indexStart,
          indexEnd: bar.indexEnd,
        })),
      ),
    [daily],
  );
  const [windowSize, setWindowSize] = useState<DeskWindowSize>(20);
  const [chart, setChart] = useState<"daily" | "cumulative" | "rolling" | "price">("daily");
  const [note, setNote] = useState<Report | null>(null);
  const [noteKey, setNoteKey] = useState<string | null>(null);
  const [noteStamp, setNoteStamp] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [trimmed, setTrimmed] = useState(false);
  const activeWindow = desk.windows[windowSize].complete ? windowSize : (DESK_WINDOWS.find((size) => desk.windows[size].complete) ?? 5);
  const points = deskWindowPoints(desk, activeWindow);

  useEffect(() => {
    const saved = readFlowNotes().find((item) => item.materialKey === desk.materialKey);
    setNote(
      saved
        ? {
            takeaway: saved.takeaway,
            changes: saved.changes,
            alignment: saved.alignment,
            history: saved.history,
            price: saved.price,
            risks: saved.risks,
            watch: saved.watch,
          }
        : null,
    );
    setNoteKey(saved?.materialKey || null);
    setNoteStamp(saved?.at || null);
    setNoteError(null);
    setTrimmed(false);
  }, [desk.materialKey]);

  async function ask() {
    setAsking(true);
    setNoteError(null);
    try {
      const res = await fetch("/api/market-flows", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; report?: Report; error?: string; model?: string; generatedAt?: string; latestDate?: string | null; materialKey?: string; trimmed?: boolean };
      if (!data.ok || !data.report) {
        setNoteError(data.error || "The model did not answer. The charts and totals above are unchanged.");
        return;
      }
      setNote(data.report);
      setTrimmed(!!data.trimmed);
      setNoteStamp(data.generatedAt || new Date().toISOString());
      setNoteKey(data.materialKey || desk.materialKey);
      if (data.materialKey) {
        rememberFlowNote({
          id: data.materialKey,
          at: data.generatedAt || new Date().toISOString(),
          latestDate: data.latestDate || null,
          materialKey: data.materialKey,
          model: data.model || "grok-4.5",
          ...data.report,
        });
      }
    } catch {
      setNoteError("The model did not answer. The charts and totals above are unchanged.");
    } finally {
      setAsking(false);
    }
  }

  const five = desk.windows[5];
  const twenty = desk.windows[20];
  const stale = !!note && noteKey !== desk.materialKey;
  return (
    <section className="mt-4 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]" aria-label="Institutional flow desk">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold">Institutional flow desk</h2>
          <p className="mt-1 text-[12px] text-muted">Cash-market FII/FPI and DII nets. Figures are calculated from the stored sessions. A missing window is left blank, not filled with zero.</p>
        </div>
        <p className="text-[11px] text-subtle">
          Session {desk.latestDate || "—"} · retrieved {retrievedAt.slice(0, 16).replace("T", " ")} UTC · {sourceName}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="FII net · latest" value={cr(desk.latest?.fii)} n={desk.latest?.fii} hint={`Published session ${desk.latestDate || "—"}. ₹ crore. Not the retrieval time.`} />
        <Stat label="DII net · latest" value={cr(desk.latest?.dii)} n={desk.latest?.dii} hint="Domestic institutional net cash on the same session." />
        <Stat label="Combined net" value={cr(desk.latest?.combined)} n={desk.latest?.combined} hint="FII + DII for that session. Not the whole market." />
        <Stat label="5-session FII" value={cr(five.fii)} n={five.fii} hint={five.complete ? `${five.from} to ${five.to}. FII positive in ${five.fiiPositive} of 5, negative in ${five.fiiNegative}.` : `${five.have} of 5 sessions stored.`} />
        <Stat label="5-session DII" value={cr(five.dii)} n={five.dii} hint={five.complete ? `DII positive in ${five.diiPositive} of 5, negative in ${five.diiNegative}.` : "Withheld until 5 sessions are stored."} />
        <Stat label="20-session FII" value={cr(twenty.fii)} n={twenty.fii} hint={twenty.complete ? `${twenty.from} to ${twenty.to}. Positive ${twenty.fiiPositive}, negative ${twenty.fiiNegative}.` : `${twenty.have} of 20 stored.`} />
        <Stat label="20-session DII" value={cr(twenty.dii)} n={twenty.dii} hint={twenty.complete ? `Positive ${twenty.diiPositive}, negative ${twenty.diiNegative}.` : "Withheld until 20 sessions are stored."} />
        <Stat label="Sessions stored" value={String(desk.sessions)} n={null} hint="Published rows in the cash file. Holidays are absent, not zero." />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full bg-bg p-0.5" role="tablist" aria-label="Flow window">
          {DESK_WINDOWS.map((size) => (
            <button
              key={size}
              type="button"
              role="tab"
              aria-selected={activeWindow === size}
              disabled={!desk.windows[size].complete}
              className={cn("h-7 rounded-full px-3 text-[12px]", activeWindow === size ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted", !desk.windows[size].complete && "opacity-40")}
              onClick={() => setWindowSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Flow chart">
          {(
            [
              ["daily", "Daily nets"],
              ["cumulative", "Cumulative"],
              ["rolling", "Rolling"],
              ["price", "Versus Nifty"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={chart === id} className={cn("h-7 rounded-full px-3 text-[12px]", chart === id ? "bg-fg text-bg" : "text-muted")} onClick={() => setChart(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        {points ? <DeskChart points={points} kind={chart} /> : <p className="text-[13px] text-muted">That window is longer than the stored file, so the chart is withheld.</p>}
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-2">
        <article className="rounded-md bg-bg px-3 py-3">
          <h3 className="text-[13px] font-semibold">What changed</h3>
          <ul className="mt-2 space-y-2">
            {desk.evidence.changed.map((item) => (
              <li key={item.id}>
                <p className="text-[12px] leading-relaxed text-fg">{item.fact}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-subtle">{item.why}</p>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-md bg-bg px-3 py-3">
          <h3 className="text-[13px] font-semibold">Alignment · {desk.evidence.alignment.label}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">{desk.evidence.alignment.text}</p>
        </article>
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-[13px] font-semibold">Historical context, price, and what to monitor</summary>
        <div className="mt-2 space-y-3 text-[12px] leading-relaxed text-muted">
          <ul className="space-y-1">
            {desk.evidence.history.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p>{desk.evidence.price}</p>
          <div>
            <p className="font-semibold text-fg">Monitor</p>
            <ul className="mt-1 list-disc pl-4">
              {desk.evidence.watch.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-fg">Limits</p>
            <ul className="mt-1 list-disc pl-4">
              {desk.evidence.risks.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <p className="text-[11px] text-subtle">{desk.percentile.method} {desk.zscore.method}</p>
        </div>
      </details>

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[13px] font-semibold">Interpretation</h3>
          <button type="button" className="h-8 rounded-md bg-fg px-3 text-[12px] text-bg disabled:opacity-60" disabled={asking} onClick={() => void ask()}>
            {asking ? "Writing…" : note ? "Rewrite from the current file" : "Write an interpretation"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-subtle">The model explains the calculated figures. It does not add a total, a percent, or a probability. Charts stay if this fails.</p>
        {asking ? <p className="mt-2 text-[12px] text-muted">Checking the note against the cash file…</p> : null}
        {noteError ? (
          <div className="mt-2 rounded-md border border-down/30 px-3 py-2">
            <p className="text-[12px] text-down">{noteError}</p>
            {note ? <p className="mt-1 text-[11px] text-subtle">The previous note is still shown. It is not a new reading.</p> : null}
          </div>
        ) : null}
        {note ? (
          <div className="mt-3">
            <p className="text-[11px] text-subtle">
              Model reading{noteStamp ? ` · ${noteStamp.slice(0, 16).replace("T", " ")} UTC` : ""}
              {desk.latestDate ? ` · file session ${desk.latestDate}` : ""}
              {trimmed ? " · an unsupported sentence was left out" : ""}
              {stale ? " · this note is for an older file and is not the current session" : ""}
              . Not a forecast.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed">{note.takeaway}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {SECTIONS.map((section) => (
                <article key={section.key} className="rounded-md border border-border px-3 py-2">
                  <p className="text-[10px] tracking-wide text-subtle uppercase">{section.kind}</p>
                  <h4 className="text-[12px] font-semibold">{section.label}</h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{note[section.key]}</p>
                </article>
              ))}
            </div>
          </div>
        ) : !asking && !noteError ? (
          <p className="mt-2 text-[12px] text-muted">No interpretation has been written for this cash file yet.</p>
        ) : null}
      </div>
    </section>
  );
}

function Stat({ label, value, n, hint }: { label: string; value: string; n: number | null | undefined; hint: string }) {
  return (
    <div className="rounded-md bg-bg px-2.5 py-2" title={hint}>
      <div className="text-[10px] text-subtle">{label}</div>
      <div className={cn("mt-1 font-mono text-[14px] tabular", tone(n))}>{value}</div>
    </div>
  );
}

function DeskChart({ points, kind }: { points: DeskPoint[]; kind: "daily" | "cumulative" | "rolling" | "price" }) {
  const width = 760;
  const height = 240;
  const left = 48;
  const right = 16;
  const top = 16;
  const bottom = height - 24;
  const plotW = width - left - right;
  const plotH = bottom - top;
  const n = Math.max(points.length, 1);
  const slot = plotW / n;
  const xOf = (index: number) => left + slot * index + slot / 2;
  const baseFii = points[0].cumFii - points[0].fii;
  const baseDii = points[0].cumDii - points[0].dii;
  const fii = points.map((point) => point.fii);
  const dii = points.map((point) => point.dii);
  const cumFii = points.map((point) => point.cumFii - baseFii);
  const cumDii = points.map((point) => point.cumDii - baseDii);
  const rolls = [...points.map((point) => point.roll5Fii), ...points.map((point) => point.roll20Fii), ...points.map((point) => point.roll5Dii), ...points.map((point) => point.roll20Dii)].filter((value): value is number => value != null);
  const prices = points.map((point) => point.indexEnd).filter((value): value is number => value != null && value > 0);
  const flowValues = kind === "cumulative" ? [...cumFii, ...cumDii] : kind === "rolling" ? rolls : [...fii, ...dii];
  const flowMax = Math.max(1, ...flowValues.map((value) => Math.abs(value)));
  const yFlow = (value: number) => top + plotH / 2 - (value / flowMax) * (plotH / 2 - 6);
  const zero = yFlow(0);
  const pxMin = prices.length ? Math.min(...prices) : 0;
  const pxMax = prices.length ? Math.max(...prices) : 1;
  const yPx = (value: number) => top + ((pxMax - value) / Math.max(1, pxMax - pxMin)) * plotH;
  const line = (values: (number | null)[], scale: (value: number) => number) => {
    let started = false;
    const parts: string[] = [];
    values.forEach((value, index) => {
      if (value == null || !Number.isFinite(value)) {
        started = false;
        return;
      }
      parts.push(`${started ? "L" : "M"} ${xOf(index)} ${scale(value)}`);
      started = true;
    });
    return parts.join(" ");
  };
  const ticks = [0, Math.round((n - 1) / 2), n - 1].filter((value, index, all) => all.indexOf(value) === index);
  const note =
    kind === "cumulative"
      ? "Cumulative net starts at zero before the first session of this window. It is the running sum of daily nets, not the daily series."
      : kind === "rolling"
        ? "The 5- and 20-session lines are means of published sessions ending that day. A line is omitted until that many sessions exist. Gaps are not filled with zero."
        : kind === "price"
          ? prices.length >= 2
            ? "Left axis is the Nifty close in index points. Right axis is cumulative FII+DII in ₹ crore for this window. Matching direction is not a cause."
            : "The index close is missing for this window, so the comparison is not drawn."
          : "Daily FII and DII net cash, ₹ crore. The dashed line is zero. A missing session is absent, not a zero bar.";
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label={note}>
        <line x1={left} y1={zero} x2={width - right} y2={zero} stroke="var(--color-border)" strokeDasharray="3 3" />
        {kind === "daily"
          ? points.map((point, index) => {
              const x = xOf(index);
              const bw = Math.max(1.5, Math.min(7, slot * 0.28));
              return (
                <g key={point.date}>
                  <rect x={x - bw - 0.4} y={Math.min(yFlow(point.fii), zero)} width={bw} height={Math.max(1, Math.abs(yFlow(point.fii) - zero))} fill="var(--color-chart)" />
                  <rect x={x + 0.4} y={Math.min(yFlow(point.dii), zero)} width={bw} height={Math.max(1, Math.abs(yFlow(point.dii) - zero))} fill="var(--color-chart-bench)" />
                </g>
              );
            })
          : null}
        {kind === "cumulative" ? (
          <>
            <path d={line(cumFii, yFlow)} fill="none" stroke="var(--color-chart)" strokeWidth="1.8" />
            <path d={line(cumDii, yFlow)} fill="none" stroke="var(--color-chart-bench)" strokeWidth="1.8" />
          </>
        ) : null}
        {kind === "rolling" ? (
          <>
            <path d={line(points.map((point) => point.roll5Fii), yFlow)} fill="none" stroke="var(--color-chart)" strokeWidth="1.6" />
            <path d={line(points.map((point) => point.roll20Fii), yFlow)} fill="none" stroke="var(--color-chart)" strokeWidth="1.6" strokeDasharray="4 3" />
            <path d={line(points.map((point) => point.roll5Dii), yFlow)} fill="none" stroke="var(--color-chart-bench)" strokeWidth="1.6" />
            <path d={line(points.map((point) => point.roll20Dii), yFlow)} fill="none" stroke="var(--color-chart-bench)" strokeWidth="1.6" strokeDasharray="4 3" />
          </>
        ) : null}
        {kind === "price" && prices.length >= 2 ? (
          <>
            <path d={line(points.map((point) => point.indexEnd), yPx)} fill="none" stroke="var(--color-fg)" strokeWidth="1.6" opacity="0.8" />
            <path d={line(cumFii.map((value, index) => value + cumDii[index]), yFlow)} fill="none" stroke="var(--color-chart)" strokeWidth="1.6" />
          </>
        ) : null}
        {ticks.map((index) => (
          <text key={points[index]?.date || index} x={xOf(index)} y={height - 6} textAnchor="middle" fontSize="10" fill="var(--color-subtle)">
            {points[index] ? points[index].date.slice(5) : ""}
          </text>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-subtle">
        <span className="inline-flex items-center gap-1.5"><i className="inline-block size-2 bg-chart" /> FII</span>
        <span className="inline-flex items-center gap-1.5"><i className="inline-block size-2" style={{ background: "var(--color-chart-bench)" }} /> DII</span>
        {kind === "rolling" ? <span>Solid is 5 sessions. Dashed is 20.</span> : null}
        {kind === "price" ? <span>Pale line is the Nifty close. Blue line is cumulative FII+DII.</span> : null}
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-subtle">{note}</p>
    </div>
  );
}
