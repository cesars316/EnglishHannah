"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/link-button";
import { Pill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Mascot } from "@/components/ui/mascot";
import { Spinner } from "@/components/ui/spinner";
import { BADGES, getWorld, PUBLISHED_WORLDS } from "@/content";
import { useGameState } from "@/features/progress/use-game-state";
import { useProgressSummary } from "@/features/progress/use-progress-summary";
import { useProfiles } from "@/features/profile/profile-context";
import { availableWorldIdsFor } from "@/features/rewards/logic";

/**
 * Pantalla de inicio de la zona de juego: siguiente mision, recompensas y
 * palabras que conviene repasar.
 *
 * Sin rachas obligatorias ni castigos: siempre hay algo que hacer, aunque se
 * lleve mucho tiempo sin entrar.
 */
export function HomeDashboard() {
  const { ready, activeProfile } = useProfiles();
  const gameState = useGameState(activeProfile?.id ?? null);
  const summary = useProgressSummary(activeProfile?.id ?? null);

  if (!ready) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner size={28} label="Cargando tu progreso" />
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <EmptyState
        icon="user"
        title="Elige un perfil para empezar"
        description="Cada perfil guarda su propio progreso. Crea el tuyo en un momento."
        action={
          <LinkButton href="/perfiles" icon="user">
            Elegir perfil
          </LinkButton>
        }
      />
    );
  }

  const completedLessons = new Set(gameState.completedLessonIds);
  const available = availableWorldIdsFor(gameState.completedWorldIds);

  const nextLesson =
    PUBLISHED_WORLDS.filter((world) => available.includes(world.id))
      .flatMap((world) => world.lessonIds)
      .find((lessonId) => !completedLessons.has(lessonId)) ?? null;

  const nextLessonWorldId =
    nextLesson === null
      ? null
      : (PUBLISHED_WORLDS.find((world) => world.lessonIds.includes(nextLesson))?.id ?? null);

  const nextWorld = nextLessonWorldId ? getWorld(nextLessonWorldId) : null;
  const reviewCount = summary?.reviewSuggestions.length ?? 0;
  const earnedBadges = gameState.earnedBadgeIds.length;

  return (
    <div className="space-y-5">
      <Card tone="warm" className="space-y-3">
        <div className="flex items-start gap-4">
          <Mascot name="pip" mood="cheering" size={72} />
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-cream-900 text-xl font-extrabold sm:text-2xl">
              ¡Hola, {activeProfile.displayName}!
            </h2>
            <p className="text-cream-700 text-sm leading-relaxed sm:text-base">
              {nextLesson && nextWorld
                ? `Siguiente parada: ${nextWorld.title.es}.`
                : "¡Has completado todos los mundos disponibles! Puedes repetir lo que quieras."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {nextLesson ? (
            <LinkButton href={`/jugar/leccion/${nextLesson}`} size="lg" icon="play">
              Jugar ahora
            </LinkButton>
          ) : (
            <LinkButton href="/jugar/mapa" size="lg" icon="map">
              Ver el mapa
            </LinkButton>
          )}
          <LinkButton href="/jugar/mapa" variant="secondary" icon="map">
            Elegir otro mundo
          </LinkButton>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="space-y-1">
          <p className="text-cream-700 flex items-center gap-2 text-sm font-bold">
            <Icon name="star" size={18} className="text-brand-600" />
            Experiencia
          </p>
          <p className="text-cream-900 text-2xl font-extrabold">{gameState.xp} XP</p>
        </Card>
        <Card className="space-y-1">
          <p className="text-cream-700 flex items-center gap-2 text-sm font-bold">
            <Icon name="coin" size={18} className="text-warning-500" />
            Monedas
          </p>
          <p className="text-cream-900 text-2xl font-extrabold">{gameState.coins}</p>
        </Card>
        <Card className="space-y-1">
          <p className="text-cream-700 flex items-center gap-2 text-sm font-bold">
            <Icon name="trophy" size={18} className="text-purple-600" />
            Insignias
          </p>
          <p className="text-cream-900 text-2xl font-extrabold">
            {earnedBadges}{" "}
            <span className="text-cream-600 text-base font-bold">de {BADGES.length}</span>
          </p>
        </Card>
      </div>

      {summary && summary.vocabularySeen > 0 && (
        <Card className="space-y-3">
          <h2 className="text-cream-900 text-lg font-extrabold">Tu avance en palabras</h2>
          <ProgressBar
            value={summary.vocabularyMastered}
            max={Math.max(summary.vocabularySeen, 1)}
            label="Palabras dominadas"
            hint={`${summary.vocabularyMastered} de ${summary.vocabularySeen} practicadas`}
            tone="success"
          />
          <p className="text-cream-700 text-sm">
            Llevas {summary.activitiesCompleted} actividades y unos {summary.minutesPracticed}{" "}
            minutos de practica en total.
          </p>
        </Card>
      )}

      {summary && reviewCount > 0 && (
        <Card className="space-y-3" tone="cool">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-cream-900 text-lg font-extrabold">Palabras para repasar</h2>
            <Pill tone="sky">{reviewCount}</Pill>
          </div>
          <ul className="flex flex-wrap gap-2">
            {summary.reviewSuggestions.map((suggestion) => (
              <li
                key={suggestion.entityId}
                className="rounded-2xl border border-sky-200 bg-white px-3 py-1.5 text-sm"
              >
                <span className="text-cream-900 font-bold">{suggestion.word}</span>
                <span className="text-cream-600 ml-2">{suggestion.translation}</span>
              </li>
            ))}
          </ul>
          <LinkButton href="/jugar/practicar" icon="refresh">
            Repasar ahora
          </LinkButton>
        </Card>
      )}

      <Card className="space-y-3">
        <h2 className="text-cream-900 text-lg font-extrabold">Tus ultimos pasos</h2>
        {summary && summary.recentActivity.length > 0 ? (
          <ul className="space-y-2">
            {summary.recentActivity.slice(0, 5).map((activity) => {
              const world = getWorld(activity.worldId);
              return (
                <li
                  key={`${activity.activityId}-${activity.createdAt}`}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <span
                    aria-hidden="true"
                    className={
                      activity.result === "correct"
                        ? "text-success-600"
                        : activity.result === "incorrect"
                          ? "text-warning-600"
                          : "text-sky-600"
                    }
                  >
                    <Icon name={activity.result === "correct" ? "check" : "target"} size={18} />
                  </span>
                  <span className="text-cream-900 font-bold">
                    {world?.title.es ?? activity.worldId}
                  </span>
                  <span className="text-cream-600">
                    {activity.result === "correct"
                      ? "acertada"
                      : activity.result === "incorrect"
                        ? "para practicar otra vez"
                        : "completada"}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-cream-700 text-sm">
            Cuando juegues tu primera actividad, aqui veras tu recorrido.
          </p>
        )}
      </Card>
    </div>
  );
}
