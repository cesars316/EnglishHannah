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

const animal = (id: string, alt: string): ChoiceOption => ({ id, visual: imageVisual(id, alt) });

const DOG = animal("dog", "Un perro");
const CAT = animal("cat", "Un gato");
const BIRD = animal("bird", "Un pajaro");
const FISH = animal("fish", "Un pez");
const RABBIT = animal("rabbit", "Un conejo");
const HORSE = animal("horse", "Un caballo");
const COW = animal("cow", "Una vaca");
const DUCK = animal("duck", "Un pato");
const LION = animal("lion", "Un leon");
const MONKEY = animal("monkey", "Un mono");

/** Une la palabra del animal con su dibujo. */
function animalPairs(...options: readonly ChoiceOption[]): MatchingPair[] {
  return options.map((option) => ({
    id: `p-${option.id}`,
    left: { id: option.id, label: option.id },
    right: { id: option.id, visual: option.visual },
  }));
}

/** Actividades del mundo 4: Animal Park. */
export const ANIMAL_PARK_ACTIVITIES: readonly Activity[] = [
  /* ------------------------ animal-01: amigos del parque ------------------- */
  buildListenAndChoose({
    id: "animal-01-listen",
    worldId: "animal-park",
    lessonId: "animal-01",
    order: 1,
    vocabularyIds: ["cat", "dog", "fish"],
    say: "cat",
    options: [DOG, CAT, FISH],
    answerId: "cat",
    hints: [{ es: "Es el animal que dice miau.", en: "It says meow." }],
  }),
  buildImageChoice({
    id: "animal-01-choice",
    worldId: "animal-park",
    lessonId: "animal-01",
    order: 2,
    vocabularyIds: ["bird", "dog", "cat"],
    promptWord: "bird",
    options: [BIRD, DOG, CAT],
    answerId: "bird",
    hints: [{ es: "Tiene plumas y puede volar.", en: "It has feathers and can fly." }],
  }),
  buildMatchingPairs({
    id: "animal-01-pairs",
    worldId: "animal-park",
    lessonId: "animal-01",
    order: 3,
    vocabularyIds: ["dog", "cat", "bird"],
    pairs: animalPairs(DOG, CAT, BIRD),
  }),
  buildWordBuilder({
    id: "animal-01-build",
    worldId: "animal-park",
    lessonId: "animal-01",
    order: 4,
    vocabularyIds: ["dog"],
    answer: "dog",
    translation: "perro",
    extraTokens: ["b"],
    hints: [{ es: "Tiene tres letras y empieza con d.", en: "Three letters, starts with d." }],
  }),

  /* --------------------------- animal-02: la granja ------------------------ */
  buildListenAndChoose({
    id: "animal-02-listen",
    worldId: "animal-park",
    lessonId: "animal-02",
    order: 1,
    vocabularyIds: ["horse", "rabbit", "cow"],
    say: "horse",
    options: [RABBIT, HORSE, COW],
    answerId: "horse",
    hints: [{ es: "Es el animal que galopa y relincha.", en: "It gallops and neighs." }],
  }),
  buildImageChoice({
    id: "animal-02-choice",
    worldId: "animal-park",
    lessonId: "animal-02",
    order: 2,
    vocabularyIds: ["duck", "cow", "horse"],
    promptWord: "duck",
    options: [DUCK, COW, HORSE],
    answerId: "duck",
    hints: [{ es: "Nada en el agua y dice cuac.", en: "It swims and says quack." }],
  }),
  buildMatchingPairs({
    id: "animal-02-pairs",
    worldId: "animal-park",
    lessonId: "animal-02",
    order: 3,
    vocabularyIds: ["rabbit", "horse", "cow"],
    pairs: animalPairs(RABBIT, HORSE, COW),
  }),
  buildSentenceCompletion({
    id: "animal-02-complete",
    worldId: "animal-park",
    lessonId: "animal-02",
    order: 4,
    vocabularyIds: ["cow", "bird", "fish"],
    prompt: {
      es: 'Completa la frase con el animal que dice "muu".',
      en: 'Complete the sentence with the animal that says "moo".',
    },
    sentence: "The ___ says moo.",
    translation: "La vaca dice muu.",
    options: [textOption("cow", "cow"), textOption("bird", "bird"), textOption("fish", "fish")],
    answerId: "cow",
    hints: [{ es: "Es blanca y negra y da leche.", en: "It is black and white and gives milk." }],
  }),

  /* ------------------------- animal-03: animales salvajes ------------------ */
  buildListenAndChoose({
    id: "animal-03-listen",
    worldId: "animal-park",
    lessonId: "animal-03",
    order: 1,
    vocabularyIds: ["lion", "monkey", "fish"],
    say: "lion",
    options: [LION, MONKEY, FISH],
    answerId: "lion",
    hints: [{ es: "Es el rey de la selva.", en: "It is the king of the jungle." }],
  }),
  buildImageChoice({
    id: "animal-03-choice",
    worldId: "animal-park",
    lessonId: "animal-03",
    order: 2,
    vocabularyIds: ["monkey", "lion", "bird"],
    promptWord: "monkey",
    options: [MONKEY, LION, BIRD],
    answerId: "monkey",
    hints: [{ es: "Le encanta saltar entre los arboles.", en: "It loves jumping in trees." }],
  }),
  buildMatchingPairs({
    id: "animal-03-pairs",
    worldId: "animal-park",
    lessonId: "animal-03",
    order: 3,
    vocabularyIds: ["lion", "monkey", "bird"],
    pairs: animalPairs(LION, MONKEY, BIRD),
  }),
  buildSentenceCompletion({
    id: "animal-03-complete",
    worldId: "animal-park",
    lessonId: "animal-03",
    order: 4,
    vocabularyIds: ["monkey", "bird", "fish"],
    prompt: {
      es: "El animal que trepa a los arboles y come platanos es...",
      en: "The animal that climbs trees and eats bananas is...",
    },
    sentence: "It's a ___ .",
    translation: "Es un mono.",
    options: [
      textOption("monkey", "monkey"),
      textOption("bird", "bird"),
      textOption("fish", "fish"),
    ],
    answerId: "monkey",
    hints: [
      { es: "Es muy jugueton y tiene cola larga.", en: "It is playful and has a long tail." },
    ],
  }),

  /* -------------------- animal-04: mision final del parque ----------------- */
  buildListenAndChoose({
    id: "animal-04-listen",
    worldId: "animal-park",
    lessonId: "animal-04",
    order: 1,
    vocabularyIds: ["duck", "dog", "cat"],
    say: "duck",
    options: [DOG, DUCK, CAT],
    answerId: "duck",
    hints: [{ es: "Empieza con d y vive cerca del agua.", en: "It starts with d." }],
  }),
  buildImageChoice({
    id: "animal-04-choice",
    worldId: "animal-park",
    lessonId: "animal-04",
    order: 2,
    vocabularyIds: ["horse", "cow", "rabbit"],
    promptWord: "horse",
    options: [HORSE, COW, RABBIT],
    answerId: "horse",
    hints: [{ es: "Es grande y te puedes montar en el.", en: "It is big and you can ride it." }],
  }),
  buildMatchingPairs({
    id: "animal-04-pairs",
    worldId: "animal-park",
    lessonId: "animal-04",
    order: 3,
    vocabularyIds: ["dog", "cat", "horse"],
    pairs: animalPairs(DOG, CAT, HORSE),
  }),
  buildWordBuilder({
    id: "animal-04-build",
    worldId: "animal-park",
    lessonId: "animal-04",
    order: 4,
    vocabularyIds: ["monkey"],
    answer: "monkey",
    translation: "mono",
    extraTokens: ["a"],
    hints: [{ es: "Tiene seis letras: m-o-n-k-e-y.", en: "Six letters: m-o-n-k-e-y." }],
  }),
  buildSentenceCompletion({
    id: "animal-04-complete",
    worldId: "animal-park",
    lessonId: "animal-04",
    order: 5,
    vocabularyIds: ["lion", "duck", "fish"],
    prompt: {
      es: "El animal con melena que ruge muy fuerte es...",
      en: "The animal with a mane that roars loudly is...",
    },
    sentence: "It's a ___ .",
    translation: "Es un leon.",
    options: [textOption("lion", "lion"), textOption("duck", "duck"), textOption("fish", "fish")],
    answerId: "lion",
    hints: [{ es: "Es el rey de la selva.", en: "It is the king of the jungle." }],
  }),
  buildStoryQuiz({
    id: "animal-04-story",
    worldId: "animal-park",
    lessonId: "animal-04",
    order: 6,
    vocabularyIds: ["dog", "bird", "cat", "horse"],
    difficulty: 2,
    title: { es: "El desfile de animales", en: "The animal parade" },
    sentences: [
      { en: "It is time for the animal parade!", es: "¡Es hora del desfile de animales!" },
      { en: "The dog runs first.", es: "El perro corre primero." },
      { en: "The cat walks after the dog.", es: "El gato camina despues del perro." },
      { en: "The horse and the bird join the parade.", es: "El caballo y el pajaro se unen al desfile." },
    ],
    questions: [
      {
        id: "animal-story-q1",
        prompt: { es: "¿Quien corre primero?", en: "Who runs first?" },
        options: [
          textOption("animal-story-q1-dog", "The dog"),
          textOption("animal-story-q1-cat", "The cat"),
          textOption("animal-story-q1-bird", "The bird"),
        ],
        answerId: "animal-story-q1-dog",
      },
      {
        id: "animal-story-q2",
        prompt: { es: "¿Quien camina despues del perro?", en: "Who walks after the dog?" },
        options: [
          textOption("animal-story-q2-cat", "The cat"),
          textOption("animal-story-q2-horse", "The horse"),
          textOption("animal-story-q2-fish", "The fish"),
        ],
        answerId: "animal-story-q2-cat",
      },
      {
        id: "animal-story-q3",
        prompt: { es: "¿Quien se une al desfile?", en: "Who joins the parade?" },
        options: [
          textOption("animal-story-q3-horse-bird", "The horse and the bird"),
          textOption("animal-story-q3-dog-fish", "The dog and the fish"),
          textOption("animal-story-q3-cat-monkey", "The cat and the monkey"),
        ],
        answerId: "animal-story-q3-horse-bird",
      },
    ],
  }),
] as const;
