"use client";

import { LinkButton } from "@/components/ui/link-button";
import { Spinner } from "@/components/ui/spinner";
import { useProfiles } from "@/features/profile/profile-context";

/**
 * Botones de entrada de la portada.
 *
 * Se decide en el cliente porque los perfiles viven en el dispositivo: hasta
 * que no se hidrata no se sabe si hay alguien que pueda continuar.
 */
export function StartActions() {
  const { ready, activeProfile } = useProfiles();

  if (!ready) {
    return (
      <div className="flex min-h-12 items-center">
        <Spinner size={24} label="Buscando perfiles" />
      </div>
    );
  }

  if (activeProfile) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <LinkButton href="/jugar" size="lg" icon="play">
          Seguir jugando como {activeProfile.displayName}
        </LinkButton>
        <LinkButton href="/perfiles" size="lg" variant="secondary" icon="user">
          Cambiar de perfil
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <LinkButton href="/empezar" size="lg" icon="sparkles">
        Empezar la aventura
      </LinkButton>
      <LinkButton href="/perfiles" size="lg" variant="secondary" icon="user">
        Ya tengo un perfil
      </LinkButton>
    </div>
  );
}
