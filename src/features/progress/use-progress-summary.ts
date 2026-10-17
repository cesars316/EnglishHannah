"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  getReviewPlanSnapshot,
  getSummarySnapshot,
  loadReviewPlan,
  loadSummary,
  subscribeProgress,
} from "@/features/progress/remote-store";
import type { ReviewPlan } from "@/types/api";
import type { ProgressSummary } from "@/types/domain";

/**
 * Resumen de progreso del servidor.
 *
 * Devuelve `null` mientras no hay datos (servidor e hidratacion incluidos): asi
 * la interfaz distingue "cargando" de "cero progreso" sin parpadeos.
 */

const getServerSummarySnapshot = (): ProgressSummary | null => null;

export function useProgressSummary(profileId: string | null): ProgressSummary | null {
  const subscribe = useCallback((listener: () => void) => subscribeProgress(listener), []);
  const getSnapshot = useCallback(() => getSummarySnapshot(profileId), [profileId]);

  const summary = useSyncExternalStore(subscribe, getSnapshot, getServerSummarySnapshot);

  useEffect(() => {
    if (profileId !== null) void loadSummary(profileId);
  }, [profileId]);

  return profileId === null ? null : summary;
}

/* -------------------------------------------------------------------------- */
/* Plan de repaso                                                             */
/* -------------------------------------------------------------------------- */

const getServerReviewSnapshot = (): ReviewPlan | null => null;

/**
 * Plan de repaso que ya calculo el servidor: palabras prioritarias y
 * actividades listas para jugar (sin `answerKey`).
 */
export function useReviewPlan(profileId: string | null): ReviewPlan | null {
  const subscribe = useCallback((listener: () => void) => subscribeProgress(listener), []);
  const getSnapshot = useCallback(() => getReviewPlanSnapshot(profileId), [profileId]);

  const plan = useSyncExternalStore(subscribe, getSnapshot, getServerReviewSnapshot);

  useEffect(() => {
    if (profileId !== null) void loadReviewPlan(profileId);
  }, [profileId]);

  return profileId === null ? null : plan;
}
