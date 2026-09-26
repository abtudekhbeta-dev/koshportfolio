/** Ordered drawing undo/redo. Not "delete the last shape" — every committed state. */

export type DrawHist<T> = { past: T[][]; future: T[][] };

function clone<T>(rows: T[]): T[] {
  return rows.map((r) => ({ ...r }));
}

export function histInit<T>(shapes: T[]): DrawHist<T> {
  return { past: [clone(shapes)], future: [] };
}

export function histPush<T>(h: DrawHist<T>, next: T[]): DrawHist<T> {
  const cur = h.past[h.past.length - 1] || [];
  if (JSON.stringify(cur) === JSON.stringify(next)) return h;
  return { past: [...h.past, clone(next)].slice(-40), future: [] };
}

export function histUndo<T>(h: DrawHist<T>): { hist: DrawHist<T>; shapes: T[] } | null {
  if (h.past.length < 2) return null;
  const current = h.past[h.past.length - 1];
  const past = h.past.slice(0, -1);
  return { hist: { past, future: [current, ...h.future].slice(0, 40) }, shapes: clone(past[past.length - 1]) };
}

export function histRedo<T>(h: DrawHist<T>): { hist: DrawHist<T>; shapes: T[] } | null {
  if (!h.future.length) return null;
  const [next, ...rest] = h.future;
  return { hist: { past: [...h.past, next].slice(-40), future: rest }, shapes: clone(next) };
}
