import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CameraHuntView } from "@/components/activities/camera-hunt-view";
import { SpeakAndCheckView } from "@/components/activities/speak-and-check-view";
import type { PublicActivity } from "@/types/content";

/**
 * Garantia de la Fase 5: el juego sigue funcionando cuando el microfono o la
 * camara estan apagados, la API no esta disponible o el permiso se deniega.
 * Estas vistas son presentacionales, asi que se renderizan directamente.
 */

const base = {
  eliminatedOptionIds: [],
  wrongOptionId: null,
  evaluation: null,
  busy: false,
  solved: false,
  revealed: false,
  onHint: vi.fn(),
  hintVisible: false,
  showTranslation: true,
};

const speakActivity = {
  id: "s1",
  worldId: "w1",
  lessonId: "l1",
  order: 1,
  skill: "speaking",
  prompt: { es: "Di la palabra", en: "Say the word" },
  instructions: { es: "Toca el microfono y habla", en: "Tap the mic and speak" },
  hints: [{ es: "Empieza por b", en: "Starts with b" }],
  xp: 10,
  difficulty: 1,
  vocabularyIds: ["book"],
  audio: null,
  contentVersion: 1,
  type: "speak-and-check",
  content: { target: "book", translation: "libro", acceptedAnswers: ["book"] },
} as unknown as Extract<PublicActivity, { type: "speak-and-check" }>;

const cameraActivity = {
  id: "c1",
  worldId: "w1",
  lessonId: "l1",
  order: 2,
  skill: "vocabulary",
  prompt: { es: "Busca algo rojo", en: "Find something red" },
  instructions: { es: "Mira a tu alrededor", en: "Look around" },
  hints: [],
  xp: 10,
  difficulty: 1,
  vocabularyIds: ["red"],
  audio: null,
  contentVersion: 1,
  type: "camera-hunt",
  content: {
    target: "something red",
    translation: "algo rojo",
    why: { es: "Para repasar los colores", en: "To review colors" },
    fallbackOptions: [
      { id: "red", label: "red" },
      { id: "blue", label: "blue" },
    ],
  },
} as unknown as Extract<PublicActivity, { type: "camera-hunt" }>;

describe("speak-and-check", () => {
  it("sin microfono habilitado ofrece el fallback manual y lo envia", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SpeakAndCheckView
        {...base}
        activity={speakActivity}
        microphoneEnabled={false}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText(/microfono esta apagado para este perfil/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: /ya lo dije/i }));
    expect(onSubmit).toHaveBeenCalledWith({ kind: "self-report", practiced: true });
  });

  it("con microfono habilitado pero sin soporte en el navegador, avisa y no rompe", () => {
    render(
      <SpeakAndCheckView
        {...base}
        activity={speakActivity}
        microphoneEnabled
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText(/este navegador no reconoce voz/i)).toBeDefined();
  });
});

describe("camera-hunt", () => {
  it("sin camara permite responder con las opciones", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CameraHuntView {...base} activity={cameraActivity} cameraEnabled={false} onSubmit={onSubmit} />,
    );

    expect(screen.getByText(/camara esta apagada para este perfil/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: /red/i }));
    expect(onSubmit).toHaveBeenCalledWith({ kind: "choice", optionId: "red" });
  });

  it("con camara habilitada pero sin soporte en el navegador, avisa y muestra las opciones", () => {
    render(
      <CameraHuntView {...base} activity={cameraActivity} cameraEnabled onSubmit={vi.fn()} />,
    );
    expect(screen.getByText(/este navegador no puede abrir la camara/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /blue/i })).toBeDefined();
  });
});
