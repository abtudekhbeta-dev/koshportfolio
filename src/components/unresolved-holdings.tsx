import { useEffect, useMemo, useState } from "react";
import { apiSearch } from "@/lib/kosh/api";
import { displayName } from "@/lib/kosh/names";
import { useKosh } from "@/lib/store";
import { Button } from "@/components/ui/button";
import type { Holding } from "@/lib/kosh/types";

type Pick = { symbol: string; name: string };

export function UnresolvedHoldings({
  portfolioId,
  missing,
  holdings,
}: {
  portfolioId: string;
  missing: string[];
  holdings: Holding[];
}) {
  const updateHolding = useKosh((s) => s.updateHolding);
  const [picks, setPicks] = useState<Record<string, Pick[]>>({});
  const [skip, setSkip] = useState<Record<string, boolean>>({});

  const names = useMemo(() => {
    const map = new Map(holdings.map((h) => [h.symbol, h]));
    return missing.filter((s) => {
      const h = map.get(s);
      return h?.kind !== "commodity" && !skip[s];
    });
  }, [missing, holdings, skip]);

  useEffect(() => {
    let on = true;
    (async () => {
      const next: Record<string, Pick[]> = {};
      for (const s of names) {
        const h = holdings.find((x) => x.symbol === s);
        const stem = s.replace(/[-_]SM$/i, "");
        const queries = [...new Set([stem, s, h?.name || ""].filter((q) => q && q.length >= 2))];
        const seen = new Set<string>();
        const rows: Pick[] = [];
        for (const q of queries) {
          try {
            const quotes = await apiSearch(q);
            for (const x of quotes) {
              const sym = String(x.symbol || "")
                .toUpperCase()
                .replace(/\.(NS|BO)$/i, "");
              if (!sym || seen.has(sym)) continue;
              seen.add(sym);
              rows.push({ symbol: sym, name: x.name || sym });
              if (rows.length >= 5) break;
            }
          } catch {
            /* next query */
          }
          if (rows.length >= 5) break;
        }
        next[s] = rows;
      }
      if (on) setPicks((cur) => ({ ...cur, ...next }));
    })();
    return () => {
      on = false;
    };
  }, [names.join("|"), holdings]);

  if (!names.length) return null;

  return (
    <section className="mb-5 rounded-lg border-l-[4px] border-l-warn bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-warn uppercase">Couldn’t match these names</div>
      <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
        They load when you open them alone, but the portfolio used a different ticker. Pick the listed name so they are
        included in performance, or skip.
      </p>
      <ul className="mt-3 grid gap-3">
        {names.map((s) => {
          const h = holdings.find((x) => x.symbol === s);
          const label = h ? displayName(h) : s;
          return (
            <li key={s} className="rounded-sm bg-bg px-3 py-2.5">
              <div className="font-medium">
                {label} <span className="font-mono text-[12px] text-muted">{s}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(picks[s] || []).map((p) => (
                  <Button
                    key={p.symbol}
                    size="sm"
                    variant="secondary"
                    onClick={() => updateHolding(portfolioId, s, { symbol: p.symbol, name: p.name || h?.name })}
                  >
                    Use {p.symbol}
                    {p.name && p.name !== p.symbol ? ` — ${p.name}` : ""}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => setSkip((x) => ({ ...x, [s]: true }))}>
                  Skip
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
