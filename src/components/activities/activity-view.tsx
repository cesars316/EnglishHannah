"use client";

import { CameraHuntView } from "@/components/activities/camera-hunt-view";
import { ImageChoiceView } from "@/components/activities/image-choice-view";
import { ListenAndChooseView } from "@/components/activities/listen-and-choose-view";
import { MatchingPairsView } from "@/components/activities/matching-pairs-view";
import { SentenceCompletionView } from "@/components/activities/sentence-completion-view";
import { SpeakAndCheckView } from "@/components/activities/speak-and-check-view";
import { StoryQuizView } from "@/components/activities/story-quiz-view";
import type { ActivityViewBase } from "@/components/activities/types";
import { WordBuilderView } from "@/components/activities/word-builder-view";
import { EmptyState } from "@/components/ui/empty-state";
import type { PublicActivity } from "@/types/content";

export type ActivityViewProps = ActivityViewBase & {
  activity: PublicActivity;
  lockedPairs: readonly { leftId: string; rightId: string }[];
  /** Permisos del perfil, activados por un adulto en la zona parental. */
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
};

/**
 * Elige la vista adecuada segun el tipo de actividad.
 *
 * `speak-and-check`, `camera-hunt` (Fase 5) y `story-quiz` (Fase 7) tienen su
 * propia vista; el resto son de eleccion, parejas o escritura.
 */
export function ActivityView({
  activity,
  lockedPairs,
  microphoneEnabled,
  cameraEnabled,
  ...base
}: ActivityViewProps) {
  switch (activity.type) {
    case "listen-and-choose":
      return <ListenAndChooseView activity={activity} {...base} />;
    case "image-choice":
      return <ImageChoiceView activity={activity} {...base} />;
    case "sentence-completion":
      return <SentenceCompletionView activity={activity} {...base} />;
    case "matching-pairs":
      return <MatchingPairsView activity={activity} lockedPairs={lockedPairs} {...base} />;
    case "word-builder":
      return <WordBuilderView activity={activity} {...base} />;
    case "speak-and-check":
      return <SpeakAndCheckView activity={activity} microphoneEnabled={microphoneEnabled} {...base} />;
    case "camera-hunt":
      return <CameraHuntView activity={activity} cameraEnabled={cameraEnabled} {...base} />;
    case "story-quiz":
      return <StoryQuizView activity={activity} {...base} />;
    default:
      return (
        <EmptyState
          icon="sparkles"
          title="Esta actividad llega muy pronto"
          description="Estamos preparando este tipo de reto. Mientras tanto, puedes seguir con las demás actividades."
        />
      );
  }
}
