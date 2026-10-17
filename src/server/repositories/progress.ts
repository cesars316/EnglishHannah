import type { Db } from "mongodb";

import { progressCollection, type ProgressDoc } from "@/server/db/collections";

/** Repositorio de dominio por palabra/habilidad/mundo/leccion. */

export async function listProgress(db: Db, profileId: string): Promise<ProgressDoc[]> {
  return progressCollection(db).find({ profileId }).toArray();
}

export async function getProgressDoc(
  db: Db,
  profileId: string,
  progressId: string,
): Promise<ProgressDoc | null> {
  return progressCollection(db).findOne({ _id: progressId, profileId });
}

/**
 * Guarda el registro de dominio.
 *
 * `replaceOne` con `upsert` es idempotente: repetir la misma operacion deja el
 * documento igual. La clave unica `{profileId, entityType, entityId}` del indice
 * evita duplicados.
 */
export async function saveProgressDoc(db: Db, doc: ProgressDoc): Promise<void> {
  await progressCollection(db).replaceOne({ _id: doc._id }, doc, { upsert: true });
}
