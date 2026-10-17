import type { Db } from "mongodb";

import { getDb } from "@/server/db/mongo";
import type { ProfileDoc } from "@/server/db/collections";
import { apiError } from "@/server/http/errors";
import { ensureOwner } from "@/server/repositories/owners";
import { getOwnedProfile } from "@/server/repositories/profiles";

/**
 * Contexto de una peticion autenticada.
 *
 * `profileContext` es la unica puerta de entrada a los datos de un perfil: si el
 * perfil no existe O no pertenece al `ownerId` de la sesion, responde 404. Asi
 * un dispositivo nunca puede leer ni escribir datos de otro (ADR 0003).
 */

export type OwnerContext = { db: Db; ownerId: string };

export type ProfileContext = OwnerContext & { profile: ProfileDoc };

export async function ownerContext(ownerId: string): Promise<OwnerContext> {
  const db = await getDb();
  await ensureOwner(db, ownerId);
  return { db, ownerId };
}

export async function profileContext(
  ownerId: string,
  profileId: string,
): Promise<ProfileContext> {
  const context = await ownerContext(ownerId);
  const profile = await getOwnedProfile(context.db, ownerId, profileId);
  if (!profile) throw apiError.notFound("No encontramos ese perfil.");
  return { ...context, profile };
}
