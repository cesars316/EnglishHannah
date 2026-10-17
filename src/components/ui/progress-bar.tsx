import { cn } from "@/lib/cn";

export type ProgressBarProps = {
  value: number;
  max?: number;
  label: string;
  /** Texto a la derecha (por ejemplo "3 de 8"). */
  hint?: string;
  tone?: "brand" | "sky" | "success";
  className?: string;
};

const TONES = {
  brand: "bg-brand-600",
  sky: "bg-sky-600",
  success: "bg-success-500",
} as const;

/** Barra de progreso accesible: expone `role="progressbar"` con valores reales. */
export function ProgressBar({
  value,
  max = 100,
  label,
  hint,
  tone = "brand",
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-cream-700 text-sm font-semibold">{label}</span>
        {hint && <span className="text-cream-700 text-sm font-semibold">{hint}</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={`${percent}%`}
        className="bg-cream-200 h-3.5 w-full overflow-hidden rounded-full"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", TONES[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
