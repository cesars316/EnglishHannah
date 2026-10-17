"use client";

import { useMemo, useState } from "react";

import { ActivityFrame } from "@/components/activities/activity-frame";
import { SpeakButton } from "@/components/activities/speak-button";
import type { WordBuilderViewProps } from "@/components/activities/types";
import { shuffleWithSeed } from "@/lib/random";

/** Ficha individual (letra o palabra) del banco. */
type Token = { id: string; value: string };

/**
 * `word-builder`: ordenar letras o palabras para formar la respuesta.
 *
 * Se usan identificadores unicos por ficha pero valores normalizados para que
 * "la palabra ya esta usada" se detecte por valor, no por indice.
 */
export function WordBuilderView({
  activity,
  busy,
  solved,
  revealed,
  evaluation,
  onSubmit,
  onHint,
  hintVisible,
  showTranslation,
}: WordBuilderViewProps) {
  const mode = activity.content.mode;

  const bank = useMemo<Token[]>(
    () =>
      shuffleWithSeed(
        activity.content.tokens.map((value, index) => ({ id: `${value}-${index}`, value })),
        `${activity.id}-bank`,
      ),
    [activity],
  );

  const [usedIds, setUsedIds] = useState<string[]>([]);

  const usedTokens = usedIds
    .map((id) => bank.find((token) => token.id === id))
    .filter((token): token is Token => token !== undefined);

  const available = bank.filter((token) => !usedIds.includes(token.id));

  const answer =
    mode === "letters"
      ? usedTokens.map((token) => token.value).join("")
      : usedTokens.map((token) => token.value).join(" ");

  const place = (token: Token): void => {
    if (busy || solved) return;
    setUsedIds((previous) => [...previous, token.id]);
  };

  const remove = (tokenId: string): void => {
    if (busy || solved) return;
    setUsedIds((previous) => previous.filter((id) => id !== tokenId));
  };

  const clear = (): void => setUsedIds([]);

  const submit = (): void => {
    if (answer.trim().length === 0) return;
    onSubmit({ kind: "text", text: answer });
  };

  return (
    <ActivityFrame
      prompt={showTranslation ? activity.prompt.es : activity.prompt.en}
      instructions={showTranslation ? activity.instructions.es : activity.instructions.en}
      hint={activity.hints[0]?.es}
      hintVisible={hintVisible}
      onHint={activity.hints.length > 0 ? onHint : undefined}
      footer={
        <>
          <button
            type="button"
            onClick={submit}
            disabled={answer.trim().length === 0 || busy || solved}
            className="bg-brand-700 hover:bg-brand-800 inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 text-base font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-55"
          >
            Comprobar
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={usedIds.length === 0 || busy || solved}
            className="border-cream-300 text-cream-800 hover:bg-cream-100 inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 bg-white px-4 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-55"
          >
            Borrar y empezar
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {showTranslation && (
          <p className="text-cream-700 text-sm">
            En español: <span className="font-bold">{activity.content.translation}</span>
          </p>
        )}

        <div
          className="border-cream-300 flex min-h-20 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed bg-white p-3"
          aria-label="Tu respuesta"
        >
          {usedTokens.length === 0 && (
            <span className="text-cream-600 text-sm font-semibold">
              Toca las fichas para escribir.
            </span>
          )}
          {usedTokens.map((token) => (
            <button
              key={token.id}
              type="button"
              onClick={() => remove(token.id)}
              disabled={busy || solved}
              className="border-brand-300 bg-brand-50 text-cream-900 hover:bg-brand-100 min-h-12 rounded-xl border-2 px-3 text-xl font-extrabold"
            >
              {token.value}
              <span className="sr-only">Quitar</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Fichas disponibles">
          {available.map((token) => (
            <button
              key={token.id}
              type="button"
              onClick={() => place(token)}
              disabled={busy || solved}
              className="border-cream-300 text-cream-900 min-h-12 rounded-xl border-2 bg-white px-3 text-xl font-extrabold hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {token.value}
            </button>
          ))}
        </div>

        {(solved || revealed) && evaluation?.expectedText && (
          <div className="border-success-500/40 bg-success-50 space-y-2 rounded-2xl border p-3">
            <p className="text-success-900 text-base font-bold">
              Respuesta correcta: <span className="font-extrabold">{evaluation.expectedText}</span>
            </p>
            <SpeakButton text={evaluation.expectedText} label="Escuchar" variant="soft" />
          </div>
        )}

        {solved && (
          <div className="space-y-2 rounded-2xl border border-sky-100 bg-sky-50 p-3">
            <SpeakButton text={answer} label="Escuchar tu respuesta" variant="soft" />
          </div>
        )}
      </div>
    </ActivityFrame>
  );
}
