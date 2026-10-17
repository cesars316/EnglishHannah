import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
  /** `h1` en pantallas principales, `h2` en secciones anidadas. */
  as?: "h1" | "h2";
};

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
  as: Heading = "h1",
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <p className="text-brand-700 text-xs font-bold tracking-wide uppercase">{eyebrow}</p>
        )}
        <Heading className="text-cream-900 text-2xl leading-tight font-extrabold sm:text-3xl">
          {title}
        </Heading>
        {subtitle && <p className="text-cream-700 max-w-2xl text-sm sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
