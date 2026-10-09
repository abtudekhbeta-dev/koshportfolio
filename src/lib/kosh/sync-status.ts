import { create } from "zustand";

export type SyncState = "local" | "syncing" | "synced" | "offline" | "attention";

type SyncStatus = {
  state: SyncState;
  detail: string;
  at: number;
  set: (next: { state: SyncState; detail: string; at?: number }) => void;
};

export const useSyncStatus = create<SyncStatus>((set) => ({
  state: "local",
  detail: "On this device",
  at: 0,
  set: (next) => set({ state: next.state, detail: next.detail, at: next.at || Date.now() }),
}));
