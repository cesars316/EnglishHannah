import { describe, expect, it } from "vitest";

import { MASTERY } from "@/config/rewards";
import {
  applyOutcome,
  dayKey,
  emptyProgressRecord,
  makeProgressId,
  pickReviewTargets,
  summarizeProgress,
  type ProgressOutcome,
} from "@/features/progress/logic";
import type { ActivityAttempt, GameState } from "@/types/domain";

const DAY = new Date("2026-03-10T10:00:00.000Z");

function outcome(overrides: Partial<ProgressOutcome> = {}): ProgressOutcome {
  return {
    profileId: "p1",
    entityType: "vocabulary",
    entityId: "voc-hello",
    activityType: "image-choice",
    activitySkill: "vocabulary",
    correct: true,
    selfReported: false,
    source: "session",
    now: DAY,
    ...overrides,
  };
}

function gameState(overrides: Partial<GameState> = {}): GameState {
  return {
    profileId: "p1",
    xp: 10,
    coins: 2,
    currentWorldId: "hello-village",
    unlockedWorldIds: ["hello-village"],
    completedLessonIds: [],
    completedWorldIds: [],
    earnedBadgeIds: [],
    activityCount: 1,
    lastActivityAt: DAY.toISOString(),
    updatedAt: DAY.toISOString(),
    ...overrides,
  };
}

describe("makeProgressId y dayKey", () => {
  it("compone el id con tipo y entidad", () => {
    expect(makeProgressId("vocabulary", "voc-hello")).toBe("vocabulary:voc-hello");
  });

  it("dayKey usa la fecha local en formato YYYY-MM-DD", () => {
    expect(dayKey(new Date(2026, 2, 10))).toBe("2026-03-10");
  });
});

describe("applyOutcome - dominio", () => {
  it("sube la puntuacion al acertar", () => {
    const record = applyOutcome(null, outcome({ correct: true }));
    expect(record.correctCount).toBe(1);
    expect(record.masteryScore).toBeCloseTo(MASTERY.correctWeight);
    expect(record.status).toBe("learning");
  });

  it("baja la puntuacion al fallar, sin borrar el historial", () => {
    const first = applyOutcome(null, outcome({ correct: true }));
    const failed = applyOutcome(
      first,
      outcome({ correct: false, now: new Date("2026-03-11T10:00:00Z") }),
    );

    expect(failed.correctCount).toBe(1);
    expect(failed.incorrectCount).toBe(1);
    expect(failed.masteryScore).toBeLessThan(first.masteryScore);
    expect(failed.masteryScore).toBeGreaterThanOrEqual(0);
    expect(failed.status).toBe("review");
  });

  it("nunca baja de 0 la puntuacion", () => {
    let record = applyOutcome(null, outcome({ correct: false }));
    for (let index = 0; index < 10; index += 1) {
      record = applyOutcome(record, outcome({ correct: false }));
    }
    expect(record.masteryScore).toBe(0);
  });

  it("cuenta dias distintos solo cuando el intento puntua y cambia el dia", () => {
    let record = applyOutcome(null, outcome({ correct: true }));
    expect(record.distinctPracticeDays).toBe(1);

    // Mismo dia: no cuenta otra vez.
    record = applyOutcome(
      record,
      outcome({ correct: true, now: new Date("2026-03-10T20:00:00Z") }),
    );
    expect(record.distinctPracticeDays).toBe(1);

    // Dia nuevo: cuenta.
    record = applyOutcome(
      record,
      outcome({ correct: true, now: new Date("2026-03-12T09:00:00Z") }),
    );
    expect(record.distinctPracticeDays).toBe(2);
  });

  it("registra tipos de actividad distintos sin repetirlos", () => {
    let record = applyOutcome(null, outcome({ activityType: "image-choice" }));
    record = applyOutcome(record, outcome({ activityType: "image-choice" }));
    record = applyOutcome(record, outcome({ activityType: "word-builder" }));
    expect(record.activityTypesCompleted).toEqual(["image-choice", "word-builder"]);
  });

  it("alcanza el dominio con suficientes aciertos, dias y tipos", () => {
    let record = applyOutcome(null, outcome({ correct: true, activityType: "image-choice" }));
    record = applyOutcome(
      record,
      outcome({
        correct: true,
        activityType: "word-builder",
        now: new Date("2026-03-11T10:00:00Z"),
      }),
    );
    record = applyOutcome(
      record,
      outcome({
        correct: true,
        activityType: "listen-and-choose",
        now: new Date("2026-03-12T10:00:00Z"),
      }),
    );
    record = applyOutcome(
      record,
      outcome({
        correct: true,
        activityType: "matching-pairs",
        now: new Date("2026-03-13T10:00:00Z"),
      }),
    );

    expect(record.correctCount).toBeGreaterThanOrEqual(MASTERY.requiredCorrect);
    expect(["mastered", "practicing"]).toContain(record.status);
  });

  it("no muta el registro anterior", () => {
    const first = applyOutcome(null, outcome());
    const snapshot = JSON.stringify(first);
    applyOutcome(first, outcome({ correct: false }));
    expect(JSON.stringify(first)).toBe(snapshot);
  });

  it("parte de un registro vacio consistente", () => {
    const empty = emptyProgressRecord("p1", "vocabulary", "voc-hello", DAY);
    expect(empty).toMatchObject({ seenCount: 0, correctCount: 0, status: "new", masteryScore: 0 });
  });
});

