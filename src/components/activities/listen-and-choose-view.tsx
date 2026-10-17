"use client";

import { useEffect, useRef } from "react";

import { ActivityFrame } from "@/components/activities/activity-frame";
import { OptionButton } from "@/components/activities/option-button";
import { isOptionSelectable, resolveOptionState } from "@/components/activities/option-state";
import { SpeakButton } from "@/components/activities/speak-button";
import type { ListenAndChooseViewProps } from "@/components/activities/types";
import { VocabularyVisualView } from "@/components/activities/vocabulary-visual";
import { speak } from "@/features/speech/tts";
import { useSpeechSynthesisSupported } from "@/features/speech/use-speech-support";

/**
 * `listen-and-choose`: se escucha una palabra y se elige su dibujo.
 *
 * El audio se intenta reproducir automaticamente una vez; siempre queda un
 * boton para repetir y, si el navegador no puede hablar, se muestra el texto.
 */
export function ListenAndChooseView({
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
}: ListenAndChooseViewProps) {
  const autoPlayed = useRef(false);
  const speechSupported = useSpeechSynthesisSupported();
  const audioFailed = !speechSupported;

  const stimulus = activity.content.stimulus.value;

  useEffect(() => {
    if (autoPlayed.current) return;
    autoPlayed.current = true;
    speak(stimulus);
  }, [stimulus]);

  return (
    <ActivityFrame
      prompt={showTranslation ? activity.prompt.es : activity.prompt.en}
      instructions={showTranslation ? activity.instructions.es : activity.instructions.en}
      hint={activity.hints[0]?.es}
      hintVisible={hintVisible}
      onHint={activity.hints.length > 0 ? onHint : undefined}
      footer={
        speechSupported ? (
          <button
            type="button"
            onClick={() => speak(stimulus)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-sky-200 bg-sky-50 px-4 text-sm font-bold text-sky-800 hover:bg-sky-100"
          >
            Repetir el audio
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
        <SpeakButton text={stimulus} label="Escuchar la palabra" size="lg" />
        {audioFailed && (
          <p className="text-cream-800 text-center text-sm font-semibold">
            Escuchar no esta disponible en este navegador. La palabra es{" "}
            <span className="font-extrabold text-sky-800">“{stimulus}”</span>.
          </p>
        )}
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
