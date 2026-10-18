import {
  buildImageChoice,
  buildListenAndChoose,
  buildMatchingPairs,
  buildSentenceCompletion,
  buildStoryQuiz,
  buildWordBuilder,
  imageVisual,
  textOption,
} from "@/content/helpers";
import type { Activity, ChoiceOption, MatchingPair } from "@/types/content";

const HELLO = imageVisual("hello", "Manos saludando");
const HI = imageVisual("hi", "Dos globos de dialogo");
const GOODBYE = imageVisual("goodbye", "Mano despidiendose");
const PLEASE = imageVisual("please", "Manos pidiendo por favor");
const THANK_YOU = imageVisual("thank-you", "Corazon con destellos");
const SORRY = imageVisual("sorry", "Cara triste con un corazon");
const YES = imageVisual("yes", "Circulo verde con una marca");
const NO = imageVisual("no", "Circulo rojo con una cruz");

const greetOptions: ChoiceOption[] = [
  { id: "hello", visual: HELLO },
  { id: "hi", visual: HI },
  { id: "goodbye", visual: GOODBYE },
];

const courtesyOptions: ChoiceOption[] = [
  { id: "please", visual: PLEASE },
  { id: "thank-you", visual: THANK_YOU },
  { id: "sorry", visual: SORRY },
];

const greetingPairs: MatchingPair[] = [
  { id: "p-hello", left: { id: "hello", label: "hello" }, right: { id: "hello", visual: HELLO } },
  { id: "p-hi", left: { id: "hi", label: "hi" }, right: { id: "hi", visual: HI } },
  {
    id: "p-goodbye",
    left: { id: "goodbye", label: "goodbye" },
    right: { id: "goodbye", visual: GOODBYE },
  },
];

