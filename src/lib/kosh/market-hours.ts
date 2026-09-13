/** IST cash session. Client-safe. */

const IST = 19800;

export function isIstSession(now = Date.now()) {
  const d = new Date(now + IST * 1000);
  const wd = d.getUTCDay();
  if (wd === 0 || wd === 6) return false;
  const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
  return mins >= 9 * 60 && mins <= 15 * 60 + 50;
}

export function isIstPreopen(now = Date.now()) {
  const d = new Date(now + IST * 1000);
  const wd = d.getUTCDay();
  if (wd === 0 || wd === 6) return false;
  const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
  return mins >= 9 * 60 && mins < 9 * 60 + 15;
}

export function istClock(now = Date.now()) {
  const d = new Date(now + IST * 1000);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
