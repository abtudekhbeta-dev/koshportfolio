import { useEffect, useMemo, useState } from "react";
import { NavChart } from "@/components/charts/nav-chart";
import { useLedgerInspector } from "@/components/ledger-shell";
import { useStudioInspector } from "@/components/studio-shell";
import { fmtInr, fmtPct } from "@/lib/kosh/engine";
import { dayChange, eodPositions, rangeStats, slicePath, valueSnapshot, type RangePreset } from "@/lib/kosh/ledger";
import type { PathEvent, PathPoint, TradeLine } from "@/lib/kosh/types";
import { cn } from "@/lib/utils";

const PRESETS: RangePreset[] = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "ALL", "CUSTOM"];

export function PathTimeline({
  nav,
  trades,
  events,
  benchName,
  splitNote,
  closes,
}: {
  nav: PathPoint[];
  trades: TradeLine[];
  events: PathEvent[];
  benchName: string;
  splitNote?: boolean;
  closes?: Record<string, { d: string; px: number }[]>;
}) {
  const [preset, setPreset] = useState<RangePreset>("ALL");
  const [custom, setCustom] = useState({ start: "", end: "" });
  const [pick, setPick] = useState(-1);
  const [indexed, setIndexed] = useState(false);
  const setStudio = useStudioInspector();
  const setLedger = useLedgerInspector();
  const setInspector = setStudio || setLedger;
  const sliced = useMemo(() => slicePath(nav, preset, custom), [nav, preset, custom]);
  const i = pick < 0 || pick >= sliced.rows.length ? Math.max(0, sliced.rows.length - 1) : pick;
  const day = sliced.rows[i]?.day || "";
  const book = useMemo(() => (day ? eodPositions(trades, day) : null), [trades, day]);
  const stats = useMemo(() => rangeStats(sliced.rows), [sliced.rows]);
  const change = useMemo(() => (day ? dayChange(sliced.rows, events, day) : null), [sliced.rows, events, day]);
  const valued = useMemo(
    () => (book && day ? valueSnapshot(book.lines, closes || {}, day) : null),
    [book, day, closes],
  );
  const chart = useMemo(
    () =>
      sliced.rows.map((p) => ({
        t: p.t,
        day: p.day,
        port: indexed ? p.unit : p.wealth,
        bench: indexed ? p.sameUnit : p.sameCash,
        covered: p.covered,
        names: p.names,
        wAvail: 1,
      })),
    [sliced.rows, indexed],
  );

  const snapshot = useMemo(
    () =>
      book && day ? (
        <Snapshot
          day={day}
          benchName={benchName}
          book={book}
          change={change}
          point={sliced.rows[i]}
          splitNote={splitNote}
          indexed={indexed}
          valued={valued}
        />
      ) : null,
    [book, day, benchName, change, sliced.rows, i, splitNote, indexed, valued],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      setPick((cur) => {
        const now = cur < 0 || cur >= sliced.rows.length ? Math.max(0, sliced.rows.length - 1) : cur;
        if (e.key === "ArrowLeft") return Math.max(0, now - 1);
        return Math.min(sliced.rows.length - 1, now + 1);
      });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sliced.rows.length]);

  useEffect(() => {
    if (!setInspector) return;
    setInspector(snapshot);
  }, [setInspector, snapshot]);

  useEffect(() => {
    if (!setInspector) return;
    return () => setInspector(null);
  }, [setInspector]);

  return (
    <section className="border-b border-border pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-subtle uppercase">Portfolio timeline</p>
          <h2 className="studio-word mt-1 text-[28px] font-medium tracking-tight">What the book was worth</h2>
        </div>
        <p className="max-w-sm text-[12px] leading-relaxed text-muted">{sliced.rule}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPreset(p);
              setPick(-1);
            }}
            className={cn("h-8 px-2 text-[12px]", preset === p ? "text-fg underline decoration-accent" : "text-muted")}
          >
            {p === "ALL" ? "All" : p === "CUSTOM" ? "Custom" : p}
          </button>
        ))}
        <button type="button" className={cn("ml-auto h-8 px-2 text-[12px]", indexed ? "text-fg" : "text-muted")} onClick={() => setIndexed((v) => !v)}>
          {indexed ? "Indexed to 100" : "Rupees"}
        </button>
      </div>
      {preset === "CUSTOM" ? (
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-muted">
          <label>
            Start
            <input type="date" value={custom.start} onChange={(e) => { setCustom((c) => ({ ...c, start: e.target.value })); setPick(-1); }} className="ml-2 bg-transparent text-fg" />
          </label>
          <label>
            End
            <input type="date" value={custom.end} onChange={(e) => { setCustom((c) => ({ ...c, end: e.target.value })); setPick(-1); }} className="ml-2 bg-transparent text-fg" />
          </label>
        </div>
      ) : null}
      <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-border py-3 sm:grid-cols-4">
        <Stat k={indexed ? "Indexed path" : "Time-weighted"} v={stats.twr == null ? "—" : fmtPct(stats.twr)} note="Not XIRR. Deposits are not counted as return." />
        <Stat k={benchName} v={stats.bench == null ? "—" : fmtPct(stats.bench)} note="Same sessions, indexed. Not index points." />
        <Stat k="Difference" v={stats.excess == null ? "—" : fmtPct(stats.excess)} note="Path minus the index, same method." />
        <Stat k="Max drop" v={stats.maxDd == null ? "—" : fmtPct(stats.maxDd)} note="Inside this window, from the indexed path." />
      </dl>
      <p className="mt-2 text-[12px] text-subtle">
        The line is securities value from recorded buys and sells. Untracked cash is not included. XIRR stays on the full trade book below — it is not recomputed for this window.
      </p>
      <div className="mt-3">
        <NavChart
          nav={chart}
          portLabel={indexed ? "Indexed path" : "Securities value"}
          benchLabel={indexed ? `${benchName} indexed` : `Same money in ${benchName}`}
          coverage={sliced.start && sliced.end ? `${sliced.start} – ${sliced.end}` : ""}
          nowValue={indexed ? undefined : sliced.rows[i]?.wealth}
          pathPrimary
          modes={indexed ? ["cum", "dd"] : ["inr", "cum", "dd"]}
          onCommit={(picked) => {
            const idx = sliced.rows.findIndex((r) => r.day === picked);
            if (idx >= 0) setPick(idx);
          }}
        />
      </div>
      {sliced.rows.length > 1 ? (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-3 text-[12px]">
            <button type="button" className="text-muted hover:text-fg" onClick={() => setPick(Math.max(0, i - 1))}>
              Previous session
            </button>
            <span className="font-mono tabular">{day || "—"}</span>
            <button type="button" className="text-muted hover:text-fg" onClick={() => setPick(Math.min(sliced.rows.length - 1, i + 1))}>
              Next session
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={sliced.rows.length - 1}
            step={1}
            value={i}
            aria-label="Selected session"
            aria-valuetext={day}
            onChange={(e) => setPick(Number(e.target.value))}
            className="mt-2 h-8 w-full cursor-pointer accent-chart"
          />
        </div>
      ) : null}
      {change?.today.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {change.today.slice(0, 8).map((e, n) => (
            <button key={e.symbol + e.side + n} type="button" className="text-[12px] text-muted" onClick={() => setPick(i)}>
              {e.side > 0 ? "Buy" : "Sell"} {e.symbol} {e.qty}
            </button>
          ))}
        </div>
      ) : null}
      {setInspector ? null : <div className="mt-4">{snapshot}</div>}
    </section>
  );
}

