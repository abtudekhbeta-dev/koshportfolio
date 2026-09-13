import { useEffect, useMemo, useState } from "react";

const MIX = [100, 101.4, 99.2, 103.8, 107.6, 106.1, 111.4, 117.8, 114.6, 121.2, 118.9, 126.4, 130.1, 127.8, 134.6, 141.2, 138.4, 146.1, 152.4, 149.6, 157.2, 162.8, 159.4, 166.2];
const BENCH = [100, 100.8, 98.4, 101.9, 104.6, 103.4, 107.2, 110.8, 108.6, 113.4, 112.1, 116.6, 119.4, 117.2, 121.8, 125.6, 123.4, 128.2, 132.4, 130.1, 134.8, 138.2, 135.8, 140.6];

function toPath(vals: number[], w: number, h: number) {
  const min = 90;
  const max = 172;
  const n = vals.length;
  return vals
    .map((v, i) => {
      const x = (i / (n - 1)) * w;
      const y = h - ((v - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function Count({ to, suffix = "", digits = 1 }: { to: number; suffix?: string; digits?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(to);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      const e = 1 - Math.pow(1 - p, 3);
      setN(to * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <span className="tabular font-mono">
      {n.toFixed(digits)}
      {suffix}
    </span>
  );
}

export function HeroMix() {
  const mix = useMemo(() => toPath(MIX, 640, 220), []);
  const bench = useMemo(() => toPath(BENCH, 640, 220), []);

  return (
    <div className="overflow-hidden rounded-[28px] bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">A sample portfolio versus Nifty 50</div>
          <div className="mt-1 text-[13px] text-muted">What your holdings path looks like — open a portfolio for yours</div>
        </div>
        <div className="flex gap-4 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-3.5 rounded-full bg-chart" />
            You <b className="text-fg"><Count to={66.2} suffix="%" /></b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-3.5 rounded-full bg-chart-bench" />
            Nifty <b className="text-fg"><Count to={40.6} suffix="%" /></b>
          </span>
        </div>
      </div>
      <svg viewBox="0 0 640 220" className="h-[180px] w-full sm:h-[210px]" role="img" aria-label="Sample portfolio beating Nifty 50 over ten years">
        <defs>
          <linearGradient id="koshFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7aa2ff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#7aa2ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 55, 110, 165, 220].map((y) => (
          <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="currentColor" className="text-border" strokeWidth="1" />
        ))}
        <path d={`${mix} L640,220 L0,220 Z`} fill="url(#koshFill)" className="kosh-fade" />
        <path d={bench} fill="none" stroke="#9a9aa4" strokeWidth="1.7" strokeDasharray="5 4" className="kosh-draw kosh-draw-bench" />
        <path d={mix} fill="none" stroke="#7aa2ff" strokeWidth="2.3" strokeLinecap="round" className="kosh-draw kosh-draw-mix" />
      </svg>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
        {[
          ["Coverage", "8/8 names"],
          ["Sessions", "2,480"],
          ["1Y gap", "+8.1 pp"],
        ].map(([k, v], i) => (
          <div key={k} className="kosh-rise rounded-lg bg-bg-elevated px-3 py-2.5" style={{ animationDelay: `${180 + i * 80}ms` }}>
            <div className="text-[10px] tracking-[0.08em] text-subtle uppercase">{k}</div>
            <div className="mt-0.5 font-mono text-fg tabular">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SLEEVES = [
  { name: "Financials", pct: 32 },
  { name: "Telecom", pct: 22 },
  { name: "IT", pct: 18 },
  { name: "Energy", pct: 12 },
  { name: "Healthcare", pct: 9 },
  { name: "FMCG", pct: 7 },
];

export function HeroSleeves() {
  return (
    <div className="rounded-[28px] bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Where the money sits</div>
      <div className="mt-4 grid gap-2.5">
        {SLEEVES.map((s, i) => (
          <div key={s.name} className="grid grid-cols-[92px_1fr_36px] items-center gap-2 text-[12px]">
            <div className="truncate text-muted">{s.name}</div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="kosh-bar h-full rounded-full bg-chart"
                style={{ width: `${s.pct}%`, animationDelay: `${220 + i * 70}ms` }}
              />
            </div>
            <div className="text-right font-mono tabular text-subtle">{s.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
