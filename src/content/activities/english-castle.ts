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

const CASTLE = imageVisual("castle", "Un castillo de piedra con dos torres");
const CROWN = imageVisual("crown", "Una corona dorada con joyas");
const GATE = imageVisual("gate", "Un porton de madera con barras");
const FLAG = imageVisual("flag", "Una bandera roja en un poste");
const KNIGHT = imageVisual("knight", "Un caballero con armadura y penacho");
const DRAGON = imageVisual("dragon", "Un dragon verde amigable");
const BRAVE = imageVisual("brave", "Un escudo azul con una estrella dorada");
const MAGIC = imageVisual("magic", "Una varita magia con estrellas");
const HAPPY = imageVisual("happy", "Una cara feliz amarilla");
const APPLE = imageVisual("apple", "Una manzana roja");
const HOUSE = imageVisual("house", "Una casa con tejado rojo y puerta");
const SUN = imageVisual("sun", "Un sol amarillo con rayos");

const option = (id: string, visual: VocabularyVisual): ChoiceOption => ({ id, visual });
const word = (id: string, label: string): ChoiceOption => ({ id, label });

const pairOf = (id: string, label: string, visual: VocabularyVisual): MatchingPair => ({
  id,
  left: { id, label },
  right: { id, visual },
});

/** Mundo 12: English Castle. Repaso integrado de la aventura. */
export const ENGLISH_CASTLE_ACTIVITIES: readonly Activity[] = [
  buildListenAndChoose({
    id: "castle-01-listen",
    worldId: "english-castle",
    lessonId: "castle-01",
    order: 1,
    vocabularyIds: ["gate", "flag", "castle"],
    say: "gate",
    options: [option("gate", GATE), option("flag", FLAG), option("castle", CASTLE)],
    answerId: "gate",
    hints: [
      {
        es: "Es la gran puerta de madera por la que se entra.",
        en: "It is the big wooden door you go in through.",
      },
    ],
  }),
  buildImageChoice({
    id: "castle-01-choice",
    worldId: "english-castle",
    lessonId: "castle-01",
    order: 2,
    vocabularyIds: ["knight", "castle", "flag"],
    promptWord: "knight",
    options: [option("knight", KNIGHT), option("castle", CASTLE), option("flag", FLAG)],
    answerId: "knight",
    hints: [
      {
        es: "Lleva armadura y guarda la puerta.",
        en: "It wears armour and guards the door.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "castle-01-pairs",
    worldId: "english-castle",
    lessonId: "castle-01",
    order: 3,
    vocabularyIds: ["castle", "gate", "flag", "knight"],
    pairs: [
      pairOf("p-castle", "castle", CASTLE),
      pairOf("p-gate", "gate", GATE),
      pairOf("p-flag", "flag", FLAG),
      pairOf("p-knight", "knight", KNIGHT),
    ],
  }),
  buildSentenceCompletion({
    id: "castle-01-complete",
    worldId: "english-castle",
    lessonId: "castle-01",
    order: 4,
    vocabularyIds: ["castle", "house", "gate"],
    sentence: "Welcome to the ___! The knight is at the gate.",
    translation: "¡Bienvenido al castillo! El caballero esta en el porton.",
    options: [word("castle", "castle"), word("house", "house"), word("garden", "garden")],
    answerId: "castle",
    hints: [
      {
        es: "Es el edificio grande de piedra con torres.",
        en: "It is the big stone building with towers.",
      },
    ],
  }),
  buildWordBuilder({
    id: "castle-01-build",
    worldId: "english-castle",
    lessonId: "castle-01",
    order: 5,
    vocabularyIds: ["castle"],
    answer: "castle",
    translation: "castillo",
    extraTokens: ["c", "l", "e", "s"],
    hints: [
      {
        es: "Empieza por cas y termina en -tle.",
        en: "Start with cas and finish with -tle.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "castle-02-listen",
    worldId: "english-castle",
    lessonId: "castle-02",
    order: 1,
    vocabularyIds: ["dragon", "magic", "brave"],
    say: "dragon",
    options: [option("dragon", DRAGON), option("magic", MAGIC), option("brave", BRAVE)],
    answerId: "dragon",
    hints: [
      {
        es: "Es verde, amigable y puede volar.",
        en: "It is green, friendly and can fly.",
      },
    ],
  }),
  buildImageChoice({
    id: "castle-02-choice",
    worldId: "english-castle",
    lessonId: "castle-02",
    order: 2,
    vocabularyIds: ["magic", "brave", "dragon"],
    promptWord: "magic",
    options: [option("magic", MAGIC), option("brave", BRAVE), option("dragon", DRAGON)],
    answerId: "magic",
    hints: [
      {
        es: "Es lo que tiene la varita de estrellas.",
        en: "It is what the star wand has.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "castle-02-pairs",
    worldId: "english-castle",
    lessonId: "castle-02",
    order: 3,
    vocabularyIds: ["dragon", "magic", "brave", "happy"],
    pairs: [
      pairOf("p-dragon", "dragon", DRAGON),
      pairOf("p-magic", "magic", MAGIC),
      pairOf("p-brave", "brave", BRAVE),
      pairOf("p-happy", "happy", HAPPY),
    ],
  }),
  buildSentenceCompletion({
    id: "castle-02-complete",
    worldId: "english-castle",
    lessonId: "castle-02",
    order: 4,
    vocabularyIds: ["brave", "scared", "happy"],
    sentence: "The dragon is friendly. I feel brave, not ___.",
    translation: "El dragon es amigable. Me siento valiente, no asustado.",
    options: [word("scared", "scared"), word("happy", "happy"), word("tired", "tired")],
    answerId: "scared",
    hints: [
      {
        es: "Es el sentimiento de Feelings Garden que desaparece ante un dragon amigable.",
        en: "It is the Feelings Garden feeling that goes away with a friendly dragon.",
      },
    ],
  }),
  buildWordBuilder({
    id: "castle-02-build",
    worldId: "english-castle",
    lessonId: "castle-02",
    order: 5,
    vocabularyIds: ["brave"],
    answer: "brave",
    translation: "valiente",
    extraTokens: ["r", "v", "a", "e"],
    hints: [
      {
        es: "Suena como breiv y empieza por br.",
        en: "It sounds like breiv and starts with br.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "castle-03-listen",
    worldId: "english-castle",
    lessonId: "castle-03",
    order: 1,
    vocabularyIds: ["crown", "castle", "flag"],
    say: "crown",
    options: [option("crown", CROWN), option("castle", CASTLE), option("flag", FLAG)],
    answerId: "crown",
    hints: [
      {
        es: "La lleva la reina en la cabeza; es dorada.",
        en: "The queen wears it on her head; it is golden.",
      },
    ],
  }),
  buildImageChoice({
    id: "castle-03-choice",
    worldId: "english-castle",
    lessonId: "castle-03",
    order: 2,
    vocabularyIds: ["sun", "apple", "house"],
    promptWord: "sun",
    options: [option("sun", SUN), option("apple", APPLE), option("house", HOUSE)],
    answerId: "sun",
    hints: [
      {
        es: "Lo viste en Weather Mountain: amarillo y en el cielo.",
        en: "You saw it in Weather Mountain: yellow and in the sky.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "castle-03-pairs",
    worldId: "english-castle",
    lessonId: "castle-03",
    order: 3,
    vocabularyIds: ["crown", "apple", "house", "sun"],
    pairs: [
      pairOf("p-crown", "crown", CROWN),
      pairOf("p-apple", "apple", APPLE),
      pairOf("p-house", "house", HOUSE),
      pairOf("p-sun", "sun", SUN),
    ],
  }),
  buildSentenceCompletion({
    id: "castle-03-complete",
    worldId: "english-castle",
    lessonId: "castle-03",
    order: 4,
    vocabularyIds: ["house", "castle", "crown"],
    sentence: "This is my favourite place: the ___, with a golden crown inside.",
    translation: "Este es mi lugar favorito: el castillo, con una corona dorada dentro.",
    options: [word("castle", "castle"), word("house", "house"), word("garden", "garden")],
    answerId: "castle",
    hints: [
      {
        es: "Es el lugar del mundo 12, con torres y un porton.",
        en: "It is the world 12 place, with towers and a gate.",
      },
    ],
  }),
  buildWordBuilder({
    id: "castle-03-build",
    worldId: "english-castle",
    lessonId: "castle-03",
    order: 5,
    vocabularyIds: ["crown", "castle"],
    mode: "words",
    answer: "I like the castle",
    translation: "me gusta el castillo",
    extraTokens: ["crown"],
    hints: [
      {
        es: "Empieza con I like y termina con el lugar de piedra con torres.",
        en: "Start with I like and finish with the stone place with towers.",
      },
    ],
  }),
  buildStoryQuiz({
    id: "castle-03-story",
    worldId: "english-castle",
    lessonId: "castle-03",
    order: 6,
    vocabularyIds: ["castle", "crown", "happy", "sun"],
    difficulty: 2,
    title: { es: "La corona de English Quest", en: "The English Quest crown" },
    sentences: [
      {
        en: "Lina walks to the top of the castle.",
        es: "Lina camina hasta lo alto del castillo.",
      },
      {
        en: "The knight says: hello! You can open the gate.",
        es: "El caballero dice: hello! Puedes abrir el porton.",
      },
      {
        en: "Inside there is a golden crown on the table.",
        es: "Dentro hay una corona dorada sobre la mesa.",
      },
      {
        en: "Lina feels happy and says: thank you, English Quest!",
        es: "Lina se siente feliz y dice: thank you, English Quest!",
      },
    ],
    questions: [
      {
        id: "castle-story-q1",
        prompt: { es: "¿Que hay dentro del castillo?", en: "What is inside the castle?" },
        options: [
          word("castle-story-q1-crown", "A golden crown"),
          word("castle-story-q1-dragon", "A green dragon"),
          word("castle-story-q1-flag", "A red flag"),
        ],
        answerId: "castle-story-q1-crown",
      },
      {
        id: "castle-story-q2",
        prompt: { es: "¿Que le dice el caballero a Lina?", en: "What does the knight say to Lina?" },
        options: [
          word("castle-story-q2-gate", "You can open the gate"),
          word("castle-story-q2-sleep", "You must sleep here"),
          word("castle-story-q2-run", "You must run away"),
        ],
        answerId: "castle-story-q2-gate",
      },
      {
        id: "castle-story-q3",
        prompt: { es: "¿Como se siente Lina al final?", en: "How does Lina feel at the end?" },
        options: [
          word("castle-story-q3-happy", "Happy"),
          word("castle-story-q3-sad", "Sad"),
          word("castle-story-q3-angry", "Angry"),
        ],
        answerId: "castle-story-q3-happy",
      },
    ],
  }),
];