function Stat({ k, v, note }: { k: string; v: string; note: string }) {
  return (
    <div>
      <dt className="text-[11px] text-subtle">{k}</dt>
      <dd className="font-mono text-[18px] tabular">{v}</dd>
      <p className="text-[11px] leading-snug text-muted">{note}</p>
    </div>
  );
}

function Snapshot({
  day,
  benchName,
  book,
  change,
  point,
  splitNote,
  indexed,
  valued,
}: {
  day: string;
  benchName: string;
  book: ReturnType<typeof eodPositions>;
  change: ReturnType<typeof dayChange> | null;
  point?: PathPoint;
  splitNote?: boolean;
  indexed: boolean;
  valued: ReturnType<typeof valueSnapshot> | null;
}) {
  const total = valued && valued.priced + valued.stale > 0 ? valued.total : point?.wealth || 0;
  const lines = valued?.rows.filter((l) => l.qty > 0) || [];
  return (
    <div>
      <p className="text-[11px] tracking-[0.14em] text-subtle uppercase">Snapshot · {day}</p>
      <p className="ledger-word mt-1 text-[22px] tracking-tight">{total ? fmtInr(total) : "—"}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        Securities value, excluding untracked cash. {indexed ? "The chart above is indexed, not rupees." : "The chart is rupees."}{" "}
        A close is the last unadjusted print on or before this session. A later print is never used. Missing is not zero.
        {valued ? ` ${valued.priced} names on this session, ${valued.stale} using an earlier close, ${valued.missing} with no price.` : ""}
        {splitNote ? " A corporate action may change share counts. This ledger uses the trade file as written and does not guess a split." : ""}
      </p>
      {change?.delta != null ? (
        <p className="mt-2 text-[12px] text-muted">
          Versus the previous session {fmtInr(change.delta)}. Buys {fmtInr(change.bought)}, sells {fmtInr(change.sold)}
          {change.priceDriven != null ? `, price move about ${fmtInr(change.priceDriven)}` : ""}. {benchName} is not drawn on this rupee figure.
        </p>
      ) : null}
      {book.warnings.length ? <p className="mt-2 text-[12px] text-warn">{book.warnings[0]}</p> : null}
      <table className="mt-3 w-full text-left text-[13px]">
        <thead className="text-[11px] text-subtle">
          <tr>
            <th className="py-1 font-medium">Held at the close</th>
            <th className="py-1 text-right font-medium">Qty</th>
            <th className="py-1 text-right font-medium">Close</th>
            <th className="py-1 text-right font-medium">Value</th>
            <th className="py-1 text-right font-medium">Weight</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.symbol} className="border-t border-border">
              <td className="py-1.5">
                {l.name}
                <span className="ml-2 text-[11px] text-subtle">{l.symbol}</span>
                {l.status === "stale" ? <span className="ml-2 text-[11px] text-warn">Close {l.sessionDay}</span> : null}
                {l.status === "missing" ? <span className="ml-2 text-[11px] text-warn">No close</span> : null}
              </td>
              <td className="py-1.5 text-right font-mono tabular">{Number(l.qty.toFixed(4))}</td>
              <td className="py-1.5 text-right font-mono tabular">{l.px != null ? fmtInr(l.px) : "—"}</td>
              <td className="py-1.5 text-right font-mono tabular">{l.value != null ? fmtInr(l.value) : "—"}</td>
              <td className="py-1.5 text-right font-mono tabular">{l.weight != null ? `${l.weight.toFixed(1)}%` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {valued && valued.sum > 0 ? (
        <p className="mt-2 text-[11px] leading-relaxed text-subtle">
          Priced lines sum to {fmtInr(valued.sum)}. Weights use only priced lines. Names without a close are listed and left out of the total.
        </p>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-subtle">No unadjusted close on or before this session for these names.</p>
      )}
    </div>
  );
}
