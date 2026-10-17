"use client";

import { useMemo, useState } from "react";

import { ActivityFrame } from "@/components/activities/activity-frame";
import { OptionButton, type OptionState } from "@/components/activities/option-button";
import type { MatchingPairsViewProps } from "@/components/activities/types";
import { VocabularyVisualView } from "@/components/activities/vocabulary-visual";
import { shuffleWithSeed } from "@/lib/random";

/**
 * `matching-pairs`: se une cada palabra con su dibujo.
 *
 * El emparejamiento se comprueba de una vez (el navegador nunca ve la
 * solucion). Las parejas ya acertadas quedan fijadas entre intentos.
 */
export function MatchingPairsView({
  activity,
  eliminatedOptionIds,
  evaluation,
  busy,
  solved,
  revealed,
  onSubmit,
  onHint,
  hintVisible,
  showTranslation,
  lockedPairs,
}: MatchingPairsViewProps) {
  const lefts = useMemo(
    () =>
      shuffleWithSeed(
        activity.content.pairs.map((pair) => pair.left),
        `${activity.id}-left`,
      ),
    [activity],
  );
  const rights = useMemo(
    () =>
      shuffleWithSeed(
        activity.content.pairs.map((pair) => pair.right),
        `${activity.id}-right`,
      ),
    [activity],
  );

  const [assignment, setAssignment] = useState<Record<string, string>>(() =>
    Object.fromEntries(lockedPairs.map((pair) => [pair.leftId, pair.rightId])),
  );
  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);

  const assignedRightIds = new Set(Object.values(assignment));
  const complete = lefts.every((left) => assignment[left.id] !== undefined);
  const correctByLeftId = new Map(
    (evaluation?.correctPairs ?? []).map((pair) => [pair.leftId, pair.rightId]),
  );

  /** rightId -> true si esta colocado en su pareja correcta. */
  const assignedCorrectly = new Map<string, boolean>();
  for (const [leftId, rightId] of Object.entries(assignment)) {
    assignedCorrectly.set(rightId, correctByLeftId.get(leftId) === rightId);
  }

  const assign = (leftId: string, rightId: string): void => {
    setAssignment((previous) => {
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(previous)) {
        if (value !== rightId) next[key] = value;
      }
      next[leftId] = rightId;
      return next;
    });
    setActiveLeftId(null);
  };

  const handleRight = (rightId: string): void => {
    if (activeLeftId === null) return;
    assign(activeLeftId, rightId);
  };

  const handleLeft = (leftId: string): void => {
    if (assignment[leftId] !== undefined) {
      setAssignment((previous) => {
        const next = { ...previous };
        delete next[leftId];
        return next;
      });
      setActiveLeftId(leftId);
      return;
    }
    setActiveLeftId((previous) => (previous === leftId ? null : leftId));
  };

  const submit = (): void => {
    const pairs = lefts
      .map((left) => ({ leftId: left.id, rightId: assignment[left.id] }))
      .filter((pair): pair is { leftId: string; rightId: string } => pair.rightId !== undefined);
    onSubmit({ kind: "pairs", pairs });
  };

  const stateForRight = (rightId: string): OptionState => {
    if (solved) return evaluation?.correctOptionIds.includes(rightId) ? "correct" : "idle";
    if (assignedCorrectly.get(rightId) === true) return "correct";
    if (eliminatedOptionIds.includes(rightId)) return "dimmed";
    if (assignedRightIds.has(rightId)) return "selected";
    return "idle";
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
            disabled={!complete || busy || solved}
            className="bg-brand-700 hover:bg-brand-800 inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 text-base font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-55"
          >
            Comprobar
          </button>
          {!complete && !solved && (
            <span className="text-cream-700 text-sm font-semibold">
              Une todas las parejas para comprobar.
            </span>
          )}
          {revealed && (
            <span className="text-success-900 text-sm font-bold">
              Solucion:{" "}
              {activity.content.pairs
                .map((pair) => `${pair.left.id} = ${pair.right.id}`)
                .join(" · ")}
            </span>
          )}
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3" role="group" aria-label="Palabras">
          {lefts.map((left) => {
            const isLocked =
              assignment[left.id] !== undefined &&
              correctByLeftId.get(left.id) === assignment[left.id];
            return (
              <OptionButton
                key={left.id}
                state={isLocked ? "correct" : activeLeftId === left.id ? "selected" : "idle"}
                disabled={busy || solved || isLocked}
                onClick={() => handleLeft(left.id)}
                className="min-h-16"
              >
                <span className="text-lg">{left.label ?? left.id}</span>
              </OptionButton>
            );
          })}
        </div>

        <div className="space-y-3" role="group" aria-label="Dibujos">
          {rights.map((right) => (
            <OptionButton
              key={right.id}
              state={stateForRight(right.id)}
              disabled={busy || solved}
              onClick={() => handleRight(right.id)}
              className="min-h-16"
            >
              {right.visual ? (
                <VocabularyVisualView
                  visual={right.visual}
                  size="md"
                  decorative={!(solved || revealed)}
                />
              ) : (
                <span className="text-lg">{right.label ?? right.id}</span>
              )}
            </OptionButton>
          ))}
        </div>
      </div>
    </ActivityFrame>
  );
}
