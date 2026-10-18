import { describe, expect, it } from "vitest";

import { ALL_ACTIVITIES, ALL_VOCABULARY, getLesson } from "@/content";
import {
  selectReviewActivities,
  uniqueVocabularyIds,
  worldIdForActivity,
} from "@/features/activities/select";

describe("selectReviewActivities", () => {
  it("devuelve una lista vacia si no hay objetivos o el limite es cero", () => {
    expect(selectReviewActivities([], 5)).toEqual([]);
    expect(selectReviewActivities(["voc-hello"], 0)).toEqual([]);
  });

  it("solo elige actividades que practican alguna palabra objetivo", () => {
    const target = ALL_VOCABULARY.find((item) => item.word === "red") ?? ALL_VOCABULARY[0];
    if (!target) throw new Error("El contenido no tiene vocabulario");

    const selected = selectReviewActivities([target.id], 4);
    expect(selected.length).toBeGreaterThan(0);
    for (const activity of selected) {
      expect(activity.vocabularyIds).toContain(target.id);
    }
  });

  it("respeta el limite pedido", () => {
    const ids = ALL_VOCABULARY.map((item) => item.id);
    expect(selectReviewActivities(ids, 3)).toHaveLength(3);
  });

  it("rota por tipos de actividad antes de repetir uno", () => {
    const ids = ALL_VOCABULARY.map((item) => item.id);
    const selected = selectReviewActivities(ids, 5);
    const types = selected.map((activity) => activity.type);
    expect(new Set(types).size).toBeGreaterThan(1);
  });

  it("no devuelve actividades con answerKey ausente (usa el contenido completo)", () => {
    const ids = ALL_VOCABULARY.map((item) => item.id);
    const selected = selectReviewActivities(ids, 2);
    for (const activity of selected) {
      expect(activity).toHaveProperty("answerKey");
      expect(ALL_ACTIVITIES.some((item) => item.id === activity.id)).toBe(true);
    }
  });

  describe("ajuste de dificultad (preferredDifficulty)", () => {
    const ids = ALL_VOCABULARY.map((item) => item.id);

    const difficultySum = (items: readonly { difficulty: number }[]): number =>
      items.reduce((total, item) => total + item.difficulty, 0);

    it("sin preferencia el orden es identico al comportamiento anterior", () => {
      const legacy = selectReviewActivities(ids, 6);
      const explicit = selectReviewActivities(ids, 6, {});
      expect(explicit).toEqual(legacy);
    });

    it("prefiere actividades suaves cuando el nivel pedido es 1", () => {
      const gentle = selectReviewActivities(ids, 6, { preferredDifficulty: 1 });
      const champion = selectReviewActivities(ids, 6, { preferredDifficulty: 3 });

      expect(gentle).toHaveLength(6);
      expect(champion).toHaveLength(6);
      expect(difficultySum(gentle)).toBeLessThan(difficultySum(champion));
      expect(gentle[0]?.difficulty).toBe(1);
      expect(champion[0]?.difficulty).toBe(3);
    });

    it("mantiene la rotacion por tipos y el limite pedido", () => {
      const selected = selectReviewActivities(ids, 5, { preferredDifficulty: 3 });
      const types = selected.map((activity) => activity.type);
      expect(selected).toHaveLength(5);
      expect(new Set(types).size).toBeGreaterThan(1);
    });

    it("sigue eligiendo solo actividades que practican las palabras objetivo", () => {
      const target = ALL_VOCABULARY.find((item) => item.word === "red") ?? ALL_VOCABULARY[0];
      if (!target) throw new Error("El contenido no tiene vocabulario");

      const selected = selectReviewActivities([target.id], 4, { preferredDifficulty: 2 });
      expect(selected.length).toBeGreaterThan(0);
      for (const activity of selected) {
        expect(activity.vocabularyIds).toContain(target.id);
      }
    });
  });
});

describe("worldIdForActivity", () => {
  it("devuelve el mundo de la leccion de la actividad", () => {
    const activity = ALL_ACTIVITIES[0];
    if (!activity) throw new Error("El contenido no tiene actividades");
    const lesson = getLesson(activity.lessonId);
    expect(worldIdForActivity(activity)).toBe(lesson?.worldId);
  });
});

describe("uniqueVocabularyIds", () => {
  it("quita repetidos conservando el orden de aparicion", () => {
    const items = ALL_VOCABULARY.slice(0, 3);
    const duplicated = [...items, ...items];
    expect(uniqueVocabularyIds(duplicated)).toEqual(items.map((item) => item.id));
  });
});
