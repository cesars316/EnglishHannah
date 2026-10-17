import { FEEDBACK } from "@/config/rewards";

import type { ActivityEvaluation, LocalizedText } from "@/types/content";

/** Mensaje amable para un resultado. Un fallo nunca es motivo de reproche. */
export function feedbackFor(evaluation: ActivityEvaluation, firstTry: boolean): LocalizedText {
  if (evaluation.selfReported) return FEEDBACK.selfReported;
  if (!evaluation.isCorrect) return FEEDBACK.incorrect;
  return firstTry ? FEEDBACK.correctFirstTry : FEEDBACK.correct;
}
