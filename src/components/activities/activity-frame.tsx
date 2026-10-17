"use client";

import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type ActivityFrameProps = {
  /** Enunciado principal (lo que hay que hacer). */
  prompt: string;
  /** Instrucciones de apoyo. */
  instructions?: string;
  /** Pista disponible a peticion (nunca se impone). */
  hint?: string;
  hintVisible?: boolean;
  onHint?: () => void;
  /** Contenido especifico de cada tipo de actividad. */
  children: ReactNode;
  /** Acciones inferiores (por ejemplo "Comprobar"). */
  footer?: ReactNode;
  className?: string;
};

/**
 * Marco comun de todas las actividades: enunciado, instrucciones, pista
 * opcional y acciones. Mantiene el mismo ritmo visual en todo el juego.
 */
export function ActivityFrame({
  prompt,
  instructions,
  hint,
  hintVisible = false,
  onHint,
  children,
  footer,
  className,
}: ActivityFrameProps) {
  return (
    <section className={cn("space-y-4", className)} aria-label={prompt}>
      <div className="space-y-1">
        <h2 className="text-cream-900 text-xl leading-snug font-extrabold sm:text-2xl">{prompt}</h2>
        {instructions && <p className="text-cream-700 text-sm sm:text-base">{instructions}</p>}
      </div>

      {onHint && hint && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onHint}
            aria-expanded={hintVisible}
            className="border-warning-500/50 bg-warning-100 text-warning-700 hover:bg-warning-100/80 inline-flex min-h-11 items-center gap-2 rounded-xl border-2 px-3 text-sm font-bold"
          >
            <Icon name="lightbulb" size={18} />
            {hintVisible ? "Ocultar la pista" : "Ver una pista"}
          </button>
          {hintVisible && (
            <p role="status" className="animate-soft-in text-cream-800 text-sm leading-relaxed">
              {hint}
            </p>
          )}
        </div>
      )}

      {children}

      {footer && <div className="flex flex-wrap items-center gap-2 pt-1">{footer}</div>}
    </section>
  );
}
