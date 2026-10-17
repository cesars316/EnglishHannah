import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { DEFAULT_AVATAR_ID } from "@/config/avatars";
import { ALL_ACTIVITIES } from "@/content";
import { LessonRunner } from "@/features/activities/components/lesson-runner";
import { toPublicActivities } from "@/features/activities/engine/public-activity";
import { ProfileProvider } from "@/features/profile/profile-context";
import { resetProfileStore } from "@/features/profile/remote-store";
import { resetProgressStore } from "@/features/progress/remote-store";
import type { AnswerActivityResult, CompleteLessonResult } from "@/types/api";
import type { ActivityResponse, PublicActivity } from "@/types/content";
import type { GameState, Profile } from "@/types/domain";

/**
 * Prueba de componente del flujo completo de una sesion.
 *
 * La API se sustituye por un doble: aqui se comprueba la ORQUESTACION (fases,
 * feedback, recompensas, resumen), no la correccion, que ya tiene sus propias
 * pruebas unitarias y de integracion contra MongoDB.
 */

vi.mock("@/features/api/client", () => ({
  ApiClientError: class ApiClientError extends Error {},
  isAuthError: () => false,
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { api } from "@/features/api/client";

type ApiMock = {
  get: Mock;
  post: Mock;
  patch: Mock;
  delete: Mock;
};

const mockedApi = api as unknown as ApiMock;

const PROFILE_ID = "profile-1";

function makeProfile(): Profile {
  return {
    id: PROFILE_ID,
    displayName: "Ana",
    avatarId: DEFAULT_AVATAR_ID,
    locale: "es",
    targetLanguage: "en",
    settings: {
      microphoneEnabled: false,
      cameraEnabled: false,
      soundEnabled: true,
      reducedMotion: false,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function makeGameState(): GameState {
  return {
    profileId: PROFILE_ID,
    xp: 0,
    coins: 0,
    currentWorldId: null,
    unlockedWorldIds: [],
    completedLessonIds: [],
    completedWorldIds: [],
    earnedBadgeIds: [],
    activityCount: 0,
    lastActivityAt: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function answerResult(params: { correct: boolean; xp: number; coins?: number }): AnswerActivityResult {
  return {
    duplicate: false,
    evaluation: { isCorrect: params.correct, correctOptionIds: [] },
    feedback: params.correct
      ? { es: "¡Perfecto a la primera!", en: "Well done!" }
      : { es: "Casi. Prueba otra vez.", en: "Try again." },
    xpAwarded: params.xp,
    coinsAwarded: params.coins ?? 1,
    attemptNumber: 1,
    solved: params.correct,
    revealed: false,
    totalAttempts: 1,
    gameState: makeGameState(),
    earnedBadgeIds: [],
  };
}

function completionResult(xp: number): CompleteLessonResult {
  return {
    duplicate: false,
    lessonId: "hello-01",
    xpAwarded: xp,
    coinsAwarded: 0,
    newlyCompletedWorldIds: [],
    gameState: makeGameState(),
    earnedBadgeIds: [],
  };
}

/** Enruta las peticiones POST del runner a respuestas canonicas. */
function mockPostRoutes(options: {
  answer: AnswerActivityResult | "reject";
  complete?: CompleteLessonResult;
}): void {
  mockedApi.post.mockImplementation(((path: string) => {
    if (path.includes("/answer")) {
      return options.answer === "reject"
        ? Promise.reject(new Error("sin conexion"))
        : Promise.resolve(options.answer);
    }
    if (path.includes("/complete")) {
      return Promise.resolve(options.complete ?? completionResult(0));
    }
    return Promise.reject(new Error(`Ruta inesperada: ${path}`));
  }) as unknown as typeof api.post);
}

function imageChoiceActivities(): PublicActivity[] {
  const activities = ALL_ACTIVITIES.filter((activity) => activity.type === "image-choice").slice(
    0,
    2,
  );
  if (activities.length === 0) throw new Error("El contenido no tiene actividades image-choice");
  return toPublicActivities(activities);
}

function firstActivity(): PublicActivity[] {
  const [first] = imageChoiceActivities();
  if (!first) throw new Error("No hay actividad image-choice de prueba");
  return [first];
}

function renderRunner(activities: PublicActivity[]) {
  return render(
    <ProfileProvider>
      <LessonRunner
        lessonId="hello-01"
        title="Mision de prueba"
        subtitle="Una mision corta"
        objectives={["Objetivo uno"]}
        activities={activities}
        completeHref="/jugar/mapa"
      />
    </ProfileProvider>,
  );
}

/** Botones de opcion: son los unicos con la altura tactil grande. */
function optionButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>("button.min-h-20")).filter(
    (button) => !button.hasAttribute("disabled"),
  );
}

async function startAndPlayFirstOption(container: HTMLElement): Promise<void> {
  await userEvent.click(await screen.findByRole("button", { name: /empezar/i }));
  await screen.findByText(/actividad 1 de/i);

  const [first] = optionButtons(container);
  if (!first) throw new Error("No se encontro ningun boton de opcion jugable");
  await userEvent.click(first);
}

beforeEach(() => {
  window.localStorage.clear();
  resetProfileStore();
  resetProgressStore();
  vi.clearAllMocks();
  mockedApi.get.mockResolvedValue({ profiles: [makeProfile()] });
});

describe("LessonRunner", () => {
  it("muestra la introduccion y empieza al pulsar Empezar", async () => {
    mockPostRoutes({ answer: answerResult({ correct: true, xp: 10 }) });
    renderRunner(imageChoiceActivities());

    expect(await screen.findByRole("heading", { name: /mision de prueba/i })).toBeInTheDocument();
    expect(screen.getByText(/objetivo uno/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /empezar/i }));

    expect(await screen.findByText("Actividad 1 de 2")).toBeInTheDocument();
  });

  it("resuelve una actividad correcta, muestra el feedback y pasa a la siguiente", async () => {
    mockPostRoutes({ answer: answerResult({ correct: true, xp: 15 }) });

    const { container } = renderRunner(imageChoiceActivities());
    await startAndPlayFirstOption(container);

    await waitFor(() => expect(mockedApi.post).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/perfecto a la primera/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(await screen.findByText("Actividad 2 de 2")).toBeInTheDocument();
  });

  it("termina la sesion con un resumen que incluye el bonus de leccion", async () => {
    mockPostRoutes({
      answer: answerResult({ correct: true, xp: 10 }),
      complete: completionResult(20),
    });

    const { container } = renderRunner(firstActivity());
    await startAndPlayFirstOption(container);

    await userEvent.click(await screen.findByRole("button", { name: /continuar/i }));

    expect(await screen.findByRole("heading", { name: /mision cumplida/i })).toBeInTheDocument();
    // 10 XP de la actividad + 20 XP de completar la leccion.
    expect(screen.getByText(/\+30 XP/)).toBeInTheDocument();
  });

  it("avisa cuando no se pudo comprobar la respuesta sin cerrar la actividad", async () => {
    mockPostRoutes({ answer: "reject" });

    const { container } = renderRunner(imageChoiceActivities());
    await startAndPlayFirstOption(container);

    expect(await screen.findByText(/no pudimos comprobar tu respuesta/i)).toBeInTheDocument();
    expect(screen.getByText("Actividad 1 de 2")).toBeInTheDocument();
  });

  it("pide elegir un perfil cuando no hay ninguno activo", async () => {
    mockedApi.get.mockResolvedValue({ profiles: [] });

    renderRunner(imageChoiceActivities());

    expect(await screen.findByText(/primero elige un perfil/i)).toBeInTheDocument();
  });

  it("envia el intento con el perfil activo y el numero de intento correcto", async () => {
    mockPostRoutes({ answer: answerResult({ correct: true, xp: 10 }) });

    const activities = imageChoiceActivities();
    const { container } = renderRunner(activities);
    await startAndPlayFirstOption(container);

    await waitFor(() => expect(mockedApi.post).toHaveBeenCalledTimes(1));

    const [path, body] = mockedApi.post.mock.calls[0] as [string, Record<string, unknown>];
    expect(path).toBe(`/activities/${activities[0]?.id}/answer`);
    expect(body).toMatchObject({
      profileId: PROFILE_ID,
      attemptNumber: 1,
      hintUsed: false,
      isReview: false,
    });
    expect(typeof body.clientAttemptId).toBe("string");
    expect((body.response as ActivityResponse).kind).toBe("choice");
  });
});
