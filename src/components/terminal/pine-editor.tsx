import { useEffect, useMemo, useRef, useState } from "react";
import { compilePine, highlightPine, matchingBracket, pineVersion, PINE_SUPPORTED, PINE_UNSUPPORTED, runPine, type PineInput, type PinePlot } from "@/lib/kosh/pine";
import { loadPineActive, loadPineLibrary, newPineId, savePineActive, savePineLibrary, type SavedPine } from "@/lib/kosh/pine-store";
import type { OhlcBar } from "@/lib/kosh/types";
import { cn } from "@/lib/utils";

const STARTER = `//@version=5
indicator("SMA", overlay=true)
len = input.int(20, "Length")
plot(ta.sma(close, len), "SMA", color=color.teal)
`;

const HINTS = ["ta.sma(", "ta.ema(", "ta.rsi(", "ta.atr(", "ta.highest(", "ta.lowest(", "ta.crossover(", "ta.crossunder(", "ta.change(", "math.abs(", "math.max(", "math.min(", "input.int(", "input.float(", "input.bool(", "color.teal", "color.red", "color.blue", "plot(", "hline("];

function readStore() {
  if (typeof localStorage === "undefined") return { library: [] as SavedPine[], active: [] as string[] };
  return { library: loadPineLibrary((key) => localStorage.getItem(key)), active: loadPineActive((key) => localStorage.getItem(key)) };
}

