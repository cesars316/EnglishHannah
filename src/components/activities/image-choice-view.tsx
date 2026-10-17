"use client";

import { ActivityFrame } from "@/components/activities/activity-frame";
import { OptionButton } from "@/components/activities/option-button";
import { isOptionSelectable, resolveOptionState } from "@/components/activities/option-state";
import { SpeakButton } from "@/components/activities/speak-button";
import type { ImageChoiceViewProps } from "@/components/activities/types";
import { VocabularyVisualView } from "@/components/activities/vocabulary-visual";

/**
 * `image-choice`: se lee (o se escucha) una palabra y se elige su dibujo.
 * Los nombres de las opciones se revelan solo al resolver, para no convertir el
 * ejercicio en una simple comparacion de textos.
 */
export function ImageChoiceView({
  activity,
  eliminatedOptionIds,
  wrongOptionId,
  evaluation,
  busy,
  solved,
  revealed,
  onSubmit,
  onHint,
  hintVisible,
  showTranslation,
}: ImageChoiceViewProps) {
  const promptWord = activity.content.promptWord;

  return (
    <ActivityFrame
      prompt={showTranslation ? activity.prompt.es : activity.prompt.en}
      instructions={showTranslation ? activity.instructions.es : activity.instructions.en}
      hint={activity.hints[0]?.es}
      hintVisible={hintVisible}
      onHint={activity.hints.length > 0 ? onHint : undefined}
    >
      <div className="border-brand-100 bg-brand-50/60 flex flex-wrap items-center justify-center gap-4 rounded-2xl border p-4">
        <p className="text-cream-900 text-3xl font-extrabold sm:text-4xl">{promptWord}</p>
        <SpeakButton text={promptWord} label="Escuchar" variant="soft" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {activity.content.options.map((option) => {
          const state = resolveOptionState({
            optionId: option.id,
            eliminatedOptionIds,
            wrongOptionId,
            evaluation,
            solved,
            revealed,
          });
          const showLabel = solved || revealed;

          return (
            <OptionButton
              key={option.id}
              state={state}
              disabled={!isOptionSelectable(state, busy, solved)}
              srLabel={showLabel ? option.id : undefined}
              onClick={() => onSubmit({ kind: "choice", optionId: option.id })}
            >
              {option.visual ? (
                <VocabularyVisualView visual={option.visual} size="lg" decorative={!showLabel} />
              ) : (
                <span className="text-lg">{option.label ?? option.id}</span>
              )}
              {showLabel && <span className="text-cream-900 text-base">{option.id}</span>}
            </OptionButton>
          );
        })}
      </div>
    </ActivityFrame>
  );
}
