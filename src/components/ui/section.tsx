import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  href,
  viewAllLabel,
  children,
  className,
}: {
  title: string;
  href?: string;
  viewAllLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-10", className)} aria-label={title}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-950 dark:text-white flex items-center gap-2">
          <span className="inline-block h-6 w-1.5 rounded-full bg-gold-500" aria-hidden />
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-sm font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-300"
          >
            {viewAllLabel ?? "View all"} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
