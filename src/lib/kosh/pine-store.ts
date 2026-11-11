/** Saved Pine scripts. The library is not the same thing as a script currently on the chart. */

export type SavedPine = { id: string; name: string; source: string; updatedAt: string };

const LIBRARY = "kosh-pine-library-v1";
const ACTIVE = "kosh-pine-active-v1";

function isScript(value: unknown): value is SavedPine {
  if (!value || typeof value !== "object") return false;
  const row = value as SavedPine;
  return typeof row.id === "string" && typeof row.name === "string" && typeof row.source === "string";
}

export function loadPineLibrary(read: (key: string) => string | null): SavedPine[] {
  try {
    const raw = JSON.parse(read(LIBRARY) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isScript).slice(0, 40);
  } catch {
    return [];
  }
}

export function savePineLibrary(rows: SavedPine[], write: (key: string, value: string) => void) {
  write(LIBRARY, JSON.stringify(rows.slice(0, 40)));
}

export function loadPineActive(read: (key: string) => string | null): string[] {
  try {
    const raw = JSON.parse(read(ACTIVE) || "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((id) => typeof id === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function savePineActive(ids: string[], write: (key: string, value: string) => void) {
  write(ACTIVE, JSON.stringify(ids.slice(0, 8)));
}

export function newPineId() {
  return `pine-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
