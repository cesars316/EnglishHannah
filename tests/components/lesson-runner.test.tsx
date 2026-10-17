import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ALL_ACTIVITIES } from "@/content";
import { toPublicActivities } from "@/features/activities/engine/public-activity";
import { LessonRunner } from "@/features/activities/components/lesson-runner";
import { DEFAULT_AVATAR_ID } from "@/config/avatars";
import { createProfile, setActiveProfileId } from "@/features/profile/local-store";
import { ProfileProvider } from "@/features/profile/profile-context";
import type { PublicActivity } from "@/types/content";

/**
 * Prueba de componente del flujo completo de una sesion.
 *
 * La Server Action se sustituye por un doble: aqui se comprueba la ORQUESTACION
 * (fases, feedback, recompensas, resumen), no la correccion, que ya tiene sus
 * propias pruebas unitarias.
 */

vi.mock("@/features/activities/actions", () => ({
  evaluateAnswer: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { evaluateAnswer } from "@/features/activities/actions";

const evaluateAnswerMock = vi.mocked(evaluateAnswer);

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
        worldId="hello-village"
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
  evaluateAnswerMock.mockReset();
  const profile = createProfile({ displayName: "Ana", avatarId: DEFAULT_AVATAR_ID });
  setActiveProfileId(profile.id);
});

describe("LessonRunner", () => {
  it("muestra la introduccion y empieza al pulsar Empezar", async () => {
    renderRunner(imageChoiceActivities());

    expect(await screen.findByRole("heading", { name: /mision de prueba/i })).toBeInTheDocument();
    expect(screen.getByText(/objetivo uno/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /empezar/i }));

    expect(await screen.findByText("Actividad 1 de 2")).toBeInTheDocument();
  });

  it("resuelve una actividad correcta, muestra el feedback y pasa a la siguiente", async () => {
    evaluateAnswerMock.mockResolvedValue({
      evaluation: { isCorrect: true, correctOptionIds: [] },
      feedback: { es: "¡Perfecto a la primera!", en: "Well done!" },
      xpAwarded: 15,
      coinsAwarded: 1,
    });

    const { container } = renderRunner(imageChoiceActivities());
    await startAndPlayFirstOption(container);

    await waitFor(() => expect(evaluateAnswerMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/perfecto a la primera/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(await screen.findByText("Actividad 2 de 2")).toBeInTheDocument();
  });

  it("termina la sesion con un resumen que incluye el bonus de leccion", async () => {
    evaluateAnswerMock.mockResolvedValue({
      evaluation: { isCorrect: true, correctOptionIds: [] },
      feedback: { es: "¡Muy bien!", en: "Great job!" },
      xpAwarded: 10,
      coinsAwarded: 1,
    });

    const { container } = renderRunner(firstActivity());
    await startAndPlayFirstOption(container);

    await userEvent.click(await screen.findByRole("button", { name: /continuar/i }));

    expect(await screen.findByRole("heading", { name: /mision cumplida/i })).toBeInTheDocument();
    // 10 XP de la actividad + 20 XP de completar la leccion.
    expect(screen.getByText(/\+30 XP/)).toBeInTheDocument();
  });

  it("avisa cuando no se pudo comprobar la respuesta sin cerrar la actividad", async () => {
    evaluateAnswerMock.mockRejectedValue(new Error("sin conexion"));

    const { container } = renderRunner(imageChoiceActivities());
    await startAndPlayFirstOption(container);

    expect(await screen.findByText(/no pudimos comprobar tu respuesta/i)).toBeInTheDocument();
    expect(screen.getByText("Actividad 1 de 2")).toBeInTheDocument();
  });

  it("pide elegir un perfil cuando no hay ninguno activo", async () => {
    window.localStorage.clear();

    renderRunner(imageChoiceActivities());

    expect(await screen.findByText(/primero elige un perfil/i)).toBeInTheDocument();
  });
});
