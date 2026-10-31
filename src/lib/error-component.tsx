import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center text-fg"
      }
    >
      <span className="text-red-500" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-muted">
        {(error instanceof Error ? error.message : "") || "An unexpected error occurred. Try reloading the page."}
      </p>
      <button
        type="button"
        className="mt-1 inline-flex h-11 items-center rounded-sm bg-fg px-4 text-sm font-medium text-bg"
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
