import { CONTENT_VERSION } from "@/config/game";
import { ORIGINAL_SVG_SOURCE, countVisual } from "@/content/helpers";
import type { VocabularyItem } from "@/types/content";

type NumberEntry = {
  value: number;
  word: string;
  translation: string;
  phonetic: string;
};

/**
 * Mundo 3: Number Beach. Numeros del 1 al 20.
 * El visual es un grupo contable de puntos (mejor para contar que una imagen fija).
 */
const NUMBER_WORDS: readonly NumberEntry[] = [
  { value: 1, word: "one", translation: "uno", phonetic: "UAN" },
  { value: 2, word: "two", translation: "dos", phonetic: "TU" },
  { value: 3, word: "three", translation: "tres", phonetic: "ZRI" },
  { value: 4, word: "four", translation: "cuatro", phonetic: "FOR" },
  { value: 5, word: "five", translation: "cinco", phonetic: "FAIV" },
  { value: 6, word: "six", translation: "seis", phonetic: "SIKS" },
  { value: 7, word: "seven", translation: "siete", phonetic: "SE-ven" },
  { value: 8, word: "eight", translation: "ocho", phonetic: "EIT" },
  { value: 9, word: "nine", translation: "nueve", phonetic: "NAIN" },
  { value: 10, word: "ten", translation: "diez", phonetic: "TEN" },
  { value: 11, word: "eleven", translation: "once", phonetic: "i-LE-ven" },
  { value: 12, word: "twelve", translation: "doce", phonetic: "TUELV" },
  { value: 13, word: "thirteen", translation: "trece", phonetic: "ZER-tin" },
  { value: 14, word: "fourteen", translation: "catorce", phonetic: "FOR-tin" },
  { value: 15, word: "fifteen", translation: "quince", phonetic: "FIF-tin" },
  { value: 16, word: "sixteen", translation: "dieciseis", phonetic: "SIKS-tin" },
  { value: 17, word: "seventeen", translation: "diecisiete", phonetic: "SE-ven-tin" },
  { value: 18, word: "eighteen", translation: "dieciocho", phonetic: "EI-tin" },
  { value: 19, word: "nineteen", translation: "diecinueve", phonetic: "NAIN-tin" },
  { value: 20, word: "twenty", translation: "veinte", phonetic: "TUEN-ti" },
];

export const NUMBER_BEACH_VOCABULARY: readonly VocabularyItem[] = NUMBER_WORDS.map((entry) => {
  const noun = entry.value === 1 ? "apple" : "apples";
  return {
    id: entry.word,
    worldId: "number-beach",
    word: entry.word,
    translation: entry.translation,
    partOfSpeech: "numeral",
    phonetic: entry.phonetic,
    visual: countVisual(entry.value, `Un grupo de ${entry.value} puntos para contar`),
    audio: null,
    example: {
      en: `I have ${entry.word} ${noun}.`,
      es: `Tengo ${entry.translation} manzana${entry.value === 1 ? "" : "s"}.`,
    },
    acceptedAnswers: [entry.word],
    tags: ["numbers", "counting"],
    objective: `Reconocer y contar el numero ${entry.value}`,
    source: ORIGINAL_SVG_SOURCE,
    contentVersion: CONTENT_VERSION,
  };
});

export const NUMBER_WORDS_BY_VALUE: Readonly<Record<number, string>> = Object.fromEntries(
  NUMBER_WORDS.map((entry) => [entry.value, entry.word]),
);
