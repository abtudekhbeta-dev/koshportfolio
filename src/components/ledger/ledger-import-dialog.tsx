import { useState } from "react";
import { createPortal } from "react-dom";
import {
  applyImport,
  importCounts,
  loadImportUndo,
  parseSymbolToken,
  previewImport,
  saveImportUndo,
  type ImportPreview,
  type SymbolRow,
} from "@/lib/kosh/ledger-import";
import type { LedgerDraw } from "@/lib/kosh/ledger-layout";

type UrlResult = {
  ok: boolean;
  error?: string;
  kind?: "watchlist" | "chart";
  name?: string;
  symbols?: string[];
  drawingsFound?: boolean;
  note?: string;
};

export function LedgerImportDialog({
  open,
  symbol,
  drawings,
  onClose,
  onCommit,
  onRollback,
}: {
  open: boolean;
  symbol: string;
  drawings: Record<string, LedgerDraw[]>;
  onClose: () => void;
  onCommit: (next: Record<string, LedgerDraw[]>, watch: string[]) => void;
  onRollback: (drawings: Record<string, LedgerDraw[]>) => void;
}) {
  const [url, setUrl] = useState("");
  const [urlNote, setUrlNote] = useState("");
  const [symbols, setSymbols] = useState<SymbolRow[]>([]);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [assign, setAssign] = useState(false);
  const [mode, setMode] = useState<"add" | "replace">("add");
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [addWatch, setAddWatch] = useState(true);
  const [busy, setBusy] = useState(false);
  const [fileText, setFileText] = useState("");
  const undo = typeof window === "undefined" ? null : loadImportUndo();
  if (!open) return null;

  async function readUrl() {
    setBusy(true);
    setUrlNote("");
    setPreview(null);
    try {
      const response = await fetch("/api/tv-public?url=" + encodeURIComponent(url.trim()));
      const body = (await response.json()) as UrlResult;
      if (!body.ok) {
        setUrlNote(body.error || "That link could not be read.");
        setSymbols([]);
        return;
      }
      const rows = (body.symbols || []).map(parseSymbolToken);
      setSymbols(rows);
      setUrlNote(body.note || "");
      if (body.kind === "chart" && body.drawingsFound === false) setPreview(null);
    } catch {
      setUrlNote("That link could not be read.");
    } finally {
      setBusy(false);
    }
  }

  function readFile(text: string, assignNow = assign) {
    setFileText(text);
    try {
      const parsed = JSON.parse(text) as unknown;
      setPreview(previewImport(parsed, assignNow ? symbol : ""));
      setUrlNote("");
    } catch {
      setPreview(null);
      setUrlNote("That file is not JSON.");
    }
  }

  function commit() {
    if (!preview) return;
    if (mode === "replace" && !confirmReplace) return;
    const scopes = [...new Set(preview.objects.filter((item) => item.draw && item.scope).map((item) => item.scope))];
    const applied = applyImport({
      current: drawings,
      objects: preview.objects,
      mode,
      replaceScopes: mode === "replace" ? scopes : [],
    });
    saveImportUndo(drawings);
    const watch = addWatch ? symbols.filter((row) => row.status === "resolved").map((row) => row.symbol) : [];
    const fromObjects = preview.objects.filter((item) => item.status === "exact" || item.status === "converted").map((item) => item.symbol);
    onCommit(applied.next, [...new Set([...watch, ...fromObjects.filter(Boolean)])]);
    onClose();
  }

  const counts = preview ? importCounts(preview) : null;
  return createPortal(
    <div className="lt-modal" role="dialog" aria-modal="true" aria-label="Import from TradingView">
      <button type="button" className="lt-backdrop" aria-label="Close import" onClick={onClose} />
      <div className="lt-modal-card">
        <header>
          <strong>Import from TradingView</strong>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <p>
          A shared watchlist link can provide symbols. A chart link only identifies a layout. It is not treated as a drawing export unless the page actually contains drawing objects.
        </p>
        <label>
          Watchlist or chart link
          <input aria-label="TradingView link" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.tradingview.com/watchlists/…" />
        </label>
        <button type="button" disabled={busy || !url.trim()} onClick={() => void readUrl()}>
          {busy ? "Reading" : "Read public page"}
        </button>
        <label>
          Drawing file
          <input
            aria-label="Drawing JSON file"
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 1_500_000) {
                setUrlNote("That file is larger than 1.5 MB.");
                return;
              }
              void file.text().then(readFile);
            }}
          />
        </label>
        <p className="lt-muted">
          Accepts a kosh-drawings version 1 file, or a TradingView layout JSON whose sources include LineTool objects with time and price. CSV chart data is not a drawing file.
        </p>
        {urlNote ? <p>{urlNote}</p> : null}
        {symbols.length ? (
          <ul>
            {symbols.slice(0, 40).map((row) => (
              <li key={row.raw}>
                {row.raw} · {row.status === "resolved" ? row.symbol : "needs review"} · {row.reason}
              </li>
            ))}
          </ul>
        ) : null}
        {counts ? (
          <dl>
            <div>Symbols in the file: {counts.symbols}</div>
            <div>Resolved: {counts.resolved}</div>
            <div>Symbols needing a mapping: {counts.reviewSymbols}</div>
            <div>Exact drawings: {counts.exact}</div>
            <div>Converted drawings: {counts.converted}</div>
            <div>Needs review: {counts.review}</div>
            <div>Unsupported: {counts.unsupported}</div>
          </dl>
        ) : null}
        {preview?.objects.some((item) => item.status === "needs-review" || item.status === "unsupported") ? (
          <ul>
            {preview.objects
              .filter((item) => item.status === "needs-review" || item.status === "unsupported")
              .slice(0, 12)
              .map((item, index) => (
                <li key={item.fingerprint + index}>
                  {item.status}: {item.reason}
                </li>
              ))}
          </ul>
        ) : null}
        <label>
          <input type="checkbox" checked={assign} onChange={(e) => { const next = e.target.checked; setAssign(next); if (fileText) readFile(fileText, next); }} />
          Assign objects that have no symbol to {symbol}. This is recorded as a conversion.
        </label>
        <label>
          <input type="radio" name="import-mode" checked={mode === "add"} onChange={() => setMode("add")} />
          Add beside existing drawings
        </label>
        <label>
          <input type="radio" name="import-mode" checked={mode === "replace"} onChange={() => setMode("replace")} />
          Replace drawings for the symbols in this file
        </label>
        {mode === "replace" ? (
          <label>
            <input type="checkbox" checked={confirmReplace} onChange={(e) => setConfirmReplace(e.target.checked)} />
            I understand this removes current drawings on those symbols first.
          </label>
        ) : null}
        <label>
          <input type="checkbox" checked={addWatch} onChange={(e) => setAddWatch(e.target.checked)} />
          Add resolved symbols to the open watchlist
        </label>
        <div className="lt-modal-actions">
          <button type="button" disabled={!preview || (mode === "replace" && !confirmReplace)} onClick={commit}>
            Import checked drawings
          </button>
          {undo ? (
            <button
              type="button"
              onClick={() => {
                onRollback(undo.drawings);
                onClose();
              }}
            >
              Roll back the last import
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
