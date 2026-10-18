import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StoryQuizView } from "@/components/activities/story-quiz-view";
import type { ActivityEvaluation, PublicActivity } from "@/types/content";

/**
 * La vista de historia es presentacional: recibe una actividad publica (sin
 * `answerKey`) y devuelve la respuesta completa al pulsar «Comprobar». La
 * solucion solo llega en `evaluation`, cuando ya se ha respondido.
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

const storyActivity = {
  id: "s1",
  worldId: "w1",
  lessonId: "l1",
  order: 1,
  skill: "reading",
  prompt: { es: "Lee la historia y responde.", en: "Read the story and answer." },
  instructions: { es: "Lee con calma.", en: "Read carefully." },
  hints: [{ es: "Lee la historia otra vez.", en: "Read the story again." }],
  xp: 15,
  difficulty: 2,
  vocabularyIds: ["hello"],
  audio: null,
  contentVersion: 1,
  type: "story-quiz",
  content: {
    title: { es: "El primer dia", en: "Pip's first day" },
    sentences: [
      { en: "Pip is new in the village.", es: "Pip es nuevo en el pueblo." },
      { en: "He says hello.", es: "El dice hola." },
    ],
    questions: [
      {
        id: "q1",
        prompt: { es: "¿Quien es nuevo?", en: "Who is new?" },
        options: [
          { id: "q1-pip", label: "Pip" },
          { id: "q1-lina", label: "Lina" },
          { id: "q1-sam", label: "Sam" },
        ],
      },
      {
        id: "q2",
        prompt: { es: "¿Que dice?", en: "What does he say?" },
        options: [
          { id: "q2-hello", label: "Hello" },
          { id: "q2-no", label: "No" },
          { id: "q2-sorry", label: "Sorry" },
        ],
      },
    ],
  },
} as unknown as Extract<PublicActivity, { type: "story-quiz" }>;

const wrongAttempt: ActivityEvaluation = {
  isCorrect: false,
  correctOptionIds: ["q1-pip", "q2-hello"],
  quizResults: [
    { questionId: "q1", optionId: "q1-lina", isCorrect: false },
    { questionId: "q2", optionId: "q2-hello", isCorrect: true },
  ],
};

const disabled = (name: RegExp): boolean =>
  (screen.getByRole("button", { name }) as HTMLButtonElement).disabled;

describe("story-quiz", () => {
  it("no deja comprobar hasta responder todas las preguntas", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StoryQuizView {...base} activity={storyActivity} onSubmit={onSubmit} />);

    expect(screen.getByText("Pip is new in the village.")).toBeDefined();
    expect(disabled(/responde todas las preguntas/i)).toBe(true);

    await user.click(screen.getByRole("button", { name: /Pip/ }));
    expect(disabled(/responde todas las preguntas/i)).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Hello/ }));
    await user.click(screen.getByRole("button", { name: /comprobar/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      kind: "quiz",
      answers: [
        { questionId: "q1", optionId: "q1-pip" },
        { questionId: "q2", optionId: "q2-hello" },
      ],
    });
  });

  it("marca lo fallado, pide releer y permite corregir sin reiniciar", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(
      <StoryQuizView {...base} activity={storyActivity} onSubmit={onSubmit} />,
    );

    await user.click(screen.getByRole("button", { name: /Lina/ }));
    await user.click(screen.getByRole("button", { name: /Hello/ }));
    await user.click(screen.getByRole("button", { name: /comprobar/i }));

    rerender(
      <StoryQuizView {...base} activity={storyActivity} evaluation={wrongAttempt} onSubmit={onSubmit} />,
    );

    expect(screen.getByText(/vuelve a leer la historia/i)).toBeDefined();
    expect(disabled(/comprobar/i)).toBe(false);

    await user.click(screen.getByRole("button", { name: /Pip/ }));
    await user.click(screen.getByRole("button", { name: /comprobar/i }));

    expect(onSubmit).toHaveBeenLastCalledWith({
      kind: "quiz",
      answers: [
        { questionId: "q1", optionId: "q1-pip" },
        { questionId: "q2", optionId: "q2-hello" },
      ],
    });
  });

  it("al revelarse muestra la solucion, bloquea las opciones y oculta el boton", () => {
    render(
      <StoryQuizView
        {...base}
        activity={storyActivity}
        revealed
        evaluation={wrongAttempt}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: /respuesta correcta/i })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /comprobar/i })).toBeNull();
  });
});
