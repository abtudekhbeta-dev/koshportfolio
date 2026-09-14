import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBookCtx } from "@/components/book-context";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { NavChart } from "@/components/charts/nav-chart";
import { fmtInr, fmtPct, pickMaterialLevers, buildMixPath } from "@/lib/kosh/engine";
import { bookXirr } from "@/lib/kosh/xirr";
import { ShareRing, MiniBars } from "@/components/charts/share-ring";
import { SkillMarkdown } from "@/components/analysis-view";
import { METRICS } from "@/lib/kosh/metrics";
import { skillOf, skillPass, skillPeek } from "@/lib/kosh/screens";
import { startImprove, isImproveLooping } from "@/lib/kosh/improve-run";
import { sameBusinessPiles } from "@/lib/kosh/peers";
import { apiHistories } from "@/lib/kosh/api";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Holding, RiskLever } from "@/lib/kosh/types";
import { StockLink } from "@/components/stock-link";

export const Route = createFileRoute("/p/$id/improve")({ component: Improve });

const MONTH_MS = 35 * 24 * 60 * 60 * 1000;

function fmtWhen(at: number) {
  return new Date(at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Improve() {
  const { query, portfolio } = useBookCtx();
  const book = query.data!;
  const reads = useKosh((s) => s.skillReads);
  const stored = useKosh((s) => s.bookNotes[portfolio.id]);
  const run = useKosh((s) => s.improveRun);
  const mine = run?.portfolioId === portfolio.id ? run : null;
  const rows = book.rows.filter((r) => book.includeCommodities || r.kind !== "commodity");
  const x = useMemo(
    () =>
      bookXirr(
        rows.map((r) => {
          const h = portfolio.holdings.find((z) => z.symbol === r.symbol);
          return {
            date: h?.date || null,
            boughtAt: h?.boughtAt || null,
            qty: r.qty,
            avg: r.avg,
            px: r.px,
            value: r.value,
            lots: h?.lots,
          };
        }),
        true,
      ),
    [rows, portfolio.holdings],
  );

  const top = [...rows].sort((a, b) => b.weight - a.weight);
  const heavy = top.filter((r) => r.weight >= 0.18);
  const targets = top.filter((r) => r.kind !== "commodity").slice(0, 20);
  const sectorHits = Object.entries(book.sectors)
    .map(([k, v]) => ({ k, w: v.value / (book.value || 1) }))
    .filter((s) => s.w >= 0.35)
    .sort((a, b) => b.w - a.w);

  const passOf = (symbol: string) => skillPass(skillOf(reads, symbol));
  const strongHeavy = heavy.filter((r) => passOf(r.symbol).both);
  const weakHeavy = heavy.filter((r) => {
    const s = skillOf(reads, r.symbol);
    return s ? !skillPass(s).both : false;
  });
  const unreadHeavy = heavy.filter((r) => r.kind !== "commodity" && !skillOf(reads, r.symbol));
  const weakSkills = top.slice(0, 12).flatMap((r) => {
    const s = skillOf(reads, r.symbol);
    if (!s) return [];
    if (skillPass(s).both) return [];
    return [{ symbol: r.symbol, name: r.name, why: s.fundVerdict || s.qualVerdict || s.fundTag }];
  });
  const missingSkills = targets.filter((r) => !skillOf(reads, r.symbol));
  const readCount = targets.filter((r) => skillOf(reads, r.symbol)).length;
  const strongWeight = targets.filter((r) => passOf(r.symbol).both).reduce((s, r) => s + r.weight, 0);
  const weakWeight = targets
    .filter((r) => {
      const s = skillOf(reads, r.symbol);
      return s && !skillPass(s).both;
    })
    .reduce((s, r) => s + r.weight, 0);

  const niftyOverlap = top.filter((r) => r.weight < 0.04).length >= Math.max(6, Math.round(top.length * 0.6));
  const themes = new Map<string, typeof top>();
  for (const r of top) {
    const k = r.sector || "Other";
    const cur = themes.get(k) || [];
    cur.push(r);
    themes.set(k, cur);
  }
  const overlapTheme = [...themes.entries()].find(([, list]) => list.length >= 3 && list.reduce((s, x) => s + x.weight, 0) >= 0.28);

  const material = pickMaterialLevers(book.levers || [], 5);
  const piles = useMemo(() => sameBusinessPiles(top, book.corr), [top, book.corr]);

  const bullets: { tone: "up" | "down" | "muted"; t: string }[] = [];
  if (strongHeavy.length)
    bullets.push({
      tone: "up",
      t: `${strongHeavy.map((h) => `${h.name} (${(h.weight * 100).toFixed(0)}%)`).join(", ")} — both skills pass. Size here is the bet, not a defect.`,
    });
  if (weakHeavy.length)
    bullets.push({
      tone: "down",
      t: `${weakHeavy.map((h) => `${h.name} (${(h.weight * 100).toFixed(0)}%)`).join(", ")} — large, and the skills do not back them.`,
    });
  if (unreadHeavy.length)
    bullets.push({
      tone: "muted",
      t: `${unreadHeavy.map((h) => `${h.name} (${(h.weight * 100).toFixed(0)}%)`).join(", ")} — no skill read yet.`,
    });
  if (!heavy.length)
    bullets.push({ tone: "up", t: "No single name is above 18%. Size is spread." });
  if (sectorHits.length) {
    const hit = sectorHits[0];
    const names = (themes.get(hit.k) || []).slice(0, 6);
    const qualityCluster = names.length > 0 && names.filter((r) => passOf(r.symbol).both).length >= Math.ceil(names.length * 0.6);
    bullets.push({
      tone: qualityCluster ? "up" : names.some((r) => skillOf(reads, r.symbol) && !passOf(r.symbol).both) ? "down" : "muted",
      t: qualityCluster
        ? `${hit.k} is ${(hit.w * 100).toFixed(0)}% — a cluster of names both skills back, not a random pile.`
        : `${hit.k} is ${(hit.w * 100).toFixed(0)}% of value${names.some((r) => skillOf(reads, r.symbol) && !passOf(r.symbol).both) ? " and some of those names fail the skills." : "."}`,
    });
  }
  if (overlapTheme && !sectorHits.some((s) => s.k === overlapTheme[0])) {
    const list = overlapTheme[1];
    const qualityCluster = list.filter((r) => passOf(r.symbol).both).length >= Math.ceil(list.length * 0.6);
    bullets.push({
      tone: qualityCluster ? "up" : "down",
      t: qualityCluster
        ? `${overlapTheme[0]} has ${list.length} names doing similar work — and they pass. That is a theme, not an accident.`
        : `${overlapTheme[0]} has ${list.length} names doing similar work. One shock hits all of them.`,
    });
  }
  if (piles.length)
    bullets.push({
      tone: "muted",
      t: piles
        .map((p) => `${p.line}: ${p.names.map((n) => n.symbol).join(", ")} (min corr ${(p.minCorr * 100).toFixed(0)}%)`)
        .join(" · ") + " — same business, moving together. Not a skill call.",
    });
  if (niftyOverlap)
    bullets.push({
      tone: "muted",
      t: "Many small weights — this can look like the index with extra cost. The large names are the actual bet.",
    });
  if (x.xirr != null)
    bullets.push({
      tone: x.xirr >= 12 ? "up" : "muted",
      t: `Your XIRR ${x.xirr.toFixed(1)}% from ${x.from || "first buy"} — money-weighted, not the mix chart.`,
    });
  else if (x.nMissing)
    bullets.push({
      tone: "muted",
      t: `${x.nMissing} lines have no buy date — XIRR is waiting on dates.`,
    });
  if (weakSkills.length && !weakHeavy.length)
    bullets.push({
      tone: "down",
      t: `Skills do not back: ${weakSkills.map((w) => w.symbol).join(", ")}.`,
    });
  if (missingSkills.length > unreadHeavy.length)
    bullets.push({
      tone: "muted",
      t: `${missingSkills.length} names have no stock-page read yet. Run analysis — leftover names scan in the background.`,
    });

  const rec =
    !stored && !readCount
      ? "Run analysis for a verdict on this portfolio as a whole — not a loop of stock essays."
      : weakHeavy.length
        ? `Size is sitting on names the skills do not back (${weakHeavy.map((h) => h.symbol).join(", ")}). Cut or wait — don’t add more of the same.`
        : strongWeight >= 0.45 && weakWeight < 0.12
          ? strongHeavy.length
            ? `${strongHeavy[0].name} and the other large lines are names both skills back. Concentration here is the opportunity, not a defect.`
            : "The portfolio is quality-led. Keep feeding the names that already pass both skills."
          : weakWeight >= 0.18
            ? `Capital is sitting in names the skills do not back. Size those down before adding anything new.`
            : missingSkills.length && stored
              ? "Verdict is saved. Remaining names are scanning in the background."
              : missingSkills.length
                ? "Some weights still have no skill read. Run analysis — the first pass is the whole portfolio."
                : material.length
                  ? `The structure is workable. Size follows quality — the material lever is ${material[0].label.toLowerCase()} ${material[0].name}.`
                  : "The structure is workable. Size follows quality: add to names that pass both skills, don’t trim a compounder just because it is large. Not advice.";

  const [runErr, setRunErr] = useState("");
  const busy = Boolean(mine) && isImproveLooping(portfolio.id);
  const scanning = mine?.stage === "scan";
  const stale = Boolean(stored && Date.now() - stored.at > MONTH_MS);

  async function onRun() {
    setRunErr("");
    const r = await startImprove({
      portfolioId: portfolio.id,
      name: portfolio.name,
      bench: book.benchName,
      force: Boolean(stored),
      targets: targets.map((t) => ({
        symbol: t.symbol,
        name: t.name,
        weight: t.weight,
        sector: t.sector || "Other",
      })),
    });
    if (!r.ok) setRunErr(r.error);
  }

  const sectorList = Object.entries(book.sectors)
    .map(([name, s]) => ({ name, pct: book.value ? (s.value / book.value) * 100 : 0 }))
    .sort((a, b) => b.pct - a.pct);

  const scanTotal = mine?.total || 0;
  const scanDone = mine?.done || 0;
  const pctDone = scanTotal ? Math.round((scanDone / scanTotal) * 100) : mine?.stage === "verdict" ? 8 : 0;

  return (
    <div className="kosh-page grid gap-6">
      <article className="rounded-xl border-l-[4px] border-l-chart bg-surface p-5 shadow-[var(--shadow-border)]">
        <div className="text-[11px] font-semibold tracking-[0.14em] text-chart uppercase">Recommendation</div>
        <h2 className="mt-2 text-[22px] font-semibold tracking-tight">{rec}</h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
          From this portfolio’s weights, dated XIRR, same-business pile-up, and the skills as one input — not the only
          one. Size on a name both skills back is an opportunity. Not a buy list.
        </p>
        <ul className="mt-4 grid gap-2">
          {bullets.map((b) => (
            <li key={b.t} className="flex gap-2 text-[14px] leading-snug">
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  b.tone === "up" && "bg-up",
                  b.tone === "down" && "bg-down",
                  b.tone === "muted" && "bg-subtle",
                )}
              />
              <span>{b.t}</span>
            </li>
          ))}
        </ul>
      </article>

      <MixReplay
        holdings={portfolio.holdings}
        levers={material}
        benchSymbol={book.benchSymbol}
        benchName={book.benchName}
      />

      <section className="grid gap-3 lg:grid-cols-3">
        {x.xirr != null ? (
          <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Your XIRR</div>
            <div className="mt-1 font-mono text-[22px] tabular">{x.xirr.toFixed(1)}%</div>
            <p className="mt-1 text-[12px] text-muted">
              {x.nDated} dated lines · from {x.from}
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Your XIRR</div>
            <p className="mt-2 text-[13px] text-muted">
              Add buy dates to unlock this.{" "}
              <Link to="/p/$id/holdings" params={{ id: portfolio.id }} className="text-chart hover:underline">
                Holdings
              </Link>
            </p>
          </div>
        )}
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Largest name</div>
          <div className="mt-1 text-[18px] font-semibold">{top[0]?.name || "—"}</div>
          <p className="mt-1 font-mono text-[12px] text-muted">
            {top[0] ? fmtPct(top[0].weight * 100) : ""}
            {top[0] && skillOf(reads, top[0].symbol)
              ? ` · ${skillOf(reads, top[0].symbol)!.fundTag} / ${skillOf(reads, top[0].symbol)!.qualTag}`
              : ""}
          </p>
        </div>
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Portfolio</div>
          <div className="mt-1 font-mono text-[22px] tabular">{fmtInr(book.value)}</div>
          <p className="mt-1 text-[12px] text-muted">
            {rows.length} lines vs {book.benchName}
            {targets.length ? ` · ${readCount}/${targets.length} skill reads` : ""}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h3 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Sectors</h3>
          <div className="mt-3">
            <ShareRing items={sectorList} />
          </div>
        </div>
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h3 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Largest weights</h3>
          <div className="mt-3">
            <MiniBars
              items={top.slice(0, 6).map((r) => ({
                name: r.name,
                sub: r.symbol,
                symbol: r.symbol,
                value: r.weight * 100,
                label: (r.weight * 100).toFixed(1) + "%",
                tone: passOf(r.symbol).both ? "up" : r.weight >= 0.18 && skillOf(reads, r.symbol) ? "down" : "muted",
              }))}
            />
          </div>
        </div>
      </section>

      {piles.length ? (
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h3 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Same-business pile-up</h3>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            Same line of business and they moved together at least 50% over the last year. Skills do not decide this —
            it is a structure fact. A quality cluster is not automatically a cut.
          </p>
          <ul className="mt-3 grid gap-3">
            {piles.map((p) => (
              <li key={p.line + p.names.map((n) => n.symbol).join(",")}>
                <div className="text-[12px] font-semibold tracking-[0.06em] text-subtle uppercase">
                  {p.line} · min corr {(p.minCorr * 100).toFixed(0)}%
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                  {p.names.map((n) => (
                    <span key={n.symbol} className="inline-flex items-baseline gap-1.5">
                      <StockLink symbol={n.symbol} name={n.name} className="font-medium" />
                      <span className="font-mono tabular text-muted">{(n.weight * 100).toFixed(1)}%</span>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Portfolio analysis</h3>
            <p className="mt-1 max-w-xl text-[13px] text-muted">
              One pass on the whole portfolio. Both skills run on each name, then one verdict. Names already read on a
              stock page are reused. Keep this tab open. Prefer once a month.
            </p>
            {stored ? (
              <p className={cn("mt-1 text-[12px]", stale ? "text-warn" : "text-subtle")}>
                Last run {fmtWhen(stored.at)}
                {stale ? " — a monthly refresh is due." : ". Prefer once a month."}
                {` · ${stored.nRead}/${stored.nTotal} names with both skills.`}
              </p>
            ) : (
              <p className="mt-1 text-[12px] text-subtle">Prefer once a month. The verdict is stored so you don’t rerun it.</p>
            )}
          </div>
          <Button size="sm" disabled={busy || !targets.length} onClick={() => void onRun()}>
            {mine?.stage === "verdict"
              ? "Writing verdict…"
              : scanning
                ? "Scanning both skills…"
                : stored
                  ? "Refresh analysis"
                  : "Run analysis on the portfolio"}
          </Button>
        </div>
        {mine ? (
          <div className="mb-3 rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13px]">
              <span>
                {mine.stage === "verdict"
                  ? "Writing verdict…"
                  : `${mine.name} — both skills`}
                {scanning ? <span className="text-muted"> · you can leave this page</span> : null}
              </span>
              {scanning || mine.stage === "refresh" ? (
                <span className="font-mono tabular text-muted">
                  {scanDone} / {scanTotal}
                </span>
              ) : null}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full bg-chart transition-[width] duration-300" style={{ width: `${Math.min(100, pctDone)}%` }} />
            </div>
          </div>
        ) : null}
        {runErr || mine?.error ? <p className="mb-2 text-[13px] text-down">{runErr || mine?.error}</p> : null}

        <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[32rem] text-left text-[13px]">
            <thead className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">
              <tr className="border-b border-border">
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Weight</th>
                <th className="px-3 py-2 font-semibold">Fundamental</th>
                <th className="px-3 py-2 font-semibold">Qualitative</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((r) => {
                const s = skillPeek(reads, r.symbol);
                const running = Boolean(mine && mine.stage === "scan" && mine.name === r.name);
                const fundTone = s?.fundTag ? (s.fundRating === "pass" ? "text-up" : "text-down") : "text-muted";
                const qualTone = s?.qualTag ? (s.qualPotential === "yes" ? "text-up" : "text-down") : "text-muted";
                return (
                  <tr key={r.symbol} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2">
                      <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="font-medium hover:text-chart">
                        {r.name}
                      </Link>
                      <div className="text-[11px] text-subtle">{r.symbol}</div>
                    </td>
                    <td className="px-3 py-2 font-mono tabular">{(r.weight * 100).toFixed(1)}%</td>
                    <td className={cn("px-3 py-2", fundTone)}>
                      {s?.fundTag || (running ? "Scanning…" : "Not run")}
                    </td>
                    <td className={cn("px-3 py-2", qualTone)}>
                      {s?.qualTag || (running ? "Scanning…" : "Not run")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {stored?.text ? (
          <article className="mt-4 rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]">
            <SkillMarkdown text={stored.text} color />
          </article>
        ) : null}
      </section>

      <section>
        <h3 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Moves that change the scores</h3>
        <p className="mt-1 mb-3 max-w-2xl text-[13px] text-muted">
          Same 1-year path as Risk. One action per name, improving moves first. Green = the score improves, red = it
          worsens. These are historical scores — future returns and metrics can differ.
        </p>
        {material.length ? (
          <ul className="grid gap-2">
            {material.map((l) => (
              <LeverCard key={l.symbol + l.action} l={l} />
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-muted">No single name moves the scores enough to list. That is a good sign.</p>
        )}
      </section>
    </div>
  );
}

function LeverCard({ l }: { l: RiskLever }) {
  return (
    <li className="grid gap-3 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)] sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center">
      <div className="min-w-0">
        <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{l.label}</div>
        <div className="mt-0.5 truncate font-medium">
          <Link to="/s/$symbol" params={{ symbol: l.symbol }} className="hover:text-chart">
            {l.name}
          </Link>
        </div>
        <div className="font-mono text-[12px] text-muted tabular">{(l.weight * 100).toFixed(1)}%</div>
      </div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        <Delta metricId="sharpe" n={l.dSharpe} digits={2} better={1} />
        <Delta metricId="maxDd" n={l.dMaxDd} digits={1} better={1} suffix="pp" />
        <Delta metricId="vol" n={l.dVol} digits={1} better={-1} suffix="pp" />
        <Delta metricId="cagr" n={l.dCagr} digits={1} better={1} suffix="pp" />
      </div>
    </li>
  );
}

function Delta({
  metricId,
  n,
  digits,
  better,
  suffix,
}: {
  metricId: "sharpe" | "maxDd" | "vol" | "cagr";
  n: number | null | undefined;
  digits: number;
  better: 1 | -1;
  suffix?: string;
}) {
  const m = METRICS[metricId];
  if (n == null || !Number.isFinite(n)) return <div />;
  const good = better === 1 ? n > 0.005 : n < -0.005;
  const bad = better === 1 ? n < -0.005 : n > 0.005;
  return (
    <Tooltip
      content={
        <div className="max-w-xs p-0.5">
          <div className="font-medium">{m.label}</div>
          <p className="mt-1 text-[12px] leading-snug text-muted">{m.hover}</p>
          <p className="mt-1 text-[12px] leading-snug text-muted">{m.short}</p>
        </div>
      }
    >
      <button
        type="button"
        className={cn(
          "w-full rounded-sm px-1 py-1.5 text-center",
          good && "bg-up/15 text-up",
          bad && "bg-down/15 text-down",
          !good && !bad && "text-muted",
        )}
      >
        <div className="text-[10px] tracking-[0.06em] text-subtle uppercase">{m.label}</div>
        <div className="mt-0.5 font-mono text-[13px] tabular">
          {n >= 0 ? "+" : ""}
          {n.toFixed(digits)}
          {suffix ? suffix : ""}
        </div>
      </button>
    </Tooltip>
  );
}

function leverQty(h: Holding, levers: RiskLever[]) {
  const lev = levers.find(
    (l) => l.symbol.toUpperCase().replace(/\.(NS|BO)$/i, "") === h.symbol.toUpperCase().replace(/\.(NS|BO)$/i, ""),
  );
  if (!lev) return h.qty;
  if (lev.action === "cut") return h.qty * 0.5;
  if (lev.action === "trim") return h.qty * 0.75;
  if (lev.action === "add") return h.qty * 1.25;
  return h.qty;
}

function MixReplay({
  holdings,
  levers,
  benchSymbol,
  benchName,
}: {
  holdings: Holding[];
  levers: RiskLever[];
  benchSymbol: string;
  benchName: string;
}) {
  const eq = holdings.filter((h) => h.kind !== "commodity");
  const proposed = eq.map((h) => ({ ...h, qty: leverQty(h, levers) }));
  const changed = levers.length > 0;
  const hx = useQuery({
    queryKey: ["mix-replay", eq.map((h) => h.symbol).join(","), benchSymbol],
    queryFn: () => apiHistories([...eq.map((h) => h.symbol), benchSymbol], "max"),
    staleTime: 30 * 60 * 1000,
    enabled: eq.length > 0,
  });
  const pack = useMemo(() => {
    const rows = hx.data || [];
    const histories: Record<string, { t: number; c: number }[]> = {};
    let benchBars: { t: number; c: number }[] = [];
    for (const r of rows) {
      const bars = r.bars || [];
      const bare = String(r.input || r.symbol || "").replace(/\.(NS|BO)$/i, "");
      histories[bare] = bars;
      histories[r.input] = bars;
      histories[r.symbol] = bars;
      if (String(r.input).includes("NSEI") || String(r.symbol).includes("NSEI") || r.input === benchSymbol) benchBars = bars;
    }
    const byHold = (list: Holding[]) => {
      const map: Record<string, { t: number; c: number }[]> = {};
      for (const h of list) map[h.symbol] = histories[h.symbol] || histories[h.symbol.replace(/\.(NS|BO)$/i, "")] || [];
      return map;
    };
    const current = buildMixPath(eq, byHold(eq), benchBars);
    const alt = changed ? buildMixPath(proposed, byHold(proposed), benchBars) : null;
    return { current, alt };
  }, [hx.data, eq, proposed, changed, benchSymbol]);

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h3 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Historical mix replay</h3>
      <p className="mt-1 max-w-2xl text-[13px] text-muted">
        Today’s weights taken back through each name’s adjusted daily prices — the same method as Current holdings
        historical performance. If there are material levers, the second line is those size changes applied, then replayed.
        Not your XIRR. Not a reconstruction of old holdings.
      </p>
      {hx.isPending ? (
        <p className="mt-3 text-sm text-muted">Loading daily history for the replay…</p>
      ) : pack.current.nav.length ? (
        <div className="mt-3 grid gap-4">
          <NavChart
            nav={pack.current.nav}
            portLabel="Today’s mix"
            benchLabel={benchName}
            coverage={pack.current.coverage}
          />
          {pack.alt && pack.alt.nav.length ? (
            <div>
              <p className="mb-2 text-[12px] text-muted">
                After {levers.map((l) => `${l.action} ${l.symbol}`).join(", ")}.
              </p>
              <NavChart
                nav={pack.alt.nav}
                portLabel="After levers"
                benchLabel={benchName}
                coverage={pack.alt.coverage}
              />
            </div>
          ) : (
            <p className="text-[13px] text-muted">No material size levers to replay yet.</p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">Not enough overlapping daily history to replay.</p>
      )}
    </section>
  );
}
