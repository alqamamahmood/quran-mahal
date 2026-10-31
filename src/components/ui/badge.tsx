import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type Tone = "brand" | "gold" | "neutral" | "red";

const tones: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200",
  gold: "bg-gold-200 text-yellow-900 dark:bg-gold-500/20 dark:text-gold-300",
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-neutral-300",
  red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export function Badge({
  tone = "brand",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
