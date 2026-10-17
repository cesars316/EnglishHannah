"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  createProfile as createProfileInStore,
  deleteProfile as deleteProfileInStore,
  getProfileSnapshot,
  revalidateProfiles,
  SERVER_PROFILE_SNAPSHOT,
  setActiveProfileId as setActiveProfileIdInStore,
  subscribeProfiles,
  updateProfile as updateProfileInStore,
  type CreateProfileInput,
} from "@/features/profile/local-store";
import { clearProfileProgress } from "@/features/progress/local-progress";
import type { Profile, ProfileSettings } from "@/types/domain";

/**
 * Estado de perfiles en el cliente.
 *
 * La fuente de verdad es `localStorage`, expuesto como almacen externo para
 * `useSyncExternalStore`: el servidor usa una instantanea vacia y el cliente
 * adopta los datos reales tras la hidratacion, sin desajustes ni `setState`
 * dentro de un efecto.
 *
 * `ready` distingue "aun hidratando" de "no hay perfiles" para evitar
 * parpadeos y redirecciones incorrectas.
 */
export type ProfileContextValue = {
  ready: boolean;
  profiles: Profile[];
  activeProfile: Profile | null;
  selectProfile: (profileId: string | null) => void;
  createProfile: (input: CreateProfileInput) => Profile;
  updateProfile: (
    profileId: string,
    patch: Partial<Pick<Profile, "displayName" | "avatarId">> & {
      settings?: Partial<ProfileSettings>;
    },
  ) => Profile | null;
  deleteProfile: (profileId: string) => void;
  refresh: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const getServerSnapshot = (): typeof SERVER_PROFILE_SNAPSHOT => SERVER_PROFILE_SNAPSHOT;
const getHydratedOnClient = (): boolean => true;
const getHydratedOnServer = (): boolean => false;

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeProfiles, getProfileSnapshot, getServerSnapshot);
  // `useSyncExternalStore` devuelve `false` en servidor y `true` en el cliente.
  const ready = useSyncExternalStore(subscribeProfiles, getHydratedOnClient, getHydratedOnServer);

  const { profiles, activeId } = snapshot;

  const selectProfile = useCallback((profileId: string | null) => {
    setActiveProfileIdInStore(profileId);
  }, []);

  const handleCreate = useCallback((input: CreateProfileInput) => createProfileInStore(input), []);

  const handleUpdate = useCallback<ProfileContextValue["updateProfile"]>(
    (profileId, patch) => updateProfileInStore(profileId, patch),
    [],
  );

  const handleDelete = useCallback((profileId: string) => {
    clearProfileProgress(profileId);
    deleteProfileInStore(profileId);
  }, []);

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
      ready,
      profiles,
      activeProfile,
      selectProfile,
      createProfile: handleCreate,
      updateProfile: handleUpdate,
      deleteProfile: handleDelete,
      refresh: revalidateProfiles,
    }),
    [ready, profiles, activeProfile, selectProfile, handleCreate, handleUpdate, handleDelete],
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
