"use client";

import { useCallback, useReducer } from "react";

import { ActivityView } from "@/components/activities/activity-view";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/link-button";
import { Mascot } from "@/components/ui/mascot";
import { Pill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { StatusMessage } from "@/components/ui/status-message";
import { evaluateAnswer } from "@/features/activities/actions";
import {
  EMPTY_ATTEMPT,
  reduceAttempt,
  type AttemptProgress,
} from "@/features/activities/engine/attempt";
import { useProfiles } from "@/features/profile/profile-context";
import { completeLesson, recordAttempt } from "@/features/progress/session";
import type { ActivityResponse, PublicActivity, Skill } from "@/types/content";

/**
 * Flujo completo de una sesion de juego: introduccion, actividades con
 * correccion amable y resumen con recompensas.
 *
 * Este componente NUNCA conoce el `answerKey`: envia la respuesta a una Server
 * Action y pinta lo que le devuelve (ADR 0004).
 */

export type LessonRunnerProps = {
  lessonId: string;
  worldId: string;
  title: string;
  subtitle?: string;
  objectives: readonly string[];
  activities: readonly PublicActivity[];
  /** El bloque viene del repaso de palabras dificiles. */
  isReview?: boolean;
  /** A donde volver al terminar la sesion. */
  completeHref: string;
  completeLabel?: string;
};

type Outcome = {
  activityId: string;
  activityType: string;
  skill: Skill;
  correct: boolean;
  selfReported: boolean;
  hintUsed: boolean;
  xp: number;
  coins: number;
  durationMs: number;
  vocabularyIds: readonly string[];
};

type Completion = {
  duplicate: boolean;
  xpAwarded: number;
  coinsAwarded: number;
};

type State = {
  phase: "intro" | "playing" | "summary";
  index: number;
  attempt: AttemptProgress;
  outcomes: Outcome[];
  completion: Completion | null;
  busy: boolean;
  error: string | null;
  hintVisible: boolean;
  activityStartedAt: number;
};

type Action =
  | { type: "start" }
  | { type: "submit-start" }
  | { type: "submit-result"; attempt: AttemptProgress; outcome: Outcome | null }
  | { type: "submit-error"; message: string }
  | { type: "toggle-hint" }
  | { type: "next"; finished: boolean; completion: Completion | null };

function createInitialState(): State {
  return {
    phase: "intro",
    index: 0,
    attempt: EMPTY_ATTEMPT,
    outcomes: [],
    completion: null,
    busy: false,
    error: null,
    hintVisible: false,
    activityStartedAt: 0,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return {
        ...createInitialState(),
        phase: "playing",
        activityStartedAt: Date.now(),
      };
    case "submit-start":
      return { ...state, busy: true, error: null };
    case "submit-result":
      return {
        ...state,
        busy: false,
        attempt: action.attempt,
        outcomes: action.outcome ? [...state.outcomes, action.outcome] : state.outcomes,
      };
    case "submit-error":
      return { ...state, busy: false, error: action.message };
    case "toggle-hint":
      return {
        ...state,
        hintVisible: !state.hintVisible,
        attempt: { ...state.attempt, hintUsed: state.attempt.hintUsed || !state.hintVisible },
      };
    case "next":
      return {
        ...state,
        phase: action.finished ? "summary" : "playing",
        index: action.finished ? state.index : state.index + 1,
        attempt: EMPTY_ATTEMPT,
        completion: action.completion,
        error: null,
        hintVisible: false,
        busy: false,
        activityStartedAt: Date.now(),
      };
    default:
      return state;
  }
}

export function LessonRunner({
  lessonId,
  worldId,
  title,
  subtitle,
  objectives,
  activities,
  isReview = false,
  completeHref,
  completeLabel = "Volver al mapa",
}: LessonRunnerProps) {
  const { ready, activeProfile } = useProfiles();
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const total = activities.length;
  const current = activities[state.index] ?? null;

  const finishActivity = useCallback(
    (outcome: Outcome) => {
      if (!activeProfile) return;

      recordAttempt({
        profileId: activeProfile.id,
        activityId: outcome.activityId,
        activityType: outcome.activityType,
        lessonId,
        worldId,
        skill: outcome.skill,
        vocabularyIds: outcome.vocabularyIds,
        correct: outcome.correct,
        selfReported: outcome.selfReported,
        durationMs: outcome.durationMs,
        hintUsed: outcome.hintUsed,
        xpAwarded: outcome.xp,
        coinsAwarded: outcome.coins,
        isReview,
      });

      const isLast = state.index + 1 >= total;
      // El repaso no es una leccion del mapa: no debe marcarse como completada.
      const completion = isLast && !isReview ? completeLesson(activeProfile.id, lessonId) : null;

      dispatch({
        type: "next",
        finished: isLast,
        completion: completion
          ? {
              duplicate: completion.duplicate,
              xpAwarded: completion.xpAwarded,
              coinsAwarded: completion.coinsAwarded,
            }
          : null,
      });
    },
    [activeProfile, isReview, lessonId, state.index, total, worldId],
  );

  const outcomeFor = useCallback(
    (attempt: AttemptProgress, activity: PublicActivity, solved: boolean): Outcome => ({
      activityId: activity.id,
      activityType: activity.type,
      skill: activity.skill,
      correct: solved,
      selfReported: attempt.evaluation?.selfReported === true,
      hintUsed: attempt.hintUsed,
      xp: attempt.xp,
      coins: attempt.coins,
      durationMs: Date.now() - state.activityStartedAt,
      vocabularyIds: activity.vocabularyIds,
    }),
    [state.activityStartedAt],
  );

  const handleSubmit = useCallback(
    async (response: ActivityResponse) => {
      if (
        !current ||
        !activeProfile ||
        state.busy ||
        state.attempt.solved ||
        state.attempt.revealed
      ) {
        return;
      }

      const attemptNumber = state.attempt.attempts + 1;
      dispatch({ type: "submit-start" });

      try {
        const result = await evaluateAnswer({
          activityId: current.id,
          response,
          attemptNumber,
          hintUsed: state.attempt.hintUsed,
          isReview,
        });

        const nextAttempt = reduceAttempt(state.attempt, { activity: current, response, result });
        const outcome = nextAttempt.solved ? outcomeFor(nextAttempt, current, true) : null;

        dispatch({ type: "submit-result", attempt: nextAttempt, outcome });
      } catch {
        dispatch({
          type: "submit-error",
          message: "No pudimos comprobar tu respuesta. Intentalo otra vez.",
        });
      }
    },
    [activeProfile, current, isReview, outcomeFor, state.attempt, state.busy],
  );

  const handleAdvance = useCallback(() => {
    if (!current) return;
    finishActivity(outcomeFor(state.attempt, current, state.attempt.solved));
  }, [current, finishActivity, outcomeFor, state.attempt]);

  if (!ready) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner size={28} label="Cargando" />
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <EmptyState
        icon="user"
        title="Primero elige un perfil"
        description="Cada aventura se guarda en su propio perfil, para que tu progreso no se mezcle con el de nadie mas."
        action={
          <LinkButton href="/perfiles" icon="user">
            Elegir perfil
          </LinkButton>
        }
      />
    );
  }

  if (total === 0) {
    return (
      <EmptyState
        icon="book"
        title="Esta leccion todavia no tiene actividades"
        description="Estamos preparando el contenido. Prueba con otra mision mientras tanto."
        action={
          <LinkButton href="/jugar/mapa" variant="secondary" icon="map">
            Ir al mapa
          </LinkButton>
        }
      />
    );
  }

  if (state.phase === "intro") {
    return (
      <section className="surface-card space-y-5 p-6">
        <div className="flex items-start gap-4">
          <Mascot name="pip" mood="cheering" size={64} />
          <div className="space-y-1">
            <p className="text-brand-700 text-xs font-bold tracking-wide uppercase">
              {isReview ? "Repaso" : "Nueva mision"}
            </p>
            <h1 className="text-cream-900 text-2xl font-extrabold sm:text-3xl">{title}</h1>
            {subtitle && (
              <p className="text-cream-700 text-sm leading-relaxed sm:text-base">{subtitle}</p>
            )}
          </div>
        </div>

        {objectives.length > 0 && (
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <h2 className="mb-2 text-sm font-bold tracking-wide text-sky-900 uppercase">
              Lo que vas a practicar
            </h2>
            <ul className="space-y-1.5">
              {objectives.map((objective) => (
                <li key={objective} className="text-cream-800 flex gap-2 text-sm">
                  <Icon name="check" size={18} className="mt-0.5 shrink-0 text-sky-600" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            icon="play"
            onClick={() => dispatch({ type: "start" })}
          >
            Empezar
          </Button>
          <Pill tone="neutral" icon={<Icon name="clock" size={16} />}>
            {total} {total === 1 ? "actividad" : "actividades"} · unos {Math.max(3, total * 2)} min
          </Pill>
        </div>
      </section>
    );
  }

  if (state.phase === "summary") {
    const earnedXp = state.outcomes.reduce((sum, outcome) => sum + outcome.xp, 0);
    const earnedCoins = state.outcomes.reduce((sum, outcome) => sum + outcome.coins, 0);
    const bonusXp = state.completion?.xpAwarded ?? 0;
    const bonusCoins = state.completion?.coinsAwarded ?? 0;
    const correct = state.outcomes.filter((outcome) => outcome.correct).length;
    const minutes = Math.max(
      1,
      Math.round(state.outcomes.reduce((sum, outcome) => sum + outcome.durationMs, 0) / 60000),
    );

    return (
      <div className="space-y-5">
        <section className="surface-card space-y-4 p-6 text-center">
          <div className="flex justify-center">
            <Mascot name="mia" mood="cheering" size={104} />
          </div>
          <div className="space-y-1">
            <h1 className="text-cream-900 text-2xl font-extrabold sm:text-3xl">
              ¡Mision cumplida!
            </h1>
            <p className="text-cream-700 text-sm leading-relaxed sm:text-base">
              Practicaste {total} {total === 1 ? "actividad" : "actividades"} en unos {minutes}{" "}
              {minutes === 1 ? "minuto" : "minutos"} y acertaste {correct} sin ayuda.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Pill tone="brand" icon={<Icon name="star" size={16} />}>
              +{earnedXp + bonusXp} XP
            </Pill>
            <Pill tone="warning" icon={<Icon name="coin" size={16} />}>
              +{earnedCoins + bonusCoins} monedas
            </Pill>
            {bonusXp > 0 && !state.completion?.duplicate && (
              <Pill tone="success">Bonus de leccion</Pill>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <LinkButton href={completeHref} size="lg" icon="map">
              {completeLabel}
            </LinkButton>
            <Button variant="secondary" icon="refresh" onClick={() => dispatch({ type: "start" })}>
              Repetir la mision
            </Button>
          </div>
        </section>

        <StatusMessage tone="success" title="Tu progreso esta guardado">
          <p>
            Puedes seguir cuando quieras: aqui no hay tiempo limite ni rachas que perder. Repetir
            una mision siempre suma.
          </p>
        </StatusMessage>
      </div>
    );
  }

  const progressValue = state.index + (state.attempt.solved || state.attempt.revealed ? 1 : 0);
  const feedback = state.attempt.feedback;

  return (
    <div className="space-y-5">
      <ProgressBar
        value={progressValue}
        max={total}
        label={`Actividad ${Math.min(state.index + 1, total)} de ${total}`}
        hint={title}
      />

      <div className="surface-card space-y-4 p-5 sm:p-6">
        {current ? (
          <ActivityView
            key={`${current.id}-${state.attempt.attempts}`}
            activity={current}
            eliminatedOptionIds={state.attempt.eliminatedOptionIds}
            wrongOptionId={state.attempt.wrongOptionId}
            evaluation={state.attempt.evaluation}
            busy={state.busy}
            solved={state.attempt.solved}
            revealed={state.attempt.revealed}
            lockedPairs={state.attempt.lockedPairs}
            hintVisible={state.hintVisible}
            showTranslation
            onHint={() => dispatch({ type: "toggle-hint" })}
            onSubmit={handleSubmit}
          />
        ) : (
          <EmptyState
            icon="sparkles"
            title="No encontramos esta actividad"
            description="Puede que el contenido haya cambiado. Vuelve al mapa para elegir otra mision."
          />
        )}
      </div>

      <div aria-live="polite" className="space-y-3">
        {state.error && (
          <StatusMessage tone="error" title="Algo no salio bien">
            <p>{state.error}</p>
          </StatusMessage>
        )}

        {feedback && !state.attempt.solved && !state.attempt.revealed && (
          <StatusMessage tone="warning" title={feedback.es}>
            <p>Mira las opciones otra vez: las que ya probaste se quedan apagadas.</p>
          </StatusMessage>
        )}

        {feedback && state.attempt.solved && (
          <StatusMessage tone="success" title={feedback.es}>
            <div className="space-y-3">
              <p>¡Sigue asi! Toca continuar para la siguiente actividad.</p>
              <Button variant="success" icon="arrowRight" onClick={handleAdvance}>
                Continuar
              </Button>
            </div>
          </StatusMessage>
        )}

        {state.attempt.revealed && (
          <StatusMessage tone="info" title="Aqui esta la respuesta">
            <div className="space-y-3">
              <p>
                No pasa nada: aprender tambien es ver la solucion y seguir. Ya te llevas tus monedas
                por intentarlo.
              </p>
              <Button variant="primary" icon="arrowRight" onClick={handleAdvance}>
                Continuar
              </Button>
            </div>
          </StatusMessage>
        )}
      </div>
    </div>
  );
}
