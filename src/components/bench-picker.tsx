import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { apiSearch } from "@/lib/kosh/api";
import { BENCH, resolveBench } from "@/lib/kosh/benchmarks";
import { searchNse } from "@/lib/kosh/universe";
import { cn } from "@/lib/utils";

type Hit = { key: string; symbol: string; name: string; group: string };

const INDEX_HITS: Hit[] = Object.entries(BENCH).map(([key, v]) => ({
  key,
  symbol: v.symbol,
  name: v.name,
  group: "Indices",
}));

export function BenchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const current = resolveBench(value);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<{ symbol: string; name: string; exch: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.clearTimeout(timer.current);
    const v = q.trim();
    if (v.length < 1) {
      setRemote([]);
      return;
    }
    setBusy(true);
    timer.current = window.setTimeout(() => {
      void apiSearch(v)
        .then((rows) => setRemote(rows))
        .catch(() => setRemote([]))
        .finally(() => setBusy(false));
    }, 160);
  }, [q, open]);

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const idx = needle
      ? INDEX_HITS.filter(
          (h) =>
            h.name.toLowerCase().includes(needle) ||
            h.key.toLowerCase().includes(needle) ||
            h.symbol.toLowerCase().includes(needle),
        )
      : INDEX_HITS;
    const nse = needle ? searchNse(q, 8) : [];
    const nseHits: Hit[] = nse.map((x) => ({ key: x.symbol, symbol: x.symbol, name: x.name, group: "NSE" }));
    const seen = new Set([...idx, ...nseHits].map((h) => h.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase()));
    const rest: Hit[] = remote
      .filter((r) => {
        const bare = r.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
        if (seen.has(bare)) return false;
        seen.add(bare);
        return true;
      })
      .map((r) => ({
        key: r.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase(),
        symbol: r.symbol,
        name: r.name,
        group: /index|\^/i.test(r.exch + r.symbol) ? "Indices" : r.exch || "NSE & BSE",
      }));
    return [...idx, ...nseHits, ...rest].slice(0, 16);
  }, [q, remote]);

  function pick(h: Hit) {
    onChange(h.key);
    setOpen(false);
    setQ("");
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 min-w-[160px] max-w-[220px] items-center gap-2 rounded-sm bg-bg-elevated px-2.5 text-left text-[13px] text-fg shadow-[var(--shadow-border)]"
        aria-label="Benchmark"
      >
        <Search className="size-3.5 shrink-0 text-subtle" />
        <span className="min-w-0 flex-1 truncate">{current.name}</span>
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-1 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-lg bg-bg-elevated shadow-[var(--shadow-border)]">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nifty, Sensex, TCS, a BSE name…"
            className="h-10 w-full border-b border-border bg-transparent px-3 text-[13px] outline-none placeholder:text-subtle"
          />
          <ul className="max-h-64 overflow-y-auto p-1">
            {busy ? <li className="px-2.5 py-2 text-[12px] text-subtle">Looking up…</li> : null}
            {hits.map((h) => (
              <li key={h.group + h.key}>
                <button
                  type="button"
                  onClick={() => pick(h)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-left text-[13px] hover:bg-surface",
                    (value === h.key || current.symbol === h.symbol) && "bg-surface",
                  )}
                >
                  <span className="font-medium">{h.name}</span>
                  <span className="ml-3 truncate text-[11px] text-subtle">{h.group}</span>
                </button>
              </li>
            ))}
            {q.trim() && !hits.length && !busy ? (
              <li className="px-2.5 py-3 text-[13px] text-muted">No hits. Try Nifty, Bank Nifty, or a ticker.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
