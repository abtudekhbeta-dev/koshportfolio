import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function useInView<T extends HTMLElement = HTMLDivElement>(once = true) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        if (once) io.disconnect();
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return { ref, on };
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, on } = useInView();
  return (
    <div
      ref={ref}
      className={cn(on ? "kosh-in" : "kosh-pre", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
