import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EnrichButton } from "@/components/enrich-button";
import { RowComplete } from "@/components/row-complete";
import { Button } from "@/components/ui/button";
import { AIButton } from "@/components/ui/ai-button";
import { apiScreenBuild, apiScreener, apiScreenerDeep } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { fmtVol } from "@/lib/kosh/ohlc";
import {
  applyFilter,
  applyScreen,
  candidateMultibagger,
  fillBlankScreenFund,
  filterSector,
  matchLabel,
  mergeScreenRows,
  rulesForScreen,
  scoreMultibagger,
  SCREEN_PRESETS,
  sortRows,
  type ScreenFilter,
  type ScreenId,
  type SortKey,
} from "@/lib/kosh/screens";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

const EXTRA_COLS: { key: SortKey; label: string }[] = [
  { key: "peg", label: "PEG" },
  { key: "eps", label: "EPS" },
  { key: "book", label: "Book" },
  { key: "interestCover", label: "Int. cover" },
  { key: "cfoPat", label: "CFO/PAT" },
  { key: "pledge", label: "Pledge" },
  { key: "salesCagr3", label: "Sales 3Y" },
  { key: "profitCagr5", label: "Profit 5Y" },
  { key: "fii", label: "FII" },
  { key: "dii", label: "DII" },
];

export const Route = createFileRoute("/screen")({ ssr: false, component: ScreenPage });

