import type { OptionState } from "@/components/activities/option-button";
import type { ActivityEvaluation } from "@/types/content";

export type OptionStateInput = {
  optionId: string;
  eliminatedOptionIds: readonly string[];
  wrongOptionId: string | null;
  evaluation: ActivityEvaluation | null;
  solved: boolean;
  revealed: boolean;
};

/**
 * Decide como se pinta una opcion segun el historial del intento.
 * Nunca depende solo del color: `OptionButton` añade icono y texto accesible.
 */
export function resolveOptionState({
  optionId,
  eliminatedOptionIds,
  wrongOptionId,
  evaluation,
  solved,
  revealed,
}: OptionStateInput): OptionState {
  const correctIds = evaluation?.correctOptionIds ?? [];
  const showCorrect = (solved || revealed) && correctIds.includes(optionId);

  if (showCorrect) return "correct";
  if (wrongOptionId === optionId) return "wrong";
  if (eliminatedOptionIds.includes(optionId)) return "dimmed";
  return "idle";
}

/** Indica si una opcion puede pulsarse. */
export function isOptionSelectable(state: OptionState, busy: boolean, solved: boolean): boolean {
  return !busy && !solved && state !== "correct" && state !== "dimmed" && state !== "wrong";
}
