"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  createProfile as createProfileInStore,
  deleteProfile as deleteProfileInStore,
  getActiveProfileId,
  getProfileSnapshot,
  getProfilesError,
  getProfilesStatus,
  loadProfiles,
  setActiveProfileId as setActiveProfileIdInStore,
  SERVER_PROFILE_SNAPSHOT,
  subscribeProfiles,
  updateProfile as updateProfileInStore,
  type ProfilePatch,
} from "@/features/profile/remote-store";
import type { Profile } from "@/types/domain";

/**
 * Estado de perfiles en el cliente.
 *
 * El servidor es la autoridad (ADR 0003): los perfiles se leen de `/api/v1` y
 * se cachean en un almacen externo. `ready` sigue el estado de la carga para
 * distinguir "aun cargando" de "no hay perfiles" y evitar parpadeos.
 */
export type CreateProfileInput = {
  displayName: string;
  avatarId?: string;
};

export type ProfileContextValue = {
  ready: boolean;
  error: string | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  selectProfile: (profileId: string | null) => void;
  createProfile: (input: CreateProfileInput) => Promise<Profile>;
  updateProfile: (profileId: string, patch: ProfilePatch) => Promise<Profile>;
  deleteProfile: (profileId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const getServerSnapshot = (): typeof SERVER_PROFILE_SNAPSHOT => SERVER_PROFILE_SNAPSHOT;
const getServerStatus = (): "idle" | "loading" | "ready" | "error" => "idle";
const getServerError = (): string | null => null;

export function ProfileProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeProfiles, getProfileSnapshot, getServerSnapshot);
  const status = useSyncExternalStore(subscribeProfiles, getProfilesStatus, getServerStatus);
  const error = useSyncExternalStore(subscribeProfiles, getProfilesError, getServerError);

  // La carga se dispara desde un efecto (nunca durante el render) y el almacen
  // avisa a los suscriptores cuando termina.
  useEffect(() => {
    void loadProfiles();
  }, []);

  const { profiles, activeId } = snapshot;

  const selectProfile = useCallback((profileId: string | null) => {
    setActiveProfileIdInStore(profileId);
  }, []);

  const handleCreate = useCallback(
    (input: CreateProfileInput) => createProfileInStore(input),
    [],
  );

  const handleUpdate = useCallback(
    (profileId: string, patch: ProfilePatch) => updateProfileInStore(profileId, patch),
    [],
  );

  const handleDelete = useCallback((profileId: string) => deleteProfileInStore(profileId), []);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeId) ?? null,
    [profiles, activeId],
  );

  // El ajuste "movimiento reducido" se aplica al documento completo.
  useEffect(() => {
    const root = document.documentElement;
    if (activeProfile?.settings.reducedMotion) {
      root.dataset.motion = "reduced";
    } else {
      delete root.dataset.motion;
    }
  }, [activeProfile?.settings.reducedMotion]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      ready: status === "ready" || status === "error",
      error,
      profiles,
      activeProfile,
      selectProfile,
      createProfile: handleCreate,
      updateProfile: handleUpdate,
      deleteProfile: handleDelete,
      refresh: loadProfiles,
    }),
    [status, error, profiles, activeProfile, selectProfile, handleCreate, handleUpdate, handleDelete],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfiles(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfiles debe usarse dentro de <ProfileProvider>");
  }
  return context;
}

export { getActiveProfileId };
