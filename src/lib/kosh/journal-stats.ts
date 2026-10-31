/** Trading-journal maths. Open trades are not treated as closed wins. */

export type JournalRules = { entry: boolean | null; stop: boolean | null; target: boolean | null };

export type JournalTrade = {
  id: string;
  symbol: string;
  exchange: "NSE" | "BSE" | "";
  name: string;
  strategy: string;
  direction: "long" | "short";
  entryAt: number;
  exitAt: number | null;
  entryPx: number;
  exitPx: number | null;
  qty: number;
  stop: number | null;
  target: number | null;
  fees: number;
  taxes: number;
  slippage: number;
  timeframe: string;
  tags: string[];
  notes: string;
  rules: JournalRules;
  behaviour: string[];
  group: string;
  chartRef: string;
  importKey: string;
  updatedAt: number;
};

export type JournalStats = {
  closed: number;
  open: number;
  realised: number;
  unrealised: number | null;
  winRate: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  avgRr: number | null;
  expectancy: number | null;
  profitFactor: number | null;
  maxDd: number | null;
  avgR: number | null;
  largestWin: number | null;
  largestLoss: number | null;
  streakWin: number;
  streakLoss: number;
  byStrategy: { key: string; n: number; pnl: number; winRate: number | null }[];
  byDirection: { key: string; n: number; pnl: number }[];
  byWeekday: { key: string; n: number; pnl: number }[];
  byHolding: { key: string; n: number; pnl: number }[];
  byInstrument: { key: string; n: number; pnl: number; winRate: number | null }[];
  byTimeframe: { key: string; n: number; pnl: number }[];
  byGroup: { key: string; n: number; pnl: number }[];
  bySession: { key: string; n: number; pnl: number }[];
  cleanPnl: number | null;
  brokenPnl: number | null;
  equity: { t: number; v: number }[];
};

function rMultiple(t: JournalTrade, pnl: number): number | null {
  if (!(t.stop != null && t.stop > 0) || !(t.entryPx > 0) || !(t.qty > 0)) return null;
  const risk = Math.abs(t.entryPx - t.stop) * t.qty;
  if (!(risk > 0)) return null;
  return pnl / risk;
}

export function tradePnl(t: JournalTrade, mark?: number | null): { pnl: number | null; closed: boolean } {
  const qty = t.qty;
  if (!(qty > 0) || !(t.entryPx > 0)) return { pnl: null, closed: false };
  const cost = (t.fees || 0) + (t.taxes || 0) + (t.slippage || 0);
  const sign = t.direction === "short" ? -1 : 1;
  if (t.exitPx != null && t.exitPx > 0 && t.exitAt) {
    return { pnl: sign * (t.exitPx - t.entryPx) * qty - cost, closed: true };
  }
  if (mark != null && mark > 0) return { pnl: sign * (mark - t.entryPx) * qty - cost, closed: false };
  return { pnl: null, closed: false };
}

function avg(rows: number[]): number | null {
  if (!rows.length) return null;
  return rows.reduce((s, n) => s + n, 0) / rows.length;
}

