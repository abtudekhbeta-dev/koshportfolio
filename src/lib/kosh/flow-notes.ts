/** Saved model notes. Same session replaces itself. A new session is kept beside the older one. */

export type FlowNote = {
  id: string;
  at: string;
  latestDate: string | null;
  materialKey: string;
  model: string;
  takeaway: string;
  changes: string;
  alignment: string;
  history: string;
  price: string;
  risks: string;
  watch: string;
};

export function mergeFlowNotes(prev: FlowNote[], note: FlowNote, limit = 8): FlowNote[] {
  return [note, ...prev.filter((item) => item.materialKey !== note.materialKey)].slice(0, limit);
}

const KEY = "kosh-flow-notes-v1";

function isNote(value: unknown): value is FlowNote {
  if (!value || typeof value !== "object") return false;
  const row = value as FlowNote;
  return typeof row.materialKey === "string" && typeof row.takeaway === "string" && typeof row.changes === "string" && typeof row.risks === "string";
}

export function readFlowNotes(): FlowNote[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isNote).slice(0, 8);
  } catch {
    return [];
  }
}

export function rememberFlowNote(note: FlowNote): FlowNote[] {
  const next = mergeFlowNotes(readFlowNotes(), note);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* the figures still render if the browser refuses storage */
  }
  return next;
}
