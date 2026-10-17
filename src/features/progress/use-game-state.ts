"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  getGameStateSnapshot,
  loadGameState,
  SERVER_GAME_STATE,
  subscribeProgress,
} from "@/features/progress/remote-store";
import type { GameState } from "@/types/domain";

const getServerSnapshot = (): GameState => SERVER_GAME_STATE;

/**
 * Lee el estado de juego del perfil y se mantiene sincronizado con el servidor.
 *
 * Se apoya en `useSyncExternalStore`: el servidor (y la primera hidratacion) ve
 * un estado neutro y el cliente adopta los datos reales en cuanto llegan, sin
 * desajustes. La peticion se dispara en un efecto, nunca durante el render.
 */
export function useGameState(profileId: string | null): GameState {
  const subscribe = useCallback((listener: () => void) => subscribeProgress(listener), []);
  const getSnapshot = useCallback(() => getGameStateSnapshot(profileId), [profileId]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (profileId !== null) void loadGameState(profileId);
  }, [profileId]);

  return profileId === null ? SERVER_GAME_STATE : state;
}
