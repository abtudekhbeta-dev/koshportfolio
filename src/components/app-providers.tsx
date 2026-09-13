import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CloudBridge } from "@/components/cloud-bridge";
import { IconHydrate } from "@/components/mark";
import { ThemeHydrate } from "@/components/theme-toggle";
import { useKosh } from "@/lib/store";

function ThemedToaster() {
  const theme = useKosh((s) => s.theme);
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-fg)",
        },
      }}
    />
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={200}>
        <ThemeHydrate />
        <IconHydrate />
        <CloudBridge />
        {children}
        <ThemedToaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
