import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IngestSuggestions } from "@/components/ingest-suggestions";
import { classifyIncoming, parseHoldingsFiles, parseVoice, type FillOpts, type TradeParseAudit } from "@/lib/kosh/parse";
import { enrichHoldings } from "@/lib/kosh/enrich";
import { downloadHoldingsExcel } from "@/lib/kosh/export";
import { displayName, isIsin } from "@/lib/kosh/names";
import { listingId } from "@/lib/kosh/listing";
import { apiCloseOn, apiQuotes, apiSearch } from "@/lib/kosh/api";
import { deriveMetal, formatGrams, METALS, type MetalId } from "@/lib/kosh/commodities";
import { requestIngestReview } from "@/lib/kosh/ingest-client";
import {
  aiStatusLabel,
  applyDate,
  applySymbol,
  holdingsDiff,
  makeImportRecord,
  reviewPayload,
  type Proposal,
} from "@/lib/kosh/ingest-review";
import { assessImport } from "@/lib/kosh/import-safety";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AiFailureClass, Holding, ImportAiStatus, TradeLine } from "@/lib/kosh/types";

type Tab = "file" | "manual" | "metals" | "voice";

const NONE: Holding[] = [];

type CommitMeta = {
  filename?: string;
  rowsRead: number;
  ignored: number;
  duplicates: number;
  ambiguous: number;
  missingPrices: number;
  unresolved: number;
  aiStatus: ImportAiStatus;
  aiClass?: AiFailureClass;
};

