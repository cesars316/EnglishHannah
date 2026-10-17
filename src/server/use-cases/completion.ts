import { getLesson } from "@/content";
import { applyOutcome, makeProgressId } from "@/features/progress/logic";
import {
  applyUnlocks,
  lessonCompletionReward,
  mergeRewards,
  worldCompletionReward,
  type RewardAmount,
} from "@/features/rewards/logic";
import { gameStateCollection } from "@/server/db/collections";
import {
  toAttempt,
  toGameState,
  toGameStateDoc,
  toProgressDoc,
  toProgressRecord,
} from "@/server/db/mappers";
import { apiError } from "@/server/http/errors";
import { listAttempts } from "@/server/repositories/attempts";
import { ensureGameState, saveGameState } from "@/server/repositories/game-state";
import { listProgress, saveProgressDoc } from "@/server/repositories/progress";
import { profileContext } from "@/server/use-cases/common";

import type { Db } from "mongodb";
import type { CompleteLessonResult } from "@/types/api";

export type { CompleteLessonResult };

/**
 * Cierre de leccion.
 *
 * Idempotente por partida doble:
 * 1. `$addToSet` con filtro `$ne`: solo la primera peticion modifica el estado.
 * 2. Si ya estaba completada, se devuelve `duplicate: true` sin otorgar nada.
 *
 * De paso, cuando la leccion cierra un mundo se otorga el bonus de mundo UNA
 * sola vez (los mundos completados son monotonos: su conjunto solo crece).
 */

/** Entrada del caso de uso: la leccion mas el dueno de la sesion. */
export type CompleteLessonParams = {
  ownerId: string;
  profileId: string;
  lessonId: string;
};

export async function completeLesson(input: CompleteLessonParams): Promise<CompleteLessonResult> {
  const { db } = await profileContext(input.ownerId, input.profileId);
  const { profileId, lessonId } = input;

  const lesson = getLesson(lessonId);
  if (!lesson) throw apiError.notFound("Esa leccion no existe.");

  const before = await ensureGameState(db, profileId);
  const now = new Date();

  const mark = await gameStateCollection(db).updateOne(
    { _id: profileId, completedLessonIds: { $ne: lessonId } },
    {
      $addToSet: { completedLessonIds: lessonId },
      $set: { lastActivityAt: now, updatedAt: now },
    },
  );

  if (mark.modifiedCount !== 1) {
    return {
      duplicate: true,
      lessonId,
      xpAwarded: 0,
      coinsAwarded: 0,
      newlyCompletedWorldIds: [],
      gameState: toGameState(before),
      earnedBadgeIds: before.earnedBadgeIds,
    };
  }

  await recordLessonProgress(db, profileId, lessonId, now);

  const records = await listProgress(db, profileId);
  const attempts = await listAttempts(db, profileId);
  const current = await ensureGameState(db, profileId);

  const unlocked = applyUnlocks(
    toGameState(current),
    records.map(toProgressRecord),
    attempts.map(toAttempt),
  );

  const beforeWorlds = new Set(before.completedWorldIds);
  const newlyCompletedWorldIds = unlocked.completedWorldIds.filter((id) => !beforeWorlds.has(id));

  const reward: RewardAmount = mergeRewards(
    lessonCompletionReward(),
    ...newlyCompletedWorldIds.map(() => worldCompletionReward()),
  );

  unlocked.xp += reward.xp;
  unlocked.coins += reward.coins;
  unlocked.lastActivityAt = now.toISOString();

  await saveGameState(db, toGameStateDoc(unlocked, now));
  const finalDoc = await ensureGameState(db, profileId);

  return {
    duplicate: false,
    lessonId,
    xpAwarded: reward.xp,
    coinsAwarded: reward.coins,
    newlyCompletedWorldIds,
    gameState: toGameState(finalDoc),
    earnedBadgeIds: finalDoc.earnedBadgeIds,
  };
}

async function recordLessonProgress(
  db: Db,
  profileId: string,
  lessonId: string,
  now: Date,
): Promise<void> {
  const progressId = `${profileId}:${makeProgressId("lesson", lessonId)}`;
  const records = await listProgress(db, profileId);
  const current = records.find((doc) => doc._id === progressId) ?? null;

  const next = applyOutcome(current ? toProgressRecord(current) : null, {
    profileId,
    entityType: "lesson",
    entityId: lessonId,
    activityType: "lesson-completion",
    activitySkill: "vocabulary",
    correct: true,
    selfReported: true,
    source: "session",
    now,
  });

  await saveProgressDoc(db, toProgressDoc(next, now));
}
