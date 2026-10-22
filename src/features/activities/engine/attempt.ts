import { GAME } from "@/config/game";
import { activityCompletionReward } from "@/features/rewards/logic";
import type { EvaluateAnswerResult } from "@/features/activities/engine/types";
import type {
  ActivityEvaluation,
  ActivityResponse,
  LocalizedText,
  PublicActivity,
} from "@/types/content";

/**
 * Reductor puro del estado de un intento.
 *
 * Vive aparte del componente para poder probarlo sin navegador y para que el
 * flujo sea identico en Fase 3, cuando el servidor sea la autoridad.
 */

export const MAX_ATTEMPTS = GAME.maxAttemptsPerActivity;

export type PairAssignment = { leftId: string; rightId: string };

export type AttemptProgress = {
  /** Numero de intentos enviados. */
  attempts: number;
  /** Opciones falladas: se atenuan y dejan de ser elegibles. */
  eliminatedOptionIds: string[];
  /** Opcion elegida en el ultimo intento fallido. */
  wrongOptionId: string | null;
  /** Parejas ya acertadas, que se mantienen fijas entre intentos. */
  lockedPairs: PairAssignment[];
  evaluation: ActivityEvaluation | null;
  feedback: LocalizedText | null;
  solved: boolean;
  /** Se agotaron los intentos: puede mostrarse la solucion. */
  revealed: boolean;
  /** Se pidio la pista en algun momento de esta actividad. */
  hintUsed: boolean;
  /** XP y monedas que se otorgaran al cerrar la actividad. */
  xp: number;
  coins: number;
};

export const EMPTY_ATTEMPT: AttemptProgress = {
  attempts: 0,
  eliminatedOptionIds: [],
  wrongOptionId: null,
  lockedPairs: [],
  evaluation: null,
  feedback: null,
  solved: false,
  revealed: false,
  hintUsed: false,
  xp: 0,
  coins: 0,
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function hasPair(pairs: readonly PairAssignment[], pair: PairAssignment): boolean {
  return pairs.some((item) => item.leftId === pair.leftId && item.rightId === pair.rightId);
}

/**
 * Aplica el resultado de un intento sobre el estado anterior.
 *
 * Reglas (documento maestro, seccion 6):
 * - Un acierto cierra la actividad con la recompensa que calculo el motor.
 * - Un fallo no resta nada: solo elimina la opcion elegida.
 * - Tras `MAX_ATTEMPTS` fallos se muestra la solucion y aun se otorga la
 *   recompensa por completar la actividad.
 */
export function reduceAttempt(
  previous: AttemptProgress,
  params: {
    activity: PublicActivity;
    response: ActivityResponse;
    result: EvaluateAnswerResult;
  },
): AttemptProgress {
  if (previous.solved || previous.revealed) return previous;

  const { response, result } = params;
  const attempts = previous.attempts + 1;
  const solved = result.evaluation.isCorrect;
  const revealed = !solved && attempts >= MAX_ATTEMPTS;

  const eliminated = [...previous.eliminatedOptionIds];
  const lockedPairs = [...previous.lockedPairs];
  let wrongOptionId: string | null = null;

  const correctPairs = result.evaluation.correctPairs ?? [];

  if (!solved) {
    if (response.kind === "choice") {
      wrongOptionId = response.optionId;
      eliminated.push(response.optionId);
    }

    if (response.kind === "pairs") {
      // En las parejas NO se descartan destinos fallados: la lista de destinos
      // es corta (una tarjeta por pareja) y con varios fallos se quedaria sin
      // ninguna opcion pulsable antes de llegar a la solucion. Las parejas
      // acertadas se fijan y las demas quedan libres para reintentar.
      for (const pair of response.pairs) {
        const isRight = correctPairs.some(
          (item) => item.leftId === pair.leftId && item.rightId === pair.rightId,
        );
        if (isRight && !hasPair(lockedPairs, pair)) lockedPairs.push(pair);
      }
    }
  }

  const reward = solved
    ? { xp: result.xpAwarded, coins: result.coinsAwarded }
    : revealed
      ? activityCompletionReward()
      : { xp: 0, coins: 0 };

  return {
    attempts,
    eliminatedOptionIds: unique(eliminated),
    wrongOptionId,
    lockedPairs,
    evaluation: result.evaluation,
    feedback: result.feedback,
    solved,
    revealed,
    hintUsed: previous.hintUsed,
    xp: reward.xp,
    coins: reward.coins,
  };
}
