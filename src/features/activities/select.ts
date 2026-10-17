import { ALL_ACTIVITIES, getLesson } from "@/content";
import type { Activity, VocabularyItem } from "@/types/content";

/**
 * Seleccion de actividades para una sesion de repaso.
 *
 * Reglas:
 * - Solo actividades que practican alguna palabra objetivo.
 * - Se rota por tipo para no encadenar cinco veces el mismo ejercicio.
 * - Nunca mas actividades de las pedidas (sesiones cortas, seccion 6).
 */
export function selectReviewActivities(
  vocabularyIds: readonly string[],
  limit: number,
): Activity[] {
  if (vocabularyIds.length === 0 || limit <= 0) return [];

  const targets = new Set(vocabularyIds);

  const candidates = ALL_ACTIVITIES.filter((activity) =>
    activity.vocabularyIds.some((id) => targets.has(id)),
  );

  const byType = new Map<string, Activity[]>();
  for (const activity of candidates) {
    const bucket = byType.get(activity.type) ?? [];
    bucket.push(activity);
    byType.set(activity.type, bucket);
  }

  const selected: Activity[] = [];
  let round = 0;
  while (selected.length < limit) {
    let addedInRound = false;
    for (const bucket of byType.values()) {
      const candidate = bucket[round];
      if (candidate && selected.length < limit) {
        selected.push(candidate);
        addedInRound = true;
      }
    }
    if (!addedInRound) break;
    round += 1;
  }

  return selected;
}

/** Mundo al que pertenece una actividad (via su leccion). */
export function worldIdForActivity(activity: Activity): string {
  if (activity.worldId) return activity.worldId;
  return getLesson(activity.lessonId)?.worldId ?? "";
}

/** Palabras objetivo, en el orden en que llegaron, sin repetir. */
export function uniqueVocabularyIds(items: readonly VocabularyItem[]): string[] {
  return [...new Set(items.map((item) => item.id))];
}
