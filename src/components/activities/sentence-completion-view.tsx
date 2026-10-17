"use client";

import { ActivityFrame } from "@/components/activities/activity-frame";
import { OptionButton } from "@/components/activities/option-button";
import { isOptionSelectable, resolveOptionState } from "@/components/activities/option-state";
import { SpeakButton } from "@/components/activities/speak-button";
import type { SentenceCompletionViewProps } from "@/components/activities/types";

/** Divide "I have ___ apples." en las partes de alrededor del hueco. */
function splitSentence(sentence: string): { before: string; after: string } {
  const index = sentence.indexOf("___");
  if (index === -1) return { before: sentence, after: "" };
  return { before: sentence.slice(0, index), after: sentence.slice(index + 3) };
}

/**
 * `sentence-completion`: se elige la palabra que falta en la frase.
 * El hueco se rellena visualmente con la opcion elegida para que la frase
 * completa se lea de un vistazo.
 */
export function SentenceCompletionView({
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
}: SentenceCompletionViewProps) {
  const { before, after } = splitSentence(activity.content.sentence);
  const filledWord =
    solved || revealed
      ? (activity.content.options.find((option) => option.id === evaluation?.correctOptionIds[0])
          ?.label ??
        activity.content.options.find((option) => option.id === evaluation?.correctOptionIds[0])
          ?.id ??
        null)
      : null;

  return (
    <ActivityFrame
      prompt={showTranslation ? activity.prompt.es : activity.prompt.en}
      instructions={showTranslation ? activity.instructions.es : activity.instructions.en}
      hint={activity.hints[0]?.es}
      hintVisible={hintVisible}
      onHint={activity.hints.length > 0 ? onHint : undefined}
    >
      <div className="space-y-2 rounded-2xl border border-purple-500/25 bg-purple-100/50 p-4">
        <p className="text-cream-900 text-xl leading-relaxed font-bold sm:text-2xl">
          {before}
          <span
            className={
              filledWord
                ? "bg-success-50 text-success-900 ring-success-500/50 mx-1 inline-block rounded-lg px-2 ring-2"
                : "mx-1 inline-block min-w-20 rounded-lg border-b-4 border-dashed border-purple-500/60 align-middle"
            }
          >
            {filledWord ?? "\u00a0"}
          </span>
          {after}
        </p>
        {showTranslation && (
          <p className="text-cream-700 text-sm">En español: {activity.content.translation}</p>
        )}
        <SpeakButton
          text={activity.content.sentence.replace("___", filledWord ?? "")}
          label="Escuchar la frase"
          variant="soft"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {activity.content.options.map((option) => {
          const state = resolveOptionState({
            optionId: option.id,
            eliminatedOptionIds,
            wrongOptionId,
            evaluation,
            solved,
            revealed,
          });

          return (
            <OptionButton
              key={option.id}
              state={state}
              disabled={!isOptionSelectable(state, busy, solved)}
              onClick={() => onSubmit({ kind: "choice", optionId: option.id })}
              className="min-h-16"
            >
              <span className="text-lg">{option.label ?? option.id}</span>
            </OptionButton>
          );
        })}
      </div>
    </ActivityFrame>
  );
}
