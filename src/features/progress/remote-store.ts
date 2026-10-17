"use client";

import { api } from "@/features/api/client";
import type { ProgressSummaryView, ReviewPlan, RewardsView } from "@/types/api";
import type { GameState, ProgressSummary } from "@/types/domain";

/**
 * Cache de progreso del cliente, con el servidor como autoridad (ADR 0004).
 *
 * El navegador no calcula XP ni dominio: pide el estado a `/api/v1` y lo
 * mantiene como almacen externo para `useSyncExternalStore`. Las respuestas de
 * jugar (`answer`, `complete`) ya traen el `gameState` actualizado, asi que se
 * aplican directamente sin una segunda peticion.
 *
 * Las instantaneas son estables por perfil: `getSnapshot` devuelve la misma
 * referencia mientras el dato no cambie (requisito de `useSyncExternalStore`).
 */

/** Estado de juego neutro: lo ve el servidor y la primera hidratacion. */
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

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeProgress(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

/* -------------------------------------------------------------------------- */
/* Caches por perfil                                                          */
/* -------------------------------------------------------------------------- */

const gameStates = new Map<string, GameState>();
const summaries = new Map<string, ProgressSummary>();
const reviewPlans = new Map<string, ReviewPlan>();
const emptyGameStates = new Map<string, GameState>();

const gameStateRequests = new Map<string, Promise<void>>();
const summaryRequests = new Map<string, Promise<void>>();
const reviewRequests = new Map<string, Promise<void>>();

/** Estado de juego vacio pero estable por perfil (misma referencia siempre). */
function emptyGameStateFor(profileId: string): GameState {
  let value = emptyGameStates.get(profileId);
  if (!value) {
    value = { ...SERVER_GAME_STATE, profileId };
    emptyGameStates.set(profileId, value);
  }
  return value;
}

export function getGameStateSnapshot(profileId: string | null): GameState {
  if (profileId === null) return SERVER_GAME_STATE;
  return gameStates.get(profileId) ?? emptyGameStateFor(profileId);
}

export function getSummarySnapshot(profileId: string | null): ProgressSummary | null {
  if (profileId === null) return null;
  return summaries.get(profileId) ?? null;
}

export function getReviewPlanSnapshot(profileId: string | null): ReviewPlan | null {
  if (profileId === null) return null;
  return reviewPlans.get(profileId) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Cargas                                                                     */
/* -------------------------------------------------------------------------- */

/** Pide XP, monedas, mundos desbloqueados e insignias. */
export function loadGameState(profileId: string): Promise<void> {
  const inFlight = gameStateRequests.get(profileId);
  if (inFlight) return inFlight;

  const request = api
    .get<RewardsView>(`/profiles/${profileId}/rewards`)
    .then(({ gameState }) => {
      gameStates.set(profileId, gameState);
    })
    .catch(() => {
      /* Se conserva la instantanea anterior: la interfaz ya tiene un valor neutro. */
    })
    .finally(() => {
      gameStateRequests.delete(profileId);
      emit();
    });

  gameStateRequests.set(profileId, request);
  return request;
}

/** Pide el resumen agregado (panel parental y coleccion). */
export function loadSummary(profileId: string): Promise<void> {
  const inFlight = summaryRequests.get(profileId);
  if (inFlight) return inFlight;

  const request = api
    .get<ProgressSummaryView>(`/profiles/${profileId}/progress`)
    .then(({ summary }) => {
      summaries.set(profileId, summary);
    })
    .catch(() => {
      /* Se conserva la instantanea anterior. */
    })
    .finally(() => {
      summaryRequests.delete(profileId);
      emit();
    });

  summaryRequests.set(profileId, request);
  return request;
}

/** Pide el plan de repaso (palabras prioritarias y actividades listas). */
export function loadReviewPlan(profileId: string): Promise<void> {
  const inFlight = reviewRequests.get(profileId);
  if (inFlight) return inFlight;

  const request = api
    .get<ReviewPlan>(`/profiles/${profileId}/review`)
    .then((plan) => {
      reviewPlans.set(profileId, plan);
    })
    .catch(() => {
      /* Se conserva la instantanea anterior. */
    })
    .finally(() => {
      reviewRequests.delete(profileId);
      emit();
    });

  reviewRequests.set(profileId, request);
  return request;
}

/* -------------------------------------------------------------------------- */
/* Mutaciones locales a partir de respuestas del servidor                      */
/* -------------------------------------------------------------------------- */

/**
 * Aplica el `gameState` que ya devolvio el servidor tras jugar.
 *
 * Evita una peticion extra y garantiza que la interfaz muestra exactamente lo
 * que quedo guardado.
 */
export function applyGameState(profileId: string, gameState: GameState): void {
  gameStates.set(profileId, gameState);
  emit();
}

/**
 * Marca el resumen como obsoleto tras jugar: la proxima pantalla que lo pida lo
 * volvera a leer del servidor (fuente de verdad).
 */
export function invalidateSummary(profileId: string): void {
  summaries.delete(profileId);
  emit();
}

/** Descarta todo lo cacheado de un perfil (al borrarlo o reiniciar su progreso). */
export function forgetProfile(profileId: string): void {
  gameStates.delete(profileId);
  summaries.delete(profileId);
  reviewPlans.delete(profileId);
  emptyGameStates.delete(profileId);
  emit();
}

/* -------------------------------------------------------------------------- */
/* Pruebas                                                                    */
/* -------------------------------------------------------------------------- */

/** Reinicia el almacen (solo pruebas). */
export function resetProgressStore(): void {
  gameStates.clear();
  summaries.clear();
  reviewPlans.clear();
  emptyGameStates.clear();
  gameStateRequests.clear();
  summaryRequests.clear();
  reviewRequests.clear();
  listeners.clear();
}
