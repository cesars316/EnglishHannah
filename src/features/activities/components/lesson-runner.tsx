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
import {
  EMPTY_ATTEMPT,
  reduceAttempt,
  type AttemptProgress,
} from "@/features/activities/engine/attempt";
import { useProfiles } from "@/features/profile/profile-context";
import { applyGameState, invalidateSummary } from "@/features/progress/remote-store";
import { api } from "@/features/api/client";
import type { AnswerActivityResult, CompleteLessonResult } from "@/types/api";
import type { ActivityResponse, PublicActivity } from "@/types/content";

export type LessonRunnerProps = {
  lessonId: string;
  title: string;
  subtitle?: string;
  objectives: readonly string[];
  activities: readonly PublicActivity[];
  isReview?: boolean;
  completeHref: string;
  completeLabel?: string;
};

type Outcome = {
  correct: boolean;
  xp: number;
  coins: number;
  durationMs: number;
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

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function LessonRunner({
  lessonId,
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

  const completeLesson = useCallback(
    async (last: boolean) => {
      if (!activeProfile || !last) return null;

      try {
        const result = await api.post<CompleteLessonResult>(
          `/lessons/${lessonId}/complete`,
          { profileId: activeProfile.id, clientAttemptId: randomId() },
        );
        applyGameState(activeProfile.id, result.gameState);
        invalidateSummary(activeProfile.id);
        return {
          duplicate: result.duplicate,
          xpAwarded: result.xpAwarded,
          coinsAwarded: result.coinsAwarded,
        };
      } catch {
        return null;
      }
    },
    [activeProfile, lessonId],
  );

  const handleAdvance = useCallback(() => {
    if (!current) return;

    const last = state.index + 1 >= total;
    const shouldComplete = last && !isReview;

    void (async () => {
      let completion: Completion | null = null;
      if (shouldComplete) {
        const result = await completeLesson(true);
        completion = result
          ? { duplicate: result.duplicate, xpAwarded: result.xpAwarded, coinsAwarded: result.coinsAwarded }
          : null;
      }

      dispatch({
        type: "next",
        finished: last,
        completion,
      });
    })();
  }, [current, total, state.index, isReview, completeLesson]);

  const outcomeFor = useCallback(
    (attempt: AttemptProgress, solved: boolean): Outcome => ({
      correct: solved,
      xp: attempt.xp,
      coins: attempt.coins,
      durationMs: Date.now() - state.activityStartedAt,
    }),
    [state.activityStartedAt],
  );

  const handleSubmit = useCallback(
    async (response: ActivityResponse) => {
      if (!current || !activeProfile || state.busy || state.attempt.solved || state.attempt.revealed) {
        return;
      }

      const attemptNumber = state.attempt.attempts + 1;
      dispatch({ type: "submit-start" });

      try {
        const result = await api.post<AnswerActivityResult>(
          `/activities/${current.id}/answer`,
          {
            profileId: activeProfile.id,
            clientAttemptId: randomId(),
            response,
            attemptNumber,
            durationMs: Date.now() - state.activityStartedAt,
            hintUsed: state.attempt.hintUsed,
            isReview,
          },
        );

        const nextAttempt = reduceAttempt(state.attempt, {
          activity: current,
          response,
          result,
        });

        applyGameState(activeProfile.id, result.gameState);
        invalidateSummary(activeProfile.id);

        const outcome = nextAttempt.solved ? outcomeFor(nextAttempt, true) : null;
        dispatch({ type: "submit-result", attempt: nextAttempt, outcome });
      } catch {
        dispatch({
          type: "submit-error",
          message: "No pudimos comprobar tu respuesta. Intentalo otra vez.",
        });
      }
    },
    [activeProfile, current, isReview, outcomeFor, state.attempt, state.busy, state.activityStartedAt],
  );

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
          <Button variant="primary" size="lg" icon="play" onClick={() => dispatch({ type: "start" })}>
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
            <h1 className="text-cream-900 text-2xl font-extrabold sm:text-3xl">¡Mision cumplida!</h1>
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
            Puedes seguir cuando quieras: aqui no hay tiempo limite ni rachas que perder. Repetir una mision siempre suma.
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
            microphoneEnabled={activeProfile?.settings.microphoneEnabled ?? false}
            cameraEnabled={activeProfile?.settings.cameraEnabled ?? false}
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
                No pasa nada: aprender tambien es ver la solucion y seguir. Ya te llevas tus monedas por intentarlo.
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
