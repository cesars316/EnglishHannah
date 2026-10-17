"use client";

import { api } from "@/features/api/client";
import { readJson, removeKey, writeJson } from "@/lib/storage";
import type { ProfilesView, ProfileView } from "@/types/api";
import type { Profile, ProfileSettings } from "@/types/domain";

/**
 * Almacen de perfiles del cliente, con el servidor como autoridad (ADR 0003).
 *
 * - La lista de perfiles y sus ajustes viven en MongoDB: aqui solo se cachean.
 * - En `localStorage` se guarda UNICAMENTE que perfil esta activo en este
 *   dispositivo (preferencia de interfaz, no dato del menor).
 * - Se expone como almacen externo para `useSyncExternalStore`, con instantaneas
 *   estables (misma referencia mientras no cambie nada).
 */

const ACTIVE_KEY = "eq.activeProfileId";

/* -------------------------------------------------------------------------- */
/* Estado interno y suscripcion                                               */
/* -------------------------------------------------------------------------- */

export type ProfileSnapshot = {
  profiles: Profile[];
  activeId: string | null;
};

/** Instantanea neutra que ve el servidor y la primera hidratacion. */
export const SERVER_PROFILE_SNAPSHOT: ProfileSnapshot = { profiles: [], activeId: null };

let snapshot: ProfileSnapshot = SERVER_PROFILE_SNAPSHOT;
let status: "idle" | "loading" | "ready" | "error" = "idle";
let lastError: string | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeProfiles(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function getProfileSnapshot(): ProfileSnapshot {
  return snapshot;
}

export function getProfilesStatus(): "idle" | "loading" | "ready" | "error" {
  return status;
}

export function getProfilesError(): string | null {
  return lastError;
}

/* -------------------------------------------------------------------------- */
/* Carga                                                                      */
/* -------------------------------------------------------------------------- */

let loadInFlight: Promise<void> | null = null;

/** Relee la lista de perfiles del servidor (una sola vez a la vez). */
export function loadProfiles(): Promise<void> {
  if (loadInFlight) return loadInFlight;

  status = "loading";
  lastError = null;
  emit();

  loadInFlight = api
    .get<ProfilesView>("/profiles")
    .then(({ profiles }) => {
      snapshot = { profiles, activeId: reconcileActiveId(profiles) };
      status = "ready";
    })
    .catch((error: unknown) => {
      status = "error";
      lastError = error instanceof Error ? error.message : "No pudimos cargar los perfiles.";
    })
    .finally(() => {
      loadInFlight = null;
      emit();
    });

  return loadInFlight;
}

/**
 * Elige el perfil activo: se respeta el guardado si sigue existiendo; si no, se
 * toma el primero. Nunca se inventa un perfil que el servidor no devolvio.
 */
function reconcileActiveId(profiles: Profile[]): string | null {
  const stored = readActiveId();
  if (stored && profiles.some((profile) => profile.id === stored)) return stored;

  const [first] = profiles;
  if (first) {
    writeActiveId(first.id);
    return first.id;
  }

  removeActiveId();
  return null;
}

function readActiveId(): string | null {
  const value = readJson<string | null>(ACTIVE_KEY, null);
  return typeof value === "string" ? value : null;
}

function writeActiveId(profileId: string): void {
  writeJson(ACTIVE_KEY, profileId);
}

function removeActiveId(): void {
  removeKey(ACTIVE_KEY);
}

/* -------------------------------------------------------------------------- */
/* Mutaciones                                                                 */
/* -------------------------------------------------------------------------- */

function replaceProfile(profile: Profile): void {
  const exists = snapshot.profiles.some((item) => item.id === profile.id);
  const profiles = exists
    ? snapshot.profiles.map((item) => (item.id === profile.id ? profile : item))
    : [...snapshot.profiles, profile];

  snapshot = { ...snapshot, profiles };
  emit();
}

/** Marca como activo el perfil elegido (preferencia local). */
export function setActiveProfileId(profileId: string | null): void {
  if (profileId === null) {
    removeActiveId();
  } else {
    writeActiveId(profileId);
  }
  snapshot = { ...snapshot, activeId: profileId };
  emit();
}

export async function createProfile(input: {
  displayName: string;
  avatarId?: string;
}): Promise<Profile> {
  const { profile } = await api.post<ProfileView>("/profiles", input);
  replaceProfile(profile);
  if (getActiveProfileId() === null) setActiveProfileId(profile.id);
  return profile;
}

export type ProfilePatch = Partial<Pick<Profile, "displayName" | "avatarId">> & {
  settings?: Partial<ProfileSettings>;
};

/**
 * Actualiza alias/avatar y/o ajustes.
 *
 * Se separan en dos peticiones porque el servidor protege los ajustes con la
 * zona parental: cambiar el mote es libre, cambiar microfono o camara no.
 */
export async function updateProfile(profileId: string, patch: ProfilePatch): Promise<Profile> {
  let profile: Profile | null = null;

  if (patch.displayName !== undefined || patch.avatarId !== undefined) {
    const result = await api.patch<ProfileView>(`/profiles/${profileId}`, {
      ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
      ...(patch.avatarId !== undefined ? { avatarId: patch.avatarId } : {}),
    });
    profile = result.profile;
    replaceProfile(profile);
  }

  if (patch.settings !== undefined) {
    const current = profile ?? getProfileSnapshot().profiles.find((item) => item.id === profileId);
    const settings: ProfileSettings = {
      ...(current?.settings ?? EMPTY_SETTINGS),
      ...patch.settings,
    };
    const result = await api.patch<ProfileView>(`/profiles/${profileId}/settings`, { settings });
    profile = result.profile;
    replaceProfile(profile);
  }

  if (!profile) {
    throw new Error("No hay nada que actualizar.");
  }
  return profile;
}

const EMPTY_SETTINGS: ProfileSettings = {
  microphoneEnabled: false,
  cameraEnabled: false,
  soundEnabled: true,
  reducedMotion: false,
};

/** Borra el perfil y todos sus datos. Requiere la zona parental desbloqueada. */
export async function deleteProfile(profileId: string): Promise<void> {
  await api.delete<{ deleted: boolean }>(`/profiles/${profileId}`);

  snapshot = {
    profiles: snapshot.profiles.filter((profile) => profile.id !== profileId),
    activeId: snapshot.activeId === profileId ? null : snapshot.activeId,
  };
  if (snapshot.activeId === null) reconcileAfterDelete();
  emit();
}

function reconcileAfterDelete(): void {
  const [first] = snapshot.profiles;
  snapshot = { ...snapshot, activeId: first?.id ?? null };
  if (first) writeActiveId(first.id);
  else removeActiveId();
}

export function getActiveProfileId(): string | null {
  return snapshot.activeId;
}

/* -------------------------------------------------------------------------- */
/* Utilidades de prueba                                                       */
/* -------------------------------------------------------------------------- */

/** Reinicia el almacen (solo pruebas). */
export function resetProfileStore(): void {
  snapshot = SERVER_PROFILE_SNAPSHOT;
  status = "idle";
  lastError = null;
  loadInFlight = null;
  listeners.clear();
}
