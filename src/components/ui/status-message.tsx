import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type StatusTone = "success" | "error" | "info" | "warning";

const TONES: Record<
  StatusTone,
  { wrapper: string; iconWrap: string; icon: IconName; role: "status" | "alert" }
> = {
  success: {
    wrapper: "border-success-500/40 bg-success-50 text-success-900",
    iconWrap: "bg-success-500 text-white",
    icon: "check",
    role: "status",
  },
  error: {
    wrapper: "border-danger-500/40 bg-danger-50 text-danger-700",
    iconWrap: "bg-danger-600 text-white",
    icon: "close",
    role: "alert",
  },
  info: {
    wrapper: "border-sky-200 bg-sky-50 text-sky-900",
    iconWrap: "bg-sky-600 text-white",
    icon: "sparkles",
    role: "status",
  },
  warning: {
    wrapper: "border-warning-500/50 bg-warning-100 text-warning-700",
    iconWrap: "bg-warning-500 text-cream-900",
    icon: "lightbulb",
    role: "status",
  },
};

export type StatusMessageProps = {
  tone: StatusTone;
  title: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Mensaje de estado con icono + texto + color.
 * Nunca depende solo del color para transmitir exito o error (seccion 4.1).
 */
export function StatusMessage({ tone, title, children, className }: StatusMessageProps) {
  const config = TONES[tone];

  return (
    <div
      role={config.role}
      className={cn("flex items-start gap-3 rounded-2xl border p-4", config.wrapper, className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          config.iconWrap,
        )}
      >
        <Icon name={config.icon} size={16} />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="font-bold">{title}</p>
        {children && <div className="text-sm leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
