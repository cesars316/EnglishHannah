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

const MUM = imageVisual("mum", "Sonrisa de una madre");
const DAD = imageVisual("dad", "Sonrisa de un padre");
const SISTER = imageVisual("sister", "Una nena con coletas");
const BROTHER = imageVisual("brother", "Un neno con el pelo de punta");
const GRANDMA = imageVisual("grandma", "Una abuela con gafas y moño");
const GRANDPA = imageVisual("grandpa", "Un abuelo con gafas y bigote");
const BABY = imageVisual("baby", "Un bebe con chupete");
const FAMILY = imageVisual("family", "Tres caras de familia juntas");
const LOVE = imageVisual("love", "Un corazon rojo");
const HOME = imageVisual("home", "Una casa con tejado rojo");

const option = (id: string, visual: VocabularyVisual): ChoiceOption => ({ id, visual });
const word = (id: string, label: string): ChoiceOption => ({ id, label });

const pairOf = (id: string, label: string, visual: VocabularyVisual): MatchingPair => ({
  id,
  left: { id, label },
  right: { id, visual },
});

/** Mundo 5: Family Home. */
export const FAMILY_HOME_ACTIVITIES: readonly Activity[] = [
  buildListenAndChoose({
    id: "family-01-listen",
    worldId: "family-home",
    lessonId: "family-01",
    order: 1,
    vocabularyIds: ["mum", "dad", "sister"],
    say: "mum",
    options: [option("mum", MUM), option("dad", DAD), option("sister", SISTER)],
    answerId: "mum",
    hints: [
      {
        es: "Es la persona que te canta canciones antes de dormir.",
        en: "It is the person who sings to you before sleeping.",
      },
    ],
  }),
  buildImageChoice({
    id: "family-01-choice",
    worldId: "family-home",
    lessonId: "family-01",
    order: 2,
    vocabularyIds: ["dad", "mum", "brother"],
    promptWord: "dad",
    options: [option("dad", DAD), option("mum", MUM), option("brother", BROTHER)],
    answerId: "dad",
    hints: [{ es: "Tiene bigote en el dibujo.", en: "He has a moustache in the picture." }],
  }),
  buildMatchingPairs({
    id: "family-01-pairs",
    worldId: "family-home",
    lessonId: "family-01",
    order: 3,
    vocabularyIds: ["mum", "dad", "sister", "brother"],
    pairs: [
      pairOf("p-mum", "mum", MUM),
      pairOf("p-dad", "dad", DAD),
      pairOf("p-sister", "sister", SISTER),
      pairOf("p-brother", "brother", BROTHER),
    ],
  }),
  buildSentenceCompletion({
    id: "family-01-complete",
    worldId: "family-home",
    lessonId: "family-01",
    order: 4,
    vocabularyIds: ["sister", "brother", "baby"],
    sentence: "This is my ___.",
    translation: "Esta es mi hermana.",
    options: [word("sister", "sister"), word("brother", "brother"), word("baby", "baby")],
    answerId: "sister",
    hints: [
      {
        es: "La frase ya te dice que es una persona de tu familia.",
        en: "The sentence already tells you it is someone in your family.",
      },
    ],
  }),
  buildWordBuilder({
    id: "family-01-build",
    worldId: "family-home",
    lessonId: "family-01",
    order: 5,
    vocabularyIds: ["sister"],
    answer: "sister",
    translation: "hermana",
    extraTokens: ["r", "e", "s", "t"],
    hints: [
      {
        es: "Empieza por sis y termina con -ter.",
        en: "Start with sis and finish with -ter.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "family-02-listen",
    worldId: "family-home",
    lessonId: "family-02",
    order: 1,
    vocabularyIds: ["grandma", "grandpa", "mum"],
    say: "grandma",
    options: [option("grandma", GRANDMA), option("grandpa", GRANDPA), option("mum", MUM)],
    answerId: "grandma",
    hints: [
      {
        es: "Es la abuela: la madre de tu mama o de tu papa.",
        en: "It is the grandma: your mum's or dad's mother.",
      },
    ],
  }),
  buildImageChoice({
    id: "family-02-choice",
    worldId: "family-home",
    lessonId: "family-02",
    order: 2,
    vocabularyIds: ["baby", "brother", "sister"],
    promptWord: "baby",
    options: [option("baby", BABY), option("brother", BROTHER), option("sister", SISTER)],
    answerId: "baby",
    hints: [{ es: "Es la persona mas pequeña.", en: "It is the smallest person." }],
  }),
  buildMatchingPairs({
    id: "family-02-pairs",
    worldId: "family-home",
    lessonId: "family-02",
    order: 3,
    vocabularyIds: ["grandma", "grandpa", "baby", "family"],
    pairs: [
      pairOf("p-grandma", "grandma", GRANDMA),
      pairOf("p-grandpa", "grandpa", GRANDPA),
      pairOf("p-baby", "baby", BABY),
      pairOf("p-family", "family", FAMILY),
    ],
  }),
  buildSentenceCompletion({
    id: "family-02-complete",
    worldId: "family-home",
    lessonId: "family-02",
    order: 4,
    vocabularyIds: ["grandma", "grandpa", "mum"],
    sentence: "This is my ___. She bakes cookies.",
    translation: "Esta es mi abuela. Horrea galletas.",
    options: [
      word("grandma", "grandma"),
      word("grandpa", "grandpa"),
      word("mum", "mum"),
    ],
    answerId: "grandma",
    hints: [
      {
        es: "El pronombre She te da la pista: es una mujer mayor.",
        en: "The word She is a clue: it is a woman.",
      },
    ],
  }),
  buildWordBuilder({
    id: "family-02-build",
    worldId: "family-home",
    lessonId: "family-02",
    order: 5,
    vocabularyIds: ["family"],
    answer: "family",
    translation: "familia",
    extraTokens: ["i", "y", "l", "a"],
    hints: [
      {
        es: "Suena como FA-mi-li, con dos veces la letra i.",
        en: "It sounds like FA-mi-li, with the letter i twice.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "family-03-listen",
    worldId: "family-home",
    lessonId: "family-03",
    order: 1,
    vocabularyIds: ["love", "family", "home"],
    say: "I love my family",
    options: [option("love", LOVE), option("home", HOME), option("family", FAMILY)],
    answerId: "love",
    hints: [
      {
        es: "Es el verbo que expresa cariño; el dibujo es un corazon.",
        en: "It is the verb for caring; the picture is a heart.",
      },
    ],
  }),
  buildImageChoice({
    id: "family-03-choice",
    worldId: "family-home",
    lessonId: "family-03",
    order: 2,
    vocabularyIds: ["family", "mum", "home"],
    promptWord: "family",
    options: [option("family", FAMILY), option("mum", MUM), option("home", HOME)],
    answerId: "family",
    hints: [
      {
        es: "Son varias caras juntas: es la familia entera.",
        en: "Several faces together: it is the whole family.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "family-03-pairs",
    worldId: "family-home",
    lessonId: "family-03",
    order: 3,
    vocabularyIds: ["love", "home", "family", "baby"],
    pairs: [
      pairOf("p-love", "love", LOVE),
      pairOf("p-home", "home", HOME),
      pairOf("p-family", "family", FAMILY),
      pairOf("p-baby", "baby", BABY),
    ],
  }),
  buildSentenceCompletion({
    id: "family-03-complete",
    worldId: "family-home",
    lessonId: "family-03",
    order: 4,
    vocabularyIds: ["love", "family", "home"],
    sentence: "I ___ my family.",
    translation: "Quiero a mi familia.",
    options: [word("love", "love"), word("home", "home"), word("family", "family")],
    answerId: "love",
    hints: [
      {
        es: "Despues de I va un verbo en infinitivo.",
        en: "After I comes a verb in its base form.",
      },
    ],
  }),
  buildWordBuilder({
    id: "family-03-build",
    worldId: "family-home",
    lessonId: "family-03",
    order: 5,
    vocabularyIds: ["family", "home"],
    mode: "words",
    answer: "This is my family",
    translation: "esta es mi familia",
    extraTokens: ["home"],
    hints: [
      {
        es: "Empieza con This y termina con la palabra familia.",
        en: "Start with This and finish with the word for family.",
      },
    ],
  }),
  buildStoryQuiz({
    id: "family-03-story",
    worldId: "family-home",
    lessonId: "family-03",
    order: 6,
    vocabularyIds: ["family", "mum", "grandma", "love"],
    difficulty: 2,
    title: { es: "La foto de familia", en: "The family photo" },
    sentences: [
      { en: "Today is a special day.", es: "Hoy es un dia especial." },
      { en: "Mum and Dad stand in the middle.", es: "Mama y papa estan en el centro." },
      { en: "Grandma brings the baby.", es: "La abuela trae al bebe." },
      { en: "Everyone says: I love my family!", es: "Todos dicen: ¡Quiero a mi familia!" },
    ],
    questions: [
      {
        id: "family-story-q1",
        prompt: {
          es: "¿Quien esta en el centro de la foto?",
          en: "Who is in the middle of the photo?",
        },
        options: [
          word("family-story-q1-mum-dad", "Mum and Dad"),
          word("family-story-q1-grandma", "Grandma and the baby"),
          word("family-story-q1-sister", "Sister and brother"),
        ],
        answerId: "family-story-q1-mum-dad",
      },
      {
        id: "family-story-q2",
        prompt: { es: "¿Quien trae al bebe?", en: "Who brings the baby?" },
        options: [
          word("family-story-q2-grandma", "Grandma"),
          word("family-story-q2-grandpa", "Grandpa"),
          word("family-story-q2-brother", "Brother"),
        ],
        answerId: "family-story-q2-grandma",
      },
      {
        id: "family-story-q3",
        prompt: { es: "¿Que dice la familia?", en: "What does the family say?" },
        options: [
          word("family-story-q3-love", "I love my family"),
          word("family-story-q3-home", "I love my home"),
          word("family-story-q3-sleep", "I love my bed"),
        ],
        answerId: "family-story-q3-love",
      },
    ],
  }),
];
