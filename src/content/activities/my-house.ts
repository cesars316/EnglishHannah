import {
  buildImageChoice,
  buildListenAndChoose,
  buildMatchingPairs,
  buildSentenceCompletion,
  buildStoryQuiz,
  buildWordBuilder,
  imageVisual,
} from "@/content/helpers";
import type { Activity, ChoiceOption, MatchingPair, VocabularyVisual } from "@/types/content";

const HOUSE = imageVisual("house", "Una casa con tejado rojo y puerta");
const BEDROOM = imageVisual("bedroom", "Un dormitorio con cama y ventana");
const KITCHEN = imageVisual("kitchen", "Una cocina con nevera y encimera");
const BATHROOM = imageVisual("bathroom", "Un bano con bañera");
const LIVING_ROOM = imageVisual("living-room", "Un salon con sofa y lampara");
const DOOR = imageVisual("door", "Una puerta de madera con picaporte");
const WINDOW = imageVisual("window", "Una ventana con cielo y sol");
const TABLE = imageVisual("table", "Una mesa de madera");
const CHAIR = imageVisual("chair", "Una silla de madera");
const BED = imageVisual("bed", "Una cama con almohada y manta");
const SOFA = imageVisual("sofa", "Un sofa azul con almohadones");
const LAMP = imageVisual("lamp", "Una lampara de pie amarilla");

const option = (id: string, visual: VocabularyVisual): ChoiceOption => ({ id, visual });
const word = (id: string, label: string): ChoiceOption => ({ id, label });

const pairOf = (id: string, label: string, visual: VocabularyVisual): MatchingPair => ({
  id,
  left: { id, label },
  right: { id, visual },
});

