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

const SHIRT = imageVisual("shirt", "Una camisa azul con cuello");
const TSHIRT = imageVisual("tshirt", "Una camiseta roja con estrella");
const PANTS = imageVisual("pants", "Unos pantalones azules");
const DRESS = imageVisual("dress", "Un vestido rojo");
const SHOES = imageVisual("shoes", "Dos zapatos marrones");
const SOCKS = imageVisual("socks", "Dos calcetines, uno azul y uno amarillo");
const HAT = imageVisual("hat", "Un gorro verde con visera");
const JACKET = imageVisual("jacket", "Una chaqueta morada con cremallera");
const CLOTHES = imageVisual("clothes", "Una camiseta y unos pantalones juntos");
const WEAR = imageVisual("wear", "Una persona con ropa puesta y una flecha");

const option = (id: string, visual: VocabularyVisual): ChoiceOption => ({ id, visual });
const word = (id: string, label: string): ChoiceOption => ({ id, label });

const pairOf = (id: string, label: string, visual: VocabularyVisual): MatchingPair => ({
  id,
  left: { id, label },
  right: { id, visual },
});

/** Mundo 8: Clothes Street. */
export const CLOTHES_STREET_ACTIVITIES: readonly Activity[] = [
  buildListenAndChoose({
    id: "clothes-01-listen",
    worldId: "clothes-street",
    lessonId: "clothes-01",
    order: 1,
    vocabularyIds: ["shirt", "tshirt", "pants"],
    say: "shirt",
    options: [option("shirt", SHIRT), option("tshirt", TSHIRT), option("pants", PANTS)],
    answerId: "shirt",
    hints: [
      {
        es: "Tiene cuello y botones en el dibujo.",
        en: "It has a collar and buttons in the picture.",
      },
    ],
  }),
  buildImageChoice({
    id: "clothes-01-choice",
    worldId: "clothes-street",
    lessonId: "clothes-01",
    order: 2,
    vocabularyIds: ["pants", "shirt", "tshirt"],
    promptWord: "pants",
    options: [option("pants", PANTS), option("shirt", SHIRT), option("tshirt", TSHIRT)],
    answerId: "pants",
    hints: [
      {
        es: "Cubren las piernas.",
        en: "They cover your legs.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "clothes-01-pairs",
    worldId: "clothes-street",
    lessonId: "clothes-01",
    order: 3,
    vocabularyIds: ["shirt", "tshirt", "pants"],
    pairs: [
      pairOf("p-shirt", "shirt", SHIRT),
      pairOf("p-tshirt", "t-shirt", TSHIRT),
      pairOf("p-pants", "pants", PANTS),
    ],
  }),
  buildWordBuilder({
    id: "clothes-01-build",
    worldId: "clothes-street",
    lessonId: "clothes-01",
    order: 4,
    vocabularyIds: ["shirt"],
    answer: "shirt",
    translation: "camisa",
    extraTokens: ["h", "r", "i", "s"],
    hints: [
      {
        es: "Suena como chert.",
        en: "It sounds like chert.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "clothes-02-listen",
    worldId: "clothes-street",
    lessonId: "clothes-02",
    order: 1,
    vocabularyIds: ["shoes", "socks", "dress"],
    say: "shoes",
    options: [option("shoes", SHOES), option("socks", SOCKS), option("dress", DRESS)],
    answerId: "shoes",
    hints: [
      {
        es: "Son dos, los llevas en los pies.",
        en: "There are two of them, you wear them on your feet.",
      },
    ],
  }),
  buildImageChoice({
    id: "clothes-02-choice",
    worldId: "clothes-street",
    lessonId: "clothes-02",
    order: 2,
    vocabularyIds: ["dress", "shoes", "socks"],
    promptWord: "dress",
    options: [option("dress", DRESS), option("shoes", SHOES), option("socks", SOCKS)],
    answerId: "dress",
    hints: [
      {
        es: "Es una prenda sola que cubre todo el cuerpo.",
        en: "It is a single piece that covers the whole body.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "clothes-02-pairs",
    worldId: "clothes-street",
    lessonId: "clothes-02",
    order: 3,
    vocabularyIds: ["dress", "socks", "shoes", "shirt"],
    pairs: [
      pairOf("p-dress", "dress", DRESS),
      pairOf("p-socks", "socks", SOCKS),
      pairOf("p-shoes", "shoes", SHOES),
      pairOf("p-shirt", "shirt", SHIRT),
    ],
  }),
  buildSentenceCompletion({
    id: "clothes-02-complete",
    worldId: "clothes-street",
    lessonId: "clothes-02",
    order: 4,
    vocabularyIds: ["socks", "shoes"],
    sentence: "My socks are ___.",
    translation: "Mis calcetines son amarillos.",
    options: [word("yellow", "yellow"), word("blue", "blue"), word("green", "green")],
    answerId: "yellow",
    hints: [
      {
        es: "Es el mismo color que el sol.",
        en: "It is the same colour as the sun.",
      },
    ],
  }),
  buildWordBuilder({
    id: "clothes-02-build",
    worldId: "clothes-street",
    lessonId: "clothes-02",
    order: 5,
    vocabularyIds: ["shoes"],
    answer: "shoes",
    translation: "zapatos",
    extraTokens: ["o", "e", "s", "h"],
    hints: [
      {
        es: "Suena como chus y empieza por sh.",
        en: "It sounds like chus and starts with sh.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "clothes-03-listen",
    worldId: "clothes-street",
    lessonId: "clothes-03",
    order: 1,
    vocabularyIds: ["jacket", "hat", "tshirt"],
    say: "I am wearing a jacket",
    options: [option("jacket", JACKET), option("hat", HAT), option("tshirt", TSHIRT)],
    answerId: "jacket",
    hints: [
      {
        es: "Te la pones cuando hace frio; tiene cremallera.",
        en: "You put it on when it is cold; it has a zip.",
      },
    ],
  }),
  buildImageChoice({
    id: "clothes-03-choice",
    worldId: "clothes-street",
    lessonId: "clothes-03",
    order: 2,
    vocabularyIds: ["hat", "jacket", "shirt"],
    promptWord: "hat",
    options: [option("hat", HAT), option("jacket", JACKET), option("shirt", SHIRT)],
    answerId: "hat",
    hints: [
      {
        es: "Se lleva en la cabeza.",
        en: "You wear it on your head.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "clothes-03-pairs",
    worldId: "clothes-street",
    lessonId: "clothes-03",
    order: 3,
    vocabularyIds: ["hat", "jacket", "clothes", "wear"],
    pairs: [
      pairOf("p-hat", "hat", HAT),
      pairOf("p-jacket", "jacket", JACKET),
      pairOf("p-clothes", "clothes", CLOTHES),
      pairOf("p-wear", "wear", WEAR),
    ],
  }),
  buildSentenceCompletion({
    id: "clothes-03-complete",
    worldId: "clothes-street",
    lessonId: "clothes-03",
    order: 4,
    vocabularyIds: ["dress", "wear"],
    sentence: "I ___ wearing a red dress.",
    translation: "Llevo puesto un vestido rojo.",
    options: [word("am", "am"), word("is", "is"), word("are", "are")],
    answerId: "am",
    hints: [
      {
        es: "Despues de I siempre va am en presente continuo.",
        en: "After I you always use am in the present continuous.",
      },
    ],
  }),
  buildWordBuilder({
    id: "clothes-03-build",
    worldId: "clothes-street",
    lessonId: "clothes-03",
    order: 5,
    vocabularyIds: ["hat", "wear"],
    mode: "words",
    answer: "I am wearing a hat",
    translation: "llevo puesto un gorro",
    extraTokens: ["sofa"],
    hints: [
      {
        es: "Empieza con I am y termina con lo que llevas en la cabeza.",
        en: "Start with I am and finish with what you wear on your head.",
      },
    ],
  }),
  buildStoryQuiz({
    id: "clothes-03-story",
    worldId: "clothes-street",
    lessonId: "clothes-03",
    order: 6,
    vocabularyIds: ["dress", "hat", "pants", "jacket"],
    difficulty: 2,
    title: { es: "El desfile de ropa", en: "The fashion parade" },
    sentences: [
      { en: "Today there is a parade in Clothes Street.", es: "Hoy hay un desfile en la Calle Ropa." },
      { en: "Lina wears a red dress and a green hat.", es: "Lina lleva un vestido rojo y un gorro verde." },
      { en: "Pip wears blue pants and a jacket.", es: "Pip lleva pantalones azules y una chaqueta." },
      { en: "Everyone says: look at my clothes!", es: "Todos dicen: ¡mira mi ropa!" },
    ],
    questions: [
      {
        id: "clothes-story-q1",
        prompt: { es: "¿Que lleva Lina?", en: "What does Lina wear?" },
        options: [
          word("clothes-story-q1-dress", "A red dress and a green hat"),
          word("clothes-story-q1-pants", "Blue pants and a jacket"),
          word("clothes-story-q1-shirt", "A blue shirt"),
        ],
        answerId: "clothes-story-q1-dress",
      },
      {
        id: "clothes-story-q2",
        prompt: { es: "¿Que lleva Pip?", en: "What does Pip wear?" },
        options: [
          word("clothes-story-q2-pants", "Blue pants and a jacket"),
          word("clothes-story-q2-dress", "A red dress"),
          word("clothes-story-q2-shoes", "Yellow shoes and socks"),
        ],
        answerId: "clothes-story-q2-pants",
      },
      {
        id: "clothes-story-q3",
        prompt: { es: "¿Que dice todo el mundo?", en: "What does everyone say?" },
        options: [
          word("clothes-story-q3-clothes", "Look at my clothes"),
          word("clothes-story-q3-kitchen", "Look at my kitchen"),
          word("clothes-story-q3-cat", "Look at my cat"),
        ],
        answerId: "clothes-story-q3-clothes",
      },
    ],
  }),
];
