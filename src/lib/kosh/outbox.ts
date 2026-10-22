/** One unacked account save. Same fingerprint keeps the same id so a retry is not a second mutation. */

export type PendingSave = {
  id: string;
  at: number;
  attempts: number;
  fingerprint: string;
};

export function mutationId(): string {
  return globalThis.crypto?.randomUUID?.() || `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function nextPending(current: PendingSave | null, fingerprint: string, now = Date.now()): PendingSave {
  if (current && current.fingerprint === fingerprint) return current;
  return { id: mutationId(), at: now, attempts: 0, fingerprint };
}

export function noteFailure(current: PendingSave | null, id: string): PendingSave | null {
  if (!current || current.id !== id) return current;
  return { ...current, attempts: current.attempts + 1 };
}

const KEY = "kosh-outbox";

export function readOutbox(): PendingSave | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const row = JSON.parse(raw) as PendingSave;
    if (!row?.id || !row.fingerprint) return null;
    return row;
  } catch {
    return null;
  }
}

export function writeOutbox(row: PendingSave | null) {
  if (typeof localStorage === "undefined") return;
  try {
    if (!row) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(row));
  } catch {
    /* private mode */
  }
}

export function beginSave(fingerprint: string): PendingSave {
  const next = nextPending(readOutbox(), fingerprint);
  writeOutbox(next);
  return next;
}

export function ackSave(id: string) {
  const cur = readOutbox();
  if (cur && cur.id === id) writeOutbox(null);
}

export function failSave(id: string) {
  writeOutbox(noteFailure(readOutbox(), id));
}
