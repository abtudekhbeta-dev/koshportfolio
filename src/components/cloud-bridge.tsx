import { useEffect, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadCloudState, saveCloudState } from "@/lib/kosh/cloud";
import { docFingerprint, mergeCloud, sanitizeForCloud, type CloudDoc } from "@/lib/kosh/cloud-state";
import { ackSave, beginSave, failSave } from "@/lib/kosh/outbox";
import { useSyncStatus } from "@/lib/kosh/sync-status";
import { useKosh } from "@/lib/store";

const VISIBLE_MS = 3000;
const HIDDEN_MS = 20000;

export function CloudBridge() {
  const { user, isPending } = useCurrentUserState();
  const applyCloud = useKosh((s) => s.applyCloud);
  const setSync = useSyncStatus((s) => s.set);
  const ready = useRef(false);
  const rev = useRef(0);
  const timer = useRef<number>(0);
  const poll = useRef<number>(0);
  const saving = useRef(false);

  useEffect(() => {
    ready.current = false;
    if (isPending) return;
    if (!user) {
      setSync({ state: "local", detail: "On this device" });
      return;
    }
    let cancelled = false;

    async function commit(doc: CloudDoc, baseRev: number): Promise<boolean> {
      const pending = beginSave(docFingerprint(doc));
      const sent = { ...doc, mutationId: pending.id };
      setSync({ state: "syncing", detail: pending.attempts ? "Retrying a queued save…" : "Saving…" });
      try {
        const saved = await saveCloudState({ data: { baseRev, doc: sent } });
        if (cancelled) return false;
        if (saved.ok) {
          ackSave(pending.id);
          rev.current = saved.rev;
          const over = sent.omitted && Object.values(sent.omitted).some((n) => (n || 0) > 0);
          setSync({
            state: over ? "attention" : "synced",
            detail: over ? "Part of this account is over the sync limit and was not uploaded." : "Synced",
            at: Date.now(),
          });
          return true;
        }
        if (saved.conflict) {
          ready.current = false;
          const again = mergeCloud(sanitizeForCloud(useKosh.getState()), saved.doc as CloudDoc);
          applyCloud(again.doc as Parameters<typeof applyCloud>[0]);
          const retryPending = beginSave(docFingerprint(again.doc));
          const retry = await saveCloudState({
            data: { baseRev: saved.rev, doc: { ...again.doc, mutationId: retryPending.id } },
          });
          ready.current = true;
          if (retry.ok) {
            ackSave(retryPending.id);
            rev.current = retry.rev;
            setSync({
              state: again.notes.length ? "attention" : "synced",
              detail: again.notes[0] || "Synced",
              at: Date.now(),
            });
            return true;
          }
          failSave(retryPending.id);
        } else {
          failSave(pending.id);
        }
        setSync({ state: "attention", detail: "Save was not acknowledged. It stays queued on this device." });
        return false;
      } catch {
        failSave(pending.id);
        if (!cancelled) setSync({ state: "offline", detail: "Offline — changes stay queued on this device until the next save" });
        return false;
      }
    }

    async function pull() {
      if (cancelled || saving.current || !ready.current) return;
      try {
        const remote = await loadCloudState({ data: { knownRev: rev.current } });
        if (cancelled) return;
        if (remote.unchanged || remote.rev === rev.current) {
          setSync({ state: "synced", detail: "Synced", at: Date.now() });
          return;
        }
        ready.current = false;
        const local = sanitizeForCloud(useKosh.getState());
        const merged = mergeCloud(local, remote.doc as CloudDoc);
        applyCloud(merged.doc as Parameters<typeof applyCloud>[0]);
        rev.current = remote.rev;
        if (merged.dirty) {
          saving.current = true;
          await commit(merged.doc, remote.rev);
          saving.current = false;
        } else {
          setSync({ state: "synced", detail: "Synced", at: Date.now() });
        }
        ready.current = true;
      } catch {
        if (!cancelled) setSync({ state: "offline", detail: "Could not reach the account copy" });
      }
    }

    function arm() {
      window.clearInterval(poll.current);
      const ms = document.visibilityState === "visible" ? VISIBLE_MS : HIDDEN_MS;
      poll.current = window.setInterval(() => void pull(), ms);
    }

    setSync({ state: "syncing", detail: "Opening the account copy…" });
    void loadCloudState()
      .then(async (remote) => {
        if (cancelled) return;
        const local = sanitizeForCloud(useKosh.getState());
        const merged = mergeCloud(local, remote.doc as CloudDoc);
        ready.current = false;
        applyCloud(merged.doc as Parameters<typeof applyCloud>[0]);
        rev.current = remote.rev || 0;
        if (merged.dirty) {
          saving.current = true;
          await commit(merged.doc, rev.current);
          saving.current = false;
        } else {
          setSync({ state: "synced", detail: "Synced", at: Date.now() });
        }
        ready.current = true;
        arm();
      })
      .catch(() => {
        ready.current = true;
        if (!cancelled) setSync({ state: "offline", detail: "Could not open the account copy" });
        arm();
      });

    function onFocus() {
      void pull();
    }
    document.addEventListener("visibilitychange", arm);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);

    return () => {
      cancelled = true;
      ready.current = false;
      window.clearInterval(poll.current);
      document.removeEventListener("visibilitychange", arm);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, [user, isPending, applyCloud, setSync]);

  useEffect(() => {
    if (!user) return;
    return useKosh.subscribe((s) => {
      if (!ready.current) return;
      window.clearTimeout(timer.current);
      setSync({ state: "syncing", detail: "Saving…" });
      timer.current = window.setTimeout(() => {
        const doc = sanitizeForCloud(s);
        const pending = beginSave(docFingerprint(doc));
        const sent = { ...doc, mutationId: pending.id };
        saving.current = true;
        void saveCloudState({ data: { baseRev: rev.current, doc: sent } })
          .then(async (saved) => {
            if (saved.ok) {
              ackSave(pending.id);
              rev.current = saved.rev;
              const over = sent.omitted && Object.values(sent.omitted).some((n) => (n || 0) > 0);
              setSync({
                state: over ? "attention" : "synced",
                detail: over ? "Part of this account is over the sync limit and was not uploaded." : "Synced",
                at: Date.now(),
              });
              return;
            }
            if (saved.conflict) {
              ready.current = false;
              const merged = mergeCloud(doc, saved.doc as CloudDoc);
              applyCloud(merged.doc as Parameters<typeof applyCloud>[0]);
              const retryPending = beginSave(docFingerprint(merged.doc));
              const retry = await saveCloudState({
                data: { baseRev: saved.rev, doc: { ...merged.doc, mutationId: retryPending.id } },
              });
              ready.current = true;
              if (retry.ok) {
                ackSave(retryPending.id);
                rev.current = retry.rev;
                setSync({
                  state: merged.notes.length ? "attention" : "synced",
                  detail: merged.notes[0] || "Synced",
                  at: Date.now(),
                });
                return;
              }
              failSave(retryPending.id);
            } else failSave(pending.id);
            setSync({ state: "attention", detail: "Save was not acknowledged. It stays queued on this device." });
          })
          .catch(() => {
            failSave(pending.id);
            setSync({ state: "offline", detail: "Offline — this edit is still queued on this device" });
          })
          .finally(() => {
            saving.current = false;
          });
      }, 700);
    });
  }, [user, applyCloud, setSync]);

  return null;
}
