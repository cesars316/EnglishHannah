import { describe, expect, it } from "vitest";

import { ALL_ACTIVITIES, ALL_LESSONS, ALL_VOCABULARY, ALL_WORLDS, BADGES } from "@/content";
import { summarizeIssues, validateContent } from "@/content/validate";

/**
 * Puerta de calidad del contenido: el mismo validador que corre
 * `npm run validate:content`, pero en memoria.
 *
 * `fileExists` devuelve `true` aqui a proposito: la existencia real de los SVG
 * ya la comprueba el script con acceso al sistema de archivos. Esta prueba se
 * centra en las reglas pedagogicas y de integridad referencial.
 */
const bundle = {
  worlds: ALL_WORLDS,
  lessons: ALL_LESSONS,
  activities: ALL_ACTIVITIES,
  vocabulary: ALL_VOCABULARY,
  badges: BADGES,
};

describe("validateContent (contenido real)", () => {
  const issues = validateContent(bundle, { fileExists: () => true });

  it("no encuentra errores", () => {
    const errors = issues.filter((issue) => issue.level === "error");
    expect(errors, JSON.stringify(errors, null, 2)).toEqual([]);
  });

  it("no encuentra avisos", () => {
    const warnings = issues.filter((issue) => issue.level === "warning");
    expect(warnings, JSON.stringify(warnings, null, 2)).toEqual([]);
  });

  it("el resumen cuadra con los problemas encontrados", () => {
    const summary = summarizeIssues(issues);
    expect(summary.errors + summary.warnings).toBe(issues.length);
  });
});

describe("integridad del contenido", () => {
  it("todos los ids son unicos", () => {
    for (const collection of [ALL_WORLDS, ALL_LESSONS, ALL_ACTIVITIES, ALL_VOCABULARY, BADGES]) {
      const ids = collection.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("cada leccion referencia actividades existentes y viceversa", () => {
    const activityIds = new Set(ALL_ACTIVITIES.map((activity) => activity.id));
    const lessonIds = new Set(ALL_LESSONS.map((lesson) => lesson.id));

    for (const lesson of ALL_LESSONS) {
      for (const activityId of lesson.activityIds) {
        expect(activityIds.has(activityId), `${lesson.id} -> ${activityId}`).toBe(true);
      }
    }
    for (const activity of ALL_ACTIVITIES) {
      expect(lessonIds.has(activity.lessonId), activity.id).toBe(true);
    }
  });

  it("cada mundo tiene lecciones y cada leccion un mundo existente", () => {
    const worldIds = new Set(ALL_WORLDS.map((world) => world.id));
    for (const world of ALL_WORLDS) {
      expect(world.lessonIds.length).toBeGreaterThan(0);
      for (const lessonId of world.lessonIds) {
        const lesson = ALL_LESSONS.find((item) => item.id === lessonId);
        expect(lesson, `${world.id} -> ${lessonId}`).toBeDefined();
        expect(lesson?.worldId).toBe(world.id);
      }
    }
    for (const lesson of ALL_LESSONS) {
      expect(worldIds.has(lesson.worldId), lesson.id).toBe(true);
    }
  });

  it("ninguna actividad publica expone el answerKey a traves de la proyeccion publica", async () => {
    const { toPublicActivities } = await import("@/features/activities/engine/public-activity");
    const publicActivities = toPublicActivities(ALL_ACTIVITIES);
    for (const activity of publicActivities) {
      expect("answerKey" in activity).toBe(false);
    }
  });
});
