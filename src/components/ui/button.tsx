import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500",
  secondary:
    "bg-brand-50 text-brand-800 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-200 dark:hover:bg-brand-900",
  outline:
    "border border-brand-300 text-brand-800 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-200 dark:hover:bg-brand-950",
  ghost: "text-brand-800 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-950",
  gold: "bg-gold-500 text-brand-950 hover:bg-gold-400 focus-visible:ring-gold-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-7 text-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none active:scale-[.98]",
        "min-h-[44px]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
