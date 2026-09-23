/** Shared entity-table sort. Missing values never become 0 and sort last. */

export type SortDir = "asc" | "desc" | null;

export function nextSortDir(cur: SortDir): SortDir {
  if (cur === null) return "desc";
  if (cur === "desc") return "asc";
  return null;
}

export function cmpMissingLast(a: unknown, b: unknown, dir: Exclude<SortDir, null>): number {
  const av = a == null || a === "" || (typeof a === "number" && !Number.isFinite(a));
  const bv = b == null || b === "" || (typeof b === "number" && !Number.isFinite(b));
  if (av && bv) return 0;
  if (av) return 1;
  if (bv) return -1;
  if (typeof a === "number" && typeof b === "number") return dir === "asc" ? a - b : b - a;
  if (a instanceof Date && b instanceof Date) {
    const d = a.getTime() - b.getTime();
    return dir === "asc" ? d : -d;
  }
  const as = String(a);
  const bs = String(b);
  const d = as.localeCompare(bs, "en", { numeric: true, sensitivity: "base" });
  return dir === "asc" ? d : -d;
}

export function sortEntities<T>(
  rows: T[],
  key: string | null,
  dir: SortDir,
  read?: (row: T, key: string) => unknown,
): T[] {
  if (!key || !dir) return rows;
  const get = read || ((row: T, k: string) => (row as Record<string, unknown>)[k]);
  const copy = rows.slice();
  copy.sort((a, b) => cmpMissingLast(get(a, key), get(b, key), dir));
  return copy;
}

export function cycleSort<K extends string>(
  current: { key: K | null; dir: SortDir },
  nextKey: K,
): { key: K | null; dir: SortDir } {
  if (current.key !== nextKey) return { key: nextKey, dir: "desc" };
  const dir = nextSortDir(current.dir);
  return dir ? { key: nextKey, dir } : { key: null, dir: null };
}

export function sortGlyph(active: boolean, dir: SortDir) {
  if (!active || !dir) return "↕";
  return dir === "asc" ? "↑" : "↓";
}
