import type { Db } from "mongodb";

import { availableWorldIdsFor } from "@/features/rewards/logic";
import { gameStateCollection, type GameStateDoc } from "@/server/db/collections";

/**
 * Repositorio del estado de juego de un perfil (XP, monedas, mundos e
 * insignias). Una unica coleccion por perfil para que los incrementos sean
 * atomicos y no se pierdan en peticiones simultaneas.
 */

export function initialGameState(profileId: string, now: Date = new Date()): GameStateDoc {
  return {
    _id: profileId,
    xp: 0,
    coins: 0,
    currentWorldId: null,
    unlockedWorldIds: availableWorldIdsFor([]),
    completedLessonIds: [],
    completedWorldIds: [],
    earnedBadgeIds: [],
    activityCount: 0,
    lastActivityAt: null,
    updatedAt: now,
  };
}

/** Crea el estado si no existe y lo devuelve. */
export async function ensureGameState(db: Db, profileId: string): Promise<GameStateDoc> {
  const existing = await gameStateCollection(db).findOne({ _id: profileId });
  if (existing) return existing;

  const created = initialGameState(profileId);
  await gameStateCollection(db).updateOne(
    { _id: profileId },
    { $setOnInsert: created },
    { upsert: true },
  );
  // Releemos por si otra peticion lo creo al mismo tiempo.
  return (await gameStateCollection(db).findOne({ _id: profileId })) ?? created;
}

/** Reemplaza el estado de juego completo (computado por la logica pura). */
export async function saveGameState(db: Db, state: GameStateDoc): Promise<void> {
  await gameStateCollection(db).replaceOne(
    { _id: state._id },
    { ...state, updatedAt: new Date() },
    { upsert: true },
  );
}
