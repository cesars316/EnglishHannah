"use client";

import { GAME } from "@/config/game";
import { getVocabularyItem } from "@/content";
import { LessonRunner } from "@/features/activities/components/lesson-runner";
import { toPublicActivities } from "@/features/activities/engine/public-activity";
import { selectReviewActivities } from "@/features/activities/select";
import { useProgressSummary } from "@/features/progress/use-progress-summary";
import { useProfiles } from "@/features/profile/profile-context";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Sesion de repaso: se construye con las palabras que el motor marca como
 * pendientes de practicar y las actividades que ya existen en el contenido.
 *
 * Si no hay nada pendiente, se dice con claridad en vez de inventar ejercicios.
 */
export function ReviewSession() {
  const { ready, activeProfile } = useProfiles();
  const summary = useProgressSummary(activeProfile?.id ?? null);

  if (!ready || summary === null) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner size={28} label="Preparando el repaso" />
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <EmptyState
        icon="user"
        title="Elige un perfil para repasar"
        description="El repaso se calcula a partir de lo que ya practicaste en cada perfil."
        action={
          <LinkButton href="/perfiles" icon="user">
            Elegir perfil
          </LinkButton>
        }
      />
    );
  }

  const targetIds = summary.reviewSuggestions
    .map((suggestion) => suggestion.entityId)
    .filter((id) => getVocabularyItem(id) !== null);

  const activities = selectReviewActivities(targetIds, GAME.activitiesPerSession);

  if (activities.length === 0) {
    return (
      <EmptyState
        icon="sparkles"
        title="No hay nada pendiente de repaso"
        description="Vas al dia. Cuando practiques palabras nuevas, aqui apareceran las que conviene recordar."
        action={
          <LinkButton href="/jugar/mapa" icon="map">
            Ir al mapa de mundos
          </LinkButton>
        }
      />
    );
  }

  const words = targetIds
    .map((id) => getVocabularyItem(id)?.word)
    .filter((word): word is string => word !== undefined);

  return (
    <LessonRunner
      lessonId="review"
      worldId={activities[0]?.worldId ?? ""}
      title="Repaso de palabras"
      subtitle={`Vamos a recordar estas palabras: ${words.slice(0, 8).join(", ")}.`}
      objectives={["Recordar palabras que ya practicaste", "Escuchar, leer y escribir un poco mas"]}
      activities={toPublicActivities(activities)}
      isReview
      completeHref="/jugar"
      completeLabel="Volver al inicio"
    />
  );
}
