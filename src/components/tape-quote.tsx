import { Link } from "@tanstack/react-router";
import { instrumentKind, terminalSearch } from "@/lib/kosh/instrument-nav";
import { fmtPct } from "@/lib/kosh/engine";
import type { TapeRow } from "@/lib/kosh/types";
import { canOpenStock } from "@/components/stock-link";
import { cn } from "@/lib/utils";

function fmtTape(n: number) {
  if (!(n > 0)) return "—";
  const digits = n >= 1000 ? 0 : 2;
  return n.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function tapeInner(t: TapeRow) {
  return (
    <>
      <span className="font-semibold tracking-[0.04em] text-fg">{t.label}</span>
      <b className="font-mono font-medium text-fg tabular">{t.price ? fmtTape(t.price) : "—"}</b>
      {t.unit ? <span className="text-[10px] text-subtle">{t.unit}</span> : null}
      <span className={cn("font-mono tabular", t.changePct >= 0 ? "text-up" : "text-down")}>
        {t.changePct ? fmtPct(t.changePct) : ""}
      </span>
    </>
  );
}

/** The moving strip. Indices open Terminal. Stocks open the stock page. Gold and silver stay prices. */
export function TapeQuote({ t }: { t: TapeRow }) {
  const kind = instrumentKind(t.symbol);
  const cls = "flex shrink-0 cursor-pointer items-baseline gap-2 whitespace-nowrap rounded-sm hover:text-chart focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart";
  if (kind === "index") {
    return (
      <Link
        to="/markets"
        search={terminalSearch(t.symbol, t.label)}
        aria-label={`Open ${t.label} in Terminal`}
        className={cls}
      >
        {tapeInner(t)}
      </Link>
    );
  }
  if (kind === "stock" && canOpenStock(t.symbol)) {
    const bare = t.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
    return (
      <Link to="/s/$symbol" params={{ symbol: bare }} aria-label={`Open ${t.label}`} className={cls}>
        {tapeInner(t)}
      </Link>
    );
  }
  return (
    <span className="flex shrink-0 items-baseline gap-2 whitespace-nowrap" aria-label={`${t.label} price`}>
      {tapeInner(t)}
    </span>
  );
}
