import type { Db } from "mongodb";

import { attemptsCollection, type AttemptDoc } from "@/server/db/collections";

/**
 * Repositorio de intentos.
 *
 * La idempotencia se apoya en el indice unico `{profileId, clientAttemptId}`: si
 * el navegador reintenta una peticion (red inestable), el segundo intento NO
 * crea un documento nuevo ni vuelve a otorgar XP (ADR 0004).
 */

export async function countAttemptsForActivity(
  db: Db,
  profileId: string,
  activityId: string,
): Promise<number> {
  return attemptsCollection(db).countDocuments({ profileId, activityId });
}

export async function findAttemptByClientId(
  db: Db,
  profileId: string,
  clientAttemptId: string,
): Promise<AttemptDoc | null> {
  return attemptsCollection(db).findOne({ profileId, clientAttemptId });
}

export async function insertAttempt(db: Db, doc: AttemptDoc): Promise<void> {
  await attemptsCollection(db).insertOne(doc);
}

export async function listAttempts(db: Db, profileId: string): Promise<AttemptDoc[]> {
  return attemptsCollection(db).find({ profileId }).sort({ createdAt: -1 }).toArray();
}
