import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-red-500" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">
        {(error instanceof Error ? error.message : "") || "An unexpected error occurred. Try reloading the page."}
      </p>
      <button
        type="button"
        className="mt-1 inline-flex h-10 items-center rounded-sm bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        onClick={() => {
          try {
            sessionStorage.removeItem("kosh-chunk-reload");
          } catch {
            /* ignore */
          }
          window.location.reload();
        }}
      >
        Reload
      </button>
    </main>
  );
}
