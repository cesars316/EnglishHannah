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

const HAPPY = imageVisual("happy", "Una cara feliz amarilla");
const SAD = imageVisual("sad", "Una cara triste azul con una lagrima");
const CRY = imageVisual("cry", "Una cara que llora con lagrimas");
const SMILE = imageVisual("smile", "Una sonrisa con cachetes rosas");
const ANGRY = imageVisual("angry", "Una cara enfadada con cejas juntas");
const TIRED = imageVisual("tired", "Una cara cansada bostezando");
const SCARED = imageVisual("scared", "Una cara asustada con ojos muy abiertos");
const FEEL = imageVisual("feel", "Una persona con el corazon en el pecho");
const HUNGRY = imageVisual("hungry", "Una cara con hambre y cubiertos al lado");
const THIRSTY = imageVisual("thirsty", "Una cara con sed y un vaso de agua");
const FEELINGS = imageVisual("feelings", "Cuatro caras con emociones distintas");

const option = (id: string, visual: VocabularyVisual): ChoiceOption => ({ id, visual });
const word = (id: string, label: string): ChoiceOption => ({ id, label });

const pairOf = (id: string, label: string, visual: VocabularyVisual): MatchingPair => ({
  id,
  left: { id, label },
  right: { id, visual },
});

/** Mundo 9: Feelings Garden. */
export const FEELINGS_GARDEN_ACTIVITIES: readonly Activity[] = [
  buildListenAndChoose({
    id: "feel-01-listen",
    worldId: "feelings-garden",
    lessonId: "feel-01",
    order: 1,
    vocabularyIds: ["happy", "sad", "cry"],
    say: "happy",
    options: [option("happy", HAPPY), option("sad", SAD), option("cry", CRY)],
    answerId: "happy",
    hints: [
      {
        es: "Es la cara que sonrie mucho.",
        en: "It is the face that smiles a lot.",
      },
    ],
  }),
  buildImageChoice({
    id: "feel-01-choice",
    worldId: "feelings-garden",
    lessonId: "feel-01",
    order: 2,
    vocabularyIds: ["sad", "happy", "smile"],
    promptWord: "sad",
    options: [option("sad", SAD), option("happy", HAPPY), option("smile", SMILE)],
    answerId: "sad",
    hints: [
      {
        es: "Tiene una lagrima en la cara.",
        en: "There is a tear on the face.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "feel-01-pairs",
    worldId: "feelings-garden",
    lessonId: "feel-01",
    order: 3,
    vocabularyIds: ["happy", "sad", "cry", "smile"],
    pairs: [
      pairOf("p-happy", "happy", HAPPY),
      pairOf("p-sad", "sad", SAD),
      pairOf("p-cry", "cry", CRY),
      pairOf("p-smile", "smile", SMILE),
    ],
  }),
  buildSentenceCompletion({
    id: "feel-01-complete",
    worldId: "feelings-garden",
    lessonId: "feel-01",
    order: 4,
    vocabularyIds: ["feel", "sad", "happy"],
    sentence: "How do you feel? I ___ sad.",
    translation: "¿Como te sientes? Me siento triste.",
    options: [word("feel", "feel"), word("feels", "feels"), word("am", "am")],
    answerId: "feel",
    hints: [
      {
        es: "Despues de I va la forma base del verbo.",
        en: "After I comes the base form of the verb.",
      },
    ],
  }),
  buildWordBuilder({
    id: "feel-01-build",
    worldId: "feelings-garden",
    lessonId: "feel-01",
    order: 5,
    vocabularyIds: ["happy"],
    answer: "happy",
    translation: "feliz",
    extraTokens: ["p", "p", "y", "a"],
    hints: [
      {
        es: "Tiene dos p seguidas.",
        en: "It has two p letters together.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "feel-02-listen",
    worldId: "feelings-garden",
    lessonId: "feel-02",
    order: 1,
    vocabularyIds: ["tired", "angry", "scared"],
    say: "tired",
    options: [option("tired", TIRED), option("angry", ANGRY), option("scared", SCARED)],
    answerId: "tired",
    hints: [
      {
        es: "Es la cara que bosteza y quiere dormir.",
        en: "It is the face yawning and wanting to sleep.",
      },
    ],
  }),
  buildImageChoice({
    id: "feel-02-choice",
    worldId: "feelings-garden",
    lessonId: "feel-02",
    order: 2,
    vocabularyIds: ["scared", "angry", "tired"],
    promptWord: "scared",
    options: [option("scared", SCARED), option("angry", ANGRY), option("tired", TIRED)],
    answerId: "scared",
    hints: [
      {
        es: "Tiene los ojos muy abiertos y la boca pequeña.",
        en: "It has wide-open eyes and a small mouth.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "feel-02-pairs",
    worldId: "feelings-garden",
    lessonId: "feel-02",
    order: 3,
    vocabularyIds: ["angry", "tired", "scared", "feel"],
    pairs: [
      pairOf("p-angry", "angry", ANGRY),
      pairOf("p-tired", "tired", TIRED),
      pairOf("p-scared", "scared", SCARED),
      pairOf("p-feel", "feel", FEEL),
    ],
  }),
  buildSentenceCompletion({
    id: "feel-02-complete",
    worldId: "feelings-garden",
    lessonId: "feel-02",
    order: 4,
    vocabularyIds: ["scared", "storm", "tired"],
    sentence: "I am ___ of the storm.",
    translation: "Tengo miedo de la tormenta.",
    options: [word("scared", "scared"), word("hungry", "hungry"), word("tired", "tired")],
    answerId: "scared",
    hints: [
      {
        es: "Es el mismo sentimiento que da una tormenta de noche.",
        en: "It is the same feeling a storm gives you at night.",
      },
    ],
  }),
  buildWordBuilder({
    id: "feel-02-build",
    worldId: "feelings-garden",
    lessonId: "feel-02",
    order: 5,
    vocabularyIds: ["angry"],
    answer: "angry",
    translation: "enfadado",
    extraTokens: ["r", "g", "n", "a"],
    hints: [
      {
        es: "Empieza por ang y termina en -ry.",
        en: "Start with ang and finish with -ry.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "feel-03-listen",
    worldId: "feelings-garden",
    lessonId: "feel-03",
    order: 1,
    vocabularyIds: ["hungry", "thirsty", "tired"],
    say: "I am hungry",
    options: [option("hungry", HUNGRY), option("thirsty", THIRSTY), option("tired", TIRED)],
    answerId: "hungry",
    hints: [
      {
        es: "Es cuando quieres comer algo.",
        en: "It is when you want to eat something.",
      },
    ],
  }),
  buildImageChoice({
    id: "feel-03-choice",
    worldId: "feelings-garden",
    lessonId: "feel-03",
    order: 2,
    vocabularyIds: ["thirsty", "hungry", "sad"],
    promptWord: "thirsty",
    options: [option("thirsty", THIRSTY), option("hungry", HUNGRY), option("sad", SAD)],
    answerId: "thirsty",
    hints: [
      {
        es: "Quieres beber un vaso de agua.",
        en: "You want to drink a glass of water.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "feel-03-pairs",
    worldId: "feelings-garden",
    lessonId: "feel-03",
    order: 3,
    vocabularyIds: ["hungry", "thirsty", "feelings", "happy"],
    pairs: [
      pairOf("p-hungry", "hungry", HUNGRY),
      pairOf("p-thirsty", "thirsty", THIRSTY),
      pairOf("p-feelings", "feelings", FEELINGS),
      pairOf("p-happy", "happy", HAPPY),
    ],
  }),
  buildSentenceCompletion({
    id: "feel-03-complete",
    worldId: "feelings-garden",
    lessonId: "feel-03",
    order: 4,
    vocabularyIds: ["feel", "happy", "sad"],
    sentence: "Are you OK? Yes, I ___.",
    translation: "¿Estas bien? Si, estoy bien.",
    options: [word("am", "am"), word("is", "is"), word("are", "are")],
    answerId: "am",
    hints: [
      {
        es: "Despues de I va am en presente.",
        en: "After I you use am in the present.",
      },
    ],
  }),
  buildWordBuilder({
    id: "feel-03-build",
    worldId: "feelings-garden",
    lessonId: "feel-03",
    order: 5,
    vocabularyIds: ["feel", "happy"],
    mode: "words",
    answer: "I feel happy",
    translation: "me siento feliz",
    extraTokens: ["sad"],
    hints: [
      {
        es: "Empieza con I feel y termina con la emocion que sonrie.",
        en: "Start with I feel and finish with the emotion that smiles.",
      },
    ],
  }),
  buildStoryQuiz({
    id: "feel-03-story",
    worldId: "feelings-garden",
    lessonId: "feel-03",
    order: 6,
    vocabularyIds: ["happy", "scared", "feel", "feelings"],
    difficulty: 2,
    title: { es: "Un dia en el jardin", en: "A day in the garden" },
    sentences: [
      { en: "Lina visits the feelings garden.", es: "Lina visita el jardin de los sentimientos." },
      { en: "In the morning she feels happy.", es: "Por la manana se siente feliz." },
      { en: "At night the wind is loud and she feels scared.", es: "De noche el viento hace ruido y se siente asustada." },
      { en: "She says: it is OK to feel. My feelings are important.", es: "Dice: esta bien sentir. Mis sentimientos son importantes." },
    ],
    questions: [
      {
        id: "feel-story-q1",
        prompt: { es: "¿Como se siente Lina por la manana?", en: "How does Lina feel in the morning?" },
        options: [
          word("feel-story-q1-happy", "Happy"),
          word("feel-story-q1-sad", "Sad"),
          word("feel-story-q1-tired", "Tired"),
        ],
        answerId: "feel-story-q1-happy",
      },
      {
        id: "feel-story-q2",
        prompt: { es: "¿Por que se siente asustada?", en: "Why does she feel scared?" },
        options: [
          word("feel-story-q2-wind", "The wind is loud"),
          word("feel-story-q2-sun", "The sun is hot"),
          word("feel-story-q2-food", "She is hungry"),
        ],
        answerId: "feel-story-q2-wind",
      },
      {
        id: "feel-story-q3",
        prompt: { es: "¿Que dice al final?", en: "What does she say at the end?" },
        options: [
          word("feel-story-q3-important", "My feelings are important"),
          word("feel-story-q3-loud", "My feelings are loud"),
          word("feel-story-q3-garden", "My garden is important"),
        ],
        answerId: "feel-story-q3-important",
      },
    ],
  }),
];
