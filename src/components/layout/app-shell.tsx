"use client";

import Link from "next/link";

import { GameNavDesktop, GameNavMobile } from "@/components/layout/game-nav";
import { AvatarIllustration } from "@/components/ui/avatar-illustration";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { Spinner } from "@/components/ui/spinner";
import { getAvatar } from "@/config/avatars";
import { useGameState } from "@/features/progress/use-game-state";
import { useProfiles } from "@/features/profile/profile-context";
import { SITE } from "@/config/game";

/**
 * Cascaron de la zona de juego: navegacion lateral en escritorio,
 * inferior en movil, y barra superior con perfil y recompensas.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, activeProfile } = useProfiles();
  const gameState = useGameState(activeProfile?.id ?? null);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size={32} label="Cargando tu perfil" />
      </div>
    );
  }

  const avatar = activeProfile ? getAvatar(activeProfile.avatarId) : null;

  return (
    <div className="bg-cream-50 min-h-dvh lg:flex">
      <a
        href="#contenido"
        className="sr-only-focusable shadow-float absolute top-2 left-2 z-50 rounded-xl bg-white px-4 py-2 font-bold"
      >
        Saltar al contenido
      </a>

      <aside className="border-cream-200 hidden shrink-0 border-r bg-white lg:flex lg:w-72 lg:flex-col lg:gap-6 lg:p-5">
        <Link
          href="/jugar"
          className="text-cream-900 flex items-center gap-2 text-lg font-extrabold"
        >
          <span aria-hidden="true" className="text-2xl">
            🏝️
          </span>
          <span>{SITE.name}</span>
        </Link>

        <GameNavDesktop />

        <div className="border-cream-200 mt-auto space-y-3 border-t pt-4">
          {activeProfile && (
            <div className="flex items-center gap-3">
              {avatar && <AvatarIllustration avatar={avatar} size={44} />}
              <div className="min-w-0">
                <p className="text-cream-900 truncate font-bold">{activeProfile.displayName}</p>
                <Link
                  href="/perfiles"
                  className="text-xs font-semibold text-sky-700 underline underline-offset-2"
                >
                  Cambiar de perfil
                </Link>
              </div>
            </div>
          )}
          <Link
            href="/padres"
            className="text-cream-700 hover:bg-cream-100 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold"
          >
            <Icon name="lock" size={18} />
            Zona de adultos
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-cream-200 sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-2.5 sm:px-6">
            <Link
              href="/jugar"
              className="text-cream-900 flex items-center gap-2 font-extrabold lg:hidden"
            >
              <span aria-hidden="true" className="text-xl">
                🏝️
              </span>
              <span className="sr-only sm:not-sr-only">{SITE.name}</span>
            </Link>

            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <Pill tone="warning" icon={<Icon name="star" size={16} />}>
                <span aria-hidden="true">{gameState.xp}</span>
                <span className="sr-only">{gameState.xp} puntos de experiencia</span>
                <span aria-hidden="true" className="ml-1 font-semibold">
                  XP
                </span>
              </Pill>
              <Pill tone="brand" icon={<Icon name="coin" size={16} />}>
                <span aria-hidden="true">{gameState.coins}</span>
                <span className="sr-only">{gameState.coins} monedas</span>
              </Pill>
              {activeProfile && avatar && (
                <Link
                  href="/coleccion"
                  className="hover:bg-cream-100 flex size-11 items-center justify-center rounded-full"
                >
                  <AvatarIllustration avatar={avatar} size={34} />
                  <span className="sr-only">Ver mi coleccion</span>
                </Link>
              )}
              <Link
                href="/perfiles"
                className="text-cream-700 hover:bg-cream-100 flex size-11 items-center justify-center rounded-full lg:hidden"
              >
                <Icon name="user" size={22} />
                <span className="sr-only">Cambiar de perfil</span>
              </Link>
            </div>
          </div>
        </header>

        <main
          id="contenido"
          className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-28 sm:px-6 lg:pb-10"
        >
          {children}
        </main>

        <GameNavMobile />
      </div>
    </div>
  );
}
