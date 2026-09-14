import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FundBlock, QualBlock, QualFactor, StructureBlock } from "@/lib/kosh/note-shape";
import type { FinPoint, Fundamentals, ShPoint } from "@/lib/kosh/types";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { grahamNumber } from "@/lib/kosh/portfolio-stats";
import { Tooltip } from "@/components/ui/tooltip";
import { buildFinRows, compactCr, crTicks, formatFinMonth, fullCr, type FinKind, type FinRow } from "@/lib/kosh/fin-series";

function Label({ children, tone = "chart" }: { children: string; tone?: "chart" | "warn" | "down" | "up" | "muted" }) {
  const color =
    tone === "down"
      ? "text-down"
      : tone === "warn"
        ? "text-warn"
        : tone === "up"
          ? "text-up"
          : tone === "muted"
            ? "text-subtle"
            : "text-chart";
  return <div className={cn("text-[11px] font-semibold tracking-[0.12em] uppercase", color)}>{children}</div>;
}

function P({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg">{children}</p>;
}

function Block({ children, label, tone }: { children?: ReactNode; label: string; tone?: "chart" | "warn" | "down" | "muted" | "up" }) {
  if (!children) return null;
  return (
    <div className="mt-5">
      <Label tone={tone}>{label}</Label>
      {children}
    </div>
  );
}

function Bullets({ items, tone }: { items: string[]; tone?: "down" | "warn" | "chart" }) {
  if (!items.length) return null;
  const mark = tone === "down" ? "bg-down" : tone === "warn" ? "bg-warn" : "bg-chart";
  const border = tone === "down" ? "border-down/40" : tone === "warn" ? "border-warn/40" : "border-chart/35";
  return (
    <ul className={cn("mt-2 grid gap-2 border-l-2 pl-3", border)}>
      {items.map((x, i) => (
        <li key={i} className="flex gap-2 text-[13.5px] leading-snug text-fg">
          <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", mark)} />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

function n(v: number | null | undefined, fmt: (x: number) => string = (x) => String(x)) {
  if (v == null || !Number.isFinite(v)) return "—";
  return fmt(v);
}

const VW = 640;
const VH = 168;
const PAD = { l: 40, r: 8, t: 14, b: 28 };

function FinChart({
  title,
  kind,
  sales,
  profits,
}: {
  title: string;
  kind: FinKind;
  sales: FinPoint[];
  profits: FinPoint[];
}) {
  const rows = buildFinRows(sales, profits, kind, 6);
  const [hi, setHi] = useState<number | null>(null);
  if (!rows.length) return null;
  const focus = hi == null ? rows.length - 1 : hi;
  const cur = rows[focus];
  const nums = rows.flatMap((r) => [r.sales, r.profit]).filter((v): v is number => v != null);
  const lo = Math.min(0, ...nums);
  const hiV = Math.max(...nums, 1);
  const pad = (hiV - lo) * 0.16 || 1;
  const yLo = lo < 0 ? lo - pad * 0.4 : 0;
  const yHi = hiV + pad;
  const ticks = crTicks(yLo, yHi, 4);
  const innerW = VW - PAD.l - PAD.r;
  const innerH = VH - PAD.t - PAD.b;
  const yOf = (v: number) => PAD.t + ((yHi - v) / (yHi - yLo)) * innerH;
  const zero = yOf(0);
  const slot = innerW / rows.length;
  const barW = Math.min(22, Math.max(7, slot * 0.32));
  const gap = 2;
  const margin =
    cur && cur.sales && cur.sales > 0 && cur.profit != null ? (cur.profit / cur.sales) * 100 : null;

  function groupX(i: number) {
    const cx = PAD.l + slot * i + slot / 2;
    return { sales: cx - barW - gap / 2, profit: cx + gap / 2, cx };
  }

  return (
    <div className="mt-5">
      <div className="text-[13px] font-semibold tracking-[0.06em] text-fg uppercase">{title}</div>
      <p className="mt-1 text-[12px] text-muted">₹ crore. Blue = sales, green = profit. Same scale.</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-chart" aria-hidden />
          Sales
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-up" aria-hidden />
          Profit
        </span>
        {hiV >= 1_00_000 ? <span className="text-subtle">L = lakh crore</span> : null}
      </div>
      {cur ? (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md bg-bg px-3 py-1.5 font-mono text-[12px] tabular shadow-[var(--shadow-border)]">
          <span className="font-sans text-[12px] font-semibold text-fg">{cur.label}</span>
          <span>
            <span className="text-subtle">Sales </span>
            <span className="text-chart">{cur.sales == null ? "—" : `₹ ${fullCr(cur.sales)} Cr`}</span>
          </span>
          <span>
            <span className="text-subtle">Profit </span>
            <span className={cur.profit != null && cur.profit < 0 ? "text-down" : "text-up"}>
              {cur.profit == null ? "—" : `₹ ${fullCr(cur.profit)} Cr`}
            </span>
          </span>
          {margin != null ? (
            <span>
              <span className="text-subtle">Margin </span>
              <span className={margin >= 0 ? "text-up" : "text-down"}>{fmtPct(margin)}</span>
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="mt-2 grid items-start gap-3 lg:grid-cols-2">
        <div className="min-w-0">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="h-auto w-full"
            role="img"
            aria-label={`${title}. Blue bars are sales, green bars are profit, in rupee crore.`}
          >
            {ticks.map((t) => {
              const y = yOf(t);
              return (
                <g key={t}>
                  <line x1={PAD.l} x2={VW - PAD.r} y1={y} y2={y} stroke="var(--color-border)" strokeWidth="1" />
                  <text
                    x={PAD.l - 6}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="var(--color-subtle)"
                    fontSize="10"
                    fontFamily="IBM Plex Mono, ui-monospace, monospace"
                  >
                    {compactCr(t)}
                  </text>
                </g>
              );
            })}
            <line x1={PAD.l} x2={VW - PAD.r} y1={zero} y2={zero} stroke="var(--color-border-strong)" strokeWidth="1.25" />
            {rows.map((r, i) => {
              const x = groupX(i);
              const active = i === focus;
              return (
                <g key={r.period} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)}>
                  <rect
                    x={PAD.l + slot * i}
                    y={PAD.t}
                    width={slot}
                    height={innerH + PAD.b}
                    fill="var(--color-surface-2)"
                    fillOpacity={active ? 0.55 : 0}
                  />
                  <FinBar x={x.sales} zero={zero} yOf={yOf} value={r.sales} width={barW} fill="var(--color-chart)" />
                  <FinBar
                    x={x.profit}
                    zero={zero}
                    yOf={yOf}
                    value={r.profit}
                    width={barW}
                    fill={r.profit != null && r.profit < 0 ? "var(--color-down)" : "var(--color-up)"}
                  />
                  <text
                    x={x.cx}
                    y={VH - 10}
                    textAnchor="middle"
                    fill={active ? "var(--color-fg)" : "var(--color-subtle)"}
                    fontSize="10"
                    fontFamily="IBM Plex Sans, Segoe UI, sans-serif"
                  >
                    {kind === "quarter" ? r.label.replace(" FY", "’") : r.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <FinTable rows={rows} kind={kind} />
      </div>
    </div>
  );
}

function FinBar({
  x,
  zero,
  yOf,
  value,
  width,
  fill,
}: {
  x: number;
  zero: number;
  yOf: (v: number) => number;
  value: number | null;
  width: number;
  fill: string;
}) {
  if (value == null || !Number.isFinite(value)) return null;
  const y = yOf(value);
  const top = Math.min(y, zero);
  const h = Math.max(2, Math.abs(zero - y));
  return (
    <g>
      <rect x={x} y={top} width={width} height={h} fill={fill} rx="2" />
    </g>
  );
}

function FinTable({ rows, kind }: { rows: FinRow[]; kind: FinKind }) {
  const yoy = (key: "sales" | "profit", i: number) => {
    if (i < 1) return null;
    const a = rows[i - 1][key];
    const b = rows[i][key];
    if (a == null || b == null || !(a > 0)) return null;
    return (b / a - 1) * 100;
  };
  return (
    <div className="overflow-x-auto rounded-md shadow-[var(--shadow-border)]">
      <table className="w-full min-w-[280px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-border bg-bg">
            <th className="sticky left-0 z-10 min-w-[4.5rem] border-r border-border bg-bg-elevated px-2 py-2 text-[12px] font-semibold text-fg">
              ₹ Cr
            </th>
            {rows.map((r) => (
              <th key={r.period} className="px-2 py-2 text-right text-[12px] font-semibold text-fg">
                {r.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(
            [
              ["Sales", "sales", "text-chart"],
              ["Profit", "profit", "text-up"],
            ] as const
          ).map(([name, key, tone], ri) => (
            <tr key={key} className={ri ? "bg-bg/40" : "border-b border-border/70"}>
              <td className="sticky left-0 z-10 border-r border-border bg-bg-elevated px-2 py-2 text-[13px] font-semibold text-fg">
                {name}
              </td>
              {rows.map((r, i) => {
                const v = r[key];
                const ch = yoy(key, i);
                return (
                  <td key={r.period} className="px-2 py-2 text-right font-mono tabular">
                    <div className={cn("text-[13px] font-medium", v != null && v < 0 ? "text-down" : tone)}>
                      {n(v, fullCr)}
                    </div>
                    {ch != null ? (
                      <div className={cn("text-[11px] font-medium", ch >= 0 ? "text-up" : "text-down")}>{fmtPct(ch)}</div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sr-only">
        {kind === "year" ? "Yearly" : "Quarterly"} sales and profit in rupee crore, with year-on-year change under each
        figure.
      </p>
    </div>
  );
}

export function OwnershipBlock({ fund }: { fund: Fundamentals | null | undefined }) {
  const p = fund?.promoters ?? null;
  const fii = fund?.fii ?? null;
  const dii = fund?.dii ?? null;
  return (
    <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <Label>Ownership</Label>
      <p className="mt-1 text-[12px] text-subtle">Promoter, FII and DII from the latest shareholding print. Blank means missing.</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {(
          [
            ["Promoters", p],
            ["FII", fii],
            ["DII", dii],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]">
            <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{k}</div>
            <div className="mt-1 font-mono text-[22px] tabular">{v != null ? `${v.toFixed(1)}%` : "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinancialSnapshot({ fund, bare, price }: { fund: Fundamentals | null | undefined; bare?: boolean; price?: number | null }) {
  if (!fund) {
    return (
      <div className={bare ? "" : "mt-5"}>
        {!bare ? <Label tone="muted">Financial snapshot</Label> : null}
        <p className="mt-1.5 text-[13px] text-muted">No company numbers for this ticker — numbers are not invented.</p>
      </div>
    );
  }
  const peTone: "up" | "down" | undefined =
    fund.pe != null && fund.industryPe != null
      ? fund.pe <= fund.industryPe
        ? "up"
        : fund.pe > fund.industryPe * 1.2
          ? "down"
          : undefined
      : undefined;
  const rows: [string, string, "up" | "down" | undefined, string][] = [
    ["Market cap", fund.mcapCr != null ? `₹${fund.mcapCr.toLocaleString("en-IN")} Cr` : "—", undefined, "Shares outstanding × last price, in ₹ crore."],
    ["Stock P/E", n(fund.pe, (x) => x.toFixed(1)), peTone, "Price ÷ trailing twelve-month earnings. Blank if earnings are missing or negative."],
    ["Industry P/E", n(fund.industryPe, (x) => x.toFixed(1)), undefined, "Median P/E of the reported industry, not a peer you picked."],
    ["P/B", n(fund.pb, (x) => x.toFixed(2)), fund.pb != null ? (fund.pb <= 3 ? "up" : fund.pb >= 8 ? "down" : undefined) : undefined, "Price ÷ book value per share."],
    ["Book value", fund.book != null ? fmtPx(fund.book) : "—", undefined, "Net worth per share on the company card."],
    ["EPS (TTM)", fund.eps != null ? `₹${fund.eps.toFixed(2)}` : "—", fund.eps != null ? (fund.eps >= 0 ? "up" : "down") : undefined, "Trailing twelve-month earnings per share."],
    ["ROE", fund.roe != null ? `${fund.roe.toFixed(1)}%` : "—", fund.roe != null ? (fund.roe >= 15 ? "up" : fund.roe < 10 ? "down" : undefined) : undefined, "Return on equity. Profit against shareholder funds."],
    ["ROCE", fund.roce != null ? `${fund.roce.toFixed(1)}%` : "—", fund.roce != null ? (fund.roce >= 20 ? "up" : fund.roce < 10 ? "down" : undefined) : undefined, "Return on capital employed from the company card."],
    ["OPM", fund.opm != null ? `${fund.opm.toFixed(1)}%` : "—", fund.opm != null ? (fund.opm >= 12 ? "up" : fund.opm < 6 ? "down" : undefined) : undefined, "Operating profit margin. Blank if the card does not print it."],
    ["Cash / profit", fund.cfoPat != null ? `${fund.cfoPat.toFixed(2)}×` : "—", fund.cfoPat != null ? (fund.cfoPat >= 0.8 ? "up" : fund.cfoPat < 0.5 ? "down" : undefined) : undefined, "Latest operating cash ÷ latest reported profit. Unavailable when cash flow is missing."],
    ["Debt / equity", n(fund.de, (x) => x.toFixed(2)), fund.de != null ? (fund.de <= 0.5 ? "up" : fund.de > 1 ? "down" : undefined) : undefined, "Total debt ÷ net worth. Banks often skip this print."],
    ["Dividend yield", fund.divYield != null ? `${fund.divYield.toFixed(2)}%` : "—", fund.divYield != null && fund.divYield >= 2 ? "up" : undefined, "Trailing dividend ÷ last price."],
    ["Face value", fund.face != null ? `₹${fund.face}` : "—", undefined, "Face value of one share."],
    ["Sales growth (yr)", fund.salesYoY != null ? fmtPct(fund.salesYoY) : "—", fund.salesYoY != null ? (fund.salesYoY >= 0 ? "up" : "down") : undefined, "Latest yearly sales versus the year before."],
    ["Profit growth (yr)", fund.profitYoY != null ? fmtPct(fund.profitYoY) : "—", fund.profitYoY != null ? (fund.profitYoY >= 0 ? "up" : "down") : undefined, "Latest yearly profit versus the year before."],
    ["PEG", fund.peg != null ? fund.peg.toFixed(2) + (fund.pegVia ? " · " + fund.pegVia : "") : "—", fund.peg != null ? (fund.peg <= 1.5 ? "up" : fund.peg >= 3 ? "down" : undefined) : undefined, "P/E ÷ profit CAGR. Only when growth is positive."],
    ["Graham number", (() => {
      const g = grahamNumber(fund.eps, fund.book);
      if (g == null) return "—";
      if (price && price > 0) {
        const gap = (price / g - 1) * 100;
        return `₹${g.toFixed(0)} · last ${gap >= 0 ? "+" : ""}${gap.toFixed(0)}%`;
      }
      return `₹${g.toFixed(0)}`;
    })(), undefined, "√(22.5 × EPS × book value). A textbook ceiling, not a target."],
    ["Interest cover", fund.interestCover != null ? fund.interestCover.toFixed(1) + "×" : "—", fund.interestCover != null ? (fund.interestCover >= 4 ? "up" : fund.interestCover < 1.5 ? "down" : undefined) : undefined, "Operating profit ÷ interest. How many times interest is earned."],
    ["Promoters", fund.promoters != null ? `${fund.promoters.toFixed(1)}%` : "—", fund.promoters != null ? (fund.promoters >= 50 ? "up" : fund.promoters < 25 ? "down" : undefined) : undefined, "Promoter holding on the latest shareholding print."],
    ["FII", fund.fii != null ? `${fund.fii.toFixed(1)}%` : "—", undefined, "Foreign institutional holding on the latest print."],
    ["DII", fund.dii != null ? `${fund.dii.toFixed(1)}%` : "—", undefined, "Domestic institutional holding on the latest print."],
  ];
  return (
    <div className={bare ? "" : "mt-5"}>
      {!bare ? <Label>Financial snapshot</Label> : null}
      {!bare ? <p className="mt-1 text-[11px] text-subtle">Company card — blank means missing, not a guess. Hover a label.</p> : null}
      <dl className="mt-2 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {rows.map(([k, v, tone, help]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5">
            <dt className="text-[13px] text-muted">
              <Tooltip content={help}>
                <button type="button" className="text-left text-[13px] text-muted hover:text-fg">
                  {k}
                </button>
              </Tooltip>
            </dt>
            <dd className={cn("font-mono text-[16px] font-semibold tabular", tone === "up" && "text-up", tone === "down" && "text-down")}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <FinChart title="Yearly sales and profit" kind="year" sales={fund.sales} profits={fund.profits} />
      <FinChart title="Quarterly sales and profit" kind="quarter" sales={fund.qSales} profits={fund.qProfits} />
      <WorthTable title="Net worth yearly (₹ Cr)" points={fund.netWorth} />
      <WorthTable title="Net worth quarterly (₹ Cr)" points={fund.qNetWorth} />
      <ShareTable rows={fund.shareholding} />
    </div>
  );
}

function WorthTable({ title, points }: { title: string; points: FinPoint[] }) {
  if (!points.length) return null;
  const show = [...points].sort((a, b) => a.period.localeCompare(b.period)).slice(-6);
  return (
    <div className="mt-6">
      <div className="text-[13px] font-semibold tracking-[0.06em] text-fg uppercase">{title}</div>
      <div className="mt-2 overflow-x-auto rounded-md shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="sticky left-0 z-10 min-w-[10rem] border-r border-border bg-bg-elevated px-4 py-3 text-[14px] font-semibold text-fg">₹ Crore</th>
              {show.map((p) => (
                <th key={p.period} className="px-3 py-2.5 text-right text-[13px] font-semibold text-fg">
                  {formatFinMonth(p.period)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="sticky left-0 z-10 border-r border-border bg-bg-elevated px-3 py-3 text-[15px] font-semibold text-fg">Net worth</td>
              {show.map((p) => (
                <td key={p.period} className="px-3 py-3 text-right font-mono text-[14px] tabular">
                  {n(p.value, fullCr)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShareTable({ rows }: { rows: ShPoint[] }) {
  if (!rows.length) return null;
  const show = rows.slice(0, 8);
  return (
    <div className="mt-6">
      <div className="text-[13px] font-semibold tracking-[0.06em] text-fg uppercase">Shareholding</div>
      <div className="mt-2 overflow-x-auto rounded-md shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="sticky left-0 z-10 min-w-[8.5rem] border-r border-border bg-bg-elevated px-3 py-2.5 text-[13px] font-semibold text-fg">Period</th>
              <th className="px-3 py-2.5 text-right text-[13px] font-semibold text-fg">Promoters</th>
              <th className="px-3 py-2.5 text-right text-[13px] font-semibold text-fg">FII</th>
              <th className="px-3 py-2.5 text-right text-[13px] font-semibold text-fg">DII</th>
            </tr>
          </thead>
          <tbody>
            {show.map((r) => (
              <tr key={r.period} className="border-b border-border/60 last:border-0">
                <td className="sticky left-0 z-10 border-r border-border bg-bg-elevated px-3 py-3 text-[15px] font-semibold text-fg">
                  {formatFinMonth(r.period)}
                </td>
                <td className={cn("px-3 py-3 text-right font-mono tabular", (r.promoters ?? 0) >= 50 ? "text-up" : (r.promoters ?? 50) < 25 ? "text-down" : "")}>
                  {n(r.promoters, (x) => x.toFixed(1) + "%")}
                </td>
                <td className="px-3 py-3 text-right font-mono tabular">{n(r.fii, (x) => x.toFixed(1) + "%")}</td>
                <td className="px-3 py-3 text-right font-mono tabular">{n(r.dii, (x) => x.toFixed(1) + "%")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TagLine({ tag, tone }: { tag: string; tone: "chart" | "warn" }) {
  if (!tag) return null;
  return (
    <div className="mt-3 flex flex-wrap items-end gap-3">
      <h3 className={cn("text-[28px] font-semibold leading-none tracking-tight", tone === "warn" ? "text-warn" : "text-chart")}>
        {tag}
      </h3>
      <span className="mb-0.5 text-[11px] tracking-[0.08em] text-subtle uppercase">Verdict</span>
    </div>
  );
}

function numberTone(sentence: string, token: string): "up" | "down" | undefined {
  const s = sentence.toLowerCase();
  const num = Number(token.replace(/[,₹%]/g, ""));
  if (!Number.isFinite(num)) return undefined;
  const negative = token.startsWith("-") || num < 0;
  if (/(debt\/equity|d\/e|leverage|pledge|drawdown|loss|decline|erosion|stretched|demanding|expensive|overvalued)/.test(s)) {
    if (/(cheap|conservative|manageable|low debt)/.test(s)) return "up";
    return negative ? "up" : num > 1 && /(d\/e|debt)/.test(s) ? "down" : "down";
  }
  if (/(roe|roce|margin|growth|profit|sales|promoter|compound)/.test(s)) return negative ? "down" : "up";
  if (/%/.test(token) || /%/.test(s)) return negative ? "down" : "up";
  return undefined;
}

const GOOD_WORD = /^(healthy|cheap|conservative|sound|strong|durable|solid|constructive|reasonable|fair|positive)$/i;
const BAD_WORD = /^(weak|stretched|demanding|expensive|deteriorating|decline|loss|erosion|pledged|overvalued|negative|fragile)$/i;

function ColorLine({ text }: { text: string }) {
  const parts = text.split(/(\-?₹?[\d,]+\.?\d*%?)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (/^[\-₹]?[\d,]+\.?\d*%?$/.test(p) && /\d/.test(p)) {
          const tone = numberTone(text, p);
          return (
            <span key={i} className={cn("font-mono tabular", tone === "up" && "text-up", tone === "down" && "text-down")}>
              {p}
            </span>
          );
        }
        const words = p.split(/(\s+)/);
        return (
          <span key={i}>
            {words.map((w, j) => {
              if (GOOD_WORD.test(w)) return <span key={j} className="font-medium text-up">{w}</span>;
              if (BAD_WORD.test(w)) return <span key={j} className="font-medium text-down">{w}</span>;
              return <span key={j}>{w}</span>;
            })}
          </span>
        );
      })}
    </>
  );
}

export function SkillMarkdown({ text, color }: { text: string; color?: boolean }) {
  const body = stripMarks(
    text.replace(/\btape\b/gi, "session").replace(/\bmix\b/gi, "portfolio").replace(/\bthe book\b/gi, "the portfolio").replace(/\bthis book\b/gi, "this portfolio"),
  ).trim();
  if (!body) return null;
  const pin = extractPin(body);
  const lines = pin.body.split("\n");
  const nodes: ReactNode[] = [];
  let list: string[] = [];
  let table: string[][] | null = null;
  function flush() {
    if (!list.length) return;
    const items = list;
    list = [];
    nodes.push(
      <ul key={"l" + nodes.length} className="my-2 grid gap-1.5 border-l-2 border-chart/30 pl-3">
        {items.map((x, i) => (
          <li key={i} className="text-[14px] leading-relaxed text-fg">
            {color ? <ColorLine text={x} /> : x}
          </li>
        ))}
      </ul>,
    );
  }
  function flushTable() {
    if (!table?.length) {
      table = null;
      return;
    }
    const rows = table;
    table = null;
    const head = rows[0];
    const bodyRows = rows.slice(1);
    nodes.push(
      <div key={"t" + nodes.length} className="my-3 overflow-x-auto rounded-md bg-bg-elevated shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[420px] text-[13px]">
          <thead>
            <tr className="border-b border-border text-left">
              {head.map((c, i) => (
                <th key={i} className="px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr key={ri} className="border-b border-border/60 last:border-0">
                {row.map((c, ci) => (
                  <td key={ci} className="px-3 py-2 align-top">
                    {color ? <ColorLine text={c} /> : c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
  }
  for (const raw of lines) {
    const line = raw.trimEnd();
    const t = line.trim();
    if (!t) {
      flush();
      flushTable();
      continue;
    }
    const cells = parseMdRow(t);
    if (cells) {
      flush();
      if (!cells.length) continue;
      if (!table) table = [cells];
      else table.push(cells);
      continue;
    }
    flushTable();
    if (/^[-*]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
      list.push(t.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""));
      continue;
    }
    flush();
    const h = t.match(/^(#{1,4})\s+(.*)$/);
    const boldH = t.match(/^([A-Z][A-Za-z0-9 /&+\-]{2,48})$/);
    const labeled = t.match(/^([A-Za-z][A-Za-z0-9 /&+\-]{2,40})\s*[:：]\s*(.+)$/);
    if (h || (boldH && t.length < 48 && !/[.!?]$/.test(t))) {
      const title = (h ? h[2] : boldH![1]).trim();
      if (/final verdict|multi-?bagger potential/i.test(title)) continue;
      const cls =
        h && h[1].length <= 2
          ? "mt-5 text-[15px] font-semibold tracking-tight text-fg"
          : "mt-4 text-[13px] font-semibold tracking-[0.06em] text-chart uppercase";
      nodes.push(
        <h4 key={"h" + nodes.length} className={cls}>
          {title}
        </h4>,
      );
      continue;
    }
    if (labeled && labeled[2].length < 160 && !/[.!?]$/.test(labeled[1])) {
      const tone = noteTone(labeled[2]);
      nodes.push(
        <p key={"p" + nodes.length} className="mt-2 flex flex-wrap items-baseline gap-2 text-[14px] leading-relaxed text-fg">
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[11px] font-medium",
              tone === "up" && "bg-up/15 text-up",
              tone === "down" && "bg-down/15 text-down",
              tone === "muted" && "bg-surface-2 text-muted",
            )}
          >
            {labeled[1]}
          </span>
          {color ? <ColorLine text={labeled[2]} /> : labeled[2]}
        </p>,
      );
      continue;
    }
    nodes.push(
      <p key={"p" + nodes.length} className="mt-2 text-[14px] leading-relaxed text-fg">
        {color ? <ColorLine text={t} /> : t}
      </p>,
    );
  }
  flush();
  flushTable();
  return (
    <div className="mt-2">
      {pin.potential || pin.verdict || pin.factors.length ? (
        <div className="mb-4 rounded-md bg-bg-elevated px-3 py-3 shadow-[var(--shadow-border)]">
          {pin.potential ? (
            <div className="mb-2">
              <PotentialChip label={pin.potential} />
            </div>
          ) : null}
          {pin.verdict ? (
            <p className="text-[15px] font-medium leading-relaxed text-fg">
              {color ? <ColorLine text={pin.verdict} /> : pin.verdict}
            </p>
          ) : null}
          {pin.factors.length ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {pin.factors.map((f) => (
                <li
                  key={f.name}
                  className={cn(
                    "rounded-sm px-2 py-0.5 text-[11px] font-medium",
                    f.tone === "up" && "bg-up/15 text-up",
                    f.tone === "down" && "bg-down/15 text-down",
                    f.tone === "muted" && "bg-surface-2 text-muted",
                  )}
                  title={f.note}
                >
                  {f.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {nodes}
    </div>
  );
}

function parseMdRow(t: string): string[] | null {
  const s = t.trim();
  if (!s.includes("|")) return null;
  if (!s.startsWith("|") && (s.match(/\|/g) || []).length < 2) return null;
  const cells = s.split("|").map((x) => x.trim());
  if (s.startsWith("|")) cells.shift();
  if (s.endsWith("|") || cells[cells.length - 1] === "") cells.pop();
  if (cells.length < 2) return null;
  if (cells.every((c) => /^:?-{2,}:?$/.test(c))) return [];
  return cells;
}

function noteTone(note: string): "up" | "down" | "muted" {
  const s = note.toLowerCase();
  if (/weak|stretched|expensive|high debt|pledge|decline|fragile|poor|deteriorat|overvalued|risky|avoid|low\b/.test(s)) return "down";
  if (/strong|healthy|cheap|durable|sound|conservative|solid|reasonable|fair|robust|clean|high\b/.test(s)) return "up";
  return "muted";
}

function stripMarks(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|\s)\*(\S)/g, "$1$2")
    .replace(/(\S)\*(?=\s|$)/g, "$1")
    .replace(/_{2,}/g, "");
}

function extractPin(text: string) {
  const lines = text.split("\n");
  let verdict = "";
  let potential = "";
  const keep: string[] = [];
  let grabbing: "verdict" | "potential" | null = null;
  const verdictBuf: string[] = [];
  const factors: { name: string; tone: "up" | "down" | "muted"; note: string }[] = [];
  const seen = new Set<string>();

  function pushFactor(name: string, note: string) {
    const key = name.toLowerCase();
    if (seen.has(key) || note.length < 4) return;
    seen.add(key);
    const s = note.toLowerCase();
    const tone: "up" | "down" | "muted" =
      /weak|stretched|expensive|high debt|pledge|decline|fragile|poor|deteriorat|overvalued|risky/.test(s)
        ? "down"
        : /strong|healthy|cheap|durable|sound|conservative|solid|reasonable|fair|robust|clean/.test(s)
          ? "up"
          : "muted";
    factors.push({ name, tone, note: note.slice(0, 160) });
  }

  for (const raw of lines) {
    const t = raw.trim();
    if (/^#{1,4}\s*final verdict\b/i.test(t) || /^final verdict\b/i.test(t)) {
      grabbing = "verdict";
      continue;
    }
    if (/multi-?bagger potential/i.test(t) && t.length < 80) {
      const m = t.match(/multi-?bagger potential\s*[:\-–]\s*(high|moderate|medium|low|unlikely)/i);
      if (m) {
        const rawL = m[1].toLowerCase();
        potential = rawL === "medium" ? "Moderate" : rawL.slice(0, 1).toUpperCase() + rawL.slice(1);
      }
      grabbing = grabbing === "verdict" ? "verdict" : "potential";
      continue;
    }
    if (/^#{1,4}\s+/.test(t) || (/^[A-Z][A-Za-z0-9 /&+\-]{2,40}$/.test(t) && t.length < 48)) {
      grabbing = null;
    }
    if (grabbing === "verdict" && t) verdictBuf.push(t);
    const factorHit = t.match(
      /^(?:#{1,4}\s+)?(Profitability|Balance sheet|Leverage|Growth|Valuation|Ownership|Promoter(?:s)?|Management|Industry|Brand|Moat|Capital allocation)\s*[:.]?\s*(.*)$/i,
    );
    if (factorHit) pushFactor(factorHit[1].replace(/^./, (c) => c.toUpperCase()), factorHit[2] || factorHit[1]);
    keep.push(raw);
  }
  verdict = verdictBuf.filter((p) => !/^#{1,4}/.test(p)).join(" ").trim();
  if (!potential) {
    const m = text.match(/multi-?bagger potential\s*[:\-–]\s*(high|moderate|medium|low|unlikely)/i);
    if (m) {
      const rawL = m[1].toLowerCase();
      potential = rawL === "medium" ? "Moderate" : rawL.slice(0, 1).toUpperCase() + rawL.slice(1);
    }
  }
  const body = keep
    .filter((ln) => {
      const t = ln.trim();
      if (/^#{1,4}\s*final verdict\b/i.test(t) || /^final verdict\b/i.test(t)) return false;
      return true;
    })
    .join("\n");
  return { verdict, potential, factors: factors.slice(0, 8), body };
}

function PotentialChip({ label }: { label: string }) {
  if (!label) return null;
  const s = label.toLowerCase();
  const tone = s === "high" ? "text-up bg-up/15" : s === "moderate" ? "text-warn bg-warn/15" : "text-down bg-down/15";
  return (
    <span className={cn("rounded-sm px-2 py-0.5 text-[12px] font-medium", tone)}>
      Multi-bagger potential: {label}
    </span>
  );
}

export function FundamentalView({ block }: { block: FundBlock; fund?: Fundamentals | null }) {
  const prose = block.prose && block.prose.length > 40 ? block.prose : "";
  return (
    <article className="rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]" data-skill="fundamental">
      <Label>Fundamental analysis</Label>
      {prose ? (
        <SkillMarkdown text={prose} color />
      ) : (
        <>
          {block.verdict ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg">{block.verdict}</p> : null}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {block.business ? (
              <div>
                <Label>Business</Label>
                <P>{block.business}</P>
              </div>
            ) : null}
            {block.industry ? (
              <div>
                <Label>Industry</Label>
                <P>{block.industry}</P>
              </div>
            ) : null}
            {block.position ? (
              <div>
                <Label>Position</Label>
                <P>{block.position}</P>
              </div>
            ) : null}
            {block.profitability ? (
              <div>
                <Label>Profitability</Label>
                <P>{block.profitability}</P>
              </div>
            ) : null}
            {block.valuation ? (
              <div>
                <Label>Valuation</Label>
                <P>{block.valuation}</P>
              </div>
            ) : null}
            {block.balanceSheet ? (
              <div>
                <Label tone="muted">Balance sheet</Label>
                <P>{block.balanceSheet}</P>
              </div>
            ) : null}
            {block.growth ? (
              <div>
                <Label>Growth</Label>
                <P>{block.growth}</P>
              </div>
            ) : null}
          </div>
          {block.snapshot ? (
            <Block label="Company" tone="muted">
              <P>{block.snapshot}</P>
            </Block>
          ) : null}
          <Block label="Risks" tone="down">
            <Bullets items={block.risks.slice(0, 3)} tone="down" />
          </Block>
          <Block label="What would change this">
            <Bullets items={block.changeMind.slice(0, 2)} />
          </Block>
        </>
      )}
    </article>
  );
}

function factorTone(s: QualFactor["status"]) {
  if (s === "positive") return { chip: "bg-up/15 text-up", bar: "bg-up" };
  if (s === "negative") return { chip: "bg-down/15 text-down", bar: "bg-down" };
  if (s === "watch") return { chip: "bg-warn/20 text-warn", bar: "bg-warn" };
  return { chip: "bg-surface-2 text-muted", bar: "bg-subtle" };
}

export function QualitativeView({ block }: { block: QualBlock }) {
  const prose = block.prose && block.prose.length > 40 ? block.prose : "";
  return (
    <article className="rounded-lg border-l-[3px] border-l-warn bg-surface p-4 shadow-[var(--shadow-border)]" data-skill="qualitative">
      <Label tone="warn">Qualitative analysis</Label>
      {block.potentialLabel ? (
        <div className="mt-3">
          <PotentialChip label={block.potentialLabel} />
        </div>
      ) : null}
      {prose ? (
        <SkillMarkdown text={prose} color />
      ) : (
        <>
          {block.headline && block.headline !== block.tag ? (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg">{block.headline}</p>
          ) : null}
          {block.verdict ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg">{block.verdict}</p> : null}
          {block.allFactors.length ? (
            <Block label="All-factor check" tone="muted">
              <ul className="mt-2 grid gap-2.5">
                {block.allFactors.slice(0, 8).map((f) => {
                  const t = factorTone(f.status);
                  return (
                    <li key={f.name} className="flex gap-2">
                      <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", t.bar)} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13.5px] font-medium">{f.name}</span>
                          <span className={cn("rounded-sm px-1.5 py-0.5 text-[11px]", t.chip)}>{f.status}</span>
                        </div>
                        {f.note ? <p className="mt-0.5 text-[13px] leading-snug text-muted">{f.note}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Block>
          ) : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Block label="Positive" tone="up">
              <Bullets items={block.positive.slice(0, 3)} />
            </Block>
            <Block label="Combinations" tone="warn">
              <Bullets items={block.combinations.slice(0, 2)} tone="warn" />
            </Block>
          </div>
          <Block label="Catalysts" tone="warn">
            <Bullets items={block.catalysts.slice(0, 2)} tone="warn" />
          </Block>
          {block.pricedIn ? (
            <Block label="Already in the price" tone="muted">
              <P>{block.pricedIn}</P>
            </Block>
          ) : null}
          {block.noise ? (
            <Block label="Noise" tone="muted">
              <P>{block.noise}</P>
            </Block>
          ) : null}
        </>
      )}
    </article>
  );
}

export function CombinedView({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <article className="rounded-lg border-l-[3px] border-l-fg bg-surface p-4 shadow-[var(--shadow-border)]" data-skill="combined">
      <Label tone="muted">Combined verdict</Label>
      <h3 className="mt-2 text-[22px] font-semibold tracking-tight">One read from both</h3>
      <p className="mt-1 text-[12px] text-muted">Uses the two analyses above. Not a third independent read.</p>
      <SkillMarkdown text={text} color />
    </article>
  );
}

export function AnalysisSkeleton({ kicker }: { kicker: string }) {
  return (
    <article className="rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="h-3 w-32 rounded-sm bg-chart/70" />
      <div className="mt-3 h-5 w-4/5 animate-pulse rounded-sm bg-surface-2" />
      <div className="mt-4 h-24 animate-pulse rounded-sm bg-surface-2" />
      <div className="mt-3 h-24 animate-pulse rounded-sm bg-surface-2" />
      <p className="mt-3 text-[12px] text-muted">Reading {kicker}…</p>
    </article>
  );
}

export function StructureView({ block }: { block: StructureBlock }) {
  const tone = block.bias === "up" ? "up" : block.bias === "down" ? "down" : "muted";
  const fmt = (n: number) => (n > 0 ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—");
  return (
    <article className="rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]" data-skill="structure">
      <Label>Structure</Label>
      <TagLine tag={block.tag} tone="chart" />
      <div className="mt-2 text-[11px] tracking-[0.08em] text-subtle uppercase">
        Bias <span className={cn("font-medium", tone === "up" && "text-up", tone === "down" && "text-down")}>{block.bias}</span>
      </div>
      {block.setup ? <P>{block.setup}</P> : null}
      {block.support.length || block.resistance.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-[13px]">
            <thead className="text-[11px] tracking-[0.08em] text-subtle uppercase">
              <tr className="border-b border-border">
                <th className="py-1.5 pr-3 font-medium">Side</th>
                <th className="py-1.5 pr-3 font-medium">Level</th>
                <th className="py-1.5 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {block.support.map((r, i) => (
                <tr key={"s" + i} className="border-b border-border/60">
                  <td className="py-1.5 pr-3 text-up">Support</td>
                  <td className="py-1.5 pr-3 font-mono tabular">{fmt(r.price)}</td>
                  <td className="py-1.5 text-muted">{r.note}</td>
                </tr>
              ))}
              {block.resistance.map((r, i) => (
                <tr key={"r" + i} className="border-b border-border/60">
                  <td className="py-1.5 pr-3 text-down">Resistance</td>
                  <td className="py-1.5 pr-3 font-mono tabular">{fmt(r.price)}</td>
                  <td className="py-1.5 text-muted">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Block label="Levels" tone="muted">
          <Bullets items={block.levels.slice(0, 6)} />
        </Block>
      )}
      {block.swings.length ? (
        <div className="mt-4">
          <Label tone="muted">HH / HL</Label>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {block.swings.slice(0, 10).map((s, i) => (
              <li key={s.label + i} className="rounded-sm bg-bg px-2 py-1 font-mono text-[12px] tabular shadow-[var(--shadow-border)]">
                {s.label} {s.price ? fmt(s.price) : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {block.mtf.length ? (
        <Block label="Multi-timeframe" tone="warn">
          <Bullets items={block.mtf.slice(0, 4)} tone="warn" />
        </Block>
      ) : null}
      {block.invalidation ? (
        <Block label="Invalidation" tone="down">
          <P>{block.invalidation}</P>
        </Block>
      ) : null}
      {block.verdict ? (
        <Block label="Read">
          <P>{block.verdict}</P>
        </Block>
      ) : null}
    </article>
  );
}