/** Actividades del mundo 1: Hello Village. */
export const HELLO_VILLAGE_ACTIVITIES: readonly Activity[] = [
  /* --------------------------- hello-01: saludos --------------------------- */
  buildListenAndChoose({
    id: "hello-01-listen",
    worldId: "hello-village",
    lessonId: "hello-01",
    order: 1,
    vocabularyIds: ["hello", "hi", "goodbye"],
    say: "hello",
    options: greetOptions,
    answerId: "hello",
    hints: [
      {
        es: "Es la palabra que usamos cuando llegamos a un lugar.",
        en: "It is the word we use when we arrive somewhere.",
      },
    ],
  }),
  buildImageChoice({
    id: "hello-01-choice",
    worldId: "hello-village",
    lessonId: "hello-01",
    order: 2,
    vocabularyIds: ["hello", "hi", "goodbye"],
    promptWord: "goodbye",
    options: greetOptions,
    answerId: "goodbye",
    hints: [
      {
        es: "La usamos cuando nos vamos. Fijate en la mano que se aleja.",
        en: "We use it when we leave. Look at the hand moving away.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "hello-01-pairs",
    worldId: "hello-village",
    lessonId: "hello-01",
    order: 3,
    vocabularyIds: ["hello", "hi", "goodbye"],
    pairs: greetingPairs,
  }),
  buildWordBuilder({
    id: "hello-01-build",
    worldId: "hello-village",
    lessonId: "hello-01",
    order: 4,
    vocabularyIds: ["hello"],
    answer: "hello",
    translation: "hola",
    extraTokens: ["x"],
    hints: [{ es: "Empieza con la letra h y tiene dos letras l juntas.", en: "It starts with h." }],
  }),

  /* -------------------------- hello-02: cortesia --------------------------- */
  buildListenAndChoose({
    id: "hello-02-listen",
    worldId: "hello-village",
    lessonId: "hello-02",
    order: 1,
    vocabularyIds: ["please", "thank-you", "sorry"],
    say: "thank you",
    options: courtesyOptions,
    answerId: "thank-you",
    hints: [
      {
        es: "Se dice cuando alguien te ayuda. ¡Dos palabras juntas!",
        en: "You say it when someone helps you. Two words together!",
      },
    ],
  }),
  buildImageChoice({
    id: "hello-02-choice",
    worldId: "hello-village",
    lessonId: "hello-02",
    order: 2,
    vocabularyIds: ["please", "thank-you", "sorry"],
    promptWord: "please",
    options: courtesyOptions,
    answerId: "please",
    hints: [
      { es: "Lo dices cuando pides algo con educacion.", en: "You say it when you ask politely." },
    ],
  }),
  buildMatchingPairs({
    id: "hello-02-pairs",
    worldId: "hello-village",
    lessonId: "hello-02",
    order: 3,
    vocabularyIds: ["please", "thank-you", "sorry"],
    pairs: [
      {
        id: "p-please",
        left: { id: "please", label: "please" },
        right: { id: "please", visual: PLEASE },
      },
      {
        id: "p-thank-you",
        left: { id: "thank-you", label: "thank you" },
        right: { id: "thank-you", visual: THANK_YOU },
      },
      {
        id: "p-sorry",
        left: { id: "sorry", label: "sorry" },
        right: { id: "sorry", visual: SORRY },
      },
    ],
  }),
  buildSentenceCompletion({
    id: "hello-02-complete",
    worldId: "hello-village",
    lessonId: "hello-02",
    order: 4,
    vocabularyIds: ["please", "sorry", "yes"],
    sentence: "A glass of water, ___ .",
    translation: "Un vaso de agua, por favor.",
    options: [textOption("please", "please"), textOption("sorry", "sorry"), textOption("no", "no")],
    answerId: "please",
    hints: [
      {
        es: "Estas pidiendo algo con educacion, asi que falta la palabra magica.",
        en: "You are asking politely, so the magic word is missing.",
      },
    ],
  }),

  /* ----------------- hello-03: mision final del mundo ---------------------- */
  buildListenAndChoose({
    id: "hello-03-listen",
    worldId: "hello-village",
    lessonId: "hello-03",
    order: 1,
    vocabularyIds: ["yes", "no", "hello"],
    say: "yes",
    options: [
      { id: "yes", visual: YES },
      { id: "no", visual: NO },
      { id: "hello", visual: HELLO },
    ],
    answerId: "yes",
    hints: [
      { es: "Es la respuesta afirmativa: el circulo verde.", en: "It is the affirmative answer." },
    ],
  }),
  buildSentenceCompletion({
    id: "hello-03-complete",
    worldId: "hello-village",
    lessonId: "hello-03",
    order: 2,
    vocabularyIds: ["hello", "no", "sorry"],
    sentence: "___ , my name is Sam.",
    translation: "Hola, mi nombre es Sam.",
    options: [textOption("hello", "Hello"), textOption("no", "No"), textOption("sorry", "Sorry")],
    answerId: "hello",
    hints: [
      { es: "Empiezas a hablar con alguien, asi que saludas primero.", en: "You greet first." },
    ],
  }),
  buildWordBuilder({
    id: "hello-03-build",
    worldId: "hello-village",
    lessonId: "hello-03",
    order: 3,
    vocabularyIds: ["hello"],
    mode: "words",
    answer: "my name is Sam",
    translation: "mi nombre es Sam",
    extraTokens: ["hello", "no"],
    hints: [
      {
        es: "Empieza por la palabra my (mi) y termina con el nombre.",
        en: "Start with my and finish with the name.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "hello-03-pairs",
    worldId: "hello-village",
    lessonId: "hello-03",
    order: 4,
    vocabularyIds: ["hello", "hi", "thank-you"],
    pairs: [
      {
        id: "p-hello",
        left: { id: "hello", label: "hello" },
        right: { id: "hello", visual: HELLO },
      },
      { id: "p-hi", left: { id: "hi", label: "hi" }, right: { id: "hi", visual: HI } },
      {
        id: "p-thanks",
        left: { id: "thank-you", label: "thank you" },
        right: { id: "thank-you", visual: THANK_YOU },
      },
    ],
  }),
  buildImageChoice({
    id: "hello-03-choice",
    worldId: "hello-village",
    lessonId: "hello-03",
    order: 5,
    vocabularyIds: ["no", "yes", "sorry"],
    promptWord: "no",
    options: [
      { id: "no", visual: NO },
      { id: "yes", visual: YES },
      { id: "sorry", visual: SORRY },
    ],
    answerId: "no",
    hints: [
      { es: "Es la respuesta negativa: el circulo rojo con una cruz.", en: "The negative answer." },
    ],
  }),
  buildStoryQuiz({
    id: "hello-03-story",
    worldId: "hello-village",
    lessonId: "hello-03",
    order: 6,
    vocabularyIds: ["hello", "hi", "thank-you"],
    difficulty: 2,
    title: { es: "El primer dia de Pip", en: "Pip's first day" },
    sentences: [
      { en: "Pip is new in Hello Village.", es: "Pip es nuevo en el Pueblo Hola." },
      { en: 'He says: "Hello, I am Pip."', es: "El dice: «Hola, soy Pip»." },
      { en: 'Lina says: "Hi, Pip! How are you?"', es: "Lina dice: «¡Hola, Pip! ¿Como estas?»" },
      { en: 'Pip says: "I am fine, thank you."', es: "Pip dice: «Estoy bien, gracias»." },
    ],
    questions: [
      {
        id: "hello-story-q1",
        prompt: { es: "¿Quien es nuevo en el pueblo?", en: "Who is new in the village?" },
        options: [
          textOption("hello-story-q1-pip", "Pip"),
          textOption("hello-story-q1-lina", "Lina"),
          textOption("hello-story-q1-sam", "Sam"),
        ],
        answerId: "hello-story-q1-pip",
      },
      {
        id: "hello-story-q2",
        prompt: { es: "¿Que dice Pip primero?", en: "What does Pip say first?" },
        options: [
          textOption("hello-story-q2-hello", "Hello"),
          textOption("hello-story-q2-goodbye", "Goodbye"),
          textOption("hello-story-q2-no", "No"),
        ],
        answerId: "hello-story-q2-hello",
      },
      {
        id: "hello-story-q3",
        prompt: { es: "¿Como esta Pip?", en: "How is Pip?" },
        options: [
          textOption("hello-story-q3-fine", "Fine"),
          textOption("hello-story-q3-sad", "Sad"),
          textOption("hello-story-q3-tired", "Tired"),
        ],
        answerId: "hello-story-q3-fine",
      },
    ],
  }),
] as const;
