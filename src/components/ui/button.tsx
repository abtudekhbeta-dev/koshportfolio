import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,box-shadow] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:opacity-90",
        secondary: "bg-surface text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        ghost: "bg-transparent text-muted hover:text-fg hover:bg-surface",
        danger: "bg-down/15 text-down hover:bg-down/25",
      },
      size: {
        default: "h-10 px-3.5",
        sm: "h-8 px-2.5 text-[13px]",
        lg: "h-11 px-4",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
