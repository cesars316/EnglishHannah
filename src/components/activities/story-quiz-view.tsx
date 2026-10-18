"use client";

import { useState } from "react";

import { ActivityFrame } from "@/components/activities/activity-frame";
import { OptionButton, type OptionState } from "@/components/activities/option-button";
import { SpeakButton } from "@/components/activities/speak-button";
import type { StoryQuizViewProps } from "@/components/activities/types";
import { Button } from "@/components/ui/button";

/**
 * `story-quiz`: una mini-historia y preguntas de comprension.
 *
 * La solucion no viaja al navegador dentro de `content`: se conoce a partir de
 * `evaluation` una vez enviada la respuesta (ADR 0004). La historia siempre
 * tiene el ingles a la vista y la traduccion es opcional, para que cada vez se
 * necesite menos español.
 */
export function StoryQuizView({
  activity,
  busy,
  solved,
  revealed,
  evaluation,
  onSubmit,
  onHint,
  hintVisible,
  showTranslation,
}: StoryQuizViewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const questions = activity.content.questions;
  const finished = solved || revealed;

  const allAnswered = questions.every((question) => answers[question.id] !== undefined);
  const storyText = activity.content.sentences.map((sentence) => sentence.en).join(" ");

  const choose = (questionId: string, optionId: string): void => {
    if (busy || finished) return;
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  };

  const submit = (): void => {
    if (busy || finished || !allAnswered) return;
    onSubmit({
      kind: "quiz",
      answers: questions.map((question) => ({
        questionId: question.id,
        optionId: answers[question.id] ?? "",
      })),
    });
  };

  const optionState = (questionId: string, optionId: string): OptionState => {
    const selected = answers[questionId] === optionId;
    const isCorrectOption = evaluation?.correctOptionIds.includes(optionId) ?? false;

    if (finished) {
      if (isCorrectOption) return "correct";
      return selected ? "wrong" : "dimmed";
    }
    if (evaluation && selected) {
      const result = evaluation.quizResults?.find((item) => item.questionId === questionId);
      if (result) return result.isCorrect ? "correct" : "wrong";
    }
    return selected ? "selected" : "idle";
  };

  return (
    <ActivityFrame
      prompt={showTranslation ? activity.prompt.es : activity.prompt.en}
      instructions={showTranslation ? activity.instructions.es : activity.instructions.en}
      hint={activity.hints[0]?.es}
      hintVisible={hintVisible}
      onHint={activity.hints.length > 0 ? onHint : undefined}
      footer={
        finished ? undefined : (
          <Button onClick={submit} disabled={busy || !allAnswered} loading={busy}>
            {allAnswered ? "Comprobar" : "Responde todas las preguntas"}
          </Button>
        )
      }
    >
      <article className="border-cream-300 bg-cream-50 space-y-3 rounded-2xl border-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-cream-900 text-lg font-extrabold">
            {showTranslation ? activity.content.title.es : activity.content.title.en}
          </h3>
          <SpeakButton text={storyText} label="Escuchar la historia" variant="soft" />
        </div>
        <div className="space-y-2">
          {activity.content.sentences.map((sentence) => (
            <div key={sentence.en}>
              <p className="text-cream-900 text-base leading-relaxed">{sentence.en}</p>
              {showTranslation && <p className="text-cream-700 text-sm italic">{sentence.es}</p>}
            </div>
          ))}
        </div>
      </article>

      <ol className="space-y-5">
        {questions.map((question, index) => {
          const result = evaluation?.quizResults?.find((item) => item.questionId === question.id);
          const renderWrong = result !== undefined && !result.isCorrect && !finished;

          return (
            <li key={question.id} className="space-y-2">
              <p className="text-cream-900 text-base font-bold">
                {index + 1}. {showTranslation ? question.prompt.es : question.prompt.en}
              </p>
              <div
                className="grid gap-2 sm:grid-cols-3"
                role="group"
                aria-label={question.prompt.es}
              >
                {question.options.map((option) => (
                  <OptionButton
                    key={option.id}
                    state={optionState(question.id, option.id)}
                    disabled={busy || finished}
                    onClick={() => choose(question.id, option.id)}
                  >
                    <span className="text-lg">{option.label ?? option.id}</span>
                  </OptionButton>
                ))}
              </div>
              {renderWrong && (
                <p className="text-danger-700 text-sm font-semibold">
                  Esa no es. Vuelve a leer la historia y prueba otra vez.
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {finished && (
        <p className="border-success-500/40 bg-success-50 text-success-900 rounded-2xl border p-3 text-sm font-bold">
          ¡Historia terminada! Leer y comprender es un superpoder. Puedes volver a leerla cuando
          quieras.
        </p>
      )}
    </ActivityFrame>
  );
}
