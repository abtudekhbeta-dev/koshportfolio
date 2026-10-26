import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IngestSuggestions } from "@/components/ingest-suggestions";
import { auditTradeLines, parseHoldingsFiles, type TradeParseAudit } from "@/lib/kosh/parse";
import { fillTradePrices } from "@/lib/kosh/path";
import { enrichHoldings } from "@/lib/kosh/enrich";
import { displayName } from "@/lib/kosh/names";
import { apiHistories } from "@/lib/kosh/api";
import { requestIngestReview } from "@/lib/kosh/ingest-client";
import {
  applyDate,
  applySide,
  applySymbol,
  makeImportRecord,
  reconcileTrades,
  reviewPayload,
  tradesToCommit,
  type Proposal,
} from "@/lib/kosh/ingest-review";
import { applyIdCorrection, assessImport, duplicateGroups, revertTouches, type ImportTouch } from "@/lib/kosh/import-safety";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AiFailureClass, HistoryPack, ImportAiStatus, TradeLine } from "@/lib/kosh/types";

export function PathUpload({ portfolioId }: { portfolioId: string }) {
  const mergeTrades = useKosh((s) => s.mergeTrades);
  const setTrades = useKosh((s) => s.setTrades);
  const recordImport = useKosh((s) => s.recordImport);
  const existing = useKosh((s) => s.portfolios.find((p) => p.id === portfolioId)?.trades) || [];
  const imports = useKosh((s) => s.portfolios.find((p) => p.id === portfolioId)?.imports);
  const [msg, setMsg] = useState(
    "CSV or Excel with dated buys and sells. The full file stays on this device. AI, when available, checks labels only. This does not change This mix. An incremental file does not delete lines it omits.",
  );
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<TradeLine[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [filename, setFilename] = useState<string | undefined>();
  const [audit, setAudit] = useState<TradeParseAudit | null>(null);
  const [skipAmbiguous, setSkipAmbiguous] = useState(false);
  const [choices, setChoices] = useState<Record<string, "keep" | "apply" | "skip">>({});
  const [shapeNote, setShapeNote] = useState<string[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<{ status: ImportAiStatus; aiClass?: AiFailureClass; proposals: Proposal[]; sources: string[] }>({
    status: "not-run",
    proposals: [],
    sources: [],
  });
  const gen = useRef(0);
  const genAttempt = useRef("");

  async function reviewLabels(rows: TradeLine[], file: File | undefined, attempt: string) {
    const ticket = ++gen.current;
    setAiBusy(true);
    try {
      const payload = reviewPayload({ filename: file?.name, trades: rows.slice(0, 12) });
      const got = await requestIngestReview(payload);
      if (ticket !== gen.current || attempt !== genAttempt.current) return;
      setAi({
        status: got.status === "ok" ? "ok" : got.status === "unconfigured" ? "unconfigured" : "failed",
        aiClass: got.aiClass,
        proposals: got.proposals || [],
        sources: payload.sources,
      });
    } catch {
      if (ticket !== gen.current || attempt !== genAttempt.current) return;
      setAi({ status: "failed", aiClass: "network", proposals: [], sources: [] });
    } finally {
      if (ticket === gen.current) setAiBusy(false);
    }
  }

  function accept(p: Proposal) {
    const source = ai.sources[p.row] || "";
    setPreview((rows) =>
      (rows || []).map((t, i) => {
        if (i !== p.row) return t;
        if (p.kind === "symbol") return { ...t, symbol: applySymbol(t.symbol, p, source) };
        if (p.kind === "date") return { ...t, date: applyDate(t.date, p, source) };
        if (p.kind === "side") return { ...t, side: applySide(t.side, p, source) };
        return t;
      }),
    );
  }

  function logImport(kind: "path" | "path-replace", applied: number, extra?: { corrections?: number; touches?: ImportTouch[]; affectedFrom?: string; commit?: "applied" | "empty" }) {
    const rec = preview ? reconcileTrades(existing, preview) : null;
    recordImport(
      portfolioId,
      makeImportRecord({
        kind,
        filename,
        rowsRead: audit?.rowsRead || preview?.length || 0,
        detected: audit?.rowsRead || preview?.length || 0,
        accepted: audit?.accepted || preview?.length || 0,
        ignored: audit?.ignored || 0,
        rejected: audit?.ignored || 0,
        duplicates: (audit?.duplicates || 0) + (rec?.brokerDuplicates.length || 0),
        ambiguous: (audit?.ambiguous || 0) + (rec?.ambiguous.length || 0),
        skipped: rec ? rec.brokerDuplicates.length + (skipAmbiguous ? rec.ambiguous.length : 0) : 0,
        flagged: rec?.conflicts.length || 0,
        missingPrices: audit?.missingPrices || preview?.filter((t) => !(t.price > 0)).length || 0,
        unresolved: audit?.unresolved || 0,
        aiStatus: ai.status,
        aiClass: ai.aiClass,
        fallback: ai.status !== "ok",
        applied,
        corrections: extra?.corrections || 0,
        commit: extra?.commit || (applied || extra?.corrections ? "applied" : "empty"),
        affectedFrom: extra?.affectedFrom,
        touches: extra?.touches,
        note: rec?.conflicts.length ? `${rec.conflicts.length} broker-id conflict${rec.conflicts.length === 1 ? "" : "s"} shown for review.` : shapeNote[0],
      }),
    );
  }

  async function ingest(files: FileList | File[]) {
    const list = [...files];
    if (!list.length) return;
    gen.current += 1;
    genAttempt.current = "";
    setAi({ status: "not-run", proposals: [], sources: [] });
    setAiBusy(false);
    setBusy(true);
    setMsg("Reading " + list.length + " file(s)…");
    setErrors([]);
    setNotes([]);
    setFilename(list[0]?.name);
    setSkipAmbiguous(false);
    try {
      const { holdings, trades, errors: fails, audit: got } = await parseHoldingsFiles(list);
      setAudit(got);
      setChoices({});
      setShapeNote(
        assessImport({
          rowsRead: got?.rowsRead || 0,
          accepted: got?.accepted || (trades || []).length,
          ignored: got?.ignored || 0,
          holdings: holdings.length,
          trades: (trades || []).length,
          errors: fails,
        }).warnings,
      );
      const issues = [...fails];
      if (!trades?.length) {
        setPreview(null);
        if (holdings.length) {
          issues.push(
            "This file looks like a holdings snapshot, not a buy/sell book. Path needs a date, a side (buy or sell), and a quantity on each line.",
          );
        } else if (!issues.length) {
          issues.push("No dated buy/sell lines found. Need a ticker, quantity, buy or sell, and a date.");
        }
        setErrors([...issues, ...auditTradeLines(trades || [])]);
        setMsg("Nothing to add to your path.");
        return;
      }
      setMsg("Matching stock names…");
      let resolved = trades;
      try {
        const stub = trades.map((t) => ({
          symbol: t.symbol,
          name: t.name,
          qty: t.qty,
          avg: t.price || null,
          date: t.date,
        }));
        const named = await enrichHoldings(stub);
        const by = new Map(named.map((h) => [h.symbol.toUpperCase(), h.name]));
        resolved = trades.map((t) => ({
          ...t,
          name: by.get(t.symbol.toUpperCase()) || displayName(t) || t.name,
        }));
      } catch {
        resolved = trades;
      }
      const needPx = [...new Set(resolved.filter((t) => t.date && !(t.price > 0)).map((t) => t.symbol))];
      const hints: string[] = [];
      if (needPx.length) {
        setMsg("Looking up that day’s close for lines with no price…");
        try {
          const rows: HistoryPack[] = await apiHistories(needPx, "max");
          const hx: Record<string, HistoryPack["bars"]> = {};
          for (const r of rows) {
            hx[r.input] = r.bars || [];
            hx[r.symbol] = r.bars || [];
          }
          const got = fillTradePrices(resolved, hx);
          resolved = got.trades;
          if (got.filled.length) {
            hints.push(
              `${got.filled.length} execution price${got.filled.length === 1 ? "" : "s"} unavailable; historical closing price used. Add prices in the file if you want the exact cash you paid.`,
            );
          }
        } catch {
          hints.push("Could not look up closes for missing prices. Those lines will use the close when the path is drawn, or stay out if we have no history.");
        }
      }
      const audited = auditTradeLines(resolved);
      setPreview(resolved);
      setErrors([...issues, ...audited.filter((n) => !/day’s close|day's close/i.test(n))]);
      setNotes([...hints, ...audited.filter((n) => /day’s close|day's close/i.test(n))]);
      const undated = resolved.filter((t) => !t.date).length;
      const filledN = resolved.filter((t) => t.priceFilled).length;
      const needs = (got?.ambiguous || 0) + (got?.unresolved || 0);
      setMsg(
        got?.rowsRead
          ? `Read ${got.rowsRead.toLocaleString("en-IN")} rows · Kept ${got.accepted.toLocaleString("en-IN")} · Needs review ${needs.toLocaleString("en-IN")}` +
            (got.ignored ? ` · Ignored ${got.ignored.toLocaleString("en-IN")}` : "") +
            (filledN ? ` · ${filledN} used that day’s close` : "") +
            (undated ? ` · ${undated} without a date` : "") +
            " · This mix is not updated"
          : `Ready · ${resolved.length} buy/sell line${resolved.length === 1 ? "" : "s"}`,
      );
      const attempt = `path-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      genAttempt.current = attempt;
      void reviewLabels(resolved, list[0], attempt);
    } finally {
      setBusy(false);
    }
  }

  function add() {
    if (!preview?.length) return;
    const rec = reconcileTrades(existing, preview);
    let book = existing;
    const touches: ImportTouch[] = [];
    let corrections = 0;
    for (const row of rec.conflicts) {
      const id = String(row.id || "");
      const choice = choices[id] || "keep";
      if (choice !== "apply" || !id) continue;
      const prev = book.find((item) => item.id === id);
      const applied = applyIdCorrection(book, row);
      if (!applied.ok || !prev) continue;
      book = applied.next;
      corrections += 1;
      touches.push({
        op: "correct",
        id,
        symbol: row.symbol,
        date: row.date,
        side: row.side,
        qty: row.qty,
        price: row.price,
        beforeQty: prev.qty,
        beforePrice: prev.price,
        beforeSide: prev.side,
      });
    }
    if (book !== existing) setTrades(portfolioId, book);
    const next = tradesToCommit(preview, book, skipAmbiguous);
    if (!next.length && !corrections) {
      toast.message("Nothing new to add. Matching broker ids stay as they are.");
      logImport("path", 0, { commit: "empty" });
      setPreview(null);
      return;
    }
    if (next.length) mergeTrades(portfolioId, next);
    for (const row of next.slice(0, 80 - touches.length)) {
      touches.push({ op: "add", id: row.id, symbol: row.symbol, date: row.date, side: row.side, qty: row.qty, price: row.price });
    }
    const dates = [...book, ...next].map((row) => row.date).filter((day): day is string => Boolean(day)).sort();
    const skipped = preview.length - next.length - corrections;
    toast.success(
      `Added ${next.length} line${next.length === 1 ? "" : "s"} to your path.` +
        (corrections ? ` Applied ${corrections} correction${corrections === 1 ? "" : "s"}.` : "") +
        (skipped > 0 ? ` Left ${skipped} duplicate or conflicting line${skipped === 1 ? "" : "s"} unchanged.` : "") +
        " This mix is unchanged.",
    );
    logImport("path", next.length, { corrections, touches, affectedFrom: dates[0], commit: "applied" });
    setPreview(null);
    setMsg("Added to your path.");
  }

  function undoLast() {
    const last = imports?.[0];
    if (!last?.touches?.length || last.commit === "reverted") {
      toast.message("This import cannot be undone from the log.");
      return;
    }
    const plan = revertTouches(existing, last.touches);
    if (!plan.ok) {
      toast.error(plan.conflicts[0] || "Undo stopped because a line changed later.");
      return;
    }
    setTrades(portfolioId, plan.next);
    recordImport(
      portfolioId,
      makeImportRecord({
        kind: last.kind === "path-replace" ? "path-replace" : "path",
        filename: last.filename,
        rowsRead: last.rowsRead,
        accepted: last.accepted,
        ignored: last.ignored,
        duplicates: last.duplicates,
        ambiguous: last.ambiguous,
        missingPrices: last.missingPrices,
        unresolved: last.unresolved,
        aiStatus: last.aiStatus,
        aiClass: last.aiClass,
        fallback: last.fallback,
        applied: 0,
        commit: "reverted",
        note: "Undone. Lines that changed after this import were not overwritten.",
      }),
    );
    toast.success("That import was undone.");
  }

  function replace() {
    if (!preview?.length) return;
    if (existing.length && !confirm("Replace every buy/sell on your path with this file? Lines not in the file will be removed. This mix stays as it is.")) return;
    setTrades(portfolioId, preview);
    toast.success(`Your path now has ${preview.length} line${preview.length === 1 ? "" : "s"} from this file. This mix is unchanged.`);
    logImport("path-replace", preview.length);
    setPreview(null);
    setMsg("Path replaced.");
  }

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Upload buys and sells</h2>
      <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
        Adds to your path only. CSV, TSV, or Excel. Headers can sit below a title, and a repeated header is skipped.
        Buy, Sell, Purchased, and Sold are recognized. A side that is not one of those is left for review, not guessed.
        This mix is not changed.
      </p>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void ingest(e.dataTransfer.files);
        }}
        className="mt-3 block cursor-pointer rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted"
      >
        <input
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,.xlsm,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void ingest(e.target.files);
            e.target.value = "";
          }}
        />
        Drop a buy/sell file
        <div className="mt-1 text-[12px] text-subtle">Click to pick · CSV or Excel. Does not change quantities on This mix.</div>
      </label>
      <p className="mt-2 text-[12px] text-subtle">{busy ? "Reading…" : msg}</p>
      {errors.length ? (
        <ul className="mt-2 grid gap-1 text-[12px] text-down">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      {notes.length ? (
        <ul className="mt-2 grid gap-1 text-[12px] text-muted">
          {notes.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      {shapeNote.length ? (
        <ul className="mt-2 grid gap-1 text-[12px] text-warn">
          {shapeNote.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {preview?.length ? <IngestSuggestions busy={aiBusy} status={ai.status} aiClass={ai.aiClass} proposals={ai.proposals} onAccept={accept} /> : null}
      {preview?.length ? (
        <div className="mt-3">
          <ReconcileLine existing={existing} incoming={preview} />
          <ConflictList existing={existing} incoming={preview} choices={choices} onChoice={(id, choice) => setChoices((cur) => ({ ...cur, [id]: choice }))} />
          <DuplicateNote existing={existing} incoming={preview} />
          <div className="max-h-[40dvh] overflow-y-auto rounded-sm bg-bg px-3 py-2 text-[12px] shadow-[var(--shadow-border)] sm:max-h-56">
            <div className="grid grid-cols-[1fr_40px_56px_72px] gap-2 pb-1.5 font-medium tracking-[0.06em] text-subtle uppercase sm:grid-cols-[1fr_48px_72px_88px_88px]">
              <span>Stock</span>
              <span>Side</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Price</span>
              <span className="hidden text-right sm:block">Date</span>
            </div>
            {preview.slice(0, 80).map((t, i) => (
              <div
                key={t.symbol + t.date + t.side + t.qty + i}
                className="grid grid-cols-[1fr_40px_56px_72px] gap-2 border-t border-border/60 py-1.5 sm:grid-cols-[1fr_48px_72px_88px_88px]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-fg">{t.name}</span>
                  <span className="block truncate font-mono text-[11px] text-subtle tabular">
                    {t.symbol}
                    <span className="sm:hidden"> · {t.date || "no date"}</span>
                  </span>
                </span>
                <span className={cn("text-[11px] font-medium uppercase", t.side > 0 ? "text-up" : "text-down")}>
                  {t.side > 0 ? "Buy" : "Sell"}
                </span>
                <span className="text-right font-mono tabular">{t.qty}</span>
                <span className={cn("text-right font-mono tabular", t.price > 0 ? "text-fg" : "text-warn")}>
                  {t.price > 0 ? `₹${t.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "missing"}
                  {t.priceFilled ? <span className="block text-[10px] text-subtle">day’s close</span> : null}
                </span>
                <span className="hidden text-right font-mono text-muted tabular sm:block">{t.date || "no date"}</span>
              </div>
            ))}
          </div>
          {preview.length > 80 ? (
            <p className="mt-2 text-[12px] text-subtle">Showing 80 of {preview.length}. The rest are included when you save.</p>
          ) : null}
          <label className="mt-3 flex min-h-11 items-center gap-2 text-[12px] text-muted">
            <input type="checkbox" checked={skipAmbiguous} onChange={(e) => setSkipAmbiguous(e.target.checked)} />
            Skip fills that match an existing line but have no broker id. Leave this off to keep a second identical fill.
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button className="min-h-11 flex-1 min-w-[9rem]" onClick={add}>
              Add to path
            </Button>
            <Button variant="secondary" className="min-h-11 flex-1 min-w-[9rem]" onClick={replace}>
              Replace path
            </Button>
          </div>
        </div>
      ) : null}
      <a href="/sample-trades.csv" download className="mt-3 inline-block text-[12px] text-muted underline-offset-2 hover:text-fg hover:underline">
        Sample buy/sell file
      </a>
      {imports?.[0]?.touches?.length && imports[0].commit !== "reverted" ? (
        <button type="button" className="mt-3 block text-[12px] text-muted underline-offset-2 hover:text-fg hover:underline" onClick={undoLast}>
          Undo the last path import if those lines are unchanged
        </button>
      ) : null}
    </section>
  );
}

function DuplicateNote({ existing, incoming }: { existing: TradeLine[]; incoming: TradeLine[] }) {
  const groups = duplicateGroups(existing, incoming);
  if (!groups.length) return null;
  return (
    <div className="mb-2 text-[12px] text-muted">
      {groups.length} possible duplicate group{groups.length === 1 ? "" : "s"} with no broker id. They are kept unless you turn on “Skip fills that match”.
      <ul className="mt-1 grid gap-1">
        {groups.slice(0, 4).map((group) => (
          <li key={group.key}>
            {group.rows[0]?.symbol} · {group.rows[0]?.date || "no date"} · {group.rows[0]?.qty} @ {group.rows[0]?.price}. {group.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConflictList({
  existing,
  incoming,
  choices,
  onChoice,
}: {
  existing: TradeLine[];
  incoming: TradeLine[];
  choices: Record<string, "keep" | "apply" | "skip">;
  onChoice: (id: string, choice: "keep" | "apply" | "skip") => void;
}) {
  const rows = reconcileTrades(existing, incoming).conflicts.filter((row) => row.id);
  if (!rows.length) return null;
  return (
    <div className="mb-2 grid gap-2">
      {rows.slice(0, 8).map((row) => {
        const prev = existing.find((item) => item.id === row.id);
        const choice = choices[row.id || ""] || "keep";
        return (
          <div key={row.id} className="rounded-sm border border-border px-2 py-2 text-[12px]">
            <div className="font-medium text-fg">{row.symbol} · broker id {row.id}</div>
            <p className="mt-1 text-muted">
              On the path: {prev ? `${prev.qty} @ ₹${prev.price} on ${prev.date || "no date"}` : "not found"}. Incoming: {row.qty} @ ₹{row.price} on {row.date || "no date"}. This is a conflict, not an automatic correction.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(["keep", "apply", "skip"] as const).map((id) => (
                <button key={id} type="button" className={cn("h-8 rounded-sm border px-2", choice === id ? "border-fg bg-fg text-bg" : "border-border text-muted")} onClick={() => onChoice(row.id || "", id)}>
                  {id === "keep" ? "Keep existing" : id === "apply" ? "Apply incoming" : "Skip row"}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReconcileLine({ existing, incoming }: { existing: TradeLine[]; incoming: TradeLine[] }) {
  const rec = reconcileTrades(existing, incoming);
  return (
    <p className="mb-2 text-[12px] text-muted">
      {rec.fresh.length} new · {rec.brokerDuplicates.length} same broker id (skipped) · {rec.ambiguous.length} possible repeats
      without an id · {rec.conflicts.length} id conflicts left unchanged
      {rec.invalid.length ? ` · ${rec.invalid.length} invalid` : ""}. Lines missing from this file are not deleted.
    </p>
  );
}
