"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { getWorldLessons, PUBLISHED_WORLDS } from "@/content";
import { useGameState } from "@/features/progress/use-game-state";
import { useProfiles } from "@/features/profile/profile-context";
import { availableWorldIdsFor } from "@/features/rewards/logic";
import { cn } from "@/lib/cn";

/**
 * Mapa de mundos: la ruta de la aventura.
 *
 * Un mundo se abre cuando se completan sus prerrequisitos. El progreso se lee
 * del dispositivo, por eso la decision se toma en el cliente.
 */
export function WorldMap() {
  const { ready, activeProfile } = useProfiles();
  const gameState = useGameState(activeProfile?.id ?? null);

  if (!ready) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner size={28} label="Cargando el mapa" />
      </div>
    );
  }

  const available = new Set(availableWorldIdsFor(gameState.completedWorldIds));
  const completed = new Set(gameState.completedWorldIds);

  return (
    <ol className="space-y-3">
      {PUBLISHED_WORLDS.map((world) => {
        const lessons = getWorldLessons(world.id);
        const done = lessons.filter((lesson) =>
          gameState.completedLessonIds.includes(lesson.id),
        ).length;
        const isCompleted = completed.has(world.id);
        const isAvailable = available.has(world.id);
        const locked = !isAvailable;

        const content = (
          <Card
            tone={isCompleted ? "success" : isAvailable ? "default" : "muted"}
            className={cn(
              "flex items-start gap-4 transition",
              isAvailable && "hover:border-brand-400 hover:shadow-float",
              locked && "opacity-75",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl text-2xl",
                locked ? "bg-cream-200" : "bg-white shadow-sm",
              )}
            >
              {locked ? (
                <Icon name="lock" size={24} className="text-cream-700" />
              ) : (
                world.theme.emoji
              )}
            </span>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-cream-900 text-lg font-extrabold">{world.title.es}</h2>
                <Pill tone="neutral">Mundo {world.order}</Pill>
                {isCompleted && <Pill tone="success">Completado</Pill>}
                {locked && <Pill tone="neutral">Bloqueado</Pill>}
                {!locked && !isCompleted && done > 0 && <Pill tone="sky">En curso</Pill>}
              </div>

              <p className="text-cream-700 text-sm leading-relaxed">{world.description.es}</p>

              {locked ? (
                <p className="text-cream-700 text-sm font-semibold">
                  Se abre al completar el mundo anterior. ¡Ya casi!
                </p>
              ) : (
                <ProgressBar
                  value={done}
                  max={lessons.length}
                  label="Lecciones"
                  hint={`${done} de ${lessons.length}`}
                  tone={isCompleted ? "success" : "brand"}
                />
              )}
            </div>
          </Card>
        );

        return (
          <li key={world.id}>
            {locked ? (
              <div aria-disabled="true">{content}</div>
            ) : (
              <Link href={`/jugar/mundo/${world.id}`} className="block no-underline">
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
