import { describe, expect, it } from "vitest";

import { ALL_ACTIVITIES } from "@/content";
import {
  EMPTY_ATTEMPT,
  MAX_ATTEMPTS,
  reduceAttempt,
  type AttemptProgress,
} from "@/features/activities/engine/attempt";
import { toPublicActivity } from "@/features/activities/engine/public-activity";
import type { Activity, ActivityResponse, PublicActivity } from "@/types/content";
import type { EvaluateAnswerResult } from "@/features/activities/engine/types";

function firstOfType<T extends Activity["type"]>(type: T): Extract<Activity, { type: T }> {
  const found = ALL_ACTIVITIES.find((activity) => activity.type === type);
  if (!found) throw new Error(`No hay actividades del tipo "${type}"`);
  return found as Extract<Activity, { type: T }>;
}

function result(overrides: Partial<EvaluateAnswerResult> = {}): EvaluateAnswerResult {
  return {
    evaluation: { isCorrect: false, correctOptionIds: [] },
    feedback: { es: "feedback", en: "feedback" },
    xpAwarded: 0,
    coinsAwarded: 0,
    ...overrides,
  };
}

function correctResult(xp: number, coins: number): EvaluateAnswerResult {
  return result({
    evaluation: { isCorrect: true, correctOptionIds: [] },
    xpAwarded: xp,
    coinsAwarded: coins,
  });
}

describe("reduceAttempt - opcion multiple", () => {
  const activity = toPublicActivity(firstOfType("image-choice"));

  it("elimina la opcion fallada y no otorga recompensa", () => {
    const next = reduceAttempt(EMPTY_ATTEMPT, {
      activity,
      response: { kind: "choice", optionId: "mal" },
      result: result(),
    });

    expect(next.attempts).toBe(1);
    expect(next.solved).toBe(false);
    expect(next.eliminatedOptionIds).toEqual(["mal"]);
    expect(next.wrongOptionId).toBe("mal");
    expect(next.xp).toBe(0);
    expect(next.coins).toBe(0);
  });

  it("cierra la actividad con la recompensa que devuelve el motor al acertar", () => {
    const next = reduceAttempt(EMPTY_ATTEMPT, {
      activity,
      response: { kind: "choice", optionId: "bien" },
      result: correctResult(15, 1),
    });

    expect(next.solved).toBe(true);
    expect(next.revealed).toBe(false);
    expect(next.xp).toBe(15);
    expect(next.coins).toBe(1);
  });

  it("acumula opciones eliminadas entre intentos", () => {
    const first = reduceAttempt(EMPTY_ATTEMPT, {
      activity,
      response: { kind: "choice", optionId: "mal-1" },
      result: result(),
    });
    const second = reduceAttempt(first, {
      activity,
      response: { kind: "choice", optionId: "mal-2" },
      result: result(),
    });

    expect(second.eliminatedOptionIds).toEqual(["mal-1", "mal-2"]);
    expect(second.wrongOptionId).toBe("mal-2");
  });
});

describe("reduceAttempt - reglas de intentos", () => {
  const activity = toPublicActivity(firstOfType("image-choice"));

  it("revela la solucion al agotar los intentos y aun da recompensa", () => {
    let state: AttemptProgress = EMPTY_ATTEMPT;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      state = reduceAttempt(state, {
        activity,
        response: { kind: "choice", optionId: `mal-${attempt}` },
        result: result(),
      });
    }

    expect(state.attempts).toBe(MAX_ATTEMPTS);
    expect(state.revealed).toBe(true);
    expect(state.xp).toBeGreaterThan(0);
    expect(state.coins).toBeGreaterThan(0);
  });

  it("no cambia nada si la actividad ya estaba resuelta", () => {
    const solved = reduceAttempt(EMPTY_ATTEMPT, {
      activity,
      response: { kind: "choice", optionId: "bien" },
      result: correctResult(10, 1),
    });

    const after = reduceAttempt(solved, {
      activity,
      response: { kind: "choice", optionId: "mal" },
      result: result(),
    });

    expect(after).toBe(solved);
  });

  it("devuelve la recompensa por completar (no la de acierto) al revelar", () => {
    let state: AttemptProgress = EMPTY_ATTEMPT;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      state = reduceAttempt(state, {
        activity,
        response: { kind: "choice", optionId: `mal-${attempt}` },
        result: result(),
      });
    }
    // Nunca suma el bonus de primer intento.
    expect(state.xp).toBe(10);
    expect(state.coins).toBe(1);
  });
});

describe("reduceAttempt - parejas", () => {
  const raw = firstOfType("matching-pairs");
  const activity = toPublicActivity(raw) as Extract<PublicActivity, { type: "matching-pairs" }>;

  it("fija las parejas acertadas y no descarta ningun destino", () => {
    const [firstPair, secondPair] = raw.answerKey.pairs;
    if (!firstPair || !secondPair) throw new Error("Se necesitan al menos dos parejas");

    const response: ActivityResponse = {
      kind: "pairs",
      pairs: [
        { leftId: firstPair.leftId, rightId: firstPair.rightId },
        { leftId: secondPair.leftId, rightId: "destino-incorrecto" },
      ],
    };

    const next = reduceAttempt(EMPTY_ATTEMPT, {
      activity,
      response,
      result: result({
        evaluation: {
          isCorrect: false,
          correctOptionIds: [],
          correctPairs: raw.answerKey.pairs.map((pair) => ({
            leftId: pair.leftId,
            rightId: pair.rightId,
          })),
        },
      }),
    });

    expect(next.lockedPairs).toContainEqual({
      leftId: firstPair.leftId,
      rightId: firstPair.rightId,
    });
    // Los destinos fallados siguen disponibles: la lista es corta y descartarlos
    // dejaria la actividad sin opciones antes de revelar la solucion.
    expect(next.eliminatedOptionIds).not.toContain("destino-incorrecto");
    expect(next.eliminatedOptionIds).toHaveLength(0);
  });
});

describe("reduceAttempt - pista", () => {
  it("conserva el uso de la pista entre intentos", () => {
    const activity = toPublicActivity(firstOfType("image-choice"));
    const withHint: AttemptProgress = { ...EMPTY_ATTEMPT, hintUsed: true };

    const next = reduceAttempt(withHint, {
      activity,
      response: { kind: "choice", optionId: "mal" },
      result: result(),
    });

    expect(next.hintUsed).toBe(true);
  });
});
