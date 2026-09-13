import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useKosh } from "@/lib/store";

const COPY = {
  stock: {
    kicker: "Your portfolio versus Nifty",
    title: "One stock is a story. The portfolio is the score.",
    body: "Most people read a stock and never check whether the whole holding is beating the index. Thirty seconds.",
  },
  markets: {
    kicker: "Have a portfolio?",
    title: "Winners today. Did your holdings beat Nifty?",
    body: "Green names feel like winning. The index is the default alternative. See the gap, don’t ignore it.",
  },
  landing: {
    kicker: "Already hold stocks?",
    title: "See your portfolio versus Nifty.",
    body: "Drop a broker file — or open the sample. One line against the index. Optional. Markets is the daily stop.",
  },
  app: {
    kicker: "Versus the index",
    title: "Pick a portfolio. Put it next to Nifty.",
    body: "Growth, drawdown, and a gap versus the index — that’s the read.",
  },
} as const;

export function MixNudge({ where = "landing" }: { where?: keyof typeof COPY }) {
  const ports = useKosh((s) => s.portfolios);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const filled = ports.filter((p) => p.holdings.length > 0);
  const c = COPY[where];

  function go(id: string) {
    setOpen(false);
    void navigate({ to: "/p/$id", params: { id } });
  }

  function onSee() {
    if (filled.length === 1) go(filled[0].id);
    else if (filled.length > 1) setOpen(true);
    else void navigate({ to: "/app" });
  }

  return (
    <aside className="rounded-lg border-l-[4px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-chart uppercase">{c.kicker}</div>
      <h3 className="mt-1.5 text-[18px] font-semibold tracking-tight">{c.title}</h3>
      <p className="mt-1.5 max-w-xl text-[13px] leading-snug text-muted">{c.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={onSee}>
          See vs Nifty
          <ArrowRight className="size-3.5" />
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link to="/compare">Compare</Link>
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Which portfolio?" className="max-w-sm">
          <div className="grid gap-1">
            {filled.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => go(p.id)}
                className="rounded-sm px-3 py-2 text-left text-[13px] hover:bg-surface-2"
              >
                {p.name}
                <span className="ml-2 text-[11px] text-subtle">{p.holdings.length} names</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
