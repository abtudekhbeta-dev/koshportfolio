/** Annualised XIRR from dated buys to today's mark. Not a broker figure. */

export type XirrLine = {
  date: string | null;
  boughtAt?: string | null;
  qty: number;
  avg: number | null;
  px: number;
  value: number;
  lots?: { qty: number; avg: number; date: string | null; boughtAt?: string | null }[];
};

export type XirrResult = {
  xirr: number | null;
  note: string | null;
  datedValue: number;
  missingValue: number;
  from: string | null;
  nDated: number;
  nMissing: number;
};

function solve(flows: { t: number; v: number }[]): { rate: number | null; note: string | null } {
  if (flows.length < 2) return { rate: null, note: "XIRR unavailable — not enough cash flows." };
  const sorted = [...flows].sort((a, b) => a.t - b.t);
  const t0 = sorted[0].t;
  const yr = (t: number) => (t - t0) / (365.25 * 86400 * 1000);
  const npv = (r: number) => sorted.reduce((s, f) => s + f.v / Math.pow(1 + r, yr(f.t)), 0);
  const pos = sorted.some((f) => f.v > 0);
  const neg = sorted.some((f) => f.v < 0);
  if (!pos || !neg) return { rate: null, note: "XIRR unavailable — cash flows do not change sign." };

  const newton = () => {
    let r = 0.1;
    for (let i = 0; i < 60; i++) {
      const y = npv(r);
      const d = (npv(r + 1e-6) - y) / 1e-6;
      if (!Number.isFinite(y) || !Number.isFinite(d) || Math.abs(d) < 1e-12) return null;
      const next = r - y / d;
      if (!Number.isFinite(next) || next <= -0.9 || next > 10) return null;
      if (Math.abs(next - r) < 1e-8) return Math.abs(npv(next)) < 1 ? next : null;
      r = next;
    }
    return Math.abs(npv(r)) < 1 ? r : null;
  };

  const bisect = (lo0: number, hi0: number): number | null => {
    let lo = lo0;
    let hi = hi0;
    let flo = npv(lo);
    let fhi = npv(hi);
    if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) return null;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      const fm = npv(mid);
      if (!Number.isFinite(fm)) return null;
      if (Math.abs(fm) < 1e-6 || hi - lo < 1e-8) return mid;
      if (flo * fm <= 0) {
        hi = mid;
        fhi = fm;
      } else {
        lo = mid;
        flo = fm;
      }
    }
    return (lo + hi) / 2;
  };

  const a = newton();
  const b = bisect(-0.9, 5);
  if (a != null && b != null && Math.abs(a - b) > 0.02) {
    const c = bisect(Math.min(a, b) + 0.05, 8);
    if (c != null && Math.abs(c - a) > 0.02 && Math.abs(c - b) > 0.02) {
      return { rate: null, note: "XIRR ambiguous / multiple solutions." };
    }
  }
  const pick = a ?? b;
  if (pick == null || !Number.isFinite(pick)) return { rate: null, note: "XIRR unavailable — no root in range." };
  return { rate: pick * 100, note: null };
}

/** Annualised XIRR from dated cash flows (negative = money out). Null if there is no sign change or the root is ambiguous. */
export function xirrFromFlows(flows: { t: number; v: number }[]): number | null {
  return solve(flows).rate;
}

export function bookXirr(lines: XirrLine[], datedOnly: boolean, asOf = Date.now()): XirrResult {
  let datedValue = 0;
  let missingValue = 0;
  let nDated = 0;
  let nMissing = 0;
  const flows: { t: number; v: number }[] = [];
  let from: string | null = null;
  for (const l of lines) {
    const parts =
      l.lots && l.lots.length
        ? l.lots.map((lot) => ({
            date: lot.date,
            boughtAt: lot.boughtAt || lot.date,
            qty: lot.qty,
            avg: lot.avg,
            px: l.px,
            value: lot.qty * (l.px || 0),
          }))
        : [l];
    for (const p of parts) {
      const val = p.value || p.qty * (p.px || 0);
      const when = p.boughtAt || p.date;
      if (when && p.avg != null && p.avg > 0 && p.qty > 0) {
        const t = Date.parse(when);
        if (Number.isFinite(t)) {
          datedValue += val;
          nDated += 1;
          flows.push({ t, v: -(p.avg * p.qty) });
          const day = when.slice(0, 10);
          if (!from || day < from) from = day;
          continue;
        }
      }
      missingValue += val;
      nMissing += 1;
    }
  }
  if (datedOnly) {
    /* exclude undated from terminal value */
  } else if (nMissing && !datedOnly) {
    /* still only XIRR on dated cashflows */
  }
  if (flows.length && datedValue > 0) {
    flows.push({ t: asOf, v: datedValue });
  }
  const solved = solve(flows);
  return {
    xirr: solved.rate,
    note: solved.note,
    datedValue,
    missingValue,
    from,
    nDated,
    nMissing,
  };
}
