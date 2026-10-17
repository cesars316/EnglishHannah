"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AvatarIllustration } from "@/components/ui/avatar-illustration";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Pill } from "@/components/ui/pill";
import { StatusMessage } from "@/components/ui/status-message";
import { AVATARS, DEFAULT_AVATAR_ID, getAvatar } from "@/config/avatars";
import { LIMITS } from "@/config/game";
import { useProfiles } from "@/features/profile/profile-context";
import { cn } from "@/lib/cn";
import { useGameState } from "@/features/progress/use-game-state";

/**
 * Gestion de perfiles infantiles en el dispositivo: crear, elegir, renombrar y
 * eliminar. Cada perfil guarda su propio progreso.
 */

type FormState = {
  open: boolean;
  profileId: string | null;
  displayName: string;
  avatarId: string;
};

const CLOSED_FORM: FormState = {
  open: false,
  profileId: null,
  displayName: "",
  avatarId: DEFAULT_AVATAR_ID,
};

function ProfileForm({
  state,
  onChange,
  onSubmit,
  onCancel,
  error,
}: {
  state: FormState;
  onChange: (next: Partial<FormState>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  error: string | null;
}) {
  const isEditing = state.profileId !== null;

  return (
    <Card tone="warm" className="space-y-4">
      <h2 className="text-cream-900 text-lg font-extrabold">
        {isEditing ? "Editar perfil" : "Nuevo perfil"}
      </h2>

      <div className="space-y-2">
        <label htmlFor="displayName" className="text-cream-800 block text-sm font-bold">
          ¿Como te llamas?
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          value={state.displayName}
          onChange={(event) => onChange({ displayName: event.target.value })}
          maxLength={LIMITS.displayNameMax}
          autoComplete="off"
          className="border-cream-300 text-cream-900 min-h-12 w-full rounded-xl border-2 bg-white px-4 text-lg font-semibold outline-none focus:border-sky-500"
          placeholder="Tu nombre o apodo"
        />
        <p className="text-cream-600 text-xs">
          Solo lo ve tu familia en este dispositivo. Hasta {LIMITS.displayNameMax} caracteres.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-cream-800 text-sm font-bold">Elige tu avatar</legend>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((avatar) => {
            const selected = avatar.id === state.avatarId;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onChange({ avatarId: avatar.id })}
                aria-pressed={selected}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-2xl border-2 px-3 py-1.5 text-sm font-bold transition",
                  selected
                    ? "border-brand-500 ring-brand-300 bg-white ring-2"
                    : "border-cream-300 hover:border-brand-300 bg-white/70",
                )}
              >
                <AvatarIllustration avatar={avatar} size={32} />
                <span className="text-cream-900">{avatar.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <StatusMessage tone="error" title="Revisa el nombre">
          <p>{error}</p>
        </StatusMessage>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" icon="check" onClick={onSubmit}>
          {isEditing ? "Guardar cambios" : "Crear perfil"}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Card>
  );
}

