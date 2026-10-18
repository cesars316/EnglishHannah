import {
  buildCameraHunt,
  buildImageChoice,
  buildListenAndChoose,
  buildMatchingPairs,
  buildSentenceCompletion,
  buildSpeakAndCheck,
  buildStoryQuiz,
  buildWordBuilder,
  colorVisual,
  textOption,
} from "@/content/helpers";
import type { Activity, ChoiceOption, MatchingPair } from "@/types/content";

/** Muestra de color con identificador de palabra. */
const swatch = (id: string, hex: string, alt: string): ChoiceOption => ({
  id,
  visual: colorVisual(hex, alt),
});

const RED = swatch("red", "#d64550", "Muestra de color rojo");
const BLUE = swatch("blue", "#208be3", "Muestra de color azul");
const YELLOW = swatch("yellow", "#f5c542", "Muestra de color amarillo");
const GREEN = swatch("green", "#2e9e6b", "Muestra de color verde");
const ORANGE = swatch("orange", "#ea5a28", "Muestra de color naranja");
const PURPLE = swatch("purple", "#9b7ede", "Muestra de color morado");
const PINK = swatch("pink", "#f17fa6", "Muestra de color rosado");
const BLACK = swatch("black", "#3d3327", "Muestra de color negro");
const WHITE = swatch("white", "#ffffff", "Muestra de color blanco");
const BROWN = swatch("brown", "#a9744f", "Muestra de color marron");

/** Une palabras con su muestra de color. */
function swatchPairs(...options: readonly ChoiceOption[]): MatchingPair[] {
  return options.map((option) => ({
    id: `p-${option.id}`,
    left: { id: option.id, label: option.id },
    right: { id: option.id, visual: option.visual },
  }));
}

