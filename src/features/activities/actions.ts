"use server";

import { z } from "zod";

import { getActivity } from "@/content";
import { evaluateActivity } from "@/features/activities/engine/evaluate";
import type { EvaluateAnswerResult } from "@/features/activities/engine/types";
import { activityReward } from "@/features/rewards/logic";
import { FEEDBACK } from "@/config/rewards";
import type { ActivityEvaluation, LocalizedText } from "@/types/content";

/**
 * Evaluacion de respuestas en el servidor.
 *
 * El navegador NUNCA recibe el `answerKey` (ADR 0004): envia la respuesta y
 * recibe la correccion. En Fase 2 la actividad se resuelve desde el contenido
 * versionado (`src/content`); en Fase 3 el cuerpo de esta accion llamara al
 * caso de uso de la API para registrar el intento en MongoDB.
 */

const optionId = z.string().min(1).max(120);

const activityResponseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("choice"), optionId }),
  z.object({
    kind: z.literal("pairs"),
    pairs: z
      .array(z.object({ leftId: optionId, rightId: optionId }))
      .min(1)
      .max(12),
  }),
  z.object({ kind: z.literal("text"), text: z.string().max(200) }),
  z.object({ kind: z.literal("speech"), transcript: z.string().max(300).nullable() }),
  z.object({ kind: z.literal("self-report"), practiced: z.boolean() }),
]);

const inputSchema = z.object({
  activityId: z.string().min(1).max(120),
  response: activityResponseSchema,
  attemptNumber: z.number().int().min(1).max(20),
  hintUsed: z.boolean(),
  isReview: z.boolean(),
});

function feedbackFor(evaluation: ActivityEvaluation, firstTry: boolean): LocalizedText {
  if (evaluation.selfReported) return FEEDBACK.selfReported;
  if (!evaluation.isCorrect) return FEEDBACK.incorrect;
  return firstTry ? FEEDBACK.correctFirstTry : FEEDBACK.correct;
}

export async function evaluateAnswer(input: unknown): Promise<EvaluateAnswerResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("INVALID_PAYLOAD");
  }

  const { activityId, response, attemptNumber, hintUsed, isReview } = parsed.data;

  const activity = getActivity(activityId);
  if (!activity) {
    throw new Error("ACTIVITY_NOT_FOUND");
  }

  const evaluation = evaluateActivity(activity, response);
  const firstTry =
    evaluation.isCorrect && !evaluation.selfReported && attemptNumber === 1 && !hintUsed;

  const reward = activityReward({
    correct: evaluation.isCorrect,
    selfReported: evaluation.selfReported === true,
    firstTry,
    isReview,
  });

  return {
    evaluation,
    feedback: feedbackFor(evaluation, firstTry),
    xpAwarded: reward.xp,
    coinsAwarded: reward.coins,
  };
}