export function AddHoldings({
  portfolioId,
  trigger,
  intent = "add",
}: {
  portfolioId?: string;
  trigger: React.ReactNode;
  intent?: "add" | "update";
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={!portfolioId ? "New portfolio" : intent === "update" ? "Update holdings" : "Add holdings"}>
        <AddForm portfolioId={portfolioId} intent={intent} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AddForm({ portfolioId, intent, onDone }: { portfolioId?: string; intent: "add" | "update"; onDone: () => void }) {
  const [tab, setTab] = useState<Tab>("file");
  const [name, setName] = useState("Main");
  const addPortfolio = useKosh((s) => s.addPortfolio);
  const addHoldings = useKosh((s) => s.addHoldings);
  const fillHoldingsStore = useKosh((s) => s.fillHoldings);
  const upsertHoldingsStore = useKosh((s) => s.upsertHoldings);
  const replaceHoldings = useKosh((s) => s.replaceHoldings);
  const mergeTradesStore = useKosh((s) => s.mergeTrades);
  const recordImport = useKosh((s) => s.recordImport);
  const held = useKosh((s) =>
    portfolioId ? s.portfolios.find((p) => p.id === portfolioId)?.holdings : undefined,
  );
  const existing = held ?? NONE;
  const navigate = useNavigate();

  function commit(
    incoming: Holding[],
    pname?: string,
    mode: "add" | "fill" | "upsert" | "replace" = "add",
    opts?: FillOpts,
    trades?: TradeLine[],
    meta?: CommitMeta,
  ) {
    if (!incoming.length) {
      toast.error("No holdings found");
      return;
    }
    let savedId = portfolioId;
    let kind: "holdings" | "holdings-update" | "holdings-replace" = "holdings";
    if (portfolioId) {
      if (mode === "fill") {
        const { matched, fresh } = classifyIncoming(existing, incoming);
        fillHoldingsStore(portfolioId, incoming, opts || { dates: true, prices: true, addNew: false });
        const bits = [];
        if (opts?.dates !== false) bits.push("dates");
        if (opts?.prices !== false) bits.push("prices");
        toast.success(
          opts?.addNew
            ? `Added ${fresh.length} new name${fresh.length === 1 ? "" : "s"}`
            : `Filled ${bits.join(" & ") || "data"} on ${matched.length} matching name${matched.length === 1 ? "" : "s"} — nothing new added`,
        );
      } else if (mode === "upsert") {
        const diff = holdingsDiff(existing, incoming);
        if (diff.ambiguous.length) {
          toast.error("Two rows in the file point at the same holding. Fix the file before updating.");
          return;
        }
        if (diff.changed.some((c) => c.large)) {
          const n = diff.changed.filter((c) => c.large).length;
          if (!confirm(`${n} quantit${n === 1 ? "y changes" : "ies change"} by more than half. Names missing from the file stay. Update anyway?`)) return;
        }
        upsertHoldingsStore(portfolioId, incoming);
        kind = "holdings-update";
        toast.success(
          `Updated ${incoming.length} line${incoming.length === 1 ? "" : "s"}. ${diff.missingFromFile.length} name${diff.missingFromFile.length === 1 ? "" : "s"} not in the file stay.`,
        );
      } else if (mode === "replace") {
        const missing = holdingsDiff(existing, incoming).missingFromFile;
        if (
          !confirm(
            missing.length
              ? `Replace this snapshot? ${missing.length} name${missing.length === 1 ? "" : "s"} not in the file will be removed. That is not recorded as a sale.`
              : "Replace this snapshot with the file?",
          )
        )
          return;
        replaceHoldings(portfolioId, incoming);
        kind = "holdings-replace";
        toast.success("Holdings snapshot replaced.");
      } else {
        addHoldings(portfolioId, incoming);
        toast.success(`Added ${incoming.length} line${incoming.length === 1 ? "" : "s"}`);
      }
      if (trades?.length) {
        mergeTradesStore(portfolioId, trades);
        toast.message(`Kept ${trades.length} buy/sell line${trades.length === 1 ? "" : "s"} for your path`);
      }
    } else {
      savedId = addPortfolio(pname || name || "Main", incoming, "nifty", trades);
      toast.success("Portfolio created");
      void navigate({ to: "/p/$id", params: { id: savedId } });
    }
    if (savedId && meta) {
      recordImport(
        savedId,
        makeImportRecord({
          ...meta,
          kind,
          accepted: incoming.length,
          applied: incoming.length,
          fallback: meta.aiStatus !== "ok",
          note: meta.aiStatus === "ok" ? undefined : aiStatusLabel(meta.aiStatus, meta.aiClass),
        }),
      );
    }
    onDone();
  }

  return (
    <div>
      {!portfolioId ? (
        <Label className="mb-3">
          Name
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Label>
      ) : null}
      <div className="mb-3 flex flex-wrap rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]">
        {(["file", "manual", "metals", "voice"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-[6px] px-3 text-[12px] font-medium capitalize leading-none",
              tab === t ? "bg-surface text-fg" : "text-muted",
            )}
          >
            {t === "file" ? "Files" : t === "manual" ? "Stocks" : t === "metals" ? "Gold & silver" : "Voice"}
          </button>
        ))}
      </div>
      {tab === "file" ? (
        <FilePane
          existing={portfolioId ? existing : undefined}
          preferUpdate={intent === "update"}
          onCommit={(h, trades, meta) => commit(h, "Imported", "add", undefined, trades, meta)}
          onFill={portfolioId ? (h, opts, trades, meta) => commit(h, undefined, "fill", opts, trades, meta) : undefined}
          onUpsert={portfolioId ? (h, trades, meta) => commit(h, undefined, "upsert", undefined, trades, meta) : undefined}
          onReplace={portfolioId ? (h, meta) => commit(h, undefined, "replace", undefined, undefined, meta) : undefined}
        />
      ) : null}
      {tab === "manual" ? <ManualPane onCommit={(h) => commit(h)} /> : null}
      {tab === "metals" ? <MetalsPane onCommit={(h) => commit(h)} /> : null}
      {tab === "voice" ? <VoicePane onCommit={(h) => commit(h, "Voice")} /> : null}
    </div>
  );
}

