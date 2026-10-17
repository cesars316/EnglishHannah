import { describe, expect, it } from "vitest";

import { REWARDS } from "@/config/rewards";
import { ALL_LESSONS, PUBLISHED_WORLDS } from "@/content";
import {
  activityCompletionReward,
  activityReward,
  availableWorldIdsFor,
  computeUnlocks,
  lessonCompletionReward,
  mergeRewards,
  uniqueIds,
  worldCompletionReward,
  WORD_COLLECTOR_THRESHOLD,
} from "@/features/rewards/logic";
import type { GameState } from "@/types/domain";

function emptyState(overrides: Partial<GameState> = {}): GameState {
  return {
    profileId: "p1",
    xp: 0,
    coins: 0,
    currentWorldId: null,
    unlockedWorldIds: [],
    completedLessonIds: [],
    completedWorldIds: [],
    earnedBadgeIds: [],
    activityCount: 0,
    lastActivityAt: null,
    updatedAt: new Date(0).toISOString(),
    ...overrides,
  };
}

describe("activityReward", () => {
  it("no da nada si la respuesta es incorrecta y no es autoinforme", () => {
    expect(
      activityReward({ correct: false, selfReported: false, firstTry: false, isReview: false }),
    ).toEqual({ xp: 0, coins: 0 });
  });

  it("da la base al completar la actividad", () => {
    expect(
      activityReward({ correct: true, selfReported: false, firstTry: false, isReview: false }),
    ).toEqual({ xp: REWARDS.xpPerActivityCompleted, coins: REWARDS.coinsPerActivityCompleted });
  });

  it("suma el bonus de primer intento sin pista", () => {
    const reward = activityReward({
      correct: true,
      selfReported: false,
      firstTry: true,
      isReview: false,
    });
    expect(reward.xp).toBe(REWARDS.xpPerActivityCompleted + REWARDS.xpBonusCorrectFirstTry);
  });

  it("suma el bonus de esfuerzo en el repaso", () => {
    const reward = activityReward({
      correct: true,
      selfReported: false,
      firstTry: false,
      isReview: true,
    });
    expect(reward.xp).toBe(REWARDS.xpPerActivityCompleted + REWARDS.xpBonusReviewEffort);
  });

  it("nunca resta XP", () => {
    const reward = activityReward({
      correct: false,
      selfReported: true,
      firstTry: false,
      isReview: false,
    });
    expect(reward.xp).toBeGreaterThanOrEqual(0);
    expect(reward.coins).toBeGreaterThanOrEqual(0);
  });
});

describe("recompensas fijas", () => {
  it("la recompensa por completar una actividad coincide con la base", () => {
    expect(activityCompletionReward()).toEqual({
      xp: REWARDS.xpPerActivityCompleted,
      coins: REWARDS.coinsPerActivityCompleted,
    });
  });

  it("las recompensas de leccion y mundo usan los valores configurados", () => {
    expect(lessonCompletionReward()).toEqual({
      xp: REWARDS.xpBonusLessonCompleted,
      coins: REWARDS.coinsPerLessonCompleted,
    });
    expect(worldCompletionReward()).toEqual({
      xp: REWARDS.xpBonusWorldCompleted,
      coins: REWARDS.coinsPerWorldCompleted,
    });
  });

  it("mergeRewards suma todas las recompensas", () => {
    expect(mergeRewards({ xp: 1, coins: 2 }, { xp: 3, coins: 4 })).toEqual({ xp: 4, coins: 6 });
  });
});

describe("availableWorldIdsFor", () => {
  it("el primer mundo siempre esta disponible", () => {
    const first = PUBLISHED_WORLDS[0];
    if (!first) throw new Error("No hay mundos publicados");
    expect(availableWorldIdsFor([])).toContain(first.id);
  });

  it("abre un mundo cuando se completan sus prerrequisitos", () => {
    const withPrerequisite = PUBLISHED_WORLDS.find((world) => world.prerequisites.length > 0);
    if (!withPrerequisite) return; // si aun no hay dependencias, no hay nada que probar

    expect(availableWorldIdsFor([])).not.toContain(withPrerequisite.id);
    expect(availableWorldIdsFor(withPrerequisite.prerequisites)).toContain(withPrerequisite.id);
  });
});

describe("computeUnlocks", () => {
  it("marca un mundo como completado cuando lo estan todas sus lecciones", () => {
    const world = PUBLISHED_WORLDS[0];
    if (!world) throw new Error("No hay mundos publicados");

    const allLessons = ALL_LESSONS.filter((lesson) => lesson.worldId === world.id).map(
      (lesson) => lesson.id,
    );
    const unlocks = computeUnlocks({
      gameState: emptyState({ completedLessonIds: allLessons }),
      practicedVocabularyCount: 0,
      spokenPractice: false,
    });

    expect(unlocks.completedWorldIds).toContain(world.id);
  });

  it("no completa un mundo si falta alguna leccion", () => {
    const world = PUBLISHED_WORLDS[0];
    if (!world) throw new Error("No hay mundos publicados");

    const unlocks = computeUnlocks({
      gameState: emptyState({ completedLessonIds: [] }),
      practicedVocabularyCount: 0,
      spokenPractice: false,
    });

    expect(unlocks.completedWorldIds).not.toContain(world.id);
  });

  it("concede la insignia de primeros pasos tras la primera leccion", () => {
    const unlocks = computeUnlocks({
      gameState: emptyState({ completedLessonIds: ["cualquiera"] }),
      practicedVocabularyCount: 0,
      spokenPractice: false,
    });
    expect(unlocks.earnedBadgeIds).toContain("first-steps");
  });

  it("concede la insignia de coleccionista al alcanzar el umbral de palabras", () => {
    expect(
      computeUnlocks({
        gameState: emptyState(),
        practicedVocabularyCount: WORD_COLLECTOR_THRESHOLD - 1,
        spokenPractice: false,
      }).earnedBadgeIds,
    ).not.toContain("word-collector");

    expect(
      computeUnlocks({
        gameState: emptyState(),
        practicedVocabularyCount: WORD_COLLECTOR_THRESHOLD,
        spokenPractice: false,
      }).earnedBadgeIds,
    ).toContain("word-collector");
  });

  it("concede la insignia de hablar tras practicar en voz alta", () => {
    expect(
      computeUnlocks({
        gameState: emptyState(),
        practicedVocabularyCount: 0,
        spokenPractice: true,
      }).earnedBadgeIds,
    ).toContain("brave-speaker");
  });

  it("es idempotente: el mismo progreso da el mismo resultado", () => {
    const input = {
      gameState: emptyState({ completedLessonIds: ["l1"] }),
      practicedVocabularyCount: 3,
      spokenPractice: true,
    };
    expect(computeUnlocks(input)).toEqual(computeUnlocks(input));
  });
});

describe("uniqueIds", () => {
  it("quita duplicados conservando el orden", () => {
    expect(uniqueIds(["b", "a", "b", "c", "a"])).toEqual(["b", "a", "c"]);
  });
});
