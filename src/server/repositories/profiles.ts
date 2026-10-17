import type { Db } from "mongodb";

import {
  attemptsCollection,
  gameStateCollection,
  profilesCollection,
  progressCollection,
  type ProfileDoc,
} from "@/server/db/collections";
import type { ProfileSettings } from "@/types/domain";

/**
 * Repositorio de perfiles infantiles.
 *
 * Toda lectura/escritura verifica la pertenencia al `ownerId` de la sesion: es
 * la unica barrera de aislamiento entre dispositivos (ADR 0003).
 */

export async function listProfiles(db: Db, ownerId: string): Promise<ProfileDoc[]> {
  return profilesCollection(db).find({ ownerId }).sort({ createdAt: 1 }).toArray();
}

export async function countProfiles(db: Db, ownerId: string): Promise<number> {
  return profilesCollection(db).countDocuments({ ownerId });
}

export async function getOwnedProfile(
  db: Db,
  ownerId: string,
  profileId: string,
): Promise<ProfileDoc | null> {
  return profilesCollection(db).findOne({ _id: profileId, ownerId });
}

export async function insertProfile(db: Db, doc: ProfileDoc): Promise<void> {
  await profilesCollection(db).insertOne(doc);
}

export async function updateProfile(
  db: Db,
  profileId: string,
  patch: { displayName?: string; avatarId?: string; settings?: ProfileSettings },
  now: Date = new Date(),
): Promise<ProfileDoc | null> {
  const fields: Record<string, unknown> = { updatedAt: now };
  if (patch.displayName !== undefined) fields.displayName = patch.displayName;
  if (patch.avatarId !== undefined) fields.avatarId = patch.avatarId;
  if (patch.settings !== undefined) fields.settings = patch.settings;

  return profilesCollection(db).findOneAndUpdate(
    { _id: profileId },
    { $set: fields },
    { returnDocument: "after" },
  );
}

/** Borrado en cascada: perfil, progreso, intentos y estado de juego. */
export async function deleteProfileCascade(db: Db, profileId: string): Promise<void> {
  await Promise.all([
    profilesCollection(db).deleteOne({ _id: profileId }),
    progressCollection(db).deleteMany({ profileId }),
    attemptsCollection(db).deleteMany({ profileId }),
    gameStateCollection(db).deleteOne({ _id: profileId }),
  ]);
}

/**
 * Reinicia el progreso de un perfil SIN borrar el perfil.
 *
 * Es lo que ofrece la zona de adultos: "empezar de cero" conservando el nombre
 * y el avatar.
 */
export async function resetProfileProgress(db: Db, profileId: string): Promise<void> {
  await Promise.all([
    progressCollection(db).deleteMany({ profileId }),
    attemptsCollection(db).deleteMany({ profileId }),
    gameStateCollection(db).deleteOne({ _id: profileId }),
  ]);
}