/** Actividades del mundo 2: Color Forest. */
export const COLOR_FOREST_ACTIVITIES: readonly Activity[] = [
  /* -------------------- color-01: rojo, azul y amarillo -------------------- */
  buildListenAndChoose({
    id: "color-01-listen",
    worldId: "color-forest",
    lessonId: "color-01",
    order: 1,
    vocabularyIds: ["red", "blue", "yellow"],
    say: "blue",
    options: [BLUE, RED, YELLOW],
    answerId: "blue",
    hints: [{ es: "Es el color del cielo y del mar.", en: "It is the colour of the sky." }],
  }),
  buildImageChoice({
    id: "color-01-choice",
    worldId: "color-forest",
    lessonId: "color-01",
    order: 2,
    vocabularyIds: ["red", "blue", "yellow"],
    promptWord: "yellow",
    options: [RED, YELLOW, BLUE],
    answerId: "yellow",
    hints: [{ es: "Es el color del sol y del platano.", en: "The colour of the sun." }],
  }),
  buildMatchingPairs({
    id: "color-01-pairs",
    worldId: "color-forest",
    lessonId: "color-01",
    order: 3,
    vocabularyIds: ["red", "blue", "yellow"],
    pairs: swatchPairs(RED, BLUE, YELLOW),
  }),
  buildSentenceCompletion({
    id: "color-01-complete",
    worldId: "color-forest",
    lessonId: "color-01",
    order: 4,
    vocabularyIds: ["yellow", "blue", "red"],
    sentence: "The banana is ___ .",
    translation: "El platano es amarillo.",
    options: [textOption("yellow", "yellow"), textOption("blue", "blue"), textOption("red", "red")],
    answerId: "yellow",
    hints: [{ es: "¿De que color es un platano?", en: "What colour is a banana?" }],
  }),
  buildSpeakAndCheck({
    id: "color-01-speak",
    worldId: "color-forest",
    lessonId: "color-01",
    order: 5,
    vocabularyIds: ["blue"],
    target: "blue",
    translation: "azul",
    hints: [{ es: "Rima con «you». Di la vocal despacio.", en: "It rhymes with 'you'." }],
  }),

  /* -------------- color-02: verde, naranja, morado y rosa ----------------- */
  buildListenAndChoose({
    id: "color-02-listen",
    worldId: "color-forest",
    lessonId: "color-02",
    order: 1,
    vocabularyIds: ["green", "orange", "pink"],
    say: "green",
    options: [GREEN, ORANGE, PINK],
    answerId: "green",
    hints: [{ es: "Es el color de las hojas y del cesped.", en: "The colour of leaves." }],
  }),
  buildImageChoice({
    id: "color-02-choice",
    worldId: "color-forest",
    lessonId: "color-02",
    order: 2,
    vocabularyIds: ["purple", "green", "orange"],
    promptWord: "purple",
    options: [PURPLE, GREEN, ORANGE],
    answerId: "purple",
    hints: [{ es: "Es el color de las uvas.", en: "The colour of grapes." }],
  }),
  buildMatchingPairs({
    id: "color-02-pairs",
    worldId: "color-forest",
    lessonId: "color-02",
    order: 3,
    vocabularyIds: ["green", "orange", "pink"],
    pairs: swatchPairs(GREEN, ORANGE, PINK),
  }),
  buildWordBuilder({
    id: "color-02-build",
    worldId: "color-forest",
    lessonId: "color-02",
    order: 4,
    vocabularyIds: ["green"],
    answer: "green",
    translation: "verde",
    extraTokens: ["a"],
    hints: [{ es: "Empieza con g y tiene dos letras e juntas.", en: "It starts with g." }],
  }),
  buildCameraHunt({
    id: "color-02-hunt",
    worldId: "color-forest",
    lessonId: "color-02",
    order: 5,
    vocabularyIds: ["green", "orange", "pink"],
    target: "green",
    translation: "algo verde",
    prompt: { es: "Busca algo verde a tu alrededor.", en: "Find something green around you." },
    why: {
      es: "Para reconocer el color verde en objetos reales.",
      en: "To recognise green in real objects.",
    },
    fallbackOptions: [GREEN, ORANGE, PINK],
    answerId: "green",
    hints: [{ es: "Mira las plantas, la ropa o tus lapices.", en: "Look at plants, clothes or pencils." }],
  }),

  /* -------------- color-03: mision final del bosque ------------------------ */
  buildListenAndChoose({
    id: "color-03-listen",
    worldId: "color-forest",
    lessonId: "color-03",
    order: 1,
    vocabularyIds: ["white", "black", "brown"],
    say: "white",
    options: [WHITE, BLACK, BROWN],
    answerId: "white",
    hints: [{ es: "Es el color de las nubes y de la nieve.", en: "The colour of clouds." }],
  }),
  buildImageChoice({
    id: "color-03-choice",
    worldId: "color-forest",
    lessonId: "color-03",
    order: 2,
    vocabularyIds: ["brown", "white", "black"],
    promptWord: "brown",
    options: [BROWN, WHITE, BLACK],
    answerId: "brown",
    hints: [{ es: "Es el color de la madera y del chocolate.", en: "The colour of wood." }],
  }),
  buildMatchingPairs({
    id: "color-03-pairs",
    worldId: "color-forest",
    lessonId: "color-03",
    order: 3,
    vocabularyIds: ["black", "white", "brown"],
    pairs: swatchPairs(BLACK, WHITE, BROWN),
  }),
  buildWordBuilder({
    id: "color-03-build",
    worldId: "color-forest",
    lessonId: "color-03",
    order: 4,
    vocabularyIds: ["black"],
    answer: "black",
    translation: "negro",
    extraTokens: ["e"],
    hints: [
      { es: "Empieza con b y termina con la letra k.", en: "It starts with b and ends with k." },
    ],
  }),
  buildSentenceCompletion({
    id: "color-03-complete",
    worldId: "color-forest",
    lessonId: "color-03",
    order: 5,
    vocabularyIds: ["yellow", "purple", "brown"],
    sentence: "The sun is ___ .",
    translation: "El sol es amarillo.",
    options: [
      textOption("yellow", "yellow"),
      textOption("purple", "purple"),
      textOption("brown", "brown"),
    ],
    answerId: "yellow",
    hints: [{ es: "¿De que color es el sol?", en: "What colour is the sun?" }],
  }),
  buildStoryQuiz({
    id: "color-03-story",
    worldId: "color-forest",
    lessonId: "color-03",
    order: 6,
    vocabularyIds: ["green", "yellow", "black"],
    difficulty: 2,
    title: { es: "El bosque gris", en: "The grey forest" },
    sentences: [
      { en: "The forest is grey.", es: "El bosque esta gris." },
      { en: "Lina paints the leaves green.", es: "Lina pinta las hojas de verde." },
      { en: "She paints the sun yellow.", es: "Ella pinta el sol de amarillo." },
      { en: "Now the forest is colourful.", es: "Ahora el bosque tiene color." },
    ],
    questions: [
      {
        id: "color-story-q1",
        prompt: {
          es: "¿De que color esta el bosque al principio?",
          en: "What colour is the forest at the start?",
        },
        options: [
          textOption("color-story-q1-grey", "Grey"),
          textOption("color-story-q1-green", "Green"),
          textOption("color-story-q1-yellow", "Yellow"),
        ],
        answerId: "color-story-q1-grey",
      },
      {
        id: "color-story-q2",
        prompt: { es: "¿Que pinta Lina de verde?", en: "What does Lina paint green?" },
        options: [
          textOption("color-story-q2-leaves", "The leaves"),
          textOption("color-story-q2-sun", "The sun"),
          textOption("color-story-q2-door", "The door"),
        ],
        answerId: "color-story-q2-leaves",
      },
      {
        id: "color-story-q3",
        prompt: { es: "¿De que color pinta el sol?", en: "What colour does she paint the sun?" },
        options: [
          textOption("color-story-q3-yellow", "Yellow"),
          textOption("color-story-q3-blue", "Blue"),
          textOption("color-story-q3-black", "Black"),
        ],
        answerId: "color-story-q3-yellow",
      },
    ],
  }),
] as const;
