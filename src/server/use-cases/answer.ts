import { randomUUID } from "node:crypto";

import type { Db } from "mongodb";
import { MongoServerError } from "mongodb";

import { getActivity } from "@/content";
import { evaluateActivity } from "@/features/activities/engine/evaluate";
import { computeOutcome } from "@/features/activities/engine/outcome";
import { worldIdForActivity } from "@/features/activities/select";
import { applyOutcome, makeProgressId } from "@/features/progress/logic";
import { applyUnlocks } from "@/features/rewards/logic";
import type { AttemptDoc } from "@/server/db/collections";
import {
  toAttempt,
  toGameState,
  toGameStateDoc,
  toProgressDoc,
  toProgressRecord,
} from "@/server/db/mappers";
import { apiError } from "@/server/http/errors";
import {
  countAttemptsForActivity,
  findAttemptByClientId,
  insertAttempt,
  listAttempts,
} from "@/server/repositories/attempts";
import { ensureGameState, saveGameState } from "@/server/repositories/game-state";
import { listProgress, saveProgressDoc } from "@/server/repositories/progress";
import { profileContext } from "@/server/use-cases/common";

import type { AnswerActivityResult } from "@/types/api";
import type { ActivityEvaluation, ActivityResponse, LocalizedText, Skill } from "@/types/content";
import type { GameState, ProgressRecord } from "@/types/domain";

export type { AnswerActivityResult };

/**
 * Caso de uso central del juego: corregir una respuesta y registrar el intento.
 *
 * Autoridad unica (ADR 0004):
 * - El `answerKey` se resuelve aqui; el cliente nunca lo recibe.
 * - Un `clientAttemptId` repetido NO vuelve a otorgar XP ni monedas.
 * - El progreso y las recompensas se calculan con las funciones puras
 *   compartidas con el cliente, para que no haya dos verdades.
 */

/** Entrada del caso de uso: el payload de la API mas el dueno de la sesion. */
export type AnswerActivityParams = {
  ownerId: string;
  profileId: string;
  activityId: string;
  clientAttemptId: string;
  response: ActivityResponse;
  /** Intento dentro de esta sesion (1 = primero). */
  attemptNumber: number;
  durationMs: number;
  hintUsed: boolean;
  isReview: boolean;
  /**
   * Momento del intento. Se inyecta en las pruebas para controlar los
   * intervalos de repaso; en produccion siempre es el reloj real.
   */
  now?: Date;
};

