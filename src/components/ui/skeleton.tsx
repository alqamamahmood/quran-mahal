import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-xl bg-brand-100/70 dark:bg-white/10",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-brand-100 dark:border-white/10 overflow-hidden">
      <Skeleton className="aspect-video rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
