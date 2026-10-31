import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 dark:border-white/15 bg-brand-50/50 dark:bg-white/[.02] px-6 py-14 text-center">
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
