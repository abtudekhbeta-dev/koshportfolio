import { useState } from "react";
import { apiNote } from "@/lib/kosh/api";
import { Button } from "@/components/ui/button";
import { ProseNote } from "@/components/note-view";

export function AskAi({ symbol }: { symbol: string }) {
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    const question = q.trim();
    if (!question) return;
    setBusy(true);
    setErr("");
    try {
      const r = await apiNote({ kind: "ask", symbol, question });
      if (!r.ok) {
        setErr(r.error);
        setText("");
      } else setText(r.text);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not ask right now.");
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 max-w-2xl">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        <input
          aria-label="Ask AI"
          className="h-10 flex-1 rounded-sm bg-bg-elevated px-3 text-sm shadow-[var(--shadow-border)] outline-none"
          placeholder="Ask AI — e.g. why is volume heavy today?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={busy || !q.trim()}>
          {busy ? "Asking…" : "Ask AI"}
        </Button>
      </form>
      {err ? <p className="mt-2 text-[13px] text-down">{err}</p> : null}
      {text ? <ProseNote text={text} /> : null}
    </div>
  );
}
