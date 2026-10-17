import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LinkButton } from "@/components/ui/link-button";
import { getLesson, getLessonActivities, getWorld } from "@/content";
import { toPublicActivities } from "@/features/activities/engine/public-activity";
import { LessonRunner } from "@/features/activities/components/lesson-runner";

type PageProps = {
  params: Promise<{ lessonId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  return { title: lesson ? lesson.title.es : "Mision no encontrada" };
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();

  const world = getWorld(lesson.worldId);
  const activities = toPublicActivities(getLessonActivities(lesson.id));

  return (
    <div className="space-y-6">
      {world && (
        <LinkButton href={`/jugar/mundo/${world.id}`} variant="ghost" size="sm" icon="arrowLeft">
          {world.title.es}
        </LinkButton>
      )}

      <LessonRunner
        lessonId={lesson.id}
        worldId={lesson.worldId}
        title={lesson.title.es}
        subtitle={lesson.intro.es}
        objectives={lesson.objectives}
        activities={activities}
        isReview={false}
        completeHref={world ? `/jugar/mundo/${world.id}` : "/jugar/mapa"}
        completeLabel={lesson.isFinalMission ? "Volver al mundo" : "Seguir la aventura"}
      />
    </div>
  );
}
