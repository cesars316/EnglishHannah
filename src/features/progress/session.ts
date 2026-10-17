import {
  appendAttempt,
  createAttemptId,
  getGameState,
  listAttempts,
  listProgress,
  makeProgressId,
  saveGameState,
  upsertProgress,
} from "@/features/progress/local-progress";
import { applyOutcome, summarizeProgress, type ProgressOutcome } from "@/features/progress/logic";
import { computeUnlocks, lessonCompletionReward, uniqueIds } from "@/features/rewards/logic";
import { GAME } from "@/config/game";
import type { ActivityAttempt, GameState, ProgressRecord, ProgressSummary } from "@/types/domain";
import type { Skill } from "@/types/content";

/**
 * Orquestacion de una sesion de juego en modo local (Fase 2).
 *
 * Usa las funciones puras de `logic.ts` y escribe a traves de
 * `local-progress.ts`. En Fase 3 estas mismas operaciones se piden a la API y
 * el servidor pasa a ser la autoridad (ADR 0004).
 */

export type RecordAttemptInput = {
  profileId: string;
  activityId: string;
  activityType: string;
  lessonId: string;
  worldId: string;
  skill: Skill;
  /** Palabras practicadas en la actividad. */
  vocabularyIds: readonly string[];
  correct: boolean;
  selfReported: boolean;
  durationMs: number;
  hintUsed: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  isReview: boolean;
  now?: Date;
};

export type RecordAttemptResult = {
  attempt: ActivityAttempt;
  gameState: GameState;
  updatedRecords: ProgressRecord[];
};

function countDistinctVocabulary(records: readonly ProgressRecord[]): number {
  return uniqueIds(
    records
      .filter((record) => record.entityType === "vocabulary" && record.seenCount > 0)
      .map((record) => record.entityId),
  ).length;
}

function hasSpokenPractice(attempts: readonly ActivityAttempt[]): boolean {
  return attempts.some((attempt) => attempt.skill === "speaking" && attempt.result !== "incorrect");
}

function withUnlocks(
  gameState: GameState,
  records: readonly ProgressRecord[],
  attempts: readonly ActivityAttempt[],
): GameState {
  const unlocks = computeUnlocks({
    gameState,
    practicedVocabularyCount: countDistinctVocabulary(records),
    spokenPractice: hasSpokenPractice(attempts),
  });

  return {
    ...gameState,
    unlockedWorldIds: uniqueIds([...gameState.unlockedWorldIds, ...unlocks.availableWorldIds]),
    completedWorldIds: uniqueIds([...gameState.completedWorldIds, ...unlocks.completedWorldIds]),
    earnedBadgeIds: uniqueIds([...gameState.earnedBadgeIds, ...unlocks.earnedBadgeIds]),
  };
}

export function recordAttempt(input: RecordAttemptInput): RecordAttemptResult {
  const now = input.now ?? new Date();
  const previousAttempts = listAttempts(input.profileId);
  const attemptNumber =
    previousAttempts.filter((attempt) => attempt.activityId === input.activityId).length + 1;

  const attempt: ActivityAttempt = {
    id: createAttemptId(),
    profileId: input.profileId,
    activityId: input.activityId,
    lessonId: input.lessonId,
    worldId: input.worldId,
    skill: input.skill,
    result: input.correct ? "correct" : input.selfReported ? "self-reported" : "incorrect",
    attemptNumber,
    durationMs: Math.max(0, Math.round(input.durationMs)),
    hintUsed: input.hintUsed,
    xpAwarded: input.xpAwarded,
    createdAt: now.toISOString(),
  };

  appendAttempt(input.profileId, attempt);

  const outcomes: ProgressOutcome[] = input.vocabularyIds.map((entityId) => ({
    profileId: input.profileId,
    entityType: "vocabulary",
    entityId,
    activityType: input.activityType,
    activitySkill: input.skill,
    correct: input.correct,
    selfReported: input.selfReported,
    source: input.isReview ? "review" : "session",
    now,
  }));

  const updatedRecords: ProgressRecord[] = [];
  for (const outcome of outcomes) {
    const id = makeProgressId(outcome.entityType, outcome.entityId);
    const current = listProgress(input.profileId).find((record) => record.id === id) ?? null;
    const next = applyOutcome(current, outcome);
    upsertProgress(input.profileId, next);
    updatedRecords.push(next);
  }

  const current = getGameState(input.profileId);
  let gameState: GameState = {
    ...current,
    xp: current.xp + input.xpAwarded,
    coins: current.coins + input.coinsAwarded,
    activityCount: current.activityCount + 1,
    currentWorldId: input.worldId,
    lastActivityAt: now.toISOString(),
  };

  gameState = withUnlocks(gameState, listProgress(input.profileId), listAttempts(input.profileId));
  saveGameState(gameState);

  return { attempt, gameState, updatedRecords };
}

export type CompleteLessonResult = {
  duplicate: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  gameState: GameState;
  earnedBadgeIds: string[];
};

/** Marca una leccion como completada y otorga el bonus una sola vez. */
export function completeLesson(
  profileId: string,
  lessonId: string,
  now: Date = new Date(),
): CompleteLessonResult {
  let gameState = getGameState(profileId);
  const alreadyCompleted = gameState.completedLessonIds.includes(lessonId);

  if (!alreadyCompleted) {
    const bonus = lessonCompletionReward();
    gameState = {
      ...gameState,
      xp: gameState.xp + bonus.xp,
      coins: gameState.coins + bonus.coins,
      completedLessonIds: [...gameState.completedLessonIds, lessonId],
      lastActivityAt: now.toISOString(),
    };

    const lessonRecord: ProgressRecord = applyOutcome(
      listProgress(profileId).find((record) => record.id === makeProgressId("lesson", lessonId)) ??
        null,
      {
        profileId,
        entityType: "lesson",
        entityId: lessonId,
        activityType: "lesson-completion",
        activitySkill: "vocabulary",
        correct: true,
        selfReported: true,
        source: "session",
        now,
      },
    );
    upsertProgress(profileId, lessonRecord);

    gameState = withUnlocks(gameState, listProgress(profileId), listAttempts(profileId));
    saveGameState(gameState);

    return {
      duplicate: false,
      xpAwarded: bonus.xp,
      coinsAwarded: bonus.coins,
      gameState,
      earnedBadgeIds: gameState.earnedBadgeIds,
    };
  }

  return {
    duplicate: true,
    xpAwarded: 0,
    coinsAwarded: 0,
    gameState,
    earnedBadgeIds: gameState.earnedBadgeIds,
  };
}

export function getSummary(profileId: string, now: Date = new Date()): ProgressSummary {
  return summarizeProgress({
    gameState: getGameState(profileId),
    records: listProgress(profileId),
    attempts: listAttempts(profileId),
    now,
    reviewLimit: GAME.maxReviewSuggestions,
  });
}
