import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { classifyIncoming, parseHoldingsFiles, parseVoice, type FillOpts } from "@/lib/kosh/parse";
import { enrichHoldings } from "@/lib/kosh/enrich";
import { downloadHoldingsExcel } from "@/lib/kosh/export";
import { displayName, isIsin } from "@/lib/kosh/names";
import { apiCloseOn, apiQuotes, apiSearch } from "@/lib/kosh/api";
import { deriveMetal, formatGrams, METALS, type MetalId } from "@/lib/kosh/commodities";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Holding, TradeLine } from "@/lib/kosh/types";

type Tab = "file" | "manual" | "metals" | "voice";

const NONE: Holding[] = [];

export function AddHoldings({
  portfolioId,
  trigger,
}: {
  portfolioId?: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={portfolioId ? "Add holdings" : "New portfolio"}>
        <AddForm
          portfolioId={portfolioId}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddForm({ portfolioId, onDone }: { portfolioId?: string; onDone: () => void }) {
  const [tab, setTab] = useState<Tab>("file");
  const [name, setName] = useState("Main");
  const addPortfolio = useKosh((s) => s.addPortfolio);
  const addHoldings = useKosh((s) => s.addHoldings);
  const fillHoldingsStore = useKosh((s) => s.fillHoldings);
  const upsertHoldingsStore = useKosh((s) => s.upsertHoldings);
  const mergeTradesStore = useKosh((s) => s.mergeTrades);
  const held = useKosh((s) =>
    portfolioId ? s.portfolios.find((p) => p.id === portfolioId)?.holdings : undefined,
  );
  const existing = held ?? NONE;
  const navigate = useNavigate();

  function commit(incoming: Holding[], pname?: string, mode: "add" | "fill" | "upsert" = "add", opts?: FillOpts, trades?: TradeLine[]) {
    if (!incoming.length) {
      toast.error("No holdings found");
      return;
    }
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
        upsertHoldingsStore(portfolioId, incoming);
        toast.success(`Updated ${incoming.length} line${incoming.length === 1 ? "" : "s"} from the file`);
      } else {
        addHoldings(portfolioId, incoming);
        toast.success(`Added ${incoming.length} line${incoming.length === 1 ? "" : "s"}`);
      }
      if (trades?.length) {
        mergeTradesStore(portfolioId, trades);
        toast.message(`Kept ${trades.length} buy/sell line${trades.length === 1 ? "" : "s"} for your path`);
      }
    } else {
      const id = addPortfolio(pname || name || "Main", incoming, "nifty", trades);
      toast.success("Portfolio created");
      void navigate({ to: "/p/$id", params: { id } });
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
          onCommit={(h, trades) => commit(h, "Imported", "add", undefined, trades)}
          onFill={portfolioId ? (h, opts, trades) => commit(h, undefined, "fill", opts, trades) : undefined}
          onUpsert={portfolioId ? (h, trades) => commit(h, undefined, "upsert", undefined, trades) : undefined}
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
  existing,
}: {
  onCommit: (h: Holding[], trades?: TradeLine[]) => void;
  onFill?: (h: Holding[], opts: FillOpts, trades?: TradeLine[]) => void;
  onUpsert?: (h: Holding[], trades?: TradeLine[]) => void;
  existing?: Holding[];
}) {
  const [msg, setMsg] = useState("CSV or Excel from your broker — holdings snapshot or a buy/sell trade book.");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<Holding[] | null>(null);
  const [previewTrades, setPreviewTrades] = useState<TradeLine[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  async function ingest(files: FileList | File[]) {
    const list = [...files];
    if (!list.length) return;
    setBusy(true);
    setMsg("Reading " + list.length + " file(s)…");
    setErrors([]);
    try {
      const { holdings: all, trades, errors: fails } = await parseHoldingsFiles(list);
      setErrors(fails);
      if (!all.length) {
        setPreview(null);
        setPreviewTrades([]);
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
      setMsg(
        `Ready · ${resolved.length} stock${resolved.length === 1 ? "" : "s"}` +
          (trades?.length ? ` · ${trades.length} buy/sell line${trades.length === 1 ? "" : "s"} for your path` : "") +
          (isins ? ` · ${isins} still need a name match` : ""),
      );
    } finally {
      setBusy(false);
    }
  }

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
          Click to pick · CSV or Excel. Read on this device — your original broker file is not uploaded to Kosh.
          Trade books are netted (partial exits kept, sold names dropped). Dated buy/sell lines stay on Path only.
          This overview chart is the current mix and does not draw that path. Fill never adds extras. Update from file
          sets quantity on matches without doubling.
        </div>
      </label>
      <p className="mt-2 text-[12px] text-subtle">{busy ? "Reading…" : msg}</p>
      {errors.length ? (
        <ul className="mt-2 grid gap-1 text-[12px] text-down">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      {preview?.length ? (
        <div className="mt-3">
          <div className="max-h-[40dvh] overflow-y-auto rounded-sm bg-bg px-3 py-2 text-[12px] shadow-[var(--shadow-border)] sm:max-h-56">
            <div className="grid grid-cols-[1fr_56px_72px] gap-2 pb-1.5 font-medium tracking-[0.06em] text-subtle uppercase sm:grid-cols-[1fr_72px_88px]">
              <span>Stock</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Avg cost</span>
            </div>
            {preview.map((h) => (
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
          {preview.some((h) => !h.avg) ? (
            <p className="mt-2 text-[12px] text-warn">Some rows have no buy price — unrealised P&L for those will stay blank until you edit them.</p>
          ) : null}
          {previewTrades.length ? (
            <p className="mt-2 text-[12px] text-muted">
              {previewTrades.length} buy/sell line{previewTrades.length === 1 ? "" : "s"} in this file — kept for Path only. This mix is unchanged.
            </p>
          ) : null}
          {existing?.length ? (
            <p className="mt-2 text-[12px] text-muted">
              {classifyIncoming(existing, preview).matched.length} match this portfolio
              {classifyIncoming(existing, preview).fresh.length
                ? ` · ${classifyIncoming(existing, preview).fresh.length} not in this portfolio (sold or new)`
                : ""}
              . Fill never adds those extras.
            </p>
          ) : null}
          <div className="sticky bottom-0 mt-3 flex flex-wrap gap-2 bg-bg-elevated pt-2">
            {onFill && existing?.length ? (
              <>
                <Button
                  className="flex-1 min-w-[9rem]"
                  variant="secondary"
                  onClick={() => onFill(preview, { dates: true, prices: false, addNew: false }, previewTrades)}
                >
                  Fill dates
                </Button>
                <Button
                  className="flex-1 min-w-[9rem]"
                  variant="secondary"
                  onClick={() => onFill(preview, { dates: false, prices: true, addNew: false }, previewTrades)}
                >
                  Fill prices
                </Button>
                <Button className="flex-1 min-w-[9rem]" onClick={() => onFill(preview, { dates: true, prices: true, addNew: false }, previewTrades)}>
                  Fill dates & prices
                </Button>
                {classifyIncoming(existing, preview).fresh.length ? (
                  <Button
                    variant="secondary"
                    className="flex-1 min-w-[9rem]"
                    onClick={() => onFill(preview, { dates: false, prices: false, addNew: true }, previewTrades)}
                  >
                    Add {classifyIncoming(existing, preview).fresh.length} new
                  </Button>
                ) : null}
              </>
            ) : (
              <Button className="flex-1" onClick={() => onCommit(preview, previewTrades)}>
                Add {preview.length} stock{preview.length === 1 ? "" : "s"}
              </Button>
            )}
            {!onFill ? null : existing?.length ? (
              <Button variant="ghost" className="flex-1 min-w-[9rem]" onClick={() => (onUpsert ? onUpsert(preview, previewTrades) : onCommit(preview, previewTrades))}>
                Update from file
              </Button>
            ) : null}
            <Button
              variant="secondary"
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
                    setSymbol(h.symbol.replace(/\.(NS|BO)$/i, ""));
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
