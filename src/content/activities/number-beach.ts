import {
  buildImageChoice,
  buildListenAndChoose,
  buildMatchingPairs,
  buildSentenceCompletion,
  buildWordBuilder,
  countVisual,
  textOption,
} from "@/content/helpers";
import type { Activity, ChoiceOption, MatchingPair } from "@/types/content";

/** Opcion de conteo: el id es la palabra en ingles del numero. */
const counter = (word: string, value: number): ChoiceOption => ({
  id: word,
  visual: countVisual(value, `Grupo de ${value} puntos para contar`),
});

const ONE = counter("one", 1);
const TWO = counter("two", 2);
const THREE = counter("three", 3);
const FOUR = counter("four", 4);
const FIVE = counter("five", 5);
const SIX = counter("six", 6);
const SEVEN = counter("seven", 7);
const EIGHT = counter("eight", 8);
const NINE = counter("nine", 9);
const TEN = counter("ten", 10);
const ELEVEN = counter("eleven", 11);
const TWELVE = counter("twelve", 12);
const THIRTEEN = counter("thirteen", 13);
const FOURTEEN = counter("fourteen", 14);
const FIFTEEN = counter("fifteen", 15);
const SIXTEEN = counter("sixteen", 16);
const SEVENTEEN = counter("seventeen", 17);
const EIGHTEEN = counter("eighteen", 18);
const NINETEEN = counter("nineteen", 19);
const TWENTY = counter("twenty", 20);

/** Une la palabra del numero con su grupo de puntos. */
function numberPairs(...options: readonly ChoiceOption[]): MatchingPair[] {
  return options.map((option) => ({
    id: `p-${option.id}`,
    left: { id: option.id, label: option.id },
    right: { id: option.id, visual: option.visual },
  }));
}

/** Actividades del mundo 3: Number Beach. */
export const NUMBER_BEACH_ACTIVITIES: readonly Activity[] = [
  /* ------------------------- number-01: del 1 al 5 ------------------------- */
  buildListenAndChoose({
    id: "number-01-listen",
    worldId: "number-beach",
    lessonId: "number-01",
    order: 1,
    vocabularyIds: ["three", "one", "five"],
    say: "three",
    options: [THREE, ONE, FIVE],
    answerId: "three",
    hints: [{ es: "Cuenta los puntos: hay uno mas que dos.", en: "One more than two." }],
  }),
  buildImageChoice({
    id: "number-01-choice",
    worldId: "number-beach",
    lessonId: "number-01",
    order: 2,
    vocabularyIds: ["four", "two", "five"],
    promptWord: "four",
    options: [FIVE, FOUR, TWO],
    answerId: "four",
    hints: [{ es: "Es el numero que va despues del tres.", en: "It comes after three." }],
  }),
  buildMatchingPairs({
    id: "number-01-pairs",
    worldId: "number-beach",
    lessonId: "number-01",
    order: 3,
    vocabularyIds: ["one", "two", "three"],
    pairs: numberPairs(ONE, TWO, THREE),
  }),
  buildSentenceCompletion({
    id: "number-01-complete",
    worldId: "number-beach",
    lessonId: "number-01",
    order: 4,
    vocabularyIds: ["three", "five", "two"],
    prompt: {
      es: "En la mesa hay 3 manzanas. Completa la frase.",
      en: "There are 3 apples on the table. Complete the sentence.",
    },
    sentence: "I have ___ apples.",
    translation: "Tengo tres manzanas.",
    options: [textOption("three", "three"), textOption("five", "five"), textOption("two", "two")],
    answerId: "three",
    hints: [{ es: "Hay 3 manzanas en la mesa.", en: "There are 3 apples on the table." }],
  }),

  /* ------------------------ number-02: del 6 al 10 ------------------------- */
  buildListenAndChoose({
    id: "number-02-listen",
    worldId: "number-beach",
    lessonId: "number-02",
    order: 1,
    vocabularyIds: ["seven", "six", "nine"],
    say: "seven",
    options: [SIX, SEVEN, NINE],
    answerId: "seven",
    hints: [{ es: "Va despues del seis y antes del ocho.", en: "After six, before eight." }],
  }),
  buildImageChoice({
    id: "number-02-choice",
    worldId: "number-beach",
    lessonId: "number-02",
    order: 2,
    vocabularyIds: ["ten", "eight", "seven"],
    promptWord: "ten",
    options: [EIGHT, TEN, SEVEN],
    answerId: "ten",
    hints: [{ es: "Son los dedos de las dos manos.", en: "The fingers of both hands." }],
  }),
  buildMatchingPairs({
    id: "number-02-pairs",
    worldId: "number-beach",
    lessonId: "number-02",
    order: 3,
    vocabularyIds: ["six", "eight", "ten"],
    pairs: numberPairs(SIX, EIGHT, TEN),
  }),
  buildWordBuilder({
    id: "number-02-build",
    worldId: "number-beach",
    lessonId: "number-02",
    order: 4,
    vocabularyIds: ["eight"],
    answer: "eight",
    translation: "ocho",
    extraTokens: ["t"],
    hints: [{ es: "Empieza con e y termina con t.", en: "It starts with e and ends with t." }],
  }),

  /* ------------------- number-03: mision final del mundo ------------------- */
  buildListenAndChoose({
    id: "number-03-listen",
    worldId: "number-beach",
    lessonId: "number-03",
    order: 1,
    vocabularyIds: ["thirteen", "seventeen", "fifteen"],
    say: "thirteen",
    options: [SEVENTEEN, THIRTEEN, FIFTEEN],
    answerId: "thirteen",
    hints: [{ es: "Es el numero que empieza con thir-.", en: "It starts with thir-." }],
  }),
  buildImageChoice({
    id: "number-03-choice",
    worldId: "number-beach",
    lessonId: "number-03",
    order: 2,
    vocabularyIds: ["twenty", "sixteen", "twelve", "fourteen"],
    promptWord: "twenty",
    options: [SIXTEEN, TWENTY, TWELVE, FOURTEEN],
    answerId: "twenty",
    hints: [{ es: "Es el numero mas grande: dos decenas.", en: "The biggest number: two tens." }],
  }),
  buildMatchingPairs({
    id: "number-03-pairs",
    worldId: "number-beach",
    lessonId: "number-03",
    order: 3,
    vocabularyIds: ["eleven", "eighteen", "nineteen"],
    pairs: numberPairs(ELEVEN, EIGHTEEN, NINETEEN),
  }),
  buildWordBuilder({
    id: "number-03-build",
    worldId: "number-beach",
    lessonId: "number-03",
    order: 4,
    vocabularyIds: ["twelve"],
    answer: "twelve",
    translation: "doce",
    extraTokens: ["e"],
    hints: [{ es: "Empieza con t y termina con v e.", en: "It starts with t." }],
  }),
  buildSentenceCompletion({
    id: "number-03-complete",
    worldId: "number-beach",
    lessonId: "number-03",
    order: 5,
    vocabularyIds: ["nine", "one", "ten"],
    prompt: {
      es: 'Alguien pregunta: "How old are you?" (¿Cuantos años tienes?). Tu tienes 9.',
      en: 'Someone asks: "How old are you?". You are 9.',
    },
    sentence: "I am ___ .",
    translation: "Tengo nueve.",
    options: [textOption("nine", "nine"), textOption("one", "one"), textOption("ten", "ten")],
    answerId: "nine",
    hints: [{ es: "Responde con un numero: el tuyo es 9.", en: "Answer with a number." }],
  }),
] as const;
