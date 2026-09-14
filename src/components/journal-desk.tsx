import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fmtPx } from "@/lib/kosh/engine";
import { useKosh } from "@/lib/store";

export function JournalDesk({ symbol, price = 0 }: { symbol?: string; price?: number }) {
  const journal = useKosh((s) => s.journal);
  const add = useKosh((s) => s.addJournal);
  const remove = useKosh((s) => s.removeJournal);
  const [note, setNote] = useState("");
  const [setup, setSetup] = useState("");
  const mine = symbol ? journal.filter((j) => j.symbol === symbol.toUpperCase().replace(/\.(NS|BO)$/i, "")) : journal;
  const bare = symbol ? symbol.toUpperCase().replace(/\.(NS|BO)$/i, "") : "";

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Notes</h2>
      <p className="mt-1 text-[13px] text-muted">Your thesis on this name, in this browser. Not sent anywhere.</p>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[140px_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          const sym = bare || setup.toUpperCase().replace(/\.(NS|BO)$/i, "");
          if (!sym || !note.trim()) return;
          add({ symbol: sym, note: note.trim(), setup: setup.trim() || "Note", price });
          setNote("");
          if (!symbol) setSetup("");
        }}
      >
        {symbol ? (
          <input
            className="h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)] outline-none"
            placeholder="Setup"
            value={setup}
            onChange={(e) => setSetup(e.target.value)}
          />
        ) : (
          <input
            className="h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)] outline-none"
            placeholder="Symbol"
            value={setup}
            onChange={(e) => setSetup(e.target.value)}
          />
        )}
        <input
          className="h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)] outline-none"
          placeholder="What you see"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary">
          Save
        </Button>
      </form>
      {mine.length ? (
        <ul className="mt-3 grid gap-2">
          {mine.slice(0, 12).map((j) => (
            <li key={j.id} className="flex items-start justify-between gap-3 text-[13px]">
              <div className="min-w-0">
                <div className="text-[12px] text-muted">
                  <Link to="/s/$symbol" params={{ symbol: j.symbol }} className="hover:text-chart">
                    {j.symbol}
                  </Link>
                  {j.setup ? ` · ${j.setup}` : ""}
                  {j.price ? ` · ${fmtPx(j.price)}` : ""}
                  <span className="text-subtle"> · {new Date(j.at).toLocaleDateString("en-IN")}</span>
                </div>
                <p className="mt-0.5 leading-snug">{j.note}</p>
              </div>
              <button type="button" className="shrink-0 text-[12px] text-muted hover:text-fg" onClick={() => remove(j.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[13px] text-muted">Empty.</p>
      )}
    </section>
  );
}
