import { makeProgressId } from "@/features/progress/logic";
import { createId, readJson, keysWithPrefix, removeKey, writeJson } from "@/lib/storage";
import type {
  ActivityAttempt,
  GameState,
  ProgressRecord,
  ProgressEntityType,
} from "@/types/domain";

/**
 * Persistencia local de progreso (modo invitado / sin conexion).
 *
 * Solo guarda DATOS. Toda la logica de XP, dominio y repaso vive en
 * `src/features/progress/logic.ts` como funciones puras y testeables.
 * En Fase 3 el servidor pasa a ser la autoridad (ADR 0004).
 *
 * Nunca se guardan audio, fotos ni video: `ActivityAttempt` solo contiene
 * resultados y tiempos.
 */

const gameStateKey = (profileId: string): string => `eq.gameState.${profileId}`;
const progressKey = (profileId: string): string => `eq.progress.${profileId}`;
const attemptsKey = (profileId: string): string => `eq.attempts.${profileId}`;

/* --------------------------- notificacion de cambios --------------------------- */

type ProgressListener = () => void;
const listeners = new Set<ProgressListener>();

/** Se suscribe a cualquier cambio de progreso local. Devuelve el `unsubscribe`. */
export function subscribeProgress(listener: ProgressListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitProgressChange(): void {
  progressVersion += 1;
  gameStateSnapshots.clear();
  for (const listener of listeners) listener();
}

/**
 * Contador que se incrementa con cada cambio de progreso.
 *
 * Permite que otras instantaneas derivadas (como el resumen del panel) sepan
 * cuando deben recalcularse sin volver a leer `localStorage` en cada render.
 */
let progressVersion = 0;

export function getProgressVersion(): number {
  return progressVersion;
}

/** Invalida las instantaneas tras un cambio externo (limpieza de datos). */
export function notifyProgressChange(): void {
  emitProgressChange();
}

/**
 * Instantanea estable del estado de juego para `useSyncExternalStore`.
 * Se cachea por perfil y se invalida en cada cambio.
 */
const gameStateSnapshots = new Map<string, GameState>();

export const SERVER_GAME_STATE: GameState = {
  profileId: "",
  xp: 0,
  coins: 0,
  currentWorldId: null,
  unlockedWorldIds: [],
  completedLessonIds: [],
  completedWorldIds: [],
  earnedBadgeIds: [],
  activityCount: 0,
  lastActivityAt: null,
  updatedAt: "",
};

export function getGameStateSnapshot(profileId: string | null): GameState {
  if (profileId === null) return SERVER_GAME_STATE;
  let snapshot = gameStateSnapshots.get(profileId);
  if (snapshot === undefined) {
    snapshot = getGameState(profileId);
    gameStateSnapshots.set(profileId, snapshot);
  }
  return snapshot;
}

export function emptyGameState(profileId: string): GameState {
  const now = new Date().toISOString();
  return {
    profileId,
    xp: 0,
    coins: 0,
    currentWorldId: null,
    unlockedWorldIds: [],
    completedLessonIds: [],
    completedWorldIds: [],
    earnedBadgeIds: [],
    activityCount: 0,
    lastActivityAt: null,
    updatedAt: now,
  };
}

export function getGameState(profileId: string): GameState {
  const stored = readJson<GameState | null>(gameStateKey(profileId), null);
  if (!stored || stored.profileId !== profileId) return emptyGameState(profileId);
  return {
    ...emptyGameState(profileId),
    ...stored,
    unlockedWorldIds: Array.isArray(stored.unlockedWorldIds) ? stored.unlockedWorldIds : [],
    completedLessonIds: Array.isArray(stored.completedLessonIds) ? stored.completedLessonIds : [],
    completedWorldIds: Array.isArray(stored.completedWorldIds) ? stored.completedWorldIds : [],
    earnedBadgeIds: Array.isArray(stored.earnedBadgeIds) ? stored.earnedBadgeIds : [],
  };
}

export function saveGameState(state: GameState): void {
  writeJson(gameStateKey(state.profileId), { ...state, updatedAt: new Date().toISOString() });
  emitProgressChange();
}

export function listProgress(profileId: string): ProgressRecord[] {
  const records = readJson<ProgressRecord[]>(progressKey(profileId), []);
  return Array.isArray(records) ? records : [];
}

export function getProgress(
  profileId: string,
  entityType: ProgressEntityType,
  entityId: string,
): ProgressRecord | null {
  return (
    listProgress(profileId).find((record) => record.id === makeProgressId(entityType, entityId)) ??
    null
  );
}

export function upsertProgress(profileId: string, record: ProgressRecord): void {
  const records = listProgress(profileId);
  const index = records.findIndex((item) => item.id === record.id);
  if (index === -1) {
    records.push(record);
  } else {
    records[index] = record;
  }
  writeJson(progressKey(profileId), records);
  emitProgressChange();
}

/** Reexportado para quien solo necesita el almacen local. */
export { makeProgressId };

export function listAttempts(profileId: string): ActivityAttempt[] {
  const attempts = readJson<ActivityAttempt[]>(attemptsKey(profileId), []);
  return Array.isArray(attempts) ? attempts : [];
}

export function appendAttempt(profileId: string, attempt: ActivityAttempt): void {
  const attempts = listAttempts(profileId);
  attempts.push(attempt);
  // Se conserva un maximo razonable para no crecer sin limite en el dispositivo.
  const trimmed = attempts.slice(-500);
  writeJson(attemptsKey(profileId), trimmed);
  emitProgressChange();
}

export function createAttemptId(): string {
  return createId();
}

/** Borra el progreso local de un perfil (se usa al eliminar el perfil). */
export function clearProfileProgress(profileId: string): void {
  for (const key of keysWithPrefix(`eq.gameState.${profileId}`)) removeKey(key);
  for (const key of keysWithPrefix(`eq.progress.${profileId}`)) removeKey(key);
  for (const key of keysWithPrefix(`eq.attempts.${profileId}`)) removeKey(key);
  emitProgressChange();
}
