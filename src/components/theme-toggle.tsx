import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useKosh } from "@/lib/store";

export function ThemeHydrate() {
  const theme = useKosh((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f3f1ea" : "#09090b");
  }, [theme]);
  return null;
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useKosh((s) => s.theme);
  const setTheme = useKosh((s) => s.setTheme);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const next = theme === "dark" ? "light" : "dark";
  if (!mounted) return <div className="size-8" aria-hidden />;
  return (
    <button
      type="button"
      className={className || "grid size-8 place-items-center rounded-sm text-muted hover:bg-surface hover:text-fg"}
      aria-label={next === "light" ? "Switch to light mode" : "Switch to dark mode"}
      title={next === "light" ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(next)}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
