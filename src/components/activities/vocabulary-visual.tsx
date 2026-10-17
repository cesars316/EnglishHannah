import { cn } from "@/lib/cn";
import type { VocabularyVisual } from "@/types/content";

export type VocabularyVisualViewProps = {
  visual: VocabularyVisual;
  size?: "sm" | "md" | "lg";
  /** Si el texto ya nombra el objeto, la imagen es decorativa. */
  decorative?: boolean;
  className?: string;
};

const SIZES = {
  sm: "size-16 text-[0.55rem]",
  md: "size-24 text-[0.6rem]",
  lg: "size-36 text-[0.7rem]",
} as const;

const COUNT_COLUMNS = {
  sm: "grid-cols-4 gap-1",
  md: "grid-cols-5 gap-1.5",
  lg: "grid-cols-7 gap-2",
} as const;

const DOT_SIZES = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
} as const;

/**
 * Representa una palabra de forma visual sin inventar recursos:
 *
 * - `image`: SVG original versionado en `public/images/vocabulary`.
 * - `color`: muestra de color real con borde para que el blanco sea visible.
 * - `count`: grupo de puntos contables (numeros 1-20).
 *
 * Nunca se usa solo el color: siempre hay texto alternativo o etiqueta.
 */
export function VocabularyVisualView({
  visual,
  size = "md",
  decorative = false,
  className,
}: VocabularyVisualViewProps) {
  const a11y = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": visual.alt };

  if (visual.kind === "image") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white",
          SIZES[size],
          className,
        )}
        {...a11y}
      >
        {/* Los SVG locales son pequeños y originales; el optimizador de Next no procesa SVG. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.src}
          alt={decorative ? "" : visual.alt}
          width={144}
          height={144}
          loading="lazy"
          decoding="async"
          className="size-full object-contain"
        />
      </span>
    );
  }

  if (visual.kind === "color") {
    return (
      <span
        className={cn(
          "border-cream-300 inline-flex items-center justify-center rounded-2xl border-2 shadow-inner",
          SIZES[size],
          className,
        )}
        style={{ backgroundColor: visual.hex }}
        {...a11y}
      />
    );
  }

  const dots = Array.from({ length: Math.max(1, Math.min(visual.count, 30)) }, (_, index) => index);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border-2 border-sky-100 bg-sky-50 p-2",
        className,
        size === "lg"
          ? "min-h-36 min-w-36"
          : size === "md"
            ? "min-h-24 min-w-24"
            : "min-h-16 min-w-16",
      )}
      {...a11y}
    >
      <span className={cn("grid place-items-center", COUNT_COLUMNS[size])}>
        {dots.map((dot) => (
          <span key={dot} className={cn("rounded-full bg-sky-600", DOT_SIZES[size])} />
        ))}
      </span>
    </span>
  );
}
