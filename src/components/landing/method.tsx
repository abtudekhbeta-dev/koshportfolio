import { useEffect, useId, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { buildMixPath, istDay } from "@/lib/kosh/engine";
import type { Bar, Holding, NavPoint } from "@/lib/kosh/types";
import { cn } from "@/lib/utils";
import { useInView } from "./reveal";

const N = 28;
const LATE = 12;
const W = 560;
const H = 148;

function bars(start: number, n: number, px0: number, daily: number, wobble: number): Bar[] {
  const t0 = Date.UTC(2018, 0, 2, 10, 0, 0) / 1000;
  const out: Bar[] = [];
  let px = px0;
  for (let i = 0; i < n; i++) {
    out.push({ t: t0 + (start + i) * 86400, c: px });
    px *= 1 + daily + Math.sin(i / 4.2) * wobble;
  }
  return out;
}

const HOLDINGS: Holding[] = [
  { symbol: "RELIANCE", name: "Reliance", qty: 40, avg: 100, date: null },
  { symbol: "TCS", name: "TCS", qty: 35, avg: 100, date: null },
  { symbol: "PAYTM", name: "Paytm", qty: 25, avg: 100, date: null },
];

function synth() {
  const hx = {
    RELIANCE: bars(0, N, 100, 0.0042, 0.0014),
    TCS: bars(0, N, 100, 0.0034, 0.0011),
    PAYTM: bars(LATE, N - LATE, 118, 0.0055, 0.002),
  };
  const mix = buildMixPath(HOLDINGS, hx, []);
  const maps = HOLDINGS.map((h) => ({
    h,
    days: new Set((hx[h.symbol as keyof typeof hx] || []).map((b) => istDay(b.t))),
  }));
  const allDays = [...new Set(Object.values(hx).flatMap((b) => b.map((x) => istDay(x.t))))].sort();
  const mixBy = new Map(mix.nav.map((p) => [p.day, p.port]));
  const inner = innerJoin(HOLDINGS, hx);
  const innerBy = new Map(inner.map((p) => [p.day, p.port]));
  return {
    days: allDays,
    mixDense: allDays.map((d) => mixBy.get(d) ?? null),
    innerDense: allDays.map((d) => innerBy.get(d) ?? null),
    listed: maps.map((m) => allDays.map((d) => m.days.has(d))),
    mixLast: mix.nav.at(-1)?.port ?? 100,
    innerLast: inner.at(-1)?.port ?? 100,
    mixSessions: mix.nav.length,
    innerSessions: inner.length,
  };
}

function innerJoin(holdings: Holding[], hx: Record<string, Bar[]>): NavPoint[] {
  const maps = holdings.map((h) => ({
    h,
    m: new Map((hx[h.symbol] || []).map((b) => [istDay(b.t), b])),
  }));
  const days = [...maps[0].m.keys()].filter((d) => maps.every((x) => x.m.has(d))).sort();
  const w = 1 / holdings.length;
  const prev: Record<string, number> = {};
  let nav = 100;
  const out: NavPoint[] = [];
  for (const day of days) {
    let wr = 0;
    let avail = 0;
    let t = 0;
    for (const { h, m } of maps) {
      const b = m.get(day)!;
      t = b.t;
      if (prev[h.symbol] > 0) {
        wr += w * (b.c / prev[h.symbol] - 1);
        avail += w;
      }
      prev[h.symbol] = b.c;
    }
    if (avail < 0.99) continue;
    nav *= 1 + wr / avail;
    out.push({ t, day, port: nav, bench: null, covered: holdings.length, names: holdings.length, wAvail: 1 });
  }
  return out;
}

function linePath(vals: (number | null)[], min: number, max: number) {
  let d = "";
  let started = false;
  const span = Math.max(1, vals.length - 1);
  vals.forEach((v, i) => {
    if (v == null) return;
    const x = (i / span) * W;
    const y = H - ((v - min) / (max - min)) * H;
    d += `${started ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    started = true;
  });
  return d;
}

function usePlay(active: boolean, ms = 2200) {
  const [t, setT] = useState(0);
  const gen = useRef(0);

  useEffect(() => {
    if (!active) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setT(1);
      return;
    }
    const my = ++gen.current;
    setT(0);
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (my !== gen.current) return;
      const p = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setT(e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ms]);

  function replay() {
    gen.current += 1;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setT(1);
      return;
    }
    setT(0);
    const t0 = performance.now();
    const my = gen.current;
    const step = (now: number) => {
      if (my !== gen.current) return;
      const p = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setT(e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  return { t, replay };
}

function Panel({
  title,
  hint,
  listed,
  dense,
  t,
  stroke,
  clipId,
  lost,
  yMin,
  yMax,
}: {
  title: string;
  hint: string;
  listed: boolean[][];
  dense: (number | null)[];
  t: number;
  stroke: string;
  clipId: string;
  lost?: string;
  yMin: number;
  yMax: number;
}) {
  const d = useMemo(() => linePath(dense, yMin, yMax), [dense, yMin, yMax]);
  const names = ["RELIANCE", "TCS", "PAYTM"];
  const playI = t * (N - 1);
  const lateX = (LATE / (N - 1)) * W;

  return (
    <article className="rounded-[28px] bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">{title}</div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{hint}</p>
        </div>
        {lost ? <div className="shrink-0 font-mono text-[12px] text-down tabular">{lost}</div> : null}
      </div>
      <div className="mt-5 grid gap-2">
        {names.map((n, i) => (
          <div key={n} className="grid grid-cols-[76px_1fr] items-center gap-3 text-[11px]">
            <div className="truncate font-mono text-subtle">{n}</div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-2">
              {listed[i].map((on, d) => (
                <span
                  key={d}
                  className="h-full flex-1"
                  style={{
                    background: on && d <= playI ? stroke : "transparent",
                    opacity: on && d <= playI ? (i === 2 ? 0.85 : 1) : 0,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 h-[132px] w-full" role="img" aria-label={title}>
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={Math.max(0, t * W)} height={H} />
          </clipPath>
        </defs>
        {[0, 37, 74, 111, 148].map((y) => (
          <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="currentColor" className="text-border" strokeWidth="1" />
        ))}
        {lost ? <rect x="0" y="0" width={lateX} height={H} fill="#ef6e6e" opacity="0.08" /> : null}
        <path d={d} fill="none" stroke={stroke} strokeWidth="1.4" opacity="0.18" />
        <path d={d} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" clipPath={`url(#${clipId})`} />
        <line x1={lateX} x2={lateX} y1="0" y2={H} stroke="#6e6e76" strokeWidth="1" strokeDasharray="3 4" />
        {lost ? (
          <text x={lateX / 2} y={H / 2} textAnchor="middle" fill="#6e6e76" fontSize="11">
            waiting
          </text>
        ) : null}
        <line
          x1={t * W}
          x2={t * W}
          y1="0"
          y2={H}
          stroke="currentColor"
          className="text-fg"
          strokeWidth="1"
          opacity="0.35"
        />
      </svg>
    </article>
  );
}

export function JoinDemo() {
  const { ref, on } = useInView();
  const { t, replay } = usePlay(on);
  const data = useMemo(() => synth(), []);
  const uid = useId().replace(/:/g, "");
  const lateT = LATE / (N - 1);
  const caption =
    t < lateT
      ? "Before Paytm listed, the old method has nothing to draw. Kosh is already compounding Reliance and TCS."
      : "Paytm lists. Kosh adds it from that day — the line does not jump. The old method only now starts, having thrown the early years away.";

  return (
    <div ref={ref}>
      <div className="grid gap-3 lg:grid-cols-2">
        <Panel
          title="Old method"
          hint="A day only counts when every stock has a price. The last listing wipes everything before it."
          listed={data.listed}
          dense={data.innerDense}
          t={t}
          stroke="#9a9aa4"
          clipId={`${uid}-in`}
          lost={`${N - data.innerSessions} sessions lost`}
          yMin={99}
          yMax={114}
        />
        <Panel
          title="Kosh"
          hint="Every market day where enough of the portfolio has a price. Quiet names are held at last close."
          listed={data.listed}
          dense={data.mixDense}
          t={t}
          stroke="#7aa2ff"
          clipId={`${uid}-mx`}
          yMin={99}
          yMax={114}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-[13px] leading-relaxed text-muted">{caption}</p>
        <button
          type="button"
          onClick={replay}
          className="inline-flex h-9 items-center gap-1.5 rounded-sm px-2.5 text-[13px] text-muted transition-colors duration-150 hover:text-fg"
        >
          <RotateCcw className="size-3.5" />
          Replay
        </button>
      </div>
    </div>
  );
}

const LEDGER = [
  { name: "RELIANCE", w: 31, r: 0.82, contrib: 0.254, carry: false },
  { name: "TCS", w: 24, r: 0.41, contrib: 0.098, carry: false },
  { name: "HDFCBANK", w: 18, r: 0, contrib: 0, carry: true },
  { name: "INFY", w: 12, r: 1.1, contrib: 0.132, carry: false },
  { name: "BHARTIARTL", w: 9, r: 0.3, contrib: 0.027, carry: false },
];

export function MixLedger() {
  const { ref, on } = useInView();
  const [gen, setGen] = useState(0);

  return (
    <div ref={ref}>
      <div key={gen} className={cn("overflow-hidden rounded-[28px] bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6", on && "kosh-ledger")}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">One IST session</div>
            <div className="mt-1 font-mono text-[13px] text-muted tabular">14 Jun 2018</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">Your day</div>
            <div className="kosh-ledger-sum mt-0.5 font-mono text-[22px] font-medium text-up tabular">+0.72%</div>
          </div>
        </div>
        <div className="mt-5 grid gap-0">
          <div className="grid grid-cols-[1fr_56px_72px_72px] gap-2 border-b border-border pb-2 text-[10px] tracking-[0.08em] text-subtle uppercase">
            <span>Name</span>
            <span className="text-right">Weight</span>
            <span className="text-right">Return</span>
            <span className="text-right">Contrib</span>
          </div>
          {LEDGER.map((r) => (
            <div
              key={r.name}
              className="kosh-ledger-row grid grid-cols-[1fr_56px_72px_72px] gap-2 border-b border-border/60 py-2.5 font-mono text-[12px] tabular"
            >
              <span className="truncate text-fg">{r.name}</span>
              <span className="text-right text-muted">{r.w}%</span>
              <span className={cn("text-right", r.carry ? "text-subtle" : "text-muted")}>
                {r.carry ? "carry" : `+${r.r.toFixed(2)}%`}
              </span>
              <span className={cn("text-right", r.carry ? "text-subtle" : "text-fg")}>
                {r.carry ? "0.00" : `+${r.contrib.toFixed(3)}`}
              </span>
            </div>
          ))}
        </div>
        <div className="kosh-ledger-row mt-4 flex items-center gap-3 text-[12px]">
          <div className="flex-1">
            <div className="mb-1.5 flex justify-between text-[10px] tracking-[0.08em] text-subtle uppercase">
              <span>Coverage</span>
              <span className="font-mono tabular">94% · keep</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className={cn("h-full rounded-full bg-chart", on && "kosh-bar")} style={{ width: "94%" }} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-muted">
          HDFC Bank did not print that day. Last close is carried — it adds nothing, the day still counts.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setGen((g) => g + 1)}
        className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-sm px-2.5 text-[13px] text-muted transition-colors duration-150 hover:text-fg"
      >
        <RotateCcw className="size-3.5" />
        Replay the session
      </button>
    </div>
  );
}

const WINDOWS: { k: string; mix: string; nifty: string; up: boolean }[] = [
  { k: "1W", mix: "+1.4%", nifty: "+0.9%", up: true },
  { k: "1M", mix: "+3.8%", nifty: "+2.1%", up: true },
  { k: "3M", mix: "+8.2%", nifty: "+5.4%", up: true },
  { k: "6M", mix: "+12.1%", nifty: "+8.6%", up: true },
  { k: "1Y", mix: "+18.4%", nifty: "+10.3%", up: true },
  { k: "YTD", mix: "+9.1%", nifty: "+6.0%", up: true },
];

export function WindowsPreview() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {WINDOWS.map((w, i) => (
        <div
          key={w.k}
          className="kosh-rise rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">{w.k}</div>
          <div className="mt-2 text-[12px] text-muted">
            You <b className="text-up">{w.mix}</b>
          </div>
          <div className="mt-0.5 text-[12px] text-muted">
            Nifty <b className="text-fg">{w.nifty}</b>
          </div>
        </div>
      ))}
    </div>
  );
}
