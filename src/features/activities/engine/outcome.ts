import { feedbackFor } from "@/features/activities/feedback";
import { MAX_ATTEMPTS } from "@/features/activities/engine/attempt";
import {
  activityCompletionReward,
  activityReward,
  type RewardAmount,
} from "@/features/rewards/logic";

import type { ActivityEvaluation, LocalizedText } from "@/types/content";

/**
 * Reglas de resultado de UN intento.
 *
 * Es la autoridad que ejecuta el servidor (ADR 0004). El cliente mantiene su
 * estado local con `reduceAttempt`, que debe producir los mismos numeros; una
 * prueba unitaria (`tests/unit/outcome.test.ts`) comprueba que coinciden.
 */

export type ActivityOutcome = {
  solved: boolean;
  /** Se agotaron los intentos y ya puede mostrarse la solucion. */
  revealed: boolean;
  firstTry: boolean;
  reward: RewardAmount;
  feedback: LocalizedText;
};

export type OutcomeParams = {
  evaluation: ActivityEvaluation;
  /** Intento dentro de esta sesion de la actividad (1 = primero). */
  attemptNumber: number;
  hintUsed: boolean;
  /** La actividad viene del bloque de repaso. */
  isReview: boolean;
};

export function computeOutcome(params: OutcomeParams): ActivityOutcome {
  const { evaluation, attemptNumber, hintUsed, isReview } = params;

  const solved = evaluation.isCorrect;
  const revealed = !solved && attemptNumber >= MAX_ATTEMPTS;
  const firstTry = solved && !evaluation.selfReported && attemptNumber === 1 && !hintUsed;

  const reward = solved
    ? activityReward({
        correct: true,
        selfReported: evaluation.selfReported === true,
        firstTry,
        isReview,
      })
    : revealed
      ? activityCompletionReward()
      : { xp: 0, coins: 0 };

  return {
    solved,
    revealed,
    firstTry,
    reward,
    feedback: feedbackFor(evaluation, firstTry),
  };
}