function bucket(map: Map<string, { n: number; pnl: number; wins: number }>, key: string, pnl: number) {
  const row = map.get(key) || { n: 0, pnl: 0, wins: 0 };
  row.n += 1;
  row.pnl += pnl;
  if (pnl > 0) row.wins += 1;
  map.set(key, row);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function journalStats(trades: JournalTrade[], marks: Record<string, number> = {}): JournalStats {
  const closedPnls: { t: JournalTrade; pnl: number }[] = [];
  let unrealised = 0;
  let unrealisedN = 0;
  let open = 0;
  for (const t of trades) {
    const mark = marks[t.symbol];
    const row = tradePnl(t, mark);
    if (row.closed && row.pnl != null) closedPnls.push({ t, pnl: row.pnl });
    else {
      open += 1;
      if (row.pnl != null) {
        unrealised += row.pnl;
        unrealisedN += 1;
      }
    }
  }
  closedPnls.sort((a, b) => (a.t.exitAt || 0) - (b.t.exitAt || 0));
  const wins = closedPnls.filter((r) => r.pnl > 0).map((r) => r.pnl);
  const losses = closedPnls.filter((r) => r.pnl < 0).map((r) => r.pnl);
  const grossWin = wins.reduce((s, n) => s + n, 0);
  const grossLoss = Math.abs(losses.reduce((s, n) => s + n, 0));
  const rs = closedPnls.map((r) => rMultiple(r.t, r.pnl)).filter((n): n is number => n != null);
  const rrs = closedPnls
    .map((r) => {
      if (!(r.t.target != null && r.t.stop != null)) return null;
      const risk = Math.abs(r.t.entryPx - r.t.stop);
      const reward = Math.abs(r.t.target - r.t.entryPx);
      return risk > 0 ? reward / risk : null;
    })
    .filter((n): n is number => n != null);

  let peak = 0;
  let equity = 0;
  let maxDd = 0;
  const curve: { t: number; v: number }[] = [];
  let streakWin = 0;
  let streakLoss = 0;
  let runW = 0;
  let runL = 0;
  for (const row of closedPnls) {
    equity += row.pnl;
    peak = Math.max(peak, equity);
    maxDd = Math.max(maxDd, peak - equity);
    curve.push({ t: row.t.exitAt || row.t.entryAt, v: equity });
    if (row.pnl > 0) {
      runW += 1;
      runL = 0;
    } else if (row.pnl < 0) {
      runL += 1;
      runW = 0;
    }
    streakWin = Math.max(streakWin, runW);
    streakLoss = Math.max(streakLoss, runL);
  }

  const by = (pick: (t: JournalTrade) => string) => {
    const map = new Map<string, { n: number; pnl: number; wins: number }>();
    for (const row of closedPnls) bucket(map, pick(row.t) || "—", row.pnl);
    return [...map.entries()].map(([key, v]) => ({ key, n: v.n, pnl: v.pnl, winRate: v.n ? v.wins / v.n : null }));
  };

  let clean = 0;
  let cleanN = 0;
  let broken = 0;
  let brokenN = 0;
  for (const row of closedPnls) {
    const rules = [row.t.rules?.entry, row.t.rules?.stop, row.t.rules?.target].filter((v) => v != null);
    if (!rules.length) continue;
    if (rules.every(Boolean) && !(row.t.behaviour || []).length) {
      clean += row.pnl;
      cleanN += 1;
    } else {
      broken += row.pnl;
      brokenN += 1;
    }
  }

  const realised = closedPnls.reduce((s, r) => s + r.pnl, 0);
  return {
    closed: closedPnls.length,
    open,
    realised,
    unrealised: unrealisedN ? unrealised : null,
    winRate: closedPnls.length ? wins.length / closedPnls.length : null,
    avgWin: avg(wins),
    avgLoss: avg(losses),
    avgRr: avg(rrs),
    expectancy: closedPnls.length ? realised / closedPnls.length : null,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : wins.length ? null : null,
    maxDd: closedPnls.length ? maxDd : null,
    avgR: avg(rs),
    largestWin: wins.length ? Math.max(...wins) : null,
    largestLoss: losses.length ? Math.min(...losses) : null,
    streakWin,
    streakLoss,
    byStrategy: by((t) => t.strategy || "Untagged"),
    byDirection: by((t) => t.direction).map(({ key, n, pnl }) => ({ key, n, pnl })),
    byWeekday: by((t) => DAYS[new Date(t.entryAt).getDay()] || "—").map(({ key, n, pnl }) => ({ key, n, pnl })),
    byHolding: by((t) => {
      if (!t.exitAt) return "Open";
      const days = (t.exitAt - t.entryAt) / 86400000;
      if (days < 1) return "Intraday";
      if (days < 5) return "Under a week";
      if (days < 20) return "Under a month";
      return "Longer";
    }).map(({ key, n, pnl }) => ({ key, n, pnl })),
    byInstrument: by((t) => t.symbol || "—"),
    byTimeframe: by((t) => t.timeframe || "—").map(({ key, n, pnl }) => ({ key, n, pnl })),
    byGroup: by((t) => t.group || "No group").map(({ key, n, pnl }) => ({ key, n, pnl })),
    bySession: by((t) => {
      const hour = new Date(t.entryAt).getHours();
      if (hour < 11) return "Morning";
      if (hour < 13) return "Midday";
      if (hour < 16) return "Afternoon";
      return "Outside cash hours";
    }).map(({ key, n, pnl }) => ({ key, n, pnl })),
    cleanPnl: cleanN ? clean : null,
    brokenPnl: brokenN ? broken : null,
    equity: curve,
  };
}

export function journalKey(t: Pick<JournalTrade, "symbol" | "exchange" | "direction" | "entryAt" | "entryPx" | "qty">): string {
  const day = new Date(t.entryAt).toISOString().slice(0, 16);
  return [t.exchange, t.symbol, t.direction, day, t.qty, Math.round(t.entryPx * 100)].join("|");
}
