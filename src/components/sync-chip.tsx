import { useSyncStatus } from "@/lib/kosh/sync-status";
import { cn } from "@/lib/utils";

export function SyncChip() {
  const status = useSyncStatus();
  if (status.state === "local") return null;
  const when = status.state === "synced" && status.at ? rel(status.at) : "";
  return (
    <span
      title={status.detail}
      className={cn(
        "hidden shrink-0 text-[11px] sm:inline",
        status.state === "attention" || status.state === "offline" ? "text-warn" : "text-subtle",
      )}
    >
      {status.state === "syncing" ? "Syncing" : status.state === "offline" ? "Offline" : status.state === "attention" ? "Needs attention" : "Synced"}
      {when ? ` ${when}` : ""}
    </span>
  );
}

function rel(at: number) {
  const s = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
}
