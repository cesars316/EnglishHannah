"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  getGameStateSnapshot,
  SERVER_GAME_STATE,
  subscribeProgress,
} from "@/features/progress/local-progress";
import type { GameState } from "@/types/domain";

const getServerSnapshot = (): GameState => SERVER_GAME_STATE;

/**
 * Lee el estado de juego y se mantiene sincronizado con los cambios locales.
 *
 * Se apoya en `useSyncExternalStore`: el servidor (y el primer render de
 * hidratacion) ve un estado neutro y el cliente adopta los datos reales en
 * cuanto estan disponibles, sin desajustes de hidratacion.
 */
export function useGameState(profileId: string | null): GameState {
  const subscribe = useCallback((listener: () => void) => subscribeProgress(listener), []);
  const getSnapshot = useCallback(() => getGameStateSnapshot(profileId), [profileId]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return profileId === null ? SERVER_GAME_STATE : state;
}