export function PineDock({ bars, onPlots }: { bars: OhlcBar[]; onPlots: (plots: PinePlot[]) => void }) {
  const stored = useRef(readStore());
  const [library, setLibrary] = useState<SavedPine[]>(stored.current.library);
  const [applied, setApplied] = useState<string[]>(stored.current.active);
  const [openId, setOpenId] = useState<string | null>(stored.current.library[0]?.id || null);
  const [draft, setDraft] = useState(stored.current.library[0]?.source || STARTER);
  const [past, setPast] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [finding, setFinding] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Record<string, Record<string, number | boolean>>>({});
  const [caret, setCaret] = useState(0);
  const [aside, setAside] = useState<{ title: string; last: string }[]>([]);
  const [runNote, setRunNote] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);
  const script = library.find((row) => row.id === openId) || null;
  const compiled = useMemo(() => compilePine(draft), [draft]);
  const version = pineVersion(draft);
  const cursor = Math.max(0, caret - 1);
  const bracket = matchingBracket(draft, cursor);
  const marked = new Set<number>();
  if (bracket != null) {
    marked.add(cursor);
    marked.add(bracket);
  }

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    savePineLibrary(library, (key, value) => localStorage.setItem(key, value));
    savePineActive(applied, (key, value) => localStorage.setItem(key, value));
  }, [library, applied]);

  useEffect(() => {
    const plots: PinePlot[] = [];
    const off: { title: string; last: string }[] = [];
    const notes: string[] = [];
    for (const id of applied) {
      const row = library.find((item) => item.id === id);
      if (!row) continue;
      const ran = runPine(row.source, bars, inputs[id] || {});
      if (ran.errors.length) {
        notes.push(`${row.name}: line ${ran.errors[0].line}: ${ran.errors[0].message}`);
        continue;
      }
      for (const warning of ran.warnings) notes.push(`${row.name}: ${warning}`);
      for (const plot of ran.plots) {
        if (plot.overlay) plots.push(plot);
        else {
          let last: number | null = null;
          for (let i = plot.values.length - 1; i >= 0; i--) {
            if (plot.values[i] != null) {
              last = plot.values[i];
              break;
            }
          }
          off.push({ title: `${row.name} · ${plot.title}`, last: last == null ? "—" : last.toFixed(2) });
        }
      }
    }
    setAside(off);
    setRunNote(notes.join(" "));
    onPlots(plots);
  }, [applied, library, bars, inputs, onPlots]);

  function writeDraft(next: string) {
    setDraft(next);
    if (!openId) return;
    setLibrary((rows) => rows.map((row) => row.id === openId ? { ...row, source: next, updatedAt: new Date().toISOString() } : row));
  }

  function edit(next: string) {
    setPast((rows) => [...rows.slice(-80), draft]);
    setFuture([]);
    writeDraft(next);
  }

  function persist(name: string, source: string, id = openId) {
    const stamp = new Date().toISOString();
    if (id && library.some((row) => row.id === id)) {
      setLibrary((rows) => rows.map((row) => row.id === id ? { ...row, name, source, updatedAt: stamp } : row));
      return id;
    }
    const created: SavedPine = { id: newPineId(), name, source, updatedAt: stamp };
    setLibrary((rows) => [created, ...rows].slice(0, 40));
    setOpenId(created.id);
    return created.id;
  }

  function insertHint(hint: string) {
    const el = area.current;
    const at = el?.selectionStart ?? draft.length;
    edit(draft.slice(0, at) + hint + draft.slice(at));
    setHints([]);
  }

  const lines = draft.split("\n");
  const status = !compiled.ok ? compiled.errors[0] : null;
  const declared: PineInput[] = compiled.ok ? compiled.inputs : [];

  return (
    <div className="shrink-0 border-t border-border">
      <button type="button" className="flex h-7 w-full items-center px-2 text-left text-[11px] text-muted" onClick={() => setShow((v) => !v)}>
        {show ? "Hide Pine editor" : "Pine editor"}
        <span className="ml-2 text-subtle">{applied.length ? `${applied.length} on the chart` : "Nothing custom on the chart"}</span>
      </button>
      {show ? (
        <div className="px-2 pb-2">
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            <button type="button" className="h-7 rounded-sm bg-surface px-2" onClick={() => { setDraft(STARTER); setOpenId(null); setPast([]); setFuture([]); }}>New</button>
            <button type="button" className="h-7 rounded-sm bg-surface px-2" onClick={() => persist(script?.name || "Script", draft)}>Save</button>
            <button type="button" className="h-7 rounded-sm bg-surface px-2" onClick={() => { const name = window.prompt("Script name", script?.name || "Script"); if (name) persist(name, draft, null); }}>Save as</button>
            <button type="button" className="h-7 rounded-sm bg-surface px-2" disabled={!script} onClick={() => { const name = window.prompt("Rename", script?.name || ""); if (name && script) setLibrary((rows) => rows.map((row) => row.id === script.id ? { ...row, name } : row)); }}>Rename</button>
            <button type="button" className="h-7 rounded-sm px-2 text-down" disabled={!script} onClick={() => { if (!script) return; setLibrary((rows) => rows.filter((row) => row.id !== script.id)); setApplied((ids) => ids.filter((id) => id !== script.id)); setOpenId(null); setDraft(STARTER); }}>Delete</button>
            <label className="flex items-center gap-1 text-muted">
              Version
              <select aria-label="Pine version" className="h-7 rounded-sm bg-surface px-1" value={version == null ? "" : String(version)} onChange={(e) => {
                const next = e.target.value;
                if (next !== "5" && next !== "6") return;
                edit(/\/\/@version\s*=\s*\d+/.test(draft) ? draft.replace(/\/\/@version\s*=\s*\d+/, `//@version=${next}`) : `//@version=${next}\n${draft}`);
              }}>
                {version == null ? <option value="">No version line</option> : null}
                {version != null && version !== 5 && version !== 6 ? <option value={String(version)}>{`v${version} is outside this subset`}</option> : null}
                <option value="5">v5 subset</option>
                <option value="6">v6 subset</option>
              </select>
            </label>
            <button type="button" className="h-7 rounded-sm bg-accent px-2 text-accent-fg" onClick={() => {
              if (!compiled.ok) return;
              const id = persist(script?.name || compiled.title || "Script", draft);
              setApplied((ids) => ids.includes(id) ? ids : [...ids, id].slice(0, 8));
            }}>Add to chart</button>
            <button type="button" className="h-7 px-2 text-muted" disabled={!script || !applied.includes(script.id)} onClick={() => script && setApplied((ids) => ids.filter((id) => id !== script.id))}>Remove</button>
            <button type="button" className="h-7 px-2 text-muted" onClick={() => setFinding((v) => !v)}>Find</button>
          </div>
          {library.length ? (
            <div className="mt-1 flex gap-1 overflow-x-auto text-[11px]">
              {library.map((row) => (
                <button key={row.id} type="button" className={cn("h-6 shrink-0 rounded-sm px-2", row.id === openId ? "bg-surface-2 text-fg" : "text-muted")} onClick={() => { setOpenId(row.id); setDraft(row.source); setPast([]); setFuture([]); }}>
                  {row.name}{applied.includes(row.id) ? " · on chart" : ""}
                </button>
              ))}
            </div>
          ) : <p className="mt-1 text-[11px] text-subtle">No saved scripts yet. Save keeps the code on this device.</p>}
          {finding ? (
            <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
              <input aria-label="Find" value={find} onChange={(e) => setFind(e.target.value)} className="h-7 w-28 rounded-sm bg-surface px-2" placeholder="Find" />
              <input aria-label="Replace" value={replace} onChange={(e) => setReplace(e.target.value)} className="h-7 w-28 rounded-sm bg-surface px-2" placeholder="Replace" />
              <button type="button" className="h-7 px-2" onClick={() => { if (!find) return; const at = draft.indexOf(find, (area.current?.selectionStart || 0) + 1); const hit = at >= 0 ? at : draft.indexOf(find); if (hit >= 0) { area.current?.focus(); area.current?.setSelectionRange(hit, hit + find.length); } }}>Next</button>
              <button type="button" className="h-7 px-2" onClick={() => { if (!find) return; edit(draft.replace(find, replace)); }}>Replace</button>
            </div>
          ) : null}
          <div className="mt-1 grid max-h-56 grid-cols-[2.25rem_1fr] overflow-auto rounded-sm bg-bg font-mono text-[11px] leading-5">
            <pre className="select-none py-1 text-right text-subtle">{lines.map((_, i) => String(i + 1)).join("\n")}</pre>
            <div className="relative min-w-0">
              <pre className="pointer-events-none whitespace-pre py-1 pr-2">
                {(() => {
                  let offset = 0;
                  return lines.map((line, index) => {
                    const start = offset;
                    offset += line.length + 1;
                    let at = start;
                    const parts = highlightPine(line);
                    return (
                      <div key={index}>
                        {parts.map((part, i) => {
                          const body = part.text.split("").map((ch, j) => (
                            marked.has(at + j) ? <span key={j} className="underline decoration-2 decoration-accent">{ch}</span> : <span key={j}>{ch}</span>
                          ));
                          at += part.text.length;
                          return (
                            <span key={i} className={cn(part.kind === "key" && "text-accent", part.kind === "fn" && "text-up", part.kind === "str" && "text-warn", part.kind === "num" && "text-fg", part.kind === "note" && "text-subtle")}>{body}</span>
                          );
                        })}
                        {line.length === 0 ? " " : ""}
                      </div>
                    );
                  });
                })()}
              </pre>
              <textarea
                ref={area}
                aria-label="Pine script"
                spellCheck={false}
                value={draft}
                onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
                onChange={(e) => {
                  edit(e.target.value);
                  setCaret(e.target.selectionStart);
                  const upto = e.target.value.slice(0, e.target.selectionStart);
                  const stem = upto.match(/([A-Za-z_][\w.]*)$/)?.[1] || "";
                  setHints(stem.length >= 2 ? HINTS.filter((hint) => hint.startsWith(stem) && hint !== stem).slice(0, 6) : []);
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); persist(script?.name || "Script", draft); }
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); if (compiled.ok) { const id = persist(script?.name || "Script", draft); setApplied((ids) => ids.includes(id) ? ids : [...ids, id].slice(0, 8)); } }
                  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") { e.preventDefault(); setFinding(true); }
                  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
                    e.preventDefault();
                    if (e.shiftKey) {
                      const next = future[0];
                      if (next == null) return;
                      setFuture((rows) => rows.slice(1));
                      setPast((rows) => [...rows, draft]);
                      writeDraft(next);
                    } else {
                      const prev = past[past.length - 1];
                      if (prev == null) return;
                      setPast((rows) => rows.slice(0, -1));
                      setFuture((rows) => [draft, ...rows]);
                      writeDraft(prev);
                    }
                  }
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const el = e.currentTarget;
                    const at = el.selectionStart;
                    const next = draft.slice(0, at) + "  " + draft.slice(el.selectionEnd);
                    edit(next);
                    setCaret(at + 2);
                  }
                }}
                className="absolute inset-0 resize-none bg-transparent py-1 pr-2 text-transparent caret-fg outline-none"
              />
              {bracket != null ? <span className="sr-only">Matching bracket at position {bracket + 1}</span> : null}
            </div>
          </div>
          {hints.length ? (
            <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
              {hints.map((hint) => (
                <button key={hint} type="button" className="h-6 rounded-sm bg-surface px-2 text-muted" onClick={() => insertHint(hint.slice((draft.slice(0, area.current?.selectionStart || 0).match(/([A-Za-z_][\w.]*)$/)?.[1] || "").length))}>{hint}</button>
              ))}
            </div>
          ) : null}
          <p className={cn("mt-1 text-[11px]", status ? "text-down" : "text-subtle")}>
            {status ? `Line ${status.line}: ${status.message}` : compiled.ok ? `${compiled.title} can run. ${version ? `Version ${version}.` : "No version line, so this uses the v5/v6 subset."} Overlay plots are drawn on the price chart. A plot that is not an overlay is not drawn on the price scale. Points at or below zero are skipped by the price line.` : ""}
          </p>
          {runNote ? <p className="mt-1 text-[11px] text-down">{runNote}</p> : null}
          {aside.length ? <p className="mt-1 text-[11px] text-subtle">Off the price scale: {aside.map((row) => `${row.title} last ${row.last}`).join(" · ")}.</p> : null}
          {declared.length ? (
            <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
              {declared.map((input) => (
                <label key={input.id} className="flex items-center gap-1 text-muted">
                  {input.title}
                  <input
                    aria-label={input.title}
                    value={String((script && inputs[script.id]?.[input.id]) ?? input.def)}
                    onChange={(e) => {
                      const id = script?.id || persist(compiled.ok ? compiled.title || "Script" : "Script", draft);
                      const value = input.kind === "bool" ? e.target.value === "true" : Number(e.target.value);
                      setInputs((cur) => ({ ...cur, [id]: { ...cur[id], [input.id]: value } }));
                    }}
                    className="h-6 w-16 rounded-sm bg-surface px-1 text-fg"
                  />
                </label>
              ))}
            </div>
          ) : null}
          <details className="mt-1 text-[11px] text-subtle">
            <summary className="cursor-pointer">What this editor can run</summary>
            <p className="mt-1">Supported: {PINE_SUPPORTED.join(", ")}.</p>
            <p className="mt-1">Not supported, and rejected instead of approximated: {PINE_UNSUPPORTED.join(", ")}.</p>
            <p className="mt-1">This is not full Pine v5 or v6. A script that compiles here has not been compared with TradingView unless that comparison was actually run.</p>
          </details>
        </div>
      ) : null}
    </div>
  );
}
