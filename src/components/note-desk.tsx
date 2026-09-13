import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { apiNote, apiSkillPut, type NoteResult } from "@/lib/kosh/api";
import type { BookBrief, NoteKind } from "@/lib/kosh/ai-kinds";
import { asFund, asMix, asPulse, asQual, asQuality, asSpark, skillOutputReady } from "@/lib/kosh/note-shape";
import { MixView, ProseNote, PulseView, QualityView, SparkView } from "@/components/note-view";
import { AnalysisSkeleton, CombinedView, FundamentalView, QualitativeView } from "@/components/analysis-view";
import { Button } from "@/components/ui/button";
import { skillReadFrom } from "@/lib/kosh/screens";
import { sectorOf } from "@/lib/kosh/sectors";
import { universeName } from "@/lib/kosh/universe";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

function useDesk() {
  const [kind, setKind] = useState<NoteKind>("quality");
  const [q, setQ] = useState("");
  const [result, setResult] = useState<NoteResult | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(k: NoteKind, extra?: { symbol?: string; question?: string; book?: BookBrief }) {
    setKind(k);
    setBusy(true);
    setErr("");
    try {
      const r = await apiNote({ kind: k, ...extra, question: extra?.question ?? (k === "ask" ? q : undefined) });
      if (!r.ok) {
        setErr(r.error);
        setResult(null);
      } else setResult(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not run. Try again in a moment.");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return { kind, q, setQ, result, err, busy, run, setResult, setKind };
}

function NoteResultView({ result, kind }: { result: Extract<NoteResult, { ok: true }>; kind: NoteKind }) {
  const q = result.qualityBlock || asQuality(result.quality);
  const s = result.sparkBlock || asSpark(result.spark);
  const pulse = result.pulseBlock || (kind === "pulse" ? asPulse(result.text) : null);
  const mix = result.mixBlock || (kind === "book" ? asMix(result.text) : null);
  const fund = result.fundBlock || (kind === "fund" ? asFund(result.text) : null);
  const qual = result.qualBlock || (kind === "qual" ? asQual(result.text) : null);

  if (kind === "ask") return <ProseNote text={result.text} />;
  if (kind === "quality" && q) return <div className="mt-4"><QualityView block={q} /></div>;
  if (kind === "spark" && s) return <div className="mt-4"><SparkView block={s} /></div>;
  if (kind === "pulse" && pulse) return <PulseView block={pulse} />;
  if (kind === "book" && mix) return <MixView block={mix} />;
  if (kind === "fund" && fund) return <div className="mt-4"><FundamentalView block={fund} /></div>;
  if (kind === "qual" && qual) return <div className="mt-4"><QualitativeView block={qual} /></div>;
  if (q || s) {
    return (
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {q ? <QualityView block={q} /> : null}
        {s ? <SparkView block={s} /> : null}
      </div>
    );
  }
  return <ProseNote text={result.text} />;
}

export function NoteDesk({ symbol, compact }: { symbol: string; compact?: boolean }) {
  const [open, setOpen] = useState<"fund" | "qual" | null>(null);
  const [busy, setBusy] = useState<"fund" | "qual" | null>(null);
  const [err, setErr] = useState("");
  const [fundRes, setFundRes] = useState<NoteResult | null>(null);
  const [qualRes, setQualRes] = useState<NoteResult | null>(null);
  const [combineRes, setCombineRes] = useState<NoteResult | null>(null);
  const [combineBusy, setCombineBusy] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    setFundRes(null);
    setQualRes(null);
    setCombineRes(null);
    setCombineBusy(false);
    setOpen(null);
    setPinned(false);
    setErr("");
  }, [symbol]);

  useEffect(() => {
    if (compact) {
      setPinned(false);
      setOpen(null);
    }
  }, [compact]);

  async function runFull(kind: "fund" | "qual") {
    setOpen(kind);
    setBusy(kind);
    setErr("");
    if (!compact) setPinned(true);
    let lastErr = "The analysis did not finish. Retry.";
    try {
      for (let i = 0; i < 3; i++) {
        if (i) await new Promise((r) => setTimeout(r, 2800 * i));
        try {
          const r = await apiNote({ kind, symbol, fresh: i ? Date.now() : undefined });
          if (r.ok && skillOutputReady(kind, r.text)) {
            if (kind === "fund") setFundRes(r);
            else setQualRes(r);
            setCombineRes(null);
            setErr("");
            return;
          }
          lastErr = r.ok ? "The analysis did not finish. Retry." : r.error;
          if (/Too many reads|429/i.test(lastErr)) await new Promise((r) => setTimeout(r, 16000));
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "Could not run. Try again in a moment.";
          if (/Busy|Too many|429|took too long|Retry|Gateway|504/i.test(lastErr)) {
            await new Promise((r) => setTimeout(r, 4000 * (i + 1)));
          }
        }
      }
      if (kind === "fund") setFundRes(null);
      else setQualRes(null);
      setErr(lastErr);
    } finally {
      setBusy(null);
    }
  }

  function toggle(kind: "fund" | "qual") {
    if (!compact) setPinned(true);
    if (open === kind) setOpen(null);
    else if (kind === "fund" && fundRes && fundRes.ok && skillOutputReady("fund", fundRes.text)) setOpen("fund");
    else if (kind === "qual" && qualRes && qualRes.ok && skillOutputReady("qual", qualRes.text)) setOpen("qual");
    else void runFull(kind);
  }

  const fundBlock = fundRes && fundRes.ok ? fundRes.fundBlock || asFund(fundRes.text) : null;
  const qualBlock = qualRes && qualRes.ok ? qualRes.qualBlock || asQual(qualRes.text) : null;
  const setSkillRead = useKosh((s) => s.setSkillRead);

  useEffect(() => {
    if (!fundRes || !fundRes.ok || !qualRes || !qualRes.ok) return;
    if (!skillOutputReady("fund", fundRes.text) || !skillOutputReady("qual", qualRes.text)) return;
    const fb = fundRes.fundBlock || asFund(fundRes.text);
    const qb = qualRes.qualBlock || asQual(qualRes.text);
    if (!fb || !qb) return;
    const read = skillReadFrom({
      symbol,
      name: universeName(symbol),
      sector: sectorOf(symbol),
      fund: fb,
      qual: qb,
    });
    setSkillRead(read);
    void apiSkillPut(read).catch(() => {});
  }, [fundRes, qualRes, symbol, setSkillRead]);

  async function runCombine() {
    if (!fundRes || !fundRes.ok || !qualRes || !qualRes.ok) return;
    if (!skillOutputReady("fund", fundRes.text) || !skillOutputReady("qual", qualRes.text)) {
      setErr("Need both complete analyses before connecting them.");
      return;
    }
    setCombineBusy(true);
    setErr("");
    try {
      const r = await apiNote({
        kind: "combine",
        symbol,
        prior: { fund: fundRes.text, qual: qualRes.text },
      });
      setCombineRes(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not connect the two skills.");
    } finally {
      setCombineBusy(false);
    }
  }

  const collapsed = Boolean(compact) && !pinned;

  if (collapsed) {
    return (
      <section>
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
          <button
            type="button"
            onClick={() => toggle("fund")}
            className="inline-flex h-9 items-center rounded-sm bg-bg px-3 text-[13px] font-medium hover:text-chart"
          >
            Fundamental{fundBlock?.tag ? ` · ${fundBlock.tag}` : ""}
          </button>
          <button
            type="button"
            onClick={() => toggle("qual")}
            className="inline-flex h-9 items-center rounded-sm bg-bg px-3 text-[13px] font-medium hover:text-warn"
          >
            Qualitative{qualBlock?.tag ? ` · ${qualBlock.tag}` : ""}
          </button>
          <button type="button" className="ml-auto text-[12px] text-muted hover:text-fg" onClick={() => setPinned(true)}>
            Expand
          </button>
        </div>
        {err ? <p className="mt-2 text-[13px] text-down">{err}</p> : null}
        {busy && open ? (
          <div className="mt-3">
            <AnalysisSkeleton kicker={open === "fund" ? "fundamental analysis" : "qualitative analysis"} />
          </div>
        ) : null}
        {open === "fund" && fundBlock ? (
          <div className="mt-3">
            <FundamentalView block={fundBlock} />
          </div>
        ) : null}
        {open === "qual" && qualBlock ? (
          <div className="mt-3">
            <QualitativeView block={qualBlock} />
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-[12px] font-semibold tracking-[0.14em] text-chart uppercase">Read this name</h2>
        <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
          Same analysis as the full fundamental and qualitative read — full prose, native final verdict, multi-bagger potential.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => toggle("fund")}
          disabled={busy === "fund"}
          className={cn(
            "group rounded-lg border-l-[4px] border-l-chart bg-surface p-5 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]",
            open === "fund" && "ring-1 ring-chart/40",
          )}
        >
          <div className="text-[11px] font-semibold tracking-[0.14em] text-chart uppercase">Fundamental analysis</div>
          <h3 className="mt-2 text-[22px] font-semibold tracking-tight">Is the company sound?</h3>
          <p className="mt-1.5 max-w-md text-[13px] leading-snug text-muted">
            Profitability, balance sheet, growth, valuation, ownership. The full fundamental read.
          </p>
          <span className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-accent px-4 text-[13px] font-medium text-accent-fg group-hover:opacity-90">
            {busy === "fund" ? "Reading…" : open === "fund" ? "Hide" : "Read the business"}
            <ArrowRight className="size-3.5" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => toggle("qual")}
          disabled={busy === "qual"}
          className={cn(
            "group rounded-lg border-l-[4px] border-l-warn bg-surface p-5 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]",
            open === "qual" && "ring-1 ring-warn/40",
          )}
        >
          <div className="text-[11px] font-semibold tracking-[0.14em] text-warn uppercase">Qualitative analysis</div>
          <h3 className="mt-2 text-[22px] font-semibold tracking-tight">Can it be a multi-bagger?</h3>
          <p className="mt-1.5 max-w-md text-[13px] leading-snug text-muted">
            Management, industry, brand, and an explicit multi-bagger potential — High, Moderate, Low, or Unlikely.
          </p>
          <span className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-accent px-4 text-[13px] font-medium text-accent-fg group-hover:opacity-90">
            {busy === "qual" ? "Reading…" : open === "qual" ? "Hide" : "Read the story"}
            <ArrowRight className="size-3.5" />
          </span>
        </button>
      </div>
      {err ? <p className="mt-3 text-[13px] text-down">{err}</p> : null}
      {busy && open ? (
        <div className="mt-4">
          <AnalysisSkeleton kicker={open === "fund" ? "fundamental analysis" : "qualitative analysis"} />
        </div>
      ) : null}
      {open === "fund" && fundRes && !fundRes.ok ? <p className="mt-3 text-[13px] text-down">{fundRes.error}</p> : null}
      {open === "qual" && qualRes && !qualRes.ok ? <p className="mt-3 text-[13px] text-down">{qualRes.error}</p> : null}
      {open === "fund" && fundBlock ? (
        <div className="mt-4">
          <div className="mb-2 flex justify-end">
            <Button size="sm" variant="ghost" disabled={busy === "fund"} onClick={() => void runFull("fund")}>
              Refresh analysis
            </Button>
          </div>
          <FundamentalView block={fundBlock} />
        </div>
      ) : null}
      {open === "qual" && qualBlock ? (
        <div className="mt-4">
          <div className="mb-2 flex justify-end">
            <Button size="sm" variant="ghost" disabled={busy === "qual"} onClick={() => void runFull("qual")}>
              Refresh analysis
            </Button>
          </div>
          <QualitativeView block={qualBlock} />
        </div>
      ) : null}
      {fundBlock &&
      qualBlock &&
      fundRes &&
      fundRes.ok &&
      qualRes &&
      qualRes.ok &&
      skillOutputReady("fund", fundRes.text) &&
      skillOutputReady("qual", qualRes.text) ? (
        <div className="mt-4">
          {combineRes && combineRes.ok ? (
            <CombinedView text={combineRes.text} />
          ) : (
            <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Connect both skills</div>
              <h3 className="mt-2 text-[20px] font-semibold tracking-tight">Combined verdict</h3>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
                Uses the two analyses above — where they agree, where they pull apart, and one final verdict. Not a
                third independent read.
              </p>
              <Button className="mt-4" disabled={combineBusy} onClick={() => void runCombine()}>
                {combineBusy ? "Connecting…" : "Combined verdict"}
              </Button>
            </div>
          )}
          {combineRes && !combineRes.ok ? <p className="mt-3 text-[13px] text-down">{combineRes.error}</p> : null}
        </div>
      ) : null}
    </section>
  );
}

export function PulseDesk() {
  const d = useDesk();
  const pulse = useQuery({
    queryKey: ["pulse"],
    queryFn: () => apiNote({ kind: "pulse" }),
    staleTime: 6 * 60 * 60 * 1000,
  });
  const auto = pulse.data && pulse.data.ok ? pulse.data : null;
  const block = auto?.pulseBlock || asPulse(auto?.text);

  return (
    <div>
      <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Pulse</h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
              Today’s Indian market — indices, breadth, names that actually moved, headlines versus the last price. Not
              advice.
            </p>
          </div>
          <Button
            size="sm"
            disabled={pulse.isFetching || d.busy}
            onClick={() => {
              if (pulse.data) void pulse.refetch();
              else void d.run("pulse");
            }}
          >
            {pulse.isFetching || d.busy ? "Run Pulse…" : "Run Pulse"}
          </Button>
        </div>
        {pulse.isPending ? <p className="mt-3 text-[13px] text-muted">Reading Pulse…</p> : null}
        {pulse.data && !pulse.data.ok ? <p className="mt-3 text-[13px] text-down">{pulse.data.error}</p> : null}
        {d.err ? <p className="mt-3 text-[13px] text-down">{d.err}</p> : null}
      </div>
      {d.result?.ok ? <NoteResultView result={d.result} kind="pulse" /> : block ? <PulseView block={block} /> : null}
    </div>
  );
}

export function PortfolioDesk({ brief }: { brief: BookBrief }) {
  const d = useDesk();
  return (
    <div>
      <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Quality on this portfolio</h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
              Sends today’s weights and the public prices — not quantities or cost.
            </p>
          </div>
          <Button size="sm" disabled={d.busy} onClick={() => void d.run("book", { book: brief })}>
            {d.busy ? "Reading…" : "Read this portfolio"}
          </Button>
        </div>
        {d.err ? <p className="mt-3 text-[13px] text-down">{d.err}</p> : null}
      </div>
      {d.result?.ok ? <NoteResultView result={d.result} kind="book" /> : null}
    </div>
  );
}

/** @deprecated use PortfolioDesk */
export const BookDesk = PortfolioDesk;

export function HoldingDesk({ brief }: { brief: BookBrief }) {
  const top = [...brief.names].sort((a, b) => b.weight - a.weight).slice(0, 8);

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Largest holdings</h2>
        <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
          Open a name for Fundamental and Qualitative. Public weights only — not quantities or cost.
        </p>
      </div>
      {top.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {top.map((n) => (
            <li key={n.symbol}>
              <Link
                to="/s/$symbol"
                params={{ symbol: n.symbol }}
                className="flex items-center justify-between rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)] hover:text-chart"
              >
                <span className="font-medium">{n.symbol}</span>
                <span className="font-mono text-[13px] text-muted tabular">{(n.weight * 100).toFixed(1)}%</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Add holdings to see them here.</p>
      )}
    </section>
  );
}
