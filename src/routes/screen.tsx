import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { apiScreenBuild, apiScreener } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { fmtVol } from "@/lib/kosh/ohlc";
import {
  applyFilter,
  applyScreen,
  filterSector,
  SCREEN_PRESETS,
  sortRows,
  type ScreenFilter,
  type ScreenId,
  type SortKey,
} from "@/lib/kosh/screens";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/screen")({ ssr: false, component: ScreenPage });

function ScreenPage() {
  const q = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const [id, setId] = useState<ScreenId | "custom">("soundmb");
  const [custom, setCustom] = useState<ScreenFilter | null>(null);
  const [sector, setSector] = useState("All");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "changePct", dir: "desc" });
  const saved = useKosh((s) => s.customScreens);
  const saveCustomScreen = useKosh((s) => s.saveCustomScreen);
  const removeCustomScreen = useKosh((s) => s.removeCustomScreen);
  const reads = useKosh((s) => s.skillReads);
  const rows = q.data?.rows || [];
  const sectors = useMemo(() => ["All", ...[...new Set(rows.map((r) => r.sector))].sort()], [rows]);
  const base = filterSector(rows, sector);
  const filtered =
    id === "custom" && custom
      ? applyFilter(base, custom)
      : applyScreen(base, id === "custom" ? "soundmb" : id);
  const shown = sortRows(filtered, sort.key, sort.dir);
  const preset = id === "custom" ? custom : SCREEN_PRESETS.find((p) => p.id === id);

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
        <h1 className="text-[28px] font-semibold tracking-tight">Screen</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Live prices and company numbers on the Nifty 500. A blank cell is missing, not a guess. Fundamental and
          Qualitative live on each stock page.
        </p>

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
            {shown.length} names · {preset?.hint}
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

        {id === "soundmb" || id === "turnmb" ? (
          <div className="mt-4 rounded-lg border-l-[4px] border-l-chart bg-surface p-4 text-[13px] leading-relaxed text-muted shadow-[var(--shadow-border)]">
            <span className="font-medium text-fg">On the numbers we have.</span> Every listed name passes the checks
            that are actually available. Blank fields are extra checks for you — not a pass. Open a name if you want the
            leftover criteria tighter.
            {shown[0]?.unchecked?.length ? (
              <span> Common extras on this pass: {shown[0].unchecked.slice(0, 3).join(" · ")}.</span>
            ) : null}
          </div>
        ) : null}

        {q.isPending && !rows.length ? (
          <p className="mt-8 text-sm text-muted">Loading prices and numbers for the Nifty 500… first pass takes a moment.</p>
        ) : q.isError ? (
          <p className="mt-8 text-sm text-down">Could not load the screen. {q.error.message}</p>
        ) : (
          <>
          <div className="mt-4 hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block">
            <table className="w-full min-w-[1280px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
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
                      {head("de", "D/E")}
                      {head("promoters", "Promoters")}
                      {head("mcapCr", "Mcap")}
                      {head("salesYoY", "Sales 1Y")}
                      {head("profitYoY", "Profit 1Y")}
                      {head("divYield", "Div yield")}
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
                    <tr key={r.symbol} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-2">
                        <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="hover:text-chart">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-[11px] text-subtle">
                            {r.symbol} · {r.sector}
                            {r.above200 ? " · >200" : ""}
                          </div>
                        </Link>
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
                          <Num n={r.de} d={2} />
                          <Num n={r.promoters} d={1} suffix="%" />
                          <td className="px-3 py-2 font-mono tabular">
                            {r.mcapCr != null ? r.mcapCr.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "—"}
                          </td>
                          <Cell n={r.salesYoY} />
                          <Cell n={r.profitYoY} />
                          <Num n={r.divYield} d={1} suffix="%" />
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
                      <div className="text-[11px] text-subtle">RSI</div>
                      <div className="font-mono tabular">{r.rsi != null ? r.rsi.toFixed(0) : "—"}</div>
                    </div>
                      </>
                    )}
                    <div>
                      <div className="text-[11px] text-subtle">Fund · Qual</div>
                      <div className="truncate text-[11px] text-muted">{read ? `${read.fundTag || "—"} · ${read.qualTag || "—"}` : "—"}</div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
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

  async function fileToData(file: File) {
    if (file.size > 900_000) throw new Error("Crop the screenshot — keep it under about 0.7 MB.");
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });
  }

  async function build() {
    setBusy(true);
    setErr("");
    try {
      const r = await apiScreenBuild({ prompt, image: image || undefined });
      if (!r.ok) setErr(r.error);
      else onBuilt(r.filter);
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
        We map it to live prices and company fundamentals. A blank cell means the number is missing, not a guess.
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
        <Button size="sm" disabled={busy || (!prompt.trim() && !image)} onClick={() => void build()}>
          {busy ? "Building…" : "Build screen"}
        </Button>
      </div>
      {err ? <p className="mt-2 text-[13px] text-down">{err}</p> : null}
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
