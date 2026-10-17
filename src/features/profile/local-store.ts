import { DEFAULT_AVATAR_ID, getAvatar } from "@/config/avatars";
import { LIMITS, SITE } from "@/config/game";
import { createId, keysWithPrefix, readJson, removeKey, writeJson } from "@/lib/storage";
import type { Profile, ProfileSettings } from "@/types/domain";

/**
 * Almacen local de perfiles.
 *
 * Fase 1/Fase 2 (sin backend): el dispositivo es la fuente de verdad.
 * Fase 3: `ProfileRepository` con la implementacion de API reemplaza a esta
 * manteniendo la misma interfaz, y el servidor pasa a ser la autoridad
 * (ver ADR 0003).
 */

const PROFILES_KEY = "eq.profiles";
const ACTIVE_KEY = "eq.activeProfileId";
const SETTINGS_KEY_PREFIX = "eq.settings.";

/* -------------------------------------------------------------------------- */
/* Suscripcion y cache de instantaneas                                        */
/* -------------------------------------------------------------------------- */

/**
 * Instantanea estable para `useSyncExternalStore`.
 *
 * React exige que `getSnapshot` devuelva la MISMA referencia mientras no haya
 * cambios; por eso se cachea y se invalida en cada mutacion.
 */
export type ProfileSnapshot = {
  profiles: Profile[];
  activeId: string | null;
};

export const SERVER_PROFILE_SNAPSHOT: ProfileSnapshot = { profiles: [], activeId: null };

let cachedSnapshot: ProfileSnapshot | null = null;

export function getProfileSnapshot(): ProfileSnapshot {
  if (cachedSnapshot === null) {
    cachedSnapshot = { profiles: listProfiles(), activeId: getActiveProfileId() };
  }
  return cachedSnapshot;
}

type ProfileListener = () => void;
const profileListeners = new Set<ProfileListener>();

/** Se suscribe a los cambios del almacen local de perfiles. */
export function subscribeProfiles(listener: ProfileListener): () => void {
  profileListeners.add(listener);
  return () => {
    profileListeners.delete(listener);
  };
}

/** Invalida la cache y avisa a los suscriptores. */
export function emitProfilesChange(): void {
  cachedSnapshot = null;
  for (const listener of profileListeners) listener();
}

/** Fuerza una relectura del almacen (util tras cambios externos). */
export function revalidateProfiles(): void {
  emitProfilesChange();
}

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  microphoneEnabled: false,
  cameraEnabled: false,
  soundEnabled: true,
  reducedMotion: false,
};

export type CreateProfileInput = {
  displayName: string;
  avatarId?: string;
};

export function listProfiles(): Profile[] {
  const profiles = readJson<Profile[]>(PROFILES_KEY, []);
  if (!Array.isArray(profiles)) return [];
  return profiles.filter((profile) => typeof profile?.id === "string");
}

export function getProfile(profileId: string): Profile | null {
  return listProfiles().find((profile) => profile.id === profileId) ?? null;
}

export function getActiveProfileId(): string | null {
  return readJson<string | null>(ACTIVE_KEY, null);
}

export function setActiveProfileId(profileId: string | null): void {
  if (profileId === null) {
    removeKey(ACTIVE_KEY);
  } else {
    writeJson(ACTIVE_KEY, profileId);
  }
  emitProfilesChange();
}

export function getActiveProfile(): Profile | null {
  const profileId = getActiveProfileId();
  return profileId ? getProfile(profileId) : null;
}

export function canCreateProfile(): boolean {
  return listProfiles().length < LIMITS.maxProfilesPerOwner;
}

/** Normaliza y valida el alias. No se piden apellidos ni datos personales. */
export function normalizeDisplayName(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, LIMITS.displayNameMax);
}

export function isValidDisplayName(value: string): boolean {
  const normalized = normalizeDisplayName(value);
  return normalized.length >= LIMITS.displayNameMin && normalized.length <= LIMITS.displayNameMax;
}

export function createProfile(input: CreateProfileInput): Profile {
  const displayName = normalizeDisplayName(input.displayName);
  if (!isValidDisplayName(displayName)) {
    throw new Error("INVALID_DISPLAY_NAME");
  }
  if (!canCreateProfile()) {
    throw new Error("PROFILE_LIMIT_REACHED");
  }

  const now = new Date().toISOString();
  const avatarId = input.avatarId ?? DEFAULT_AVATAR_ID;
  const profile: Profile = {
    id: createId(),
    displayName,
    avatarId: getAvatar(avatarId).id,
    locale: SITE.supportLanguage,
    targetLanguage: SITE.targetLanguage,
    settings: { ...DEFAULT_PROFILE_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };

  writeJson(PROFILES_KEY, [...listProfiles(), profile]);
  if (getActiveProfileId() === null) setActiveProfileId(profile.id);
  emitProfilesChange();
  return profile;
}

export function updateProfile(
  profileId: string,
  patch: Partial<Pick<Profile, "displayName" | "avatarId">> & {
    settings?: Partial<ProfileSettings>;
  },
): Profile | null {
  const profiles = listProfiles();
  const index = profiles.findIndex((profile) => profile.id === profileId);
  if (index === -1) return null;

  const current = profiles[index];
  if (!current) return null;

  const nextDisplayName =
    patch.displayName === undefined
      ? current.displayName
      : normalizeDisplayName(patch.displayName) || current.displayName;

  const updated: Profile = {
    ...current,
    displayName: nextDisplayName,
    avatarId: patch.avatarId ? getAvatar(patch.avatarId).id : current.avatarId,
    settings: { ...current.settings, ...patch.settings },
    updatedAt: new Date().toISOString(),
  };

  profiles[index] = updated;
  writeJson(PROFILES_KEY, profiles);
  emitProfilesChange();
  return updated;
}

/** Elimina el perfil y todos sus datos locales asociados. */
export function deleteProfile(profileId: string): void {
  writeJson(
    PROFILES_KEY,
    listProfiles().filter((profile) => profile.id !== profileId),
  );
  if (getActiveProfileId() === profileId) setActiveProfileId(null);

  const prefixes = [
    `eq.gameState.${profileId}`,
    `eq.progress.${profileId}`,
    `eq.attempts.${profileId}`,
    `eq.lessonDraft.${profileId}`,
  ];
  for (const prefix of prefixes) {
    for (const key of keysWithPrefix(prefix)) removeKey(key);
  }
  emitProfilesChange();
}

/* -------------------------------------------------------------------------- */
/* Ajustes por perfil (accesibles aunque el perfil aun no este activo)        */
/* -------------------------------------------------------------------------- */

export function getStoredSettings(profileId: string): ProfileSettings {
  return readJson<ProfileSettings>(`${SETTINGS_KEY_PREFIX}${profileId}`, DEFAULT_PROFILE_SETTINGS);
}

export function setStoredSettings(profileId: string, settings: ProfileSettings): void {
  writeJson(`${SETTINGS_KEY_PREFIX}${profileId}`, settings);
  updateProfile(profileId, { settings });
}
