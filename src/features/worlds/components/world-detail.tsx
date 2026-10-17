"use client";

import Link from "next/link";

import { VocabularyVisualView } from "@/components/activities/vocabulary-visual";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/link-button";
import { Pill } from "@/components/ui/pill";
import { Spinner } from "@/components/ui/spinner";
import { getWorld, getWorldLessons, getWorldVocabulary } from "@/content";
import { useGameState } from "@/features/progress/use-game-state";
import { useProfiles } from "@/features/profile/profile-context";
import { availableWorldIdsFor } from "@/features/rewards/logic";
import { cn } from "@/lib/cn";

/**
 * Detalle de un mundo: sus lecciones en orden, con la siguiente mision
 * destacada, y las palabras que se practican.
 */
export function WorldDetail({ worldId }: { worldId: string }) {
  const { ready, activeProfile } = useProfiles();
  const gameState = useGameState(activeProfile?.id ?? null);

  const world = getWorld(worldId);
  const lessons = world ? getWorldLessons(world.id) : [];
  const vocabulary = world ? getWorldVocabulary(world.id) : [];

  if (!ready) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner size={28} label="Cargando el mundo" />
      </div>
    );
  }

  if (!world || lessons.length === 0) {
    return (
      <EmptyState
        icon="map"
        title="No encontramos este mundo"
        description="Puede que el contenido haya cambiado de nombre. Vuelve al mapa para elegir otra aventura."
        action={
          <LinkButton href="/jugar/mapa" icon="map">
            Volver al mapa
          </LinkButton>
        }
      />
    );
  }

  if (!availableWorldIdsFor(gameState.completedWorldIds).includes(world.id)) {
    return (
      <EmptyState
        icon="lock"
        title="Este mundo todavia esta cerrado"
        description="Se abre cuando completas el mundo anterior. Elige una mision disponible en el mapa."
        action={
          <LinkButton href="/jugar/mapa" icon="map">
            Ver el mapa
          </LinkButton>
        }
      />
    );
  }

  const completedLessons = new Set(gameState.completedLessonIds);
  const nextLesson = lessons.find((lesson) => !completedLessons.has(lesson.id)) ?? null;
  const doneCount = lessons.filter((lesson) => completedLessons.has(lesson.id)).length;

  return (
    <div className="space-y-5">
      <Card tone="warm" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm"
          >
            {world.theme.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-cream-900 text-xl font-extrabold">{world.title.es}</h2>
            <p className="text-cream-700 text-sm">{world.goal.es}</p>
          </div>
          <Pill tone={doneCount === lessons.length ? "success" : "sky"}>
            {doneCount} de {lessons.length} lecciones
          </Pill>
        </div>

        {nextLesson ? (
          <LinkButton href={`/jugar/leccion/${nextLesson.id}`} icon="play" size="lg">
            {doneCount === 0 ? "Empezar el mundo" : "Continuar"} · {nextLesson.title.es}
          </LinkButton>
        ) : (
          <Pill tone="success" icon={<Icon name="trophy" size={16} />}>
            ¡Mundo completado! Puedes repetir cualquier mision.
          </Pill>
        )}
      </Card>

      <section className="space-y-3">
        <h2 className="text-cream-900 text-lg font-extrabold">Misiones</h2>
        <ol className="space-y-3">
          {lessons.map((lesson) => {
            const isDone = completedLessons.has(lesson.id);
            return (
              <li key={lesson.id}>
                <Card className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full font-extrabold",
                      isDone ? "bg-success-500 text-white" : "bg-cream-200 text-cream-800",
                    )}
                  >
                    {isDone ? <Icon name="check" size={20} /> : lesson.order}
                  </span>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-cream-900 font-extrabold">{lesson.title.es}</h3>
                      {isDone && <Pill tone="success">Completada</Pill>}
                      {lesson.isFinalMission && <Pill tone="purple">Mision final</Pill>}
                    </div>
                    <p className="text-cream-700 text-sm leading-relaxed">{lesson.intro.es}</p>
                    <p className="text-cream-600 text-xs font-semibold">
                      {lesson.activityIds.length} actividades · {lesson.estimatedMinutes} min
                    </p>
                  </div>

                  <Link href={`/jugar/leccion/${lesson.id}`} className="no-underline">
                    <Button variant={isDone ? "secondary" : "primary"} size="sm" icon="play">
                      {isDone ? "Repetir" : "Jugar"}
                    </Button>
                  </Link>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-cream-900 text-lg font-extrabold">
          Palabras de este mundo ({vocabulary.length})
        </h2>
        <ul className="flex flex-wrap gap-2">
          {vocabulary.map((item) => (
            <li
              key={item.id}
              className="border-cream-300 flex items-center gap-2 rounded-2xl border bg-white px-3 py-1.5"
            >
              <VocabularyVisualView visual={item.visual} size="sm" decorative />
              <span className="text-cream-900 font-bold">{item.word}</span>
              <span className="text-cream-600 text-sm">{item.translation}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