function ScreenPage() {
  const q = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const deep = useQuery({ queryKey: ["screener-deep"], queryFn: apiScreenerDeep, staleTime: 10 * 60 * 1000 });
  const [id, setId] = useState<ScreenId | "custom">("all");
  const [custom, setCustom] = useState<ScreenFilter | null>(null);
  const [sector, setSector] = useState("All");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "mcapCr", dir: "desc" });
  const [qtext, setQtext] = useState("");
  const [limit, setLimit] = useState(150);
  const [cols, setCols] = useState<Record<string, boolean>>({});
  const saved = useKosh((s) => s.customScreens);
  const saveCustomScreen = useKosh((s) => s.saveCustomScreen);
  const removeCustomScreen = useKosh((s) => s.removeCustomScreen);
  const reads = useKosh((s) => s.skillReads);
  const deepFunds = useKosh((s) => s.deepFunds);
  const rows = useMemo(() => {
    const merged = mergeScreenRows(q.data?.rows || [], deep.data?.rows || []);
    const keys = Object.keys(deepFunds);
    if (!keys.length) return merged;
    return merged.map((r) => {
      const fund = deepFunds[r.symbol]?.fund;
      return fund ? fillBlankScreenFund(r, fund) : r;
    });
  }, [q.data, deep.data, deepFunds]);
  const sectors = useMemo(() => ["All", ...[...new Set(rows.map((r) => r.sector))].sort()], [rows]);
  const needle = qtext.trim().toUpperCase();
  const searched = useMemo(() => {
    const base = filterSector(rows, sector);
    if (!needle) return base;
    return base.filter((r) => r.symbol.includes(needle) || r.name.toUpperCase().includes(needle));
  }, [rows, sector, needle]);
  const filtered =
    id === "custom" && custom
      ? applyFilter(searched, custom)
      : applyScreen(searched, id === "custom" ? "soundmb" : id);
  const shownAll = sortRows(filtered, sort.key, sort.dir);
  const shown = shownAll.slice(0, limit);
  const preset = id === "custom" ? custom : SCREEN_PRESETS.find((p) => p.id === id);
  const nFull = rows.filter((r) => r.depth === "full").length;
  const nPriced = rows.filter((r) => r.price > 0).length;
  const mbRules = id === "custom" ? null : rulesForScreen(id);
  const mbScored = useMemo(
    () => (mbRules ? scoreMultibagger(searched, mbRules) : []),
    [mbRules, searched],
  );
  const candidates = useMemo(
    () => (mbRules ? candidateMultibagger(searched, mbRules, sort.key) : []),
    [mbRules, searched, sort.key],
  );
  const nStrict = mbScored.filter((x) => x.kind === "strict").length;
  const nFail = mbScored.filter((x) => x.kind === "fail").length;
  const nUnk = mbScored.filter((x) => x.kind === "unknown").length;
  const gapSyms = shownAll.filter((r) => r.roce == null || r.opm == null).map((r) => r.symbol);
  const gapNow = gapSyms.slice(0, 36);

  function head(key: SortKey, label: string) {
    const on = sort.key === key;
    return (
      <th key={key} className="px-3 py-2 font-medium">
        <button
          type="button"
          className={cn("text-[11px] tracking-[0.06em] uppercase", on ? "text-fg" : "text-subtle")}
          onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }))}
        >
          {label}
          {on ? (sort.dir === "desc" ? " ↓" : " ↑") : ""}
        </button>
      </th>
    );
  }

  return (
    <AppShell>
      <div className="kosh-page">
        <h1 className="text-[28px] font-semibold tracking-tight">Screener</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Every NSE equity we can list. Company numbers fill in from the company card, then from filings when you complete a row.
          A blank cell is missing, not a pass — and never a guess. Complete & verify data reads filings for names on this page
          that are still missing operating margin or return on capital. It does not invent a number.
        </p>
        <div className="mt-3">
          <EnrichButton symbols={gapNow} queued={Math.max(0, gapSyms.length - gapNow.length)} />
        </div>

        <CustomBuilder
          onBuilt={(f) => {
            setCustom(f);
            setId("custom");
            saveCustomScreen(f);
          }}
        />

        <div className="mt-4 flex flex-wrap gap-1">
          <span className="mr-1 self-center text-[11px] tracking-[0.08em] text-subtle uppercase">Quality</span>
          {SCREEN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setId(p.id);
                if (p.id === "stake") setSort({ key: "fiiDelta", dir: "desc" });
                else if (p.id === "vcp") setSort({ key: "vcpLastPct", dir: "asc" });
                else if (p.id === "vcpbo") setSort({ key: "vcpDays", dir: "asc" });
                else if (p.id === "all") setSort({ key: "mcapCr", dir: "desc" });
                setLimit(150);
              }}
              className={cn(
                "h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]",
                id === p.id ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg",
              )}
            >
              {p.label}
            </button>
          ))}
          {saved.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => {
                setCustom(s);
                setId("custom");
              }}
              className={cn(
                "h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]",
                id === "custom" && custom?.name === s.name ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[12px] text-muted">
            Find
            <input
              className="h-8 w-40 rounded-sm bg-bg-elevated px-2 text-[13px] text-fg shadow-[var(--shadow-border)] outline-none"
              placeholder="Name or ticker"
              value={qtext}
              onChange={(e) => {
                setQtext(e.target.value);
                setLimit(150);
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-[12px] text-muted">
            Sector
            <select
              className="h-8 rounded-sm bg-bg-elevated px-2 text-[13px] text-fg shadow-[var(--shadow-border)]"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            >
              {sectors.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <ManualStrip
            onApply={(f) => {
              setCustom(f);
              setId("custom");
            }}
          />
          <span className="text-[12px] text-subtle">
            {shownAll.length} match · {nPriced} priced · {nFull} with full history of {rows.length} listed
            {preset?.hint ? ` · ${preset.hint}` : ""}
          </span>
          {id === "custom" && custom ? (
            <button
              type="button"
              className="text-[12px] text-muted hover:text-fg"
              onClick={() => {
                removeCustomScreen(custom.name);
                setId("soundmb");
                setCustom(null);
              }}
            >
              Remove this screen
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="mr-1 self-center text-[11px] tracking-[0.08em] text-subtle uppercase">Columns</span>
          {EXTRA_COLS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCols((s) => ({ ...s, [c.key]: !s[c.key] }))}
              className={cn(
                "h-7 rounded-sm px-2 text-[11px] shadow-[var(--shadow-border)]",
                cols[c.key] ? "bg-surface text-fg" : "text-muted hover:text-fg",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {id === "soundmb" || id === "turnmb" || id === "qgrowth" ? (
          <div className="mt-4 rounded-lg border-l-[4px] border-l-chart bg-surface p-4 text-[13px] leading-relaxed text-muted shadow-[var(--shadow-border)]">
            <span className="font-medium text-fg">Strict match first — every check must be present and pass.</span> A
            blank field is not a pass. Names with no known fail but missing fields sit under Candidates, labelled
            “8/9 passed · 1 unavailable”. They are not hidden, and they are not ranked as a match.
            {mbScored.length ? (
              <span className="mt-1 block font-mono text-[12px] tabular text-subtle">
                {nStrict} strict · {candidates.length} candidates · {nFail} failed a known check · {nUnk} insufficient
              </span>
            ) : null}
          </div>
        ) : null}

        {q.isPending && !rows.length ? (
          <p className="mt-8 text-sm text-muted">Loading listed names… first pass takes a moment.</p>
        ) : q.isError ? (
          <p className="mt-8 text-sm text-down">Could not load the screener. {q.error.message}</p>
        ) : (
          <>
          <div className="mt-4 hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block">
            <table className="kosh-table w-full text-left text-[13px]">
              <thead>
                <tr>
                  {head("name", "Name")}
                  {head("price", "Price")}
                  {head("changePct", "Today")}
                  {id === "stake" ? (
                    <>
                      {head("fii", "FII")}
                      {head("fiiDelta", "FII Δ")}
                      {head("dii", "DII")}
                      {head("diiDelta", "DII Δ")}
                      <th className="px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">Quarters</th>
                      {head("ret1y", "1Y")}
                    </>
                  ) : id === "vcp" || id === "vcpbo" ? (
                    <>
                      {head("vcpN", "Contractions")}
                      {head("vcpLastPct", "Last %")}
                      {head("vcpDays", "Days")}
                      {head("vcpVolX", "Vol ×")}
                      <th className="px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">Pivot</th>
                      {head("offHigh", "vs 52w high")}
                      {head("rsi", "RSI 14")}
                    </>
                  ) : (
                    <>
                      {head("pe", "P/E")}
                      {head("pb", "P/B")}
                      {head("roe", "ROE")}
                      {head("roce", "ROCE")}
                      {head("opm", "OPM")}
                      {head("de", "D/E")}
                      {head("promoters", "Promoters")}
                      {head("mcapCr", "Mcap")}
                      {head("salesYoY", "Sales 1Y")}
                      {head("profitYoY", "Profit 1Y")}
                      {head("divYield", "Div yield")}
                      {EXTRA_COLS.filter((c) => cols[c.key]).map((c) => head(c.key, c.label))}
                      {head("ret3m", "3M")}
                      {head("ret1y", "1Y")}
                      {head("offHigh", "vs 52w high")}
                      {head("rsi", "RSI 14")}
                      {head("vol", "Vol vs 20d avg")}
                    </>
                  )}
                  <th className="px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">Fund · Qual</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const read = reads[r.symbol];
                  return (
                    <tr key={r.symbol}>
                      <td className="px-3 py-2">
                        <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="hover:text-chart">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-[11px] text-subtle">
                            {r.symbol} · {r.sector}
                            {r.above200 ? " · >200" : ""}
                            {r.thin ? " · thin print" : ""}
                            {r.gsm ? " · GSM" : ""}
                            {r.depth === "quote" ? " · price only" : r.depth === "name" ? " · no print yet" : ""}
                            {r.passCount != null ? ` · ${matchLabel(r)}` : ""}
                          </div>
                        </Link>
                        <RowComplete row={r} />
                      </td>
                      <td className="px-3 py-2 font-mono tabular">{fmtPx(r.price)}</td>
                      <td className={cn("px-3 py-2 font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down")}>
                        {fmtPct(r.changePct)}
                      </td>
                      {id === "stake" ? (
                        <>
                          <Stake n={r.fii} prev={r.fiiPrev} />
                          <Pp n={r.fiiDelta} />
                          <Stake n={r.dii} prev={r.diiPrev} />
                          <Pp n={r.diiDelta} />
                          <td className="px-3 py-2 text-[12px] text-muted">{r.shLabel || "—"}</td>
                          <Cell n={r.ret1y} />
                        </>
                      ) : id === "vcp" || id === "vcpbo" ? (
                        <>
                          <td className="px-3 py-2 font-mono tabular">{r.vcpN ?? "—"}</td>
                          <Num n={r.vcpLastPct} d={1} suffix="%" />
                          <td className="px-3 py-2 font-mono tabular">{r.vcpDays != null ? r.vcpDays : "—"}</td>
                          <Num n={r.vcpVolX} d={2} suffix="×" />
                          <td className="px-3 py-2 font-mono tabular">{r.vcpPivot != null ? fmtPx(r.vcpPivot) : "—"}</td>
                          <Cell n={r.offHigh} />
                          <td className="px-3 py-2 font-mono tabular">{r.rsi != null ? r.rsi.toFixed(0) : "—"}</td>
                        </>
                      ) : (
                        <>
                          <Num n={r.pe} d={1} />
                          <Num n={r.pb} d={2} />
                          <Num n={r.roe} d={1} suffix="%" />
                          <Num n={r.roce} d={1} suffix="%" />
                          <Num n={r.opm} d={1} suffix="%" />
                          <Num n={r.de} d={2} />
                          <Num n={r.promoters} d={1} suffix="%" />
                          <td className="px-3 py-2 font-mono tabular">
                            {r.mcapCr != null ? r.mcapCr.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "—"}
                          </td>
                          <Cell n={r.salesYoY} />
                          <Cell n={r.profitYoY} />
                          <Num n={r.divYield} d={1} suffix="%" />
                          {EXTRA_COLS.filter((c) => cols[c.key]).map((c) => (
                            <Num key={c.key} n={typeof r[c.key] === "number" ? (r[c.key] as number) : null} d={2} />
                          ))}
                          <Cell n={r.ret3m} />
                          <Cell n={r.ret1y} />
                          <Cell n={r.offHigh} />
                          <td className="px-3 py-2 font-mono tabular">{r.rsi != null ? r.rsi.toFixed(0) : "—"}</td>
                          <td className="px-3 py-2 font-mono text-muted tabular">
                            {fmtVol(r.vol)}
                            {r.volRatio ? ` · ${r.volRatio.toFixed(1)}× 20d avg` : ""}
                          </td>
                        </>
                      )}
                      <td className="px-3 py-2 text-[12px] text-muted">
                        {read ? `${read.fundTag || "—"} · ${read.qualTag || "—"}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-2 md:hidden">
            {shown.map((r) => {
              const read = reads[r.symbol];
              return (
                <article key={r.symbol} className="rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]">
                  <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="hover:text-chart">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-[11px] text-subtle">
                      {r.symbol} · {r.sector}
                      {r.thin ? " · thin print" : ""}
                      {r.gsm ? " · GSM" : ""}
                      {r.depth === "quote" ? " · price only" : r.depth === "name" ? " · no print yet" : ""}
                      {r.passCount != null ? ` · ${matchLabel(r)}` : ""}
                    </div>
                  </Link>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
                    <div>
                      <div className="text-[11px] text-subtle">Price</div>
                      <div className="font-mono tabular">{fmtPx(r.price)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-subtle">Today</div>
                      <div className={cn("font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down")}>{fmtPct(r.changePct)}</div>
                    </div>
                    {id === "stake" ? (
                      <>
                        <div>
                          <div className="text-[11px] text-subtle">FII Δ</div>
                          <div className={cn("font-mono tabular", (r.fiiDelta ?? 0) >= 0 ? "text-up" : "text-down")}>
                            {r.fiiDelta == null ? "—" : `${r.fiiDelta >= 0 ? "+" : ""}${r.fiiDelta.toFixed(2)} pp`}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-subtle">DII Δ</div>
                          <div className={cn("font-mono tabular", (r.diiDelta ?? 0) >= 0 ? "text-up" : "text-down")}>
                            {r.diiDelta == null ? "—" : `${r.diiDelta >= 0 ? "+" : ""}${r.diiDelta.toFixed(2)} pp`}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-subtle">Quarters</div>
                          <div className="truncate text-[11px] text-muted">{r.shLabel || "—"}</div>
                        </div>
                      </>
                    ) : id === "vcp" || id === "vcpbo" ? (
                      <>
                        <div>
                          <div className="text-[11px] text-subtle">Last %</div>
                          <div className="font-mono tabular">{r.vcpLastPct != null ? `${r.vcpLastPct.toFixed(1)}%` : "—"}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-subtle">Days</div>
                          <div className="font-mono tabular">{r.vcpDays ?? "—"}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-subtle">Pivot</div>
                          <div className="font-mono tabular">{r.vcpPivot != null ? fmtPx(r.vcpPivot) : "—"}</div>
                        </div>
                      </>
                    ) : (
                      <>
                    <div>
                      <div className="text-[11px] text-subtle">1Y</div>
                      <div className={cn("font-mono tabular", (r.ret1y ?? 0) >= 0 ? "text-up" : "text-down")}>
                        {r.ret1y != null ? fmtPct(r.ret1y) : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-subtle">P/E</div>
                      <div className="font-mono tabular">{r.pe != null ? r.pe.toFixed(1) : "—"}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-subtle">ROCE</div>
                      <div className="font-mono tabular">{r.roce != null ? `${r.roce.toFixed(1)}%` : "—"}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-subtle">OPM</div>
                      <div className="font-mono tabular">{r.opm != null ? `${r.opm.toFixed(1)}%` : "—"}</div>
                    </div>
                      </>
                    )}
                    <div>
                      <div className="text-[11px] text-subtle">Fund · Qual</div>
                      <div className="truncate text-[11px] text-muted">{read ? `${read.fundTag || "—"} · ${read.qualTag || "—"}` : "—"}</div>
                    </div>
                  </div>
                  <RowComplete row={r} />
                </article>
              );
            })}
          </div>
          {shownAll.length > shown.length ? (
            <button
              type="button"
              className="mt-4 h-10 w-full rounded-sm bg-surface text-[13px] font-medium shadow-[var(--shadow-border)] hover:text-fg"
              onClick={() => setLimit((n) => n + 150)}
            >
              Show more · {shown.length} of {shownAll.length}
            </button>
          ) : null}
          {candidates.length ? (
            <section className="mt-8">
              <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
                Candidates · needs verification
              </h2>
              <p className="mt-1 max-w-2xl text-[13px] text-muted">
                Enough checks are on file and none of those fail. One or more required fields are still blank — so these
                are not a strict match. Missing data is never a pass.
              </p>
              <ul className="mt-3 grid gap-2">
                {candidates.slice(0, 40).map((r) => (
                  <li key={r.symbol} className="rounded-lg bg-surface px-3 py-2.5 shadow-[var(--shadow-border)]">
                    <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="hover:text-chart">
                      <span className="font-medium">{r.name}</span>
                      <span className="ml-2 text-[12px] text-muted">
                        {r.symbol} · {matchLabel(r)}
                        {r.unchecked?.length ? ` · missing ${r.unchecked.join(", ")}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {candidates.length > 40 ? (
                <p className="mt-2 text-[12px] text-muted">{candidates.length - 40} more candidates not shown.</p>
              ) : null}
            </section>
          ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}

function CustomBuilder({ onBuilt }: { onBuilt: (f: ScreenFilter) => void }) {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [closest, setClosest] = useState("");

  async function fileToData(file: File) {
    if (file.size > 900_000) throw new Error("Crop the screenshot — keep it under about 0.7 MB.");
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });
  }

  async function build(text = prompt) {
    setBusy(true);
    setErr("");
    setClosest("");
    try {
      const r = await apiScreenBuild({ prompt: text, image: image || undefined });
      if (!r.ok) {
        setErr(r.error);
        if (r.unsupported?.closest) setClosest(r.unsupported.closest);
      } else onBuilt(r.filter);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not build that screen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Build your own</h2>
      <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
        Type it in plain words — “ROE above 15, debt under 1, RSI under 40” — or attach a screenshot of the criteria.
        Unsupported metrics are named. They are not swapped for a nearby field unless you accept that field.
      </p>
      <textarea
        className="mt-3 min-h-20 w-full rounded-sm bg-bg-elevated px-3 py-2 text-sm shadow-[var(--shadow-border)] outline-none"
        placeholder="e.g. PE under 20, ROE above 15, volume at least 1.5× average"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="inline-flex h-8 cursor-pointer items-center rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg">
          Attach screenshot
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              void fileToData(f)
                .then(setImage)
                .catch((err) => setErr(err instanceof Error ? err.message : "Could not read image"));
            }}
          />
        </label>
        {image ? (
          <span className="text-[12px] text-muted">
            Screenshot attached
            <button type="button" className="ml-2 hover:text-fg" onClick={() => setImage("")}>
              Remove
            </button>
          </span>
        ) : null}
        <AIButton busy={busy} disabled={!prompt.trim() && !image} onClick={() => void build()}>
          Build screen
        </AIButton>
      </div>
      {err ? <p className="mt-2 text-[13px] text-down">{err}</p> : null}
      {closest ? (
        <button
          type="button"
          className="mt-2 text-[13px] font-medium text-chart hover:underline"
          onClick={() => {
            const next = `${prompt} — use ${closest} instead`;
            setPrompt(next);
            void build(next);
          }}
        >
          Use {closest} instead
        </button>
      ) : null}
    </div>
  );
}

function Pp({ n }: { n: number | null }) {
  if (n == null) return <td className="px-3 py-2 font-mono text-subtle tabular">—</td>;
  return (
    <td className={cn("px-3 py-2 font-mono tabular", n >= 0 ? "text-up" : "text-down")}>
      {n >= 0 ? "+" : ""}
      {n.toFixed(2)} pp
    </td>
  );
}

function Stake({ n, prev }: { n: number | null; prev: number | null }) {
  return (
    <td className="px-3 py-2 font-mono tabular">
      {n == null ? "—" : `${n.toFixed(1)}%`}
      {prev != null ? <div className="text-[11px] text-subtle">was {prev.toFixed(1)}%</div> : null}
    </td>
  );
}

function Cell({ n }: { n: number | null }) {
  if (n == null) return <td className="px-3 py-2 font-mono text-subtle tabular">—</td>;
  return <td className={cn("px-3 py-2 font-mono tabular", n >= 0 ? "text-up" : "text-down")}>{fmtPct(n)}</td>;
}

function Num({ n, d = 1, suffix = "" }: { n: number | null; d?: number; suffix?: string }) {
  if (n == null) return <td className="px-3 py-2 font-mono text-subtle tabular">—</td>;
  return (
    <td className="px-3 py-2 font-mono tabular">
      {n.toFixed(d)}
      {suffix}
    </td>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-1 text-[11px] text-muted">
      {label}
      <input
        className="h-7 w-16 rounded-sm bg-bg-elevated px-1.5 font-mono text-[12px] text-fg shadow-[var(--shadow-border)] outline-none"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ManualStrip({ onApply }: { onApply: (f: ScreenFilter) => void }) {
  const [peMax, setPeMax] = useState("");
  const [roeMin, setRoeMin] = useState("");
  const [deMax, setDeMax] = useState("");
  const [rsiMax, setRsiMax] = useState("");
  const [mcapMin, setMcapMin] = useState("");
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const num = (s: string) => {
          const v = Number(s);
          return s.trim() && Number.isFinite(v) ? v : null;
        };
        onApply({
          name: "Manual",
          hint: "Typed min / max on PE, ROE, debt, RSI, market cap",
          peMax: num(peMax),
          roeMin: num(roeMin),
          deMax: num(deMax),
          rsiMax: num(rsiMax),
          mcapMin: num(mcapMin),
          sort: "changePct",
          sortDir: "desc",
        });
      }}
    >
      <Field label="PE ≤" value={peMax} onChange={setPeMax} />
      <Field label="ROE ≥" value={roeMin} onChange={setRoeMin} />
      <Field label="D/E ≤" value={deMax} onChange={setDeMax} />
      <Field label="RSI ≤" value={rsiMax} onChange={setRsiMax} />
      <Field label="Mcap ≥" value={mcapMin} onChange={setMcapMin} />
      <Button type="submit" size="sm" variant="secondary">
        Apply
      </Button>
    </form>
  );
}
