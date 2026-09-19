/** Sales / profit chart helpers — labels, units, period names. Not a guess at the numbers. */

import type { FinPoint } from "./types";

export type FinKind = "year" | "quarter";

export type FinRow = {
  period: string;
  label: string;
  sales: number | null;
  profit: number | null;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MON: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function year2(n: number) {
  const y = n < 100 ? (n >= 70 ? 1900 + n : 2000 + n) : n;
  return y;
}

export function parsePeriod(period: string): { y: number; m: number; t: number } | null {
  const s = String(period || "").trim();
  const iso = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    return { y, m, t: y * 100 + m };
  }
  if (/^\d{4}$/.test(s)) {
    const y = Number(s);
    return { y, m: 3, t: y * 100 + 3 };
  }
  const fy = s.match(/^FY\s*['’′]?(\d{2}|\d{4})$/i);
  if (fy) {
    const y = year2(Number(fy[1]));
    return { y, m: 3, t: y * 100 + 3 };
  }
  const mon = s.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*['’′\-]?\s*(\d{2}|\d{4})$/i);
  if (mon) {
    const m = MON[mon[1].slice(0, 3).toLowerCase()];
    const y = year2(Number(mon[2]));
    return { y, m, t: y * 100 + m };
  }
  const nse = s.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[a-z]*\.?[-/ ](\d{2}|\d{4})$/);
  if (nse) {
    const m = MON[nse[2].slice(0, 3).toLowerCase()];
    const y = year2(Number(nse[3]));
    if (m) return { y, m, t: y * 100 + m };
  }
  const q = s.match(/^Q([1-4])\s*FY\s*['’′]?(\d{2}|\d{4})$/i);
  if (q) {
    const qi = Number(q[1]);
    const fyY = year2(Number(q[2]));
    const m = qi === 1 ? 6 : qi === 2 ? 9 : qi === 3 ? 12 : 3;
    const y = qi === 4 ? fyY : fyY - 1;
    return { y, m, t: y * 100 + m };
  }
  return null;
}

export function formatFinPeriod(period: string, kind: FinKind = "year"): string {
  const p = parsePeriod(period);
  if (!p) return String(period || "").slice(0, 12);
  const yy = String(p.y).slice(-2);
  if (kind === "year") return `FY${yy}`;
  if (p.m === 6) return `Q1 FY${String(p.y + 1).slice(-2)}`;
  if (p.m === 9) return `Q2 FY${String(p.y + 1).slice(-2)}`;
  if (p.m === 12) return `Q3 FY${String(p.y + 1).slice(-2)}`;
  if (p.m === 3) return `Q4 FY${yy}`;
  return `${MONTHS[p.m - 1] || p.m} ${yy}`;
}

export function formatFinMonth(period: string): string {
  const p = parsePeriod(period);
  if (!p) return String(period || "").slice(0, 12);
  if (String(period).trim().match(/^\d{4}$/)) return `Mar ${p.y}`;
  return `${MONTHS[p.m - 1] || p.m} ${p.y}`;
}

export function fullCr(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  const digits = a >= 100 || a === Math.round(a) ? 0 : a >= 10 ? 1 : 2;
  return sign + a.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

/** Compact ₹ crore for axis / bar labels. L = lakh crore. */
export function compactCr(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a === 0) return "0";
  if (a >= 1_00_000) {
    const x = a / 1_00_000;
    const d = x >= 10 ? 1 : 2;
    return sign + x.toFixed(d).replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1") + "L";
  }
  if (a >= 100) return sign + a.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  if (a >= 10) return sign + a.toLocaleString("en-IN", { maximumFractionDigits: 1 });
  return sign + a.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function present(v: number | null | undefined): v is number {
  return v != null && Number.isFinite(v);
}

function empty(v: number | null | undefined) {
  return !present(v) || v === 0;
}

function periodRank(period: string) {
  const p = parsePeriod(period);
  return p ? p.t : Number.POSITIVE_INFINITY;
}

export function buildFinRows(sales: FinPoint[], profits: FinPoint[], kind: FinKind, n = 6): FinRow[] {
  const sMap = new Map(sales.map((x) => [x.period, x.value]));
  const pMap = new Map(profits.map((x) => [x.period, x.value]));
  const periods = [...new Set([...sales.map((x) => x.period), ...profits.map((x) => x.period)])].sort(
    (a, b) => periodRank(a) - periodRank(b) || a.localeCompare(b),
  );
  const rows: FinRow[] = periods.map((period) => {
    const s = sMap.has(period) ? sMap.get(period)! : null;
    const p = pMap.has(period) ? pMap.get(period)! : null;
    return {
      period,
      label: formatFinPeriod(period, kind),
      sales: present(s) ? s : null,
      profit: present(p) ? p : null,
    };
  });
  while (rows.length && empty(rows[rows.length - 1].sales) && empty(rows[rows.length - 1].profit)) {
    rows.pop();
  }
  return rows.slice(-n);
}

export function crTicks(lo: number, hi: number, n = 5): number[] {
  if (!(Number.isFinite(lo) && Number.isFinite(hi))) return [0];
  if (hi === lo) hi = lo + 1;
  const span = hi - lo;
  const raw = span / Math.max(1, n - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-9))));
  const step = [1, 2, 2.5, 5, 10].map((x) => x * mag).find((x) => x >= raw) || raw;
  const start = Math.floor(lo / step) * step;
  const out: number[] = [];
  for (let v = start; v <= hi + step * 0.01; v += step) out.push(v);
  return out.length ? out : [0, hi];
}
