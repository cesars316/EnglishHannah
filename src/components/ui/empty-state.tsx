import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type EmptyStateProps = {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

/** Estado vacio explicito: siempre dice que pasa y que se puede hacer. */
export function EmptyState({
  icon = "sparkles",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-card border-cream-300 flex flex-col items-center gap-3 border border-dashed bg-white/70 px-6 py-10 text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="bg-cream-100 text-cream-700 flex size-14 items-center justify-center rounded-full"
      >
        <Icon name={icon} size={28} />
      </span>
      <h3 className="text-cream-900 text-lg font-bold">{title}</h3>
      <p className="text-cream-700 max-w-md text-sm leading-relaxed">{description}</p>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
