import { useEffect, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listCloudPortfolios, saveCloudPortfolios } from "@/lib/kosh/cloud";
import { useKosh } from "@/lib/store";

export function CloudBridge() {
  const { user, isPending } = useCurrentUserState();
  const hydrate = useKosh((s) => s.hydrate);
  const ready = useRef(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    ready.current = false;
    if (isPending || !user) return;
    let cancelled = false;
    void listCloudPortfolios()
      .then((rows) => {
        if (cancelled) return;
        if (rows.length) hydrate(rows);
        ready.current = true;
      })
      .catch(() => {
        ready.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [user, isPending, hydrate]);

  useEffect(() => {
    if (!user) return;
    return useKosh.subscribe((s) => {
      if (!ready.current) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        void saveCloudPortfolios({ data: s.portfolios }).catch(() => {});
      }, 800);
    });
  }, [user]);

  return null;
}