function ProfileCard({
  profileId,
  displayName,
  avatarId,
  isActive,
  onPlay,
  onEdit,
  onDelete,
}: {
  profileId: string;
  displayName: string;
  avatarId: string;
  isActive: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const gameState = useGameState(profileId);

  return (
    <Card className="flex flex-col gap-3" as="li">
      <div className="flex items-center gap-3">
        <AvatarIllustration avatar={getAvatar(avatarId)} size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-cream-900 truncate text-lg font-extrabold">{displayName}</p>
          <p className="text-cream-600 text-xs font-semibold">
            {gameState.completedLessonIds.length} lecciones · {gameState.xp} XP
          </p>
        </div>
        {isActive && <Pill tone="success">Activo</Pill>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" icon="play" onClick={onPlay}>
          Jugar
        </Button>
        <Button variant="secondary" size="sm" icon="pencil" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="ghost" size="sm" icon="close" onClick={onDelete}>
          Borrar
        </Button>
      </div>
    </Card>
  );
}

export function ProfileManager() {
  const router = useRouter();
  const { profiles, activeProfile, selectProfile, createProfile, updateProfile, deleteProfile } =
    useProfiles();

  const [form, setForm] = useState<FormState>(CLOSED_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const canAddMore = profiles.length < LIMITS.maxProfilesPerOwner;

  const update = (next: Partial<FormState>): void =>
    setForm((previous) => ({ ...previous, ...next }));

  const openCreate = (): void => {
    setError(null);
    setForm({ ...CLOSED_FORM, open: true });
  };

  const openEdit = (profileId: string): void => {
    const profile = profiles.find((item) => item.id === profileId);
    if (!profile) return;
    setError(null);
    setForm({
      open: true,
      profileId: profile.id,
      displayName: profile.displayName,
      avatarId: profile.avatarId,
    });
  };

  const submit = async (): Promise<void> => {
    const displayName = form.displayName.trim();
    if (displayName.length < LIMITS.displayNameMin) {
      setError("Escribe al menos una letra para el nombre.");
      return;
    }

    try {
      if (form.profileId) {
        await updateProfile(form.profileId, { displayName, avatarId: form.avatarId });
      } else {
        const created = await createProfile({ displayName, avatarId: form.avatarId });
        selectProfile(created.id);
      }

      setForm(CLOSED_FORM);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el perfil.");
    }
  };

  const play = (profileId: string): void => {
    selectProfile(profileId);
    router.push("/jugar");
  };

  const confirmDelete = async (): Promise<void> => {
    if (!pendingDelete) return;
    try {
      await deleteProfile(pendingDelete);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "No pudimos borrar el perfil. Pide a un adulto que entre en la zona de adultos.",
      );
    } finally {
      setPendingDelete(null);
    }
  };

  const deletingProfile = profiles.find((profile) => profile.id === pendingDelete) ?? null;

  return (
    <div className="space-y-5">
      {profiles.length === 0 && !form.open ? (
        <EmptyState
          icon="user"
          title="Todavia no hay ningun perfil"
          description="Crea el primero para empezar la aventura. Puedes crear hasta 5 perfiles en este dispositivo."
          action={
            <Button variant="primary" size="lg" icon="plus" onClick={openCreate}>
              Crear un perfil
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profileId={profile.id}
              displayName={profile.displayName}
              avatarId={profile.avatarId}
              isActive={profile.id === activeProfile?.id}
              onPlay={() => play(profile.id)}
              onEdit={() => openEdit(profile.id)}
              onDelete={() => {
                setDeleteError(null);
                setPendingDelete(profile.id);
              }}
            />
          ))}
        </ul>
      )}

      {form.open && (
        <ProfileForm
          state={form}
          onChange={update}
          onSubmit={() => void submit()}
          onCancel={() => {
            setForm(CLOSED_FORM);
            setError(null);
          }}
          error={error}
        />
      )}

      {deleteError && (
        <StatusMessage tone="error" title="No se pudo borrar el perfil">
          <p>{deleteError}</p>
        </StatusMessage>
      )}

      {!form.open && profiles.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" icon="plus" onClick={openCreate} disabled={!canAddMore}>
            Anadir otro perfil
          </Button>
          {!canAddMore && (
            <Pill tone="neutral">Maximo {LIMITS.maxProfilesPerOwner} perfiles por dispositivo</Pill>
          )}
          <Button variant="secondary" icon="play" onClick={() => router.push("/jugar")}>
            Ir a jugar
          </Button>
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Borrar este perfil"
        footer={
          <>
            <Button variant="danger" icon="close" onClick={() => void confirmDelete()}>
              Si, borrar
            </Button>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancelar
            </Button>
          </>
        }
      >
        <p>
          Se borrara el progreso de{" "}
          <strong className="font-extrabold">
            {deletingProfile?.displayName ?? "este perfil"}
          </strong>
          : misiones completadas, monedas, insignias y palabras practicadas.
        </p>
        <p className="text-cream-700 mt-3 text-sm">
          Esta accion la tiene que aprobar un adulto desde la zona de adultos.
        </p>
      </Modal>
    </div>
  );
}
