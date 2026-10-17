import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type PillTone = "neutral" | "brand" | "sky" | "success" | "warning" | "purple" | "pink";

const TONES: Record<PillTone, string> = {
  neutral: "bg-cream-100 text-cream-800 border-cream-300",
  brand: "bg-brand-50 text-brand-800 border-brand-200",
  sky: "bg-sky-50 text-sky-800 border-sky-200",
  success: "bg-success-50 text-success-900 border-success-500/40",
  warning: "bg-warning-100 text-warning-700 border-warning-500/40",
  purple: "bg-purple-100 text-purple-700 border-purple-500/30",
  pink: "bg-pink-100 text-pink-700 border-pink-500/30",
};

export type PillProps = {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
  icon?: ReactNode;
};

/** Etiqueta compacta. Siempre incluye texto (nunca solo color). */
export function Pill({ children, tone = "neutral", className, icon }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