function FilePane({
  onCommit,
  onFill,
  onUpsert,
  onReplace,
  existing,
  preferUpdate,
}: {
  onCommit: (h: Holding[], trades?: TradeLine[], meta?: CommitMeta) => void;
  onFill?: (h: Holding[], opts: FillOpts, trades?: TradeLine[], meta?: CommitMeta) => void;
  onUpsert?: (h: Holding[], trades?: TradeLine[], meta?: CommitMeta) => void;
  onReplace?: (h: Holding[], meta?: CommitMeta) => void;
  existing?: Holding[];
  preferUpdate?: boolean;
}) {
  const [msg, setMsg] = useState(
    "CSV or Excel from your broker. The full file stays on this device. AI, when it is available, sees only redacted headers and a short label sample. Quantities and prices stay with the parser.",
  );
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<Holding[] | null>(null);
  const [previewTrades, setPreviewTrades] = useState<TradeLine[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [filename, setFilename] = useState<string | undefined>();
  const [audit, setAudit] = useState<TradeParseAudit | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<{ status: ImportAiStatus; aiClass?: AiFailureClass; proposals: Proposal[]; sources: string[] }>({
    status: "not-run",
    proposals: [],
    sources: [],
  });
  const gen = useRef(0);
  const genAttempt = useRef("");

  function metaNow(): CommitMeta {
    return {
      filename,
      rowsRead: audit?.rowsRead || preview?.length || 0,
      ignored: audit?.ignored || 0,
      duplicates: audit?.duplicates || 0,
      ambiguous: (audit?.ambiguous || 0) + (existing && preview ? holdingsDiff(existing, preview).ambiguous.length : 0),
      missingPrices: audit?.missingPrices || 0,
      unresolved: audit?.unresolved || 0,
      aiStatus: ai.status,
      aiClass: ai.aiClass,
    };
  }

  async function headerLine(file: File) {
    const name = file.name.toLowerCase();
    if (!/\.(csv|tsv|txt)$/.test(name)) return [] as string[];
    try {
      const text = (await file.slice(0, 4000).text()).replace(/^\uFEFF/, "");
      const line = text.split(/\r?\n/).find((l) => l.trim()) || "";
      return line.split(/[,;\t|]/).slice(0, 12);
    } catch {
      return [];
    }
  }

  async function reviewLabels(file: File | undefined, rows: Holding[], attempt: string) {
    const ticket = ++gen.current;
    setAiBusy(true);
    setAi({ status: "not-run", proposals: [], sources: [] });
    try {
      const headers = file ? await headerLine(file) : [];
      const payload = reviewPayload({ filename: file?.name, headers, holdings: rows.slice(0, 12) });
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
      (rows || []).map((h, i) => {
        if (i !== p.row) return h;
        if (p.kind === "symbol") return { ...h, symbol: applySymbol(h.symbol, p, source) };
        if (p.kind === "date") return { ...h, date: applyDate(h.date, p, source) };
        return h;
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
    setFilename(list[0]?.name);
    try {
      const { holdings: all, trades, errors: fails, audit: got } = await parseHoldingsFiles(list);
      setAudit(got);
      const report = assessImport({
        rowsRead: got?.rowsRead || 0,
        accepted: got?.accepted || all.length,
        ignored: got?.ignored || 0,
        holdings: all.length,
        trades: (trades || []).length,
        errors: fails,
      });
      setErrors([...fails, ...report.warnings.filter((line) => !fails.includes(line))]);
      if (!all.length) {
        setPreview(null);
        setPreviewTrades([]);
        setAi({ status: "not-run", proposals: [], sources: [] });
        setMsg("No holdings found. Need a ticker (or company name) and a quantity column. Title rows are fine.");
        return;
      }
      setMsg("Matching stock names…");
      let resolved = all;
      try {
        resolved = await enrichHoldings(all);
      } catch {
        resolved = all.map((h) => ({ ...h, name: displayName(h) }));
      }
      setPreview(resolved);
      setPreviewTrades(trades || []);
      const isins = resolved.filter((h) => isIsin(h.symbol)).length;
      const needs = (got?.ambiguous || 0) + (got?.unresolved || 0);
      setMsg(
        `Ready · ${resolved.length} stock${resolved.length === 1 ? "" : "s"}` +
          (got?.rowsRead ? ` · read ${got.rowsRead.toLocaleString("en-IN")}` : "") +
          (needs ? ` · ${needs} need review` : "") +
          (trades?.length ? ` · ${trades.length} buy/sell line${trades.length === 1 ? "" : "s"} for your path` : "") +
          (isins ? ` · ${isins} still need a name match` : ""),
      );
      const attempt = `hold-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      genAttempt.current = attempt;
      void reviewLabels(list[0], resolved, attempt);
    } finally {
      setBusy(false);
    }
  }

  const diff = existing && preview ? holdingsDiff(existing, preview) : null;
  const shown = preview ? preview.slice(0, 80) : [];

  return (
    <div>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void ingest(e.dataTransfer.files);
        }}
        className="block cursor-pointer rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted"
      >
        <input
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,.xlsm,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="sr-only"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.files) void ingest(e.target.files);
            e.target.value = "";
          }}
        />
        Drop a holdings export or a buy/sell trade book
        <div className="mt-1 text-[12px] text-subtle">
          Click to pick · CSV or Excel. Read on this device. Fill never adds extras. Update holdings changes matches and
          keeps names that are missing from the file. Replace snapshot is the only action that removes them.
        </div>
      </label>
      <p className="mt-2 text-[12px] text-subtle">{busy ? "Reading…" : msg}</p>
      {errors.length ? (
        <ul className="mt-2 grid gap-1 text-[12px] text-down">
          {errors.slice(0, 40).map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      {preview?.length ? (
        <IngestSuggestions busy={aiBusy} status={ai.status} aiClass={ai.aiClass} proposals={ai.proposals} onAccept={accept} />
      ) : null}
      {preview?.length ? (
        <div className="mt-3">
          {diff ? (
            <p className="text-[12px] text-muted">
              {diff.fresh.length} new · {diff.changed.length} changed · {diff.unchanged} unchanged · {diff.missingFromFile.length} not
              in the file (kept, not sold)
              {diff.ambiguous.length ? ` · ${diff.ambiguous.length} ambiguous` : ""}
            </p>
          ) : null}
          <div className="max-h-[40dvh] overflow-y-auto rounded-sm bg-bg px-3 py-2 text-[12px] shadow-[var(--shadow-border)] sm:max-h-56">
            <div className="grid grid-cols-[1fr_56px_72px] gap-2 pb-1.5 font-medium tracking-[0.06em] text-subtle uppercase sm:grid-cols-[1fr_72px_88px]">
              <span>Stock</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Avg cost</span>
            </div>
            {shown.map((h) => (
              <div key={h.symbol + h.name} className="grid grid-cols-[1fr_56px_72px] gap-2 border-t border-border/60 py-1.5 sm:grid-cols-[1fr_72px_88px]">
                <span className="min-w-0">
                  <span className="block truncate text-fg">{h.name}</span>
                  <span className="block truncate font-mono text-[11px] text-subtle tabular">
                    {h.symbol}
                    {h.sector ? ` · ${h.sector}` : ""}
                  </span>
                </span>
                <span className="text-right font-mono text-muted tabular">{h.qty}</span>
                <span className={cn("text-right font-mono tabular", h.avg ? "text-fg" : "text-warn")}>
                  {h.avg ? `₹${h.avg.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "missing"}
                </span>
              </div>
            ))}
          </div>
          {preview.length > shown.length ? (
            <p className="mt-2 text-[12px] text-subtle">Showing {shown.length} of {preview.length}. The rest are included when you save.</p>
          ) : null}
          {preview.some((h) => !h.avg) ? (
            <p className="mt-2 text-[12px] text-warn">Some rows have no buy price — unrealised P&L for those will stay blank until you edit them.</p>
          ) : null}
          {previewTrades.length ? (
            <p className="mt-2 text-[12px] text-muted">
              {previewTrades.length} buy/sell line{previewTrades.length === 1 ? "" : "s"} in this file — kept for Path only. This mix is unchanged.
            </p>
          ) : null}
          {existing?.length && !diff ? (
            <p className="mt-2 text-[12px] text-muted">
              {classifyIncoming(existing, preview).matched.length} match this portfolio. Fill never adds extras.
            </p>
          ) : null}
          <div className="sticky bottom-0 mt-3 flex flex-wrap gap-2 bg-bg-elevated pt-2">
            {onUpsert && existing?.length ? (
              <Button className="min-h-11 flex-1 min-w-[9rem]" onClick={() => onUpsert(preview, previewTrades, metaNow())}>
                Update holdings
              </Button>
            ) : null}
            {onFill && existing?.length && !preferUpdate ? (
              <>
                <Button
                  className="min-h-11 flex-1 min-w-[9rem]"
                  variant="secondary"
                  onClick={() => onFill(preview, { dates: true, prices: false, addNew: false }, previewTrades, metaNow())}
                >
                  Fill dates
                </Button>
                <Button
                  className="min-h-11 flex-1 min-w-[9rem]"
                  variant="secondary"
                  onClick={() => onFill(preview, { dates: false, prices: true, addNew: false }, previewTrades, metaNow())}
                >
                  Fill prices
                </Button>
                <Button
                  className="min-h-11 flex-1 min-w-[9rem]"
                  variant="secondary"
                  onClick={() => onFill(preview, { dates: true, prices: true, addNew: false }, previewTrades, metaNow())}
                >
                  Fill dates & prices
                </Button>
                {classifyIncoming(existing, preview).fresh.length ? (
                  <Button
                    variant="secondary"
                    className="min-h-11 flex-1 min-w-[9rem]"
                    onClick={() => onFill(preview, { dates: false, prices: false, addNew: true }, previewTrades, metaNow())}
                  >
                    Add {classifyIncoming(existing, preview).fresh.length} new
                  </Button>
                ) : null}
              </>
            ) : null}
            {!existing?.length ? (
              <Button className="min-h-11 flex-1" onClick={() => onCommit(preview, previewTrades, metaNow())}>
                Add {preview.length} stock{preview.length === 1 ? "" : "s"}
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="min-h-11 flex-1 min-w-[9rem]"
                onClick={() => onCommit(preview, previewTrades, metaNow())}
              >
                Add onto book
              </Button>
            )}
            {onReplace && existing?.length ? (
              <Button variant="ghost" className="min-h-11 flex-1 min-w-[9rem]" onClick={() => onReplace(preview, metaNow())}>
                Replace snapshot
              </Button>
            ) : null}
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => {
                try {
                  downloadHoldingsExcel("preview", preview);
                } catch {
                  /* ignore */
                }
              }}
            >
              Excel
            </Button>
          </div>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3 text-[12px]">
        <a href="/sample-holdings.csv" download className="text-muted underline-offset-2 hover:text-fg hover:underline">
          Sample CSV
        </a>
        <a href="/sample-holdings.xlsx" download className="text-muted underline-offset-2 hover:text-fg hover:underline">
          Sample Excel
        </a>
        <a href="/sample-trades.csv" download className="text-muted underline-offset-2 hover:text-fg hover:underline">
          Sample buy/sell file
        </a>
      </div>
    </div>
  );
}

function ManualPane({ onCommit }: { onCommit: (h: Holding[]) => void }) {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [avg, setAvg] = useState("");
  const [date, setDate] = useState("");
  const [hits, setHits] = useState<{ symbol: string; name: string }[]>([]);
  const [pending, setPending] = useState<Holding[]>([]);

  async function onSym(v: string) {
    setSymbol(v);
    if (v.trim().length < 2) {
      setHits([]);
      return;
    }
    try {
      setHits(await apiSearch(v.trim()));
    } catch {
      setHits([]);
    }
  }

  function pushCurrent() {
    const q = Number(qty);
    if (!symbol.trim() || !(q > 0)) {
      toast.error("Ticker and qty required");
      return false;
    }
    setPending((cur) => [
      ...cur,
      {
        symbol: symbol.trim().toUpperCase(),
        name: symbol.trim().toUpperCase(),
        qty: q,
        avg: Number(avg) || null,
        date: date || null,
      },
    ]);
    setSymbol("");
    setQty("");
    setAvg("");
    setDate("");
    setHits([]);
    return true;
  }

  return (
    <div className="grid gap-3">
      <Label>
        Ticker
        <Input value={symbol} onChange={(e) => void onSym(e.target.value)} placeholder="RELIANCE" autoComplete="off" />
        {hits.length ? (
          <ul className="mt-1 max-h-40 overflow-y-auto rounded-sm bg-surface shadow-[var(--shadow-border)]">
            {hits.slice(0, 6).map((h) => (
              <li key={h.symbol}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-surface-2"
                  onClick={() => {
                    setSymbol(listingId(h.symbol));
                    setHits([]);
                  }}
                >
                  <span className="font-medium">{h.symbol}</span>
                  <span className="text-muted">{h.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Label>
      <div className="grid grid-cols-2 gap-3">
        <Label>
          Qty
          <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" />
        </Label>
        <Label>
          Avg price
          <Input value={avg} onChange={(e) => setAvg(e.target.value)} type="number" placeholder="optional" />
        </Label>
      </div>
      <Label>
        Buy date
        <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
      </Label>
      {pending.length ? (
        <ul className="grid gap-1 text-[13px] text-muted">
          {pending.map((h, i) => (
            <li key={h.symbol + i} className="flex justify-between">
              <span>
                {h.symbol} × {h.qty}
              </span>
              <button type="button" className="text-subtle hover:text-fg" onClick={() => setPending((p) => p.filter((_, j) => j !== i))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => pushCurrent()}>
          Add to list
        </Button>
        <Button
          onClick={() => {
            const extra: Holding[] = [];
            if (symbol.trim() && Number(qty) > 0) {
              extra.push({
                symbol: symbol.trim().toUpperCase(),
                name: symbol.trim().toUpperCase(),
                qty: Number(qty),
                avg: Number(avg) || null,
                date: date || null,
              });
            }
            const all = [...pending, ...extra];
            if (!all.length) {
              toast.error("Add at least one stock");
              return;
            }
            onCommit(all);
          }}
        >
          Save stocks
        </Button>
      </div>
    </div>
  );
}

function MetalsPane({ onCommit }: { onCommit: (h: Holding[]) => void }) {
  const [metal, setMetal] = useState<MetalId>("GOLD");
  const [qty, setQty] = useState("");
  const [avg, setAvg] = useState("");
  const [invested, setInvested] = useState("");
  const [date, setDate] = useState("");
  const [live, setLive] = useState<number | null>(null);
  const [close, setClose] = useState<number | null>(null);
  const [closeDay, setCloseDay] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("Fill grams, a buy date, ₹/g, or total rupees — we fill the rest.");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const rows = await apiQuotes([metal]);
        const px = rows[0]?.price || 0;
        if (alive) setLive(px > 0 ? px : null);
      } catch {
        if (alive) setLive(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [metal]);

  function onPick(id: MetalId) {
    setMetal(id);
    setClose(null);
    setCloseDay(null);
    setLive(null);
    if (date) {
      /* close re-fetched below via metal change + date kept */
      void (async () => {
        try {
          const hit = await apiCloseOn(id, date);
          if (hit?.price > 0) {
            setClose(hit.price);
            setCloseDay(hit.day);
          }
        } catch {
          /* keep live */
        }
      })();
    }
  }

  async function onDate(v: string) {
    setDate(v);
    if (!v) {
      setClose(null);
      setCloseDay(null);
      return;
    }
    setBusy(true);
    try {
      const hit = await apiCloseOn(metal, v);
      if (hit?.price > 0) {
        setClose(hit.price);
        setCloseDay(hit.day);
        if (!avg) setAvg(String(Math.round(hit.price * 100) / 100));
        setHint(`Close on ${hit.day}: ₹${hit.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })} / g`);
      } else {
        setHint("No close for that date — live spot will be used.");
      }
    } catch {
      setHint("Could not fetch that day’s close — live spot will be used.");
    } finally {
      setBusy(false);
    }
  }

  const draft = deriveMetal({
    qty: Number(qty) || null,
    avg: Number(avg) || null,
    invested: Number(invested) || null,
    close,
    live,
  });

  function save() {
    const got = deriveMetal({
      qty: Number(qty) || null,
      avg: Number(avg) || null,
      invested: Number(invested) || null,
      close,
      live,
    });
    if (!got.ok) {
      toast.error(got.error);
      return;
    }
    onCommit([
      {
        symbol: metal,
        name: METALS[metal].name,
        qty: got.qty,
        avg: got.avg,
        date: date || closeDay || null,
        kind: "commodity",
        unit: "g",
        sector: "Commodities",
      },
    ]);
  }

  return (
    <div className="grid gap-3">
      <p className="text-[13px] text-muted">
        Spot from MCX — gold as ₹/10g, silver as ₹/kg. Holdings stay in grams; value is MCX. Fill any of grams, date, ₹/g or total rupees.
      </p>
      <div className="inline-flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]">
        {(["GOLD", "SILVER"] as MetalId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className={cn(
              "h-8 rounded-[6px] px-3 text-[12px] font-medium",
              metal === id ? "bg-surface text-fg" : "text-muted",
            )}
          >
            {METALS[id].name}
          </button>
        ))}
      </div>
      <p className="font-mono text-[12px] text-subtle tabular">
        {busy ? "Fetching close…" : live ? `Live ${METALS[metal].name} · ${live.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ₹/g (MCX)` : "Fetching live MCX…"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Label>
          Grams
          <Input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            type="number"
            step="any"
            placeholder="10"
            data-testid="metal-qty"
          />
        </Label>
        <Label>
          ₹ / g
          <Input value={avg} onChange={(e) => setAvg(e.target.value)} type="number" step="any" placeholder="optional" />
        </Label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Label>
          Buy date
          <Input value={date} onChange={(e) => void onDate(e.target.value)} type="date" />
        </Label>
        <Label>
          Total rupees
          <Input value={invested} onChange={(e) => setInvested(e.target.value)} type="number" step="any" placeholder="optional" />
        </Label>
      </div>
      <p className="text-[12px] text-subtle">{hint}</p>
      {draft.ok ? (
        <div className="rounded-sm bg-bg px-3 py-2 text-[13px] shadow-[var(--shadow-border)]">
          <div className="font-medium">
            {formatGrams(draft.qty)} {METALS[metal].name}
          </div>
          <div className="mt-0.5 font-mono text-[12px] text-muted tabular">
            ₹{draft.avg.toLocaleString("en-IN", { maximumFractionDigits: 2 })} / g · invested ₹
            {draft.invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })} · {draft.filledFrom}
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-muted">{draft.error}</p>
      )}
      <Button onClick={save} disabled={!draft.ok}>
        Add {METALS[metal].name}
      </Button>
    </div>
  );
}

function VoicePane({ onCommit }: { onCommit: (h: Holding[]) => void }) {
  const [txt, setTxt] = useState("Say tickers and quantities. Example: Reliance 20, TCS 8.");
  return (
    <div>
      <p className="mb-3 text-sm text-muted">{txt}</p>
      <Button
        onClick={() => {
          const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec }).SpeechRecognition
            || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
          if (!SR) {
            setTxt("Voice not supported here. Use manual add.");
            return;
          }
          const rec = new SR();
          rec.lang = "en-IN";
          rec.onresult = (ev: { results: ArrayLike<{ 0: { transcript: string } }> }) => {
            const text = ev.results[0][0].transcript;
            setTxt(text);
            const parsed = parseVoice(text);
            if (parsed.length) onCommit(parsed);
          };
          rec.start();
        }}
      >
        Start listening
      </Button>
    </div>
  );
}

type SpeechRec = {
  lang: string;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  start: () => void;
};
