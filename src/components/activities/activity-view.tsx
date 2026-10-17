"use client";

import { ImageChoiceView } from "@/components/activities/image-choice-view";
import { ListenAndChooseView } from "@/components/activities/listen-and-choose-view";
import { MatchingPairsView } from "@/components/activities/matching-pairs-view";
import { SentenceCompletionView } from "@/components/activities/sentence-completion-view";
import type { ActivityViewBase } from "@/components/activities/types";
import { WordBuilderView } from "@/components/activities/word-builder-view";
import { EmptyState } from "@/components/ui/empty-state";
import type { PublicActivity } from "@/types/content";

export type ActivityViewProps = ActivityViewBase & {
  activity: PublicActivity;
  lockedPairs: readonly { leftId: string; rightId: string }[];
};

/**
 * Elige la vista adecuada segun el tipo de actividad.
 *
 * Los tipos de las fases 5-7 (hablar, camara, historia) aun no tienen vista
 * jugable: se muestran como "proximamente" en vez de romper la sesion.
 */
export function ActivityView({ activity, lockedPairs, ...base }: ActivityViewProps) {
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
