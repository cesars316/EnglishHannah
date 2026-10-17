import type { Activity, PublicActivity } from "@/types/content";

/**
 * Proyeccion publica de una actividad: exactamente la misma actividad sin
 * `answerKey`. Es la unica forma en que una actividad debe cruzar al navegador
 * (ver ADR 0004).
 */
export function toPublicActivity(activity: Activity): PublicActivity {
  const { answerKey: _answerKey, ...rest } = activity;
  return rest as PublicActivity;
}

export function toPublicActivities(activities: readonly Activity[]): PublicActivity[] {
  return activities.map(toPublicActivity);
}

/** Comprueba que una actividad publica no filtra el `answerKey` por accidente. */
export function isPublicActivity(value: unknown): boolean {
  return typeof value === "object" && value !== null && !("answerKey" in value);
}
