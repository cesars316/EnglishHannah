import { randomUUID } from "node:crypto";

import { DEFAULT_AVATAR_ID, getAvatar } from "@/config/avatars";
import { LIMITS, SITE } from "@/config/game";
import { DEFAULT_PROFILE_SETTINGS } from "@/config/profile";
import type { ProfileDoc } from "@/server/db/collections";
import { toProfile } from "@/server/db/mappers";
import { apiError } from "@/server/http/errors";
import {
  countProfiles,
  deleteProfileCascade,
  insertProfile,
  listProfiles,
  resetProfileProgress,
  updateProfile as updateProfileDoc,
} from "@/server/repositories/profiles";
import { ownerContext, profileContext } from "@/server/use-cases/common";

import type { Profile, ProfileSettings } from "@/types/domain";

/** Casos de uso de perfiles infantiles. */

export async function listProfilesForOwner(ownerId: string): Promise<Profile[]> {
  const { db } = await ownerContext(ownerId);
  const docs = await listProfiles(db, ownerId);
  return docs.map(toProfile);
}

export async function createProfileForOwner(
  ownerId: string,
  input: { displayName: string; avatarId?: string },
): Promise<Profile> {
  const { db } = await ownerContext(ownerId);

  const existing = await countProfiles(db, ownerId);
  if (existing >= LIMITS.maxProfilesPerOwner) {
    throw apiError.conflict(`Puedes tener hasta ${LIMITS.maxProfilesPerOwner} perfiles.`);
  }

  const now = new Date();
  const doc: ProfileDoc = {
    _id: randomUUID(),
    ownerId,
    displayName: input.displayName,
    avatarId: getAvatar(input.avatarId ?? DEFAULT_AVATAR_ID).id,
    locale: SITE.supportLanguage,
    targetLanguage: SITE.targetLanguage,
    settings: { ...DEFAULT_PROFILE_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };

  await insertProfile(db, doc);
  return toProfile(doc);
}

export async function getProfileForOwner(ownerId: string, profileId: string): Promise<Profile> {
  const { profile } = await profileContext(ownerId, profileId);
  return toProfile(profile);
}

export async function updateProfileForOwner(
  ownerId: string,
  profileId: string,
  patch: { displayName?: string; avatarId?: string; settings?: Partial<ProfileSettings> },
): Promise<Profile> {
  const { db, profile } = await profileContext(ownerId, profileId);

  const mergedSettings: ProfileSettings = {
    ...profile.settings,
    ...(patch.settings ?? {}),
  };

  const updated = await updateProfileDoc(
    db,
    profileId,
    {
      ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
      ...(patch.avatarId !== undefined ? { avatarId: getAvatar(patch.avatarId).id } : {}),
      ...(patch.settings !== undefined ? { settings: mergedSettings } : {}),
    },
    new Date(),
  );

  if (!updated) throw apiError.notFound("No encontramos ese perfil.");
  return toProfile(updated);
}

export async function deleteProfileForOwner(ownerId: string, profileId: string): Promise<void> {
  const { db } = await profileContext(ownerId, profileId);
  await deleteProfileCascade(db, profileId);
}

/** Borra el progreso de un perfil conservando nombre y avatar. */
export async function resetProfileProgressForOwner(
  ownerId: string,
  profileId: string,
): Promise<void> {
  const { db } = await profileContext(ownerId, profileId);
  await resetProfileProgress(db, profileId);
}
