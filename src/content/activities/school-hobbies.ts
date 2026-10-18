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

const BOOK = imageVisual("book", "Un libro abierto con paginas");
const PENCIL = imageVisual("pencil", "Un lapiz amarillo afilado");
const TEACHER = imageVisual("teacher", "Una maestra junto a una pizarra");
const FRIEND = imageVisual("friend", "Dos amigas de la mano");
const READ = imageVisual("read", "Una persona leyendo un libro abierto");
const DRAW = imageVisual("draw", "Un lapiz dibujando una linea sobre papel");
const DANCE = imageVisual("dance", "Una persona bailando con una nota musical");
const SWIM = imageVisual("swim", "Una persona nadando entre olas");
const SING = imageVisual("sing", "Una persona cantando con notas musicales");
const PLAY = imageVisual("play", "Un balon blanco con rayas de colores");

const option = (id: string, visual: VocabularyVisual): ChoiceOption => ({ id, visual });
const word = (id: string, label: string): ChoiceOption => ({ id, label });

const pairOf = (id: string, label: string, visual: VocabularyVisual): MatchingPair => ({
  id,
  left: { id, label },
  right: { id, visual },
});

/** Mundo 11: School & Hobbies. */
export const SCHOOL_HOBBIES_ACTIVITIES: readonly Activity[] = [
  buildListenAndChoose({
    id: "school-01-listen",
    worldId: "school-hobbies",
    lessonId: "school-01",
    order: 1,
    vocabularyIds: ["teacher", "friend", "book"],
    say: "teacher",
    options: [option("teacher", TEACHER), option("friend", FRIEND), option("book", BOOK)],
    answerId: "teacher",
    hints: [
      {
        es: "Es la persona que explica en la pizarra.",
        en: "It is the person explaining on the board.",
      },
    ],
  }),
  buildImageChoice({
    id: "school-01-choice",
    worldId: "school-hobbies",
    lessonId: "school-01",
    order: 2,
    vocabularyIds: ["pencil", "book", "teacher"],
    promptWord: "pencil",
    options: [option("pencil", PENCIL), option("book", BOOK), option("teacher", TEACHER)],
    answerId: "pencil",
    hints: [
      {
        es: "Lo usas para escribir y dibujar; es amarillo en el dibujo.",
        en: "You use it to write and draw; it is yellow in the picture.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "school-01-pairs",
    worldId: "school-hobbies",
    lessonId: "school-01",
    order: 3,
    vocabularyIds: ["book", "pencil", "teacher", "friend"],
    pairs: [
      pairOf("p-book", "book", BOOK),
      pairOf("p-pencil", "pencil", PENCIL),
      pairOf("p-teacher", "teacher", TEACHER),
      pairOf("p-friend", "friend", FRIEND),
    ],
  }),
  buildSentenceCompletion({
    id: "school-01-complete",
    worldId: "school-hobbies",
    lessonId: "school-01",
    order: 4,
    vocabularyIds: ["book", "pencil", "friend"],
    sentence: "This is my ___. I read it every night.",
    translation: "Este es mi libro. Lo leo cada noche.",
    options: [word("book", "book"), word("pencil", "pencil"), word("friend", "friend")],
    answerId: "book",
    hints: [
      {
        es: "Lo abres para leer paginas.",
        en: "You open it to read pages.",
      },
    ],
  }),
  buildWordBuilder({
    id: "school-01-build",
    worldId: "school-hobbies",
    lessonId: "school-01",
    order: 5,
    vocabularyIds: ["book"],
    answer: "book",
    translation: "libro",
    extraTokens: ["b", "o", "k", "u"],
    hints: [
      {
        es: "Tiene dos o seguidas en el medio.",
        en: "It has two o letters together in the middle.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "school-02-listen",
    worldId: "school-hobbies",
    lessonId: "school-02",
    order: 1,
    vocabularyIds: ["read", "draw", "dance"],
    say: "I like to read",
    options: [option("read", READ), option("draw", DRAW), option("dance", DANCE)],
    answerId: "read",
    hints: [
      {
        es: "Lo haces con un libro abierto.",
        en: "You do it with an open book.",
      },
    ],
  }),
  buildImageChoice({
    id: "school-02-choice",
    worldId: "school-hobbies",
    lessonId: "school-02",
    order: 2,
    vocabularyIds: ["dance", "sing", "draw"],
    promptWord: "dance",
    options: [option("dance", DANCE), option("sing", SING), option("draw", DRAW)],
    answerId: "dance",
    hints: [
      {
        es: "Mueves el cuerpo con la musica.",
        en: "You move your body to the music.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "school-02-pairs",
    worldId: "school-hobbies",
    lessonId: "school-02",
    order: 3,
    vocabularyIds: ["read", "draw", "dance", "sing"],
    pairs: [
      pairOf("p-read", "read", READ),
      pairOf("p-draw", "draw", DRAW),
      pairOf("p-dance", "dance", DANCE),
      pairOf("p-sing", "sing", SING),
    ],
  }),
  buildSentenceCompletion({
    id: "school-02-complete",
    worldId: "school-hobbies",
    lessonId: "school-02",
    order: 4,
    vocabularyIds: ["draw", "pencil", "read"],
    sentence: "I like to ___ pictures with my pencil.",
    translation: "Me gusta dibujar con mi lapiz.",
    options: [word("draw", "draw"), word("read", "read"), word("sing", "sing")],
    answerId: "draw",
    hints: [
      {
        es: "Es la actividad del lapiz y el papel.",
        en: "It is the activity with the pencil and paper.",
      },
    ],
  }),
  buildWordBuilder({
    id: "school-02-build",
    worldId: "school-hobbies",
    lessonId: "school-02",
    order: 5,
    vocabularyIds: ["dance"],
    answer: "dance",
    translation: "bailar",
    extraTokens: ["c", "e", "d", "a"],
    hints: [
      {
        es: "Empieza por dan y termina en -ce.",
        en: "Start with dan and finish with -ce.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "school-03-listen",
    worldId: "school-hobbies",
    lessonId: "school-03",
    order: 1,
    vocabularyIds: ["swim", "play", "dance"],
    say: "I can swim",
    options: [option("swim", SWIM), option("play", PLAY), option("dance", DANCE)],
    answerId: "swim",
    hints: [
      {
        es: "Lo haces en el agua.",
        en: "You do it in the water.",
      },
    ],
  }),
  buildImageChoice({
    id: "school-03-choice",
    worldId: "school-hobbies",
    lessonId: "school-03",
    order: 2,
    vocabularyIds: ["play", "swim", "read"],
    promptWord: "play",
    options: [option("play", PLAY), option("swim", SWIM), option("read", READ)],
    answerId: "play",
    hints: [
      {
        es: "Lo haces con un balon o un juego.",
        en: "You do it with a ball or a game.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "school-03-pairs",
    worldId: "school-hobbies",
    lessonId: "school-03",
    order: 3,
    vocabularyIds: ["swim", "play", "read", "draw"],
    pairs: [
      pairOf("p-swim", "swim", SWIM),
      pairOf("p-play", "play", PLAY),
      pairOf("p-read", "read", READ),
      pairOf("p-draw", "draw", DRAW),
    ],
  }),
  buildSentenceCompletion({
    id: "school-03-complete",
    worldId: "school-hobbies",
    lessonId: "school-03",
    order: 4,
    vocabularyIds: ["swim", "play", "sing"],
    sentence: "I can ___ fast in the pool.",
    translation: "Se nadar rapido en la piscina.",
    options: [word("swim", "swim"), word("play", "play"), word("sing", "sing")],
    answerId: "swim",
    hints: [
      {
        es: "Es la habilidad que haces en el agua.",
        en: "It is the skill you do in the water.",
      },
    ],
  }),
  buildWordBuilder({
    id: "school-03-build",
    worldId: "school-hobbies",
    lessonId: "school-03",
    order: 5,
    vocabularyIds: ["swim", "play"],
    mode: "words",
    answer: "I can swim",
    translation: "se nadar",
    extraTokens: ["play"],
    hints: [
      {
        es: "Empieza con I can y termina con la habilidad del agua.",
        en: "Start with I can and finish with the water skill.",
      },
    ],
  }),
  buildStoryQuiz({
    id: "school-03-story",
    worldId: "school-hobbies",
    lessonId: "school-03",
    order: 6,
    vocabularyIds: ["draw", "read", "play", "dance"],
    difficulty: 2,
    title: { es: "La feria de hobbies", en: "The hobbies fair" },
    sentences: [
      {
        en: "Today there is a hobbies fair at school.",
        es: "Hoy hay una feria de hobbies en la escuela.",
      },
      { en: "Mia can draw and Ben can sing.", es: "Mia sabe dibujar y Ben sabe cantar." },
      {
        en: "Lina likes to read and Tom likes to dance.",
        es: "A Lina le gusta leer y a Tom le gusta bailar.",
      },
      {
        en: "Everyone plays a game and everyone is happy.",
        es: "Todos juegan un juego y todos estan felices.",
      },
    ],
    questions: [
      {
        id: "school-story-q1",
        prompt: { es: "¿Que sabe hacer Mia?", en: "What can Mia do?" },
        options: [
          word("school-story-q1-draw", "She can draw"),
          word("school-story-q1-sing", "She can sing"),
          word("school-story-q1-swim", "She can swim"),
        ],
        answerId: "school-story-q1-draw",
      },
      {
        id: "school-story-q2",
        prompt: { es: "¿Que le gusta hacer a Lina?", en: "What does Lina like to do?" },
        options: [
          word("school-story-q2-read", "She likes to read"),
          word("school-story-q2-dance", "She likes to dance"),
          word("school-story-q2-draw", "She likes to draw"),
        ],
        answerId: "school-story-q2-read",
      },
      {
        id: "school-story-q3",
        prompt: { es: "¿Que hacen todos al final?", en: "What does everyone do at the end?" },
        options: [
          word("school-story-q3-game", "They play a game"),
          word("school-story-q3-homework", "They do homework"),
          word("school-story-q3-sleep", "They sleep"),
        ],
        answerId: "school-story-q3-game",
      },
    ],
  }),
];
