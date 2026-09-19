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
  datedValue: number;
  missingValue: number;
  from: string | null;
  nDated: number;
  nMissing: number;
};

function newton(flows: { t: number; v: number }[]): number | null {
  if (flows.length < 2) return null;
  const sorted = [...flows].sort((a, b) => a.t - b.t);
  const t0 = sorted[0].t;
  const yr = (t: number) => (t - t0) / (365.25 * 86400 * 1000);
  const npv = (r: number) => sorted.reduce((s, f) => s + f.v / Math.pow(1 + r, yr(f.t)), 0);
  let r = 0.12;
  for (let i = 0; i < 80; i++) {
    const y = npv(r);
    const d = (npv(r + 1e-6) - y) / 1e-6;
    if (!Number.isFinite(d) || Math.abs(d) < 1e-14) break;
    const next = r - y / d;
    if (!Number.isFinite(next) || next <= -0.99 || next > 20) break;
    if (Math.abs(next - r) < 1e-8) return Math.abs(npv(next)) < 5 ? next * 100 : null;
    r = next;
  }
  return Math.abs(npv(r)) < 5 ? r * 100 : null;
}

/** Annualised XIRR from dated cash flows (negative = money out). */
export function xirrFromFlows(flows: { t: number; v: number }[]): number | null {
  return newton(flows);
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
  return {
    xirr: newton(flows),
    datedValue,
    missingValue,
    from,
    nDated,
    nMissing,
  };
}
