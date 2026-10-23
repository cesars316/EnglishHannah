import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MatchingPairsView } from "@/components/activities/matching-pairs-view";
import type { ActivityEvaluation, PublicActivity } from "@/types/content";

/**
 * La vista de parejas es presentacional: recibe una actividad publica (sin
 * `answerKey`) y devuelve el emparejamiento completo al pulsar «Comprobar».
 *
 * Se prueban las dos formas de emparejar: toque-a-toque (accesible y con
 * teclado) y arrastrar y soltar (raton o dedo).
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
  lockedPairs: [],
};

const pairsActivity = {
  id: "p1",
  worldId: "w1",
  lessonId: "l1",
  order: 1,
  skill: "reading",
  prompt: { es: "Une cada palabra con su dibujo.", en: "Match each word with its picture." },
  instructions: { es: "Arrastra la palabra.", en: "Drag the word." },
  hints: [{ es: "Mira la primera letra.", en: "Look at the first letter." }],
  xp: 15,
  difficulty: 1,
  vocabularyIds: ["book"],
  audio: null,
  contentVersion: 1,
  type: "matching-pairs",
  content: {
    pairs: [
      {
        id: "p1-book",
        left: { id: "book", label: "book" },
        right: { id: "book-visual", visual: { kind: "color", hex: "#2e9e6b", alt: "un libro" } },
      },
      {
        id: "p1-cat",
        left: { id: "cat", label: "cat" },
        right: { id: "cat-visual", visual: { kind: "color", hex: "#ea5a28", alt: "un gato" } },
      },
    ],
  },
} as unknown as Extract<PublicActivity, { type: "matching-pairs" }>;

/** Resuelve una pareja con dos toques (palabra y luego dibujo). */
async function tapPair(word: RegExp, picture: RegExp): Promise<void> {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: word }));
  await user.click(screen.getByRole("button", { name: picture }));
}

/** Localiza una palabra por su texto (el estado se anade al nombre accesible). */
function word(name: string): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^${name}`, "i") });
}

describe("matching-pairs", () => {
  it("no deja comprobar hasta emparejar todas las palabras", async () => {
    const onSubmit = vi.fn();
    render(<MatchingPairsView {...base} activity={pairsActivity} onSubmit={onSubmit} />);

    expect(screen.getByRole("button", { name: /comprobar/i }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/une todas las parejas/i)).toBeDefined();

    await tapPair(/^book/i, /un libro/i);

    expect(screen.getByRole("button", { name: /comprobar/i }).hasAttribute("disabled")).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envia los pares elegidos al pulsar Comprobar (toque-a-toque)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MatchingPairsView {...base} activity={pairsActivity} onSubmit={onSubmit} />);

    await tapPair(/^book/i, /un libro/i);
    await tapPair(/^cat/i, /un gato/i);
    await user.click(screen.getByRole("button", { name: /comprobar/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      kind: "pairs",
      pairs: expect.arrayContaining([
        { leftId: "book", rightId: "book-visual" },
        { leftId: "cat", rightId: "cat-visual" },
      ]),
    });
    expect((onSubmit.mock.calls[0]?.[0] as { pairs: unknown[] }).pairs).toHaveLength(2);
  });

  it("permite arrastrar una palabra y soltarla sobre su dibujo", () => {
    const onSubmit = vi.fn();
    render(<MatchingPairsView {...base} activity={pairsActivity} onSubmit={onSubmit} />);

    const word = screen.getByRole("button", { name: /^book$/i });
    const picture = screen.getByRole("button", { name: /un libro/i });

    // jsdom no calcula geometria: se define un rectangulo para el dibujo y se
    // simula el puntero desplazandose por encima antes de soltar.
    picture.getBoundingClientRect = () =>
      ({ left: 100, top: 100, right: 200, bottom: 200, width: 100, height: 100 }) as DOMRect;

    fireEvent.pointerDown(word, { clientX: 10, clientY: 10, pointerType: "mouse", button: 0 });
    // El primer movimiento marca el arrastre (hay un margen para no confundirlo
    // con un toque); el segundo ya entra en el dibujo.
    fireEvent.pointerMove(window, { clientX: 40, clientY: 40 });
    fireEvent.pointerMove(window, { clientX: 150, clientY: 150 });
    fireEvent.pointerUp(window, { clientX: 150, clientY: 150 });

    expect(picture.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/toca para cambiarlo/i)).toBeDefined();
  });

  it("un toque sin arrastrar elige la palabra y no la suelta", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MatchingPairsView {...base} activity={pairsActivity} onSubmit={onSubmit} />);

    await user.click(word("book"));

    expect(word("book").getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByText(/toca para cambiarlo/i)).toBeNull();
  });

  it("al revelarse fija las parejas correctas y muestra la solucion", () => {
    const wrongAttempt: ActivityEvaluation = {
      isCorrect: false,
      correctOptionIds: ["book-visual"],
      correctPairs: [{ leftId: "book", rightId: "book-visual" }],
    };
    render(
      <MatchingPairsView
        {...base}
        activity={pairsActivity}
        revealed
        evaluation={wrongAttempt}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: /respuesta correcta/i })).toHaveLength(1);
    expect(screen.getByText(/Solucion:/)).toBeDefined();
    expect(screen.getByRole("button", { name: /comprobar/i }).hasAttribute("disabled")).toBe(true);
  });
});
