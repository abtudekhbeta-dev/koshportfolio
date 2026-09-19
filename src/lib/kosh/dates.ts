/** Parse mixed NSE / ISO / Indian dates to an IST calendar day. Never invent a day. */

const MON: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(n: number) {
  return n < 10 ? "0" + n : String(n);
}

function year4(raw: string, asOf = new Date()): string | null {
  const s = String(raw || "").trim();
  if (/^\d{4}$/.test(s)) return s;
  if (/^\d{2}$/.test(s)) {
    const n = Number(s);
    return String(n >= 70 ? 1900 + n : 2000 + n);
  }
  if (/^\d{3}$/.test(s)) {
    const cy = String(asOf.getFullYear());
    if (cy.startsWith(s)) return cy;
    return null;
  }
  return null;
}

function validIso(y: number, m: number, d: number): string | null {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (y < 1990 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== m || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Canonical YYYY-MM-DD, or null if the string cannot be read. */
export function parseIstDate(raw: string | null | undefined, asOf = new Date()): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return validIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const mon = s.match(
    /^(\d{1,2})[-/\s]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\s,]+(\d{2,4})\b/i,
  );
  if (mon) {
    const y = year4(mon[3], asOf);
    const m = MON[mon[2].slice(0, 3).toLowerCase()];
    if (y && m) return validIso(Number(y), Number(m), Number(mon[1]));
  }

  const monFirst = s.match(
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\s,]+(\d{1,2})[,-\s]+(\d{2,4})\b/i,
  );
  if (monFirst) {
    const y = year4(monFirst[3], asOf);
    const m = MON[monFirst[1].slice(0, 3).toLowerCase()];
    if (y && m) return validIso(Number(y), Number(m), Number(monFirst[2]));
  }

  const dmy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\b/);
  if (dmy) {
    const y = year4(dmy[3], asOf);
    if (y) return validIso(Number(y), Number(dmy[2]), Number(dmy[1]));
  }

  return null;
}

export function istDateMs(iso: string): number | null {
  const d = parseIstDate(iso);
  if (!d) return null;
  const t = Date.parse(d + "T00:00:00+05:30");
  return Number.isFinite(t) ? t : null;
}

export function formatIstDate(raw: string | null | undefined): string {
  const d = parseIstDate(raw);
  if (!d) return String(raw || "").trim();
  const [y, m, day] = d.split("-");
  return `${Number(day)} ${MONTHS[Number(m) - 1]} ${y}`;
}

export function formatIstShort(raw: string | null | undefined): string {
  const d = parseIstDate(raw);
  if (!d) return String(raw || "").trim();
  const [, m, day] = d.split("-");
  return `${Number(day)} ${MONTHS[Number(m) - 1]}`;
}

export function compareIstDate(a: string, b: string): number {
  const am = istDateMs(a);
  const bm = istDateMs(b);
  if (am == null && bm == null) return String(a).localeCompare(String(b));
  if (am == null) return 1;
  if (bm == null) return -1;
  return am - bm;
}
