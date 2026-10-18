import { describe, expect, it } from "vitest";

import { DIFFICULTY } from "@/config/game";
import { computeChallenge } from "@/features/difficulty/logic";
import { emptyProgressRecord } from "@/features/progress/logic";
import type { ActivityAttempt, ProgressRecord, ProgressEntityType } from "@/types/domain";

const DAY = new Date("2026-03-10T10:00:00.000Z");

function record(
  entityType: ProgressEntityType,
  entityId: string,
  overrides: Partial<ProgressRecord> = {},
): ProgressRecord {
  return { ...emptyProgressRecord("p1", entityType, entityId, DAY), ...overrides };
}

function attempt(overrides: Partial<ActivityAttempt> = {}): ActivityAttempt {
  return {
    id: "attempt-1",
    profileId: "p1",
    activityId: "act-1",
    lessonId: "les-1",
    worldId: "hello-village",
    skill: "vocabulary",
    result: "correct",
    attemptNumber: 1,
    durationMs: 30_000,
    hintUsed: false,
    xpAwarded: 10,
    createdAt: DAY.toISOString(),
    ...overrides,
  };
}

function attempts(results: readonly ActivityAttempt["result"][]): ActivityAttempt[] {
  return results.map((result, index) =>
    attempt({ id: `attempt-${index}`, result, activityId: `act-${index}` }),
  );
}

describe("computeChallenge", () => {
  it("empieza en nivel suave sin intentos registrados", () => {
    const challenge = computeChallenge({ records: [], attempts: [] });

    expect(challenge.level).toBe("gentle");
    expect(challenge.preferredDifficulty).toBe(1);
    expect(challenge.accuracy).toBeNull();
    expect(challenge.attemptedActivities).toBe(0);
    expect(challenge.masteredWords).toBe(0);
    expect(challenge.label.es).toBe("Suave");
    expect(challenge.reason.es.length).toBeGreaterThan(0);
  });

  it("se queda en nivel suave aunque la precision sea perfecta si hay pocos intentos", () => {
    const few = Array.from({ length: DIFFICULTY.minAttemptsToAdapt - 1 }, () => "correct" as const);
    const challenge = computeChallenge({ records: [], attempts: attempts(few) });

    expect(challenge.level).toBe("gentle");
    expect(challenge.preferredDifficulty).toBe(1);
    expect(challenge.accuracy).toBe(1);
    expect(challenge.attemptedActivities).toBe(DIFFICULTY.minAttemptsToAdapt - 1);
  });

  it("baja al nivel suave si la precision reciente es baja", () => {
    const many = [
      ...Array.from({ length: DIFFICULTY.minAttemptsToAdapt + 2 }, () => "incorrect" as const),
      ...Array.from({ length: 3 }, () => "correct" as const),
    ];
    const challenge = computeChallenge({ records: [], attempts: attempts(many) });

    expect(challenge.level).toBe("gentle");
    expect(challenge.preferredDifficulty).toBe(1);
    expect(challenge.accuracy).toBeLessThan(DIFFICULTY.gentleAccuracy);
  });

  it("sube a nivel retador con evidencia suficiente (precision alta y palabras dominadas)", () => {
    const scored = Array.from({ length: 20 }, (_, index) =>
      index < 18 ? ("correct" as const) : ("incorrect" as const),
    );
    const mastered = Array.from({ length: DIFFICULTY.championMasteredWords }, (_, index) =>
      record("vocabulary", `voc-${index}`, { status: "mastered" }),
    );
    const challenge = computeChallenge({ records: mastered, attempts: attempts(scored) });

    expect(challenge.level).toBe("champion");
    expect(challenge.preferredDifficulty).toBe(3);
    expect(challenge.label.es).toBe("Retador");
    expect(challenge.accuracy).toBeGreaterThanOrEqual(DIFFICULTY.championAccuracy);
    expect(challenge.masteredWords).toBe(DIFFICULTY.championMasteredWords);
  });

  it("mantiene nivel normal entre los umbrales", () => {
    const scored = [
      ...Array.from({ length: 8 }, () => "correct" as const),
      ...Array.from({ length: 4 }, () => "incorrect" as const),
    ];
    const challenge = computeChallenge({ records: [], attempts: attempts(scored) });

    expect(challenge.level).toBe("steady");
    expect(challenge.preferredDifficulty).toBe(2);
    expect(challenge.label.es).toBe("Normal");
  });

  it("ignora los intentos auto-reportados al calcular la precision", () => {
    const scored = [
      ...Array.from({ length: 10 }, () => "correct" as const),
      ...Array.from({ length: 10 }, () => "self-reported" as const),
    ];
    const challenge = computeChallenge({ records: [], attempts: attempts(scored) });

    // 10 correctos entre 20 intentos: 20 auto-reportados no empeoran la precision.
    expect(challenge.accuracy).toBe(1);
    expect(challenge.attemptedActivities).toBe(20);
  });

  it("solo cuenta como dominadas las palabras de vocabulario", () => {
    const masteredWords = Array.from({ length: DIFFICULTY.championMasteredWords }, (_, index) =>
      record("vocabulary", `voc-${index}`, { status: "mastered" }),
    );
    const masteredSkills = Array.from({ length: 5 }, (_, index) =>
      record("skill", `skill-${index}`, { status: "mastered" }),
    );
    const scored = Array.from({ length: 10 }, () => "correct" as const);

    const withSkills = computeChallenge({
      records: [...masteredWords, ...masteredSkills],
      attempts: attempts(scored),
    });

    expect(withSkills.masteredWords).toBe(DIFFICULTY.championMasteredWords);
  });
});
