import { describe, expect, it } from "vitest";

import { ALL_ACTIVITIES, getActivity } from "@/content";
import { evaluateActivity, expectedResponseKind } from "@/features/activities/engine/evaluate";
import { isPublicActivity, toPublicActivity } from "@/features/activities/engine/public-activity";
import type { Activity } from "@/types/content";

/**
 * Se prueba el motor contra el CONTENIDO REAL: si el contenido deja de cubrir un
 * tipo de actividad usado por el motor, o el motor cambia de reglas, estas
 * pruebas lo detectan.
 */

function firstOfType<T extends Activity["type"]>(type: T): Extract<Activity, { type: T }> {
  const found = ALL_ACTIVITIES.find((activity) => activity.type === type);
  if (!found) throw new Error(`No hay actividades del tipo "${type}" en el contenido`);
  return found as Extract<Activity, { type: T }>;
}

function activityById(id: string): Activity {
  const activity = getActivity(id);
  if (!activity) throw new Error(`La actividad "${id}" no existe en el contenido`);
  return activity;
}

describe("expectedResponseKind", () => {
  it("asocia cada tipo de actividad con su tipo de respuesta", () => {
    expect(expectedResponseKind({ type: "image-choice" } as Activity)).toBe("choice");
    expect(expectedResponseKind({ type: "listen-and-choose" } as Activity)).toBe("choice");
    expect(expectedResponseKind({ type: "sentence-completion" } as Activity)).toBe("choice");
    expect(expectedResponseKind({ type: "matching-pairs" } as Activity)).toBe("pairs");
    expect(expectedResponseKind({ type: "word-builder" } as Activity)).toBe("text");
    expect(expectedResponseKind({ type: "speak-and-check" } as Activity)).toBe("speech");
    expect(expectedResponseKind({ type: "story-quiz" } as Activity)).toBe("self-report");
  });
});

describe("evaluateActivity - opcion multiple", () => {
  it("acepta la opcion correcta", () => {
    const activity = firstOfType("image-choice");
    const evaluation = evaluateActivity(activity, {
      kind: "choice",
      optionId: activity.answerKey.optionId,
    });
    expect(evaluation.isCorrect).toBe(true);
    expect(evaluation.correctOptionIds).toContain(activity.answerKey.optionId);
  });

  it("rechaza una opcion incorrecta sin lanzar excepcion", () => {
    const activity = firstOfType("image-choice");
    const wrong = activity.content.options.find(
      (option) => option.id !== activity.answerKey.optionId,
    );
    if (!wrong) throw new Error("La actividad no tiene una opcion incorrecta de prueba");

    const evaluation = evaluateActivity(activity, { kind: "choice", optionId: wrong.id });
    expect(evaluation.isCorrect).toBe(false);
    // Se devuelve la correcta para poder resaltarla despues de agotar intentos.
    expect(evaluation.correctOptionIds).toEqual([activity.answerKey.optionId]);
  });

  it("trata un tipo de respuesta inesperado como incorrecto", () => {
    const activity = firstOfType("image-choice");
    expect(evaluateActivity(activity, { kind: "text", text: "lo que sea" }).isCorrect).toBe(false);
  });
});

describe("evaluateActivity - parejas", () => {
  it("acierta solo si TODAS las parejas son correctas", () => {
    const activity = firstOfType("matching-pairs");
    const correct = activity.answerKey.pairs.map((pair) => ({
      leftId: pair.leftId,
      rightId: pair.rightId,
    }));

    expect(evaluateActivity(activity, { kind: "pairs", pairs: correct }).isCorrect).toBe(true);

    const swapped = activity.answerKey.pairs.map((pair, index) => ({
      leftId: pair.leftId,
      rightId: index === 0 ? `${pair.rightId}-otro` : pair.rightId,
    }));
    expect(evaluateActivity(activity, { kind: "pairs", pairs: swapped }).isCorrect).toBe(false);
  });

  it("devuelve la solucion completa cuando la respuesta es incorrecta", () => {
    const activity = firstOfType("matching-pairs");
    const evaluation = evaluateActivity(activity, { kind: "pairs", pairs: [] });
    expect(evaluation.isCorrect).toBe(false);
    expect(evaluation.correctPairs).toHaveLength(activity.answerKey.pairs.length);
  });
});

describe("evaluateActivity - texto", () => {
  it("compara sin importar mayusculas ni puntuacion", () => {
    const activity = firstOfType("word-builder");
    const evaluation = evaluateActivity(activity, {
      kind: "text",
      text: `  ${activity.answerKey.text.toUpperCase()}! `,
    });
    expect(evaluation.isCorrect).toBe(true);
    expect(evaluation.expectedText).toBe(activity.answerKey.text);
  });
});

describe("evaluateActivity - respeto por la participacion", () => {
  it("acepta una respuesta enviada como autoinforme sin corregirla", () => {
    const activity = firstOfType("image-choice");
    const evaluation = evaluateActivity(activity, { kind: "self-report", practiced: true });
    expect(evaluation.isCorrect).toBe(true);
    expect(evaluation.selfReported).toBe(true);
  });
});

describe("toPublicActivity", () => {
  it("elimina el answerKey y no muta la actividad original", () => {
    const first = ALL_ACTIVITIES[0];
    if (!first) throw new Error("El contenido no tiene actividades");

    const activity = activityById(first.id);
    const publicActivity = toPublicActivity(activity);

    expect(isPublicActivity(publicActivity)).toBe(true);
    expect("answerKey" in publicActivity).toBe(false);
    // La original sigue intacta: el contenido sigue siendo la fuente de verdad.
    expect("answerKey" in activity).toBe(true);
  });
});
