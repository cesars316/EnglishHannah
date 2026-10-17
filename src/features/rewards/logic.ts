import { REWARDS } from "@/config/rewards";
import { ALL_LESSONS, BADGES, PUBLISHED_WORLDS } from "@/content";
import type { ActivityAttempt, GameState, ProgressRecord } from "@/types/domain";

/**
 * Reglas de recompensa y desbloqueo. Logica pura y centralizada: no hay
 * numeros magicos de XP fuera de `src/config/rewards.ts`.
 */

export type RewardAmount = { xp: number; coins: number };

export type ActivityRewardParams = {
  correct: boolean;
  selfReported: boolean;
  /** Primer intento, sin pistas. */
  firstTry: boolean;
  /** La actividad forma parte del bloque de repaso. */
  isReview: boolean;
};

/**
 * Recompensa por responder una actividad.
 * Equivocarse nunca resta: simplemente no suma.
 */
export function activityReward(params: ActivityRewardParams): RewardAmount {
  const { correct, selfReported, firstTry, isReview } = params;

  if (!correct && !selfReported) return { xp: 0, coins: 0 };

  let xp = REWARDS.xpPerActivityCompleted;
  if (correct && firstTry) xp += REWARDS.xpBonusCorrectFirstTry;
  if (isReview) xp += REWARDS.xpBonusReviewEffort;

  return { xp, coins: REWARDS.coinsPerActivityCompleted };
}

export function lessonCompletionReward(): RewardAmount {
  return { xp: REWARDS.xpBonusLessonCompleted, coins: REWARDS.coinsPerLessonCompleted };
}

export function worldCompletionReward(): RewardAmount {
  return { xp: REWARDS.xpBonusWorldCompleted, coins: REWARDS.coinsPerWorldCompleted };
}

/**
 * Recompensa por TERMINAR una actividad, aunque haya hecho falta ver la
 * solucion. Es la regla "completar cualquier actividad" del documento maestro:
 * equivocarse nunca deja al jugador sin recompensa por su esfuerzo.
 */
export function activityCompletionReward(): RewardAmount {
  return { xp: REWARDS.xpPerActivityCompleted, coins: REWARDS.coinsPerActivityCompleted };
}

export function mergeRewards(...rewards: readonly RewardAmount[]): RewardAmount {
  return rewards.reduce<RewardAmount>(
    (total, reward) => ({ xp: total.xp + reward.xp, coins: total.coins + reward.coins }),
    { xp: 0, coins: 0 },
  );
}

/* -------------------------------------------------------------------------- */
/* Desbloqueos e insignias                                                     */
/* -------------------------------------------------------------------------- */

export type UnlockInput = {
  gameState: Pick<GameState, "completedLessonIds" | "completedWorldIds" | "earnedBadgeIds">;
  /** Palabras distintas practicadas al menos una vez. */
  practicedVocabularyCount: number;
  /** Se practico hablar en voz alta al menos una vez. */
  spokenPractice: boolean;
};

export type UnlockResult = {
  /** Mundos que deberian estar disponibles segun el progreso. */
  availableWorldIds: string[];
  /** Insignias que corresponden al progreso actual (conjunto completo). */
  earnedBadgeIds: string[];
  /** Mundos completados segun sus lecciones. */
  completedWorldIds: string[];
};

/** Mundos cuyos prerrequisitos ya se completaron. */
export function availableWorldIdsFor(completedWorldIds: readonly string[]): string[] {
  const completed = new Set(completedWorldIds);
  return PUBLISHED_WORLDS.filter((world) =>
    world.prerequisites.every((prerequisite) => completed.has(prerequisite)),
  ).map((world) => world.id);
}

/**
 * Calcula el estado de desbloqueo completo a partir del progreso.
 *
 * Es idempotente: devuelve el conjunto total que corresponde al progreso, no
 * solo lo nuevo. Quien lo use debe fusionar (union) con lo ya guardado para no
 * perder insignias historicas.
 */
export function computeUnlocks(input: UnlockInput): UnlockResult {
  const completedLessons = new Set(input.gameState.completedLessonIds);

  const completedWorldIds = PUBLISHED_WORLDS.filter((world) => {
    const lessons = ALL_LESSONS.filter((lesson) => lesson.worldId === world.id);
    return lessons.length > 0 && lessons.every((lesson) => completedLessons.has(lesson.id));
  }).map((world) => world.id);

  const completedWorldSet = new Set(completedWorldIds);

  const availableWorldIds = availableWorldIdsFor(completedWorldIds);

  const earnedBadgeIds = BADGES.filter((badge) => {
    if (badge.kind === "world" && badge.worldId !== null) {
      return completedWorldSet.has(badge.worldId);
    }
    switch (badge.id) {
      case "first-steps":
        return input.gameState.completedLessonIds.length > 0;
      case "brave-speaker":
        return input.spokenPractice;
      case "word-collector":
        return input.practicedVocabularyCount >= WORD_COLLECTOR_THRESHOLD;
      case "island-explorer":
        return PUBLISHED_WORLDS.every((world) => completedWorldSet.has(world.id));
      default:
        return false;
    }
  }).map((badge) => badge.id);

  return { availableWorldIds, earnedBadgeIds, completedWorldIds };
}

/** Palabras distintas necesarias para la insignia "Coleccionista de palabras". */
export const WORD_COLLECTOR_THRESHOLD = 20;

export function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

export function countDistinctVocabulary(records: readonly ProgressRecord[]): number {
  return uniqueIds(
    records
      .filter((record) => record.entityType === "vocabulary" && record.seenCount > 0)
      .map((record) => record.entityId),
  ).length;
}

export function hasSpokenPractice(attempts: readonly ActivityAttempt[]): boolean {
  return attempts.some((attempt) => attempt.skill === "speaking" && attempt.result !== "incorrect");
}

/**
 * Fusiona el resultado de `computeUnlocks` con el estado guardado.
 *
 * `computeUnlocks` devuelve siempre el conjunto COMPLETO que corresponde al
 * progreso actual, por eso la fusion es una union: asi nunca se pierden
 * insignias ni desbloqueos historicos aunque el contenido crezca.
 */
export function applyUnlocks(
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