export async function answerActivity(input: AnswerActivityParams): Promise<AnswerActivityResult> {
  const { db } = await profileContext(input.ownerId, input.profileId);
  const { profileId, activityId, clientAttemptId } = input;

  const activity = getActivity(activityId);
  if (!activity) throw apiError.notFound("Esa actividad no existe.");

  const evaluation = evaluateActivity(activity, input.response);
  const outcome = computeOutcome({
    evaluation,
    attemptNumber: input.attemptNumber,
    hintUsed: input.hintUsed,
    isReview: input.isReview,
  });

  const now = input.now ?? new Date();

  const conflict = await findAttemptByClientId(db, profileId, clientAttemptId);
  if (conflict) {
    return duplicateResult(db, profileId, activityId, evaluation, outcome.feedback, conflict);
  }

  const attemptDoc: AttemptDoc = {
    _id: randomUUID(),
    profileId,
    clientAttemptId,
    activityId,
    lessonId: activity.lessonId,
    worldId: worldIdForActivity(activity),
    skill: activity.skill,
    result: outcome.solved ? (evaluation.selfReported ? "self-reported" : "correct") : "incorrect",
    attemptNumber: input.attemptNumber,
    durationMs: Math.max(0, Math.round(input.durationMs)),
    hintUsed: input.hintUsed,
    xpAwarded: outcome.reward.xp,
    coinsAwarded: outcome.reward.coins,
    createdAt: now,
  };

  try {
    await insertAttempt(db, attemptDoc);
  } catch (error) {
    // Carrera con un reintento simultaneo: el indice unico nos protege.
    if (isDuplicateKey(error)) {
      const stored = await findAttemptByClientId(db, profileId, clientAttemptId);
      if (stored) {
        return duplicateResult(db, profileId, activityId, evaluation, outcome.feedback, stored);
      }
    }
    throw error;
  }

  let finalDoc = await ensureGameState(db, profileId);

  if (outcome.solved || outcome.revealed) {
    const records = await applyVocabularyOutcomes(db, {
      profileId,
      activityType: activity.type,
      activitySkill: activity.skill,
      vocabularyIds: activity.vocabularyIds,
      correct: evaluation.isCorrect,
      selfReported: evaluation.selfReported === true,
      isReview: input.isReview,
      now,
    });

    const played = await listAttempts(db, profileId);

    const nextState: GameState = {
      ...toGameState(finalDoc),
      xp: finalDoc.xp + outcome.reward.xp,
      coins: finalDoc.coins + outcome.reward.coins,
      activityCount: finalDoc.activityCount + 1,
      currentWorldId: attemptDoc.worldId,
      lastActivityAt: now.toISOString(),
    };

    const unlocked = applyUnlocks(nextState, records, played.map(toAttempt));
    await saveGameState(db, toGameStateDoc(unlocked, now));
    finalDoc = await ensureGameState(db, profileId);
  }

  const totalAttempts = await countAttemptsForActivity(db, profileId, activityId);

  return {
    duplicate: false,
    evaluation,
    feedback: outcome.feedback,
    xpAwarded: outcome.reward.xp,
    coinsAwarded: outcome.reward.coins,
    attemptNumber: attemptDoc.attemptNumber,
    solved: outcome.solved,
    revealed: outcome.revealed,
    totalAttempts,
    gameState: toGameState(finalDoc),
    earnedBadgeIds: finalDoc.earnedBadgeIds,
  };
}

async function duplicateResult(
  db: Db,
  profileId: string,
  activityId: string,
  evaluation: ActivityEvaluation,
  feedback: LocalizedText,
  stored: AttemptDoc,
): Promise<AnswerActivityResult> {
  const gameState = await ensureGameState(db, profileId);
  const totalAttempts = await countAttemptsForActivity(db, profileId, activityId);

  return {
    duplicate: true,
    evaluation,
    feedback,
    xpAwarded: stored.xpAwarded,
    coinsAwarded: stored.coinsAwarded,
    attemptNumber: stored.attemptNumber,
    solved: stored.result !== "incorrect",
    revealed: false,
    totalAttempts,
    gameState: toGameState(gameState),
    earnedBadgeIds: gameState.earnedBadgeIds,
  };
}

/**
 * Aplica el intento a cada palabra practicada y devuelve TODOS los registros del
 * perfil (no solo los tocados): `applyUnlocks` necesita el conjunto completo
 * para contar palabras distintas.
 */
async function applyVocabularyOutcomes(
  db: Db,
  params: {
    profileId: string;
    activityType: string;
    activitySkill: Skill;
    vocabularyIds: readonly string[];
    correct: boolean;
    selfReported: boolean;
    isReview: boolean;
    now: Date;
  },
): Promise<ProgressRecord[]> {
  const existing = await listProgress(db, params.profileId);
  const byId = new Map(existing.map((doc) => [doc._id, doc]));

  for (const vocabularyId of params.vocabularyIds) {
    const progressId = `${params.profileId}:${makeProgressId("vocabulary", vocabularyId)}`;
    const current = byId.get(progressId);

    const next = applyOutcome(current ? toProgressRecord(current) : null, {
      profileId: params.profileId,
      entityType: "vocabulary",
      entityId: vocabularyId,
      activityType: params.activityType,
      activitySkill: params.activitySkill,
      correct: params.correct,
      selfReported: params.selfReported,
      source: params.isReview ? "review" : "session",
      now: params.now,
    });

    const doc = toProgressDoc(next, params.now);
    await saveProgressDoc(db, doc);
    byId.set(doc._id, doc);
  }

  return [...byId.values()].map(toProgressRecord);
}

function isDuplicateKey(error: unknown): boolean {
  return error instanceof MongoServerError && error.code === 11000;
}
