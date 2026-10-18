"use client";

import { getVocabularyItem } from "@/content";
import { LessonRunner } from "@/features/activities/components/lesson-runner";
import { useReviewPlan } from "@/features/progress/use-progress-summary";
import { useProfiles } from "@/features/profile/profile-context";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Sesion de repaso: el servidor elige las palabras que conviene practicar y
 * devuelve las actividades ya montadas (sin `answerKey`).
 *
 * Si no hay nada pendiente, se dice con claridad en vez de inventar ejercicios.
 */
export function ReviewSession() {
  const { ready, activeProfile } = useProfiles();
  const plan = useReviewPlan(activeProfile?.id ?? null);

  if (!ready || (activeProfile !== null && plan === null)) {
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

  const activities = plan?.activities ?? [];

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

  const words = (plan?.vocabularyIds ?? [])
    .map((id) => getVocabularyItem(id)?.word)
    .filter((word): word is string => word !== undefined);

  const challenge = plan?.challenge;

  return (
    <LessonRunner
      lessonId="review"
      title="Repaso de palabras"
      subtitle={`Nivel de hoy: ${challenge?.label.es ?? "Normal"}. Vamos a recordar estas palabras: ${words.slice(0, 8).join(", ")}.`}
      objectives={[
        "Recordar palabras que ya practicaste",
        "Escuchar, leer y escribir un poco mas",
        ...(challenge ? [challenge.reason.es] : []),
      ]}
      activities={activities}
      isReview
      completeHref="/jugar"
      completeLabel="Volver al inicio"
    />
  );
}
