import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "dimmed";

export type OptionButtonProps = {
  children: ReactNode;
  state?: OptionState;
  onClick?: () => void;
  disabled?: boolean;
  /** Texto solo para lectores de pantalla que describe la opcion. */
  srLabel?: string;
  className?: string;
  /** Etiqueta corta bajo el contenido (por ejemplo la traduccion). */
  hint?: ReactNode;
};

const STATES: Record<OptionState, string> = {
  idle: "border-cream-300 bg-white hover:border-sky-400 hover:bg-sky-50",
  selected: "border-sky-500 bg-sky-50 ring-2 ring-sky-300",
  correct: "border-success-500 bg-success-50",
  wrong: "border-danger-500 bg-danger-50",
  dimmed: "border-cream-200 bg-cream-100 opacity-60",
};

const STATE_LABEL: Record<OptionState, string | null> = {
  idle: null,
  selected: "Seleccionada",
  correct: "Respuesta correcta",
  wrong: "Respuesta incorrecta, intentalo otra vez",
  dimmed: "Descartada",
};

/**
 * Opcion de respuesta grande y tactil (minimo 44 px).
 * El estado nunca se comunica solo con color: anade etiqueta para lectores de
 * pantalla y un icono visible cuando es correcta o incorrecta.
 */
export function OptionButton({
  children,
  state = "idle",
  onClick,
  disabled = false,
  srLabel,
  className,
  hint,
}: OptionButtonProps) {
  const isDisabled = disabled || state === "correct" || state === "dimmed";
  const label = STATE_LABEL[state];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      className={cn(
        "text-cream-900 relative flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 text-center font-bold transition active:translate-y-px disabled:cursor-default",
        STATES[state],
        className,
      )}
    >
      {children}
      {hint && <span className="text-cream-600 text-xs font-semibold">{hint}</span>}
      {state === "correct" && (
        <span
          aria-hidden="true"
          className="bg-success-500 absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full text-white shadow-sm"
        >
          <Icon name="check" size={16} />
        </span>
      )}
      {state === "wrong" && (
        <span
          aria-hidden="true"
          className="bg-danger-600 absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full text-white shadow-sm"
        >
          <Icon name="close" size={16} />
        </span>
      )}
      {srLabel && <span className="sr-only">{srLabel}</span>}
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}
