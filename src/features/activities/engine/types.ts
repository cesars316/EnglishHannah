import type { ActivityEvaluation, ActivityResponse, LocalizedText } from "@/types/content";

/**
 * Contrato del motor de actividades.
 *
 * `evaluateActivity` es pura y compartida: en Fase 2 la ejecuta el servidor a
 * traves de una Server Action (asi el `answerKey` nunca viaja al navegador,
 * ver ADR 0004) y en Fase 3 pasara a ser parte del caso de uso de la API.
 */

export type EvaluateAnswerInput = {
  activityId: string;
  response: ActivityResponse;
  /** Numero de intento dentro de la actividad (1 = primero). */
  attemptNumber: number;
  hintUsed: boolean;
  /** La actividad viene del bloque de repaso. */
  isReview: boolean;
};

export type EvaluateAnswerResult = {
  evaluation: ActivityEvaluation;
  feedback: LocalizedText;
  xpAwarded: number;
  coinsAwarded: number;
};
