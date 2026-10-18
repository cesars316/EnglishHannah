import { ALL_ACTIVITIES, getLesson } from "@/content";
import type { Activity, Difficulty, VocabularyItem } from "@/types/content";

/**
 * Seleccion de actividades para una sesion de repaso.
 *
 * Reglas:
 * - Solo actividades que practican alguna palabra objetivo.
 * - Se rota por tipo para no encadenar cinco veces el mismo ejercicio.
 * - Nunca mas actividades de las pedidas (sesiones cortas, seccion 6).
 *
 * Con `preferredDifficulty` (ajuste de dificultad, Fase 7) se acerca la
 * sesion al nivel que conviene practicar: dentro de cada tipo primero va lo
 * mas cercano al nivel, y los tipos tambien se ordenan por esa cercania.
 * El orden del contenido desempata (los sorts de JS son estables), asi que
 * la seleccion sigue siendo determinista.
 */
export type ReviewSelectionOptions = {
  /** Dificultad que conviene practicar ahora (1-3). */
  preferredDifficulty?: Difficulty;
};

export function selectReviewActivities(
  vocabularyIds: readonly string[],
  limit: number,
  options: ReviewSelectionOptions = {},
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

  const { preferredDifficulty } = options;
  let buckets = [...byType.values()];
  if (preferredDifficulty !== undefined) {
    const distance = (activity: Activity): number =>
      Math.abs(activity.difficulty - preferredDifficulty);
    buckets = buckets
      .map((bucket) => [...bucket].sort((a, b) => distance(a) - distance(b)))
      .sort((a, b) => {
        const firstA = a[0];
        const firstB = b[0];
        if (!firstA || !firstB) return 0;
        return distance(firstA) - distance(firstB);
      });
  }

  const selected: Activity[] = [];
  let round = 0;
  while (selected.length < limit) {
    let addedInRound = false;
    for (const bucket of buckets) {
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