describe("pickReviewTargets", () => {
  // Las palabras recien practicadas no vuelven a pedirse de inmediato: el
  // repaso tiene su propio calendario. Para que esten "vencidas" se consulta
  // una fecha bastante posterior.
  const LATER = new Date("2026-06-01T10:00:00.000Z");

  it("prioriza las palabras en estado de repaso", () => {
    const reviewRecord = applyOutcome(
      applyOutcome(null, outcome({ correct: true })),
      outcome({ correct: false, now: new Date("2026-03-11T10:00:00Z") }),
    );
    const learningRecord = applyOutcome(null, outcome({ entityId: "voc-otra", correct: true }));

    const targets = pickReviewTargets([learningRecord, reviewRecord], LATER, 5);
    expect(targets[0]?.entityId).toBe("voc-hello");
  });

  it("excluye las palabras dominadas y respeta el limite", () => {
    const mastered = {
      ...emptyProgressRecord("p1", "vocabulary", "voc-mastered", DAY),
      status: "mastered" as const,
    };
    const a = applyOutcome(null, outcome({ entityId: "voc-a" }));
    const b = applyOutcome(null, outcome({ entityId: "voc-b" }));

    const targets = pickReviewTargets([mastered, a, b], LATER, 1);
    expect(targets).toHaveLength(1);
    expect(targets.some((record) => record.entityId === "voc-mastered")).toBe(false);
  });

  it("no propone palabras cuya revision aun no toca", () => {
    const record = {
      ...emptyProgressRecord("p1", "vocabulary", "voc-futuro", DAY),
      status: "learning" as const,
      nextReviewAt: new Date("2026-04-01T00:00:00Z").toISOString(),
    };
    expect(pickReviewTargets([record], DAY, 5)).toHaveLength(0);
  });
});

describe("summarizeProgress", () => {
  function attempt(overrides: Partial<ActivityAttempt> = {}): ActivityAttempt {
    return {
      id: "a1",
      profileId: "p1",
      activityId: "act-1",
      lessonId: "hello-01",
      worldId: "hello-village",
      skill: "vocabulary",
      result: "correct",
      attemptNumber: 1,
      durationMs: 60_000,
      hintUsed: false,
      xpAwarded: 10,
      createdAt: DAY.toISOString(),
      ...overrides,
    };
  }

  it("agrega XP, monedas, minutos y actividad por habilidad", () => {
    const summary = summarizeProgress({
      gameState: gameState({ xp: 40, coins: 6, completedWorldIds: ["hello-village"] }),
      records: [applyOutcome(null, outcome())],
      attempts: [
        attempt({ id: "a1", skill: "vocabulary", result: "correct", durationMs: 60_000 }),
        attempt({ id: "a2", skill: "speaking", result: "self-reported", durationMs: 30_000 }),
        attempt({ id: "a3", skill: "vocabulary", result: "incorrect", durationMs: 30_000 }),
      ],
      now: DAY,
      reviewLimit: 5,
    });

    expect(summary.xp).toBe(40);
    expect(summary.coins).toBe(6);
    expect(summary.activitiesCompleted).toBe(3);
    expect(summary.minutesPracticed).toBe(2);
    expect(summary.worldsVisited).toBe(1);
    expect(summary.worldsCompleted).toBe(1);
    expect(summary.bySkill.vocabulary).toEqual({ attempts: 2, correct: 1 });
    expect(summary.bySkill.speaking).toEqual({ attempts: 1, correct: 0 });
  });

  it("cuenta palabras vistas y dominadas de los registros de vocabulario", () => {
    const mastered = {
      ...emptyProgressRecord("p1", "vocabulary", "voc-mastered", DAY),
      seenCount: 4,
      status: "mastered" as const,
    };
    const summary = summarizeProgress({
      gameState: gameState(),
      records: [mastered, applyOutcome(null, outcome())],
      attempts: [],
      now: DAY,
      reviewLimit: 5,
    });

    expect(summary.vocabularySeen).toBe(2);
    expect(summary.vocabularyMastered).toBe(1);
  });

  it("limita la actividad reciente a 10 entradas, de la mas nueva a la mas vieja", () => {
    const attempts = Array.from({ length: 12 }, (_, index) =>
      attempt({
        id: `a${index}`,
        createdAt: new Date(DAY.getTime() + index * 1000).toISOString(),
      }),
    );
    const summary = summarizeProgress({
      gameState: gameState(),
      records: [],
      attempts,
      now: DAY,
      reviewLimit: 5,
    });

    expect(summary.recentActivity).toHaveLength(10);
    expect(summary.recentActivity[0]?.activityId).toBe("act-1");
  });
});