/** Mundo 7: My House. */
export const MY_HOUSE_ACTIVITIES: readonly Activity[] = [
  buildListenAndChoose({
    id: "house-01-listen",
    worldId: "my-house",
    lessonId: "house-01",
    order: 1,
    vocabularyIds: ["kitchen", "bathroom", "bedroom"],
    say: "kitchen",
    options: [option("kitchen", KITCHEN), option("bathroom", BATHROOM), option("bedroom", BEDROOM)],
    answerId: "kitchen",
    hints: [
      {
        es: "Es donde se cocina: hay una nevera y una encimera.",
        en: "It is where you cook: there is a fridge and a worktop.",
      },
    ],
  }),
  buildImageChoice({
    id: "house-01-choice",
    worldId: "my-house",
    lessonId: "house-01",
    order: 2,
    vocabularyIds: ["bedroom", "kitchen", "bathroom"],
    promptWord: "bedroom",
    options: [option("bedroom", BEDROOM), option("kitchen", KITCHEN), option("bathroom", BATHROOM)],
    answerId: "bedroom",
    hints: [
      {
        es: "Es donde duermes: hay una cama.",
        en: "It is where you sleep: there is a bed.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "house-01-pairs",
    worldId: "my-house",
    lessonId: "house-01",
    order: 3,
    vocabularyIds: ["house", "bedroom", "kitchen", "bathroom"],
    pairs: [
      pairOf("p-house", "house", HOUSE),
      pairOf("p-bedroom", "bedroom", BEDROOM),
      pairOf("p-kitchen", "kitchen", KITCHEN),
      pairOf("p-bathroom", "bathroom", BATHROOM),
    ],
  }),
  buildSentenceCompletion({
    id: "house-01-complete",
    worldId: "my-house",
    lessonId: "house-01",
    order: 4,
    vocabularyIds: ["bedroom", "kitchen", "bathroom"],
    sentence: "The bed is in the ___.",
    translation: "La cama esta en el dormitorio.",
    options: [
      word("bedroom", "bedroom"),
      word("kitchen", "kitchen"),
      word("bathroom", "bathroom"),
    ],
    answerId: "bedroom",
    hints: [
      {
        es: "En esa habitacion hay una cama.",
        en: "There is a bed in that room.",
      },
    ],
  }),
  buildWordBuilder({
    id: "house-01-build",
    worldId: "my-house",
    lessonId: "house-01",
    order: 5,
    vocabularyIds: ["kitchen"],
    answer: "kitchen",
    translation: "cocina",
    extraTokens: ["i", "n", "c", "h"],
    hints: [
      {
        es: "Empieza por kit y termina en -chen.",
        en: "Start with kit and finish with -chen.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "house-02-listen",
    worldId: "my-house",
    lessonId: "house-02",
    order: 1,
    vocabularyIds: ["table", "chair", "bed"],
    say: "table",
    options: [option("table", TABLE), option("chair", CHAIR), option("bed", BED)],
    answerId: "table",
    hints: [
      {
        es: "Encima se pone la comida.",
        en: "You put the food on top of it.",
      },
    ],
  }),
  buildImageChoice({
    id: "house-02-choice",
    worldId: "my-house",
    lessonId: "house-02",
    order: 2,
    vocabularyIds: ["window", "door", "table"],
    promptWord: "window",
    options: [option("window", WINDOW), option("door", DOOR), option("table", TABLE)],
    answerId: "window",
    hints: [
      {
        es: "Por ahi entra la luz del sol.",
        en: "Sunlight comes in through it.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "house-02-pairs",
    worldId: "my-house",
    lessonId: "house-02",
    order: 3,
    vocabularyIds: ["door", "window", "table", "chair"],
    pairs: [
      pairOf("p-door", "door", DOOR),
      pairOf("p-window", "window", WINDOW),
      pairOf("p-table", "table", TABLE),
      pairOf("p-chair", "chair", CHAIR),
    ],
  }),
  buildSentenceCompletion({
    id: "house-02-complete",
    worldId: "my-house",
    lessonId: "house-02",
    order: 4,
    vocabularyIds: ["table", "chair", "bed"],
    sentence: "Where is the lamp? It is ___ the table.",
    translation: "¿Donde esta la lampara? Esta sobre la mesa.",
    options: [word("on", "on"), word("in", "in"), word("under", "under")],
    answerId: "on",
    hints: [
      {
        es: "La lampara esta encima de la mesa.",
        en: "The lamp is on top of the table.",
      },
    ],
  }),
  buildWordBuilder({
    id: "house-02-build",
    worldId: "my-house",
    lessonId: "house-02",
    order: 5,
    vocabularyIds: ["chair"],
    answer: "chair",
    translation: "silla",
    extraTokens: ["h", "r", "e", "a"],
    hints: [
      {
        es: "Suena como cher, con dos vocales juntas al final.",
        en: "It sounds like cher, with two vowels together at the end.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "house-03-listen",
    worldId: "my-house",
    lessonId: "house-03",
    order: 1,
    vocabularyIds: ["sofa", "lamp", "bed"],
    say: "It is on the sofa",
    options: [option("sofa", SOFA), option("lamp", LAMP), option("bed", BED)],
    answerId: "sofa",
    hints: [
      {
        es: "Es el mueble para sentarse y leer.",
        en: "It is the seat for sitting and reading.",
      },
    ],
  }),
  buildImageChoice({
    id: "house-03-choice",
    worldId: "my-house",
    lessonId: "house-03",
    order: 2,
    vocabularyIds: ["sofa", "bed", "chair"],
    promptWord: "sofa",
    options: [option("sofa", SOFA), option("bed", BED), option("chair", CHAIR)],
    answerId: "sofa",
    hints: [
      {
        es: "Tiene almohadones y es azul en el dibujo.",
        en: "It has cushions and it is blue in the picture.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "house-03-pairs",
    worldId: "my-house",
    lessonId: "house-03",
    order: 3,
    vocabularyIds: ["living-room", "sofa", "lamp", "window"],
    pairs: [
      pairOf("p-living", "living room", LIVING_ROOM),
      pairOf("p-sofa", "sofa", SOFA),
      pairOf("p-lamp", "lamp", LAMP),
      pairOf("p-window", "window", WINDOW),
    ],
  }),
  buildSentenceCompletion({
    id: "house-03-complete",
    worldId: "my-house",
    lessonId: "house-03",
    order: 4,
    vocabularyIds: ["living-room", "sofa", "lamp"],
    sentence: "Where is the sofa? It is ___ the living room.",
    translation: "¿Donde esta el sofa? Esta en el salon.",
    options: [word("in", "in"), word("on", "on"), word("under", "under")],
    answerId: "in",
    hints: [
      {
        es: "El sofa esta dentro de una habitacion.",
        en: "The sofa is inside a room.",
      },
    ],
  }),
  buildWordBuilder({
    id: "house-03-build",
    worldId: "my-house",
    lessonId: "house-03",
    order: 5,
    vocabularyIds: ["kitchen", "sofa"],
    mode: "words",
    answer: "It is in the kitchen",
    translation: "esta en la cocina",
    extraTokens: ["sofa"],
    hints: [
      {
        es: "Empieza con It y termina con la habitacion donde se cocina.",
        en: "Start with It and finish with the room where you cook.",
      },
    ],
  }),
  buildStoryQuiz({
    id: "house-03-story",
    worldId: "my-house",
    lessonId: "house-03",
    order: 6,
    vocabularyIds: ["bedroom", "kitchen", "sofa", "table"],
    difficulty: 2,
    title: { es: "¿Donde esta el gato?", en: "Where is the cat?" },
    sentences: [
      { en: "Pip has a little cat.", es: "Pip tiene un gato pequeño." },
      { en: "First he looks in the bedroom.", es: "Primero mira en el dormitorio." },
      { en: "The cat is in the kitchen, under the table.", es: "El gato esta en la cocina, debajo de la mesa." },
      { en: "Now the cat is sleeping on the sofa.", es: "Ahora el gato duerme en el sofa." },
    ],
    questions: [
      {
        id: "house-story-q1",
        prompt: { es: "¿Donde mira Pip primero?", en: "Where does Pip look first?" },
        options: [
          word("house-story-q1-bedroom", "In the bedroom"),
          word("house-story-q1-kitchen", "In the kitchen"),
          word("house-story-q1-bathroom", "In the bathroom"),
        ],
        answerId: "house-story-q1-bedroom",
      },
      {
        id: "house-story-q2",
        prompt: { es: "¿Donde esta el gato en la cocina?", en: "Where is the cat in the kitchen?" },
        options: [
          word("house-story-q2-under", "Under the table"),
          word("house-story-q2-on", "On the table"),
          word("house-story-q2-next", "Next to the door"),
        ],
        answerId: "house-story-q2-under",
      },
      {
        id: "house-story-q3",
        prompt: { es: "¿Donde duerme ahora?", en: "Where is it sleeping now?" },
        options: [
          word("house-story-q3-sofa", "On the sofa"),
          word("house-story-q3-bed", "On the bed"),
          word("house-story-q3-chair", "On the chair"),
        ],
        answerId: "house-story-q3-sofa",
      },
    ],
  }),
];
