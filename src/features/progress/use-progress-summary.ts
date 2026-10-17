"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  listProgress,
  getProgressVersion,
  subscribeProgress,
} from "@/features/progress/local-progress";
import { getSummary } from "@/features/progress/session";
import type { MasteryStatus, ProgressSummary } from "@/types/domain";

/**
 * Resumen de progreso listo para pintar.
 *
 * `getSummary` lee `localStorage`, asi que se expone como almacen externo: el
 * servidor ve `null` y el cliente calcula el resumen una sola vez por version
 * de progreso (no en cada render).
 */

let cachedKey: string | null = null;
let cachedValue: ProgressSummary | null = null;

function snapshotFor(profileId: string | null): ProgressSummary | null {
  if (profileId === null) return null;
  const key = `${profileId}:${getProgressVersion()}`;
  if (key !== cachedKey) {
    cachedKey = key;
    cachedValue = getSummary(profileId);
  }
  return cachedValue;
}

const getServerSnapshot = (): ProgressSummary | null => null;

export function useProgressSummary(profileId: string | null): ProgressSummary | null {
  const subscribe = useCallback((listener: () => void) => subscribeProgress(listener), []);
  const getSnapshot = useCallback(() => snapshotFor(profileId), [profileId]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* -------------------------------------------------------------------------- */
/* Estado de dominio por palabra                                              */
/* -------------------------------------------------------------------------- */

export type VocabularyProgress = Record<
  string,
  { status: MasteryStatus; seenCount: number; correctCount: number }
>;

const EMPTY_VOCABULARY_PROGRESS: VocabularyProgress = {};

let cachedVocabularyKey: string | null = null;
let cachedVocabularyValue: VocabularyProgress = EMPTY_VOCABULARY_PROGRESS;

function vocabularySnapshotFor(profileId: string | null): VocabularyProgress {
  if (profileId === null) return EMPTY_VOCABULARY_PROGRESS;
  const key = `${profileId}:${getProgressVersion()}`;
  if (key !== cachedVocabularyKey) {
    cachedVocabularyKey = key;
    cachedVocabularyValue = Object.fromEntries(
      listProgress(profileId)
        .filter((record) => record.entityType === "vocabulary")
        .map((record) => [
          record.entityId,
          { status: record.status, seenCount: record.seenCount, correctCount: record.correctCount },
        ]),
    );
  }
  return cachedVocabularyValue;
}

const getServerVocabularySnapshot = (): VocabularyProgress => EMPTY_VOCABULARY_PROGRESS;

/** Estado de dominio de cada palabra practicada (solo lo que hay en el dispositivo). */
export function useVocabularyProgress(profileId: string | null): VocabularyProgress {
  const subscribe = useCallback((listener: () => void) => subscribeProgress(listener), []);
  const getSnapshot = useCallback(() => vocabularySnapshotFor(profileId), [profileId]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerVocabularySnapshot);
}
