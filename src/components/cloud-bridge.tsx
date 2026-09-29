import { useEffect, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadCloudState, saveCloudState } from "@/lib/kosh/cloud";
import { mergeCloud, sanitizeForCloud, type CloudDoc } from "@/lib/kosh/cloud-state";
import { useKosh } from "@/lib/store";

export function CloudBridge() {
  const { user, isPending } = useCurrentUserState();
  const applyCloud = useKosh((s) => s.applyCloud);
  const ready = useRef(false);
  const rev = useRef(0);
  const timer = useRef<number>(0);

  useEffect(() => {
    ready.current = false;
    if (isPending || !user) return;
    let cancelled = false;
    void loadCloudState()
      .then(async (remote) => {
        if (cancelled) return;
        const local = sanitizeForCloud(useKosh.getState());
        const merged = mergeCloud(local, remote.doc as CloudDoc);
        applyCloud(merged.doc as Parameters<typeof applyCloud>[0]);
        rev.current = remote.rev || 0;
        if (merged.dirty) {
          const saved = await saveCloudState({ data: { baseRev: rev.current, doc: merged.doc } });
          if (saved.ok) rev.current = saved.rev;
          else if (saved.conflict) {
            const again = mergeCloud(sanitizeForCloud(useKosh.getState()), saved.doc as CloudDoc);
            applyCloud(again.doc as Parameters<typeof applyCloud>[0]);
            const retry = await saveCloudState({ data: { baseRev: saved.rev, doc: again.doc } });
            if (retry.ok) rev.current = retry.rev;
          }
        }
        ready.current = true;
      })
      .catch(() => {
        ready.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [user, isPending, applyCloud]);

  useEffect(() => {
    if (!user) return;
    return useKosh.subscribe((s) => {
      if (!ready.current) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const doc = sanitizeForCloud(s);
        void saveCloudState({ data: { baseRev: rev.current, doc } })
          .then((saved) => {
            if (saved.ok) rev.current = saved.rev;
            else if (saved.conflict) {
              const merged = mergeCloud(doc, saved.doc as CloudDoc);
              applyCloud(merged.doc as Parameters<typeof applyCloud>[0]);
              rev.current = saved.rev;
            }
          })
          .catch(() => {});
      }, 900);
    });
  }, [user, applyCloud]);

  return null;
}
