import { CONTENT_VERSION } from "@/config/game";
import type {
  ChoiceOption,
  ContentSource,
  Difficulty,
  ImageChoiceActivity,
  ListenAndChooseActivity,
  LocalizedText,
  MatchingPair,
  MatchingPairsActivity,
  SentenceCompletionActivity,
  Skill,
  VocabularyVisual,
  WordBuilderActivity,
} from "@/types/content";

/**
 * Constructores de actividades.
 *
 * Existen para que el contenido no repita campos y para garantizar que TODAS
 * las actividades cumplen el mismo contrato (seccion 5 del documento maestro:
 * motor reutilizable, no una pantalla distinta por palabra).
 */

export const ORIGINAL_SVG_SOURCE: ContentSource = {
  kind: "original",
  license: "CC0-1.0",
  url: null,
};

export const IMAGE_PATH = (id: string): string => `/images/vocabulary/${id}.svg`;

export const imageVisual = (id: string, alt: string): VocabularyVisual => ({
  kind: "image",
  src: IMAGE_PATH(id),
  alt,
});

export const colorVisual = (hex: string, alt: string): VocabularyVisual => ({
  kind: "color",
  hex,
  alt,
});

export const countVisual = (count: number, alt: string): VocabularyVisual => ({
  kind: "count",
  count,
  alt,
});

const difficultyFor = (order: number): Difficulty => (order <= 1 ? 1 : order === 2 ? 2 : 3);

type BaseInput = {
  id: string;
  worldId: string;
  lessonId: string;
  order: number;
  vocabularyIds: string[];
  /** Por defecto lo define cada tipo de actividad. */
  skill?: Skill;
  hints?: LocalizedText[];
  xp?: number;
  difficulty?: Difficulty;
  prompt?: LocalizedText;
  instructions?: LocalizedText;
};

function base(input: BaseInput) {
  return {
    id: input.id,
    worldId: input.worldId,
    lessonId: input.lessonId,
    order: input.order,
    skill: input.skill ?? "vocabulary",
    prompt: input.prompt ?? { es: "Escucha y elige.", en: "Listen and choose." },
    instructions: input.instructions ?? {
      es: "Toca una opcion. Puedes volver a escuchar todas las veces que quieras.",
      en: "Tap an option. You can listen again as many times as you like.",
    },
    hints: input.hints ?? [],
    xp: input.xp ?? 10,
    difficulty: input.difficulty ?? difficultyFor(input.order),
    vocabularyIds: input.vocabularyIds,
    audio: null,
    contentVersion: CONTENT_VERSION,
  };
}

export type ListenAndChooseInput = BaseInput & {
  /** Texto que se pronuncia con sintesis de voz. */
  say: string;
  options: ChoiceOption[];
  answerId: string;
};

export function buildListenAndChoose(input: ListenAndChooseInput): ListenAndChooseActivity {
  return {
    ...base({
      ...input,
      skill: "listening",
      prompt: input.prompt ?? {
        es: "Escucha con atencion y elige la opcion correcta.",
        en: "Listen carefully and choose the right option.",
      },
    }),
    type: "listen-and-choose",
    content: {
      stimulus: { type: "text", value: input.say },
      options: input.options,
    },
    answerKey: { optionId: input.answerId },
  };
}

export type ImageChoiceInput = BaseInput & {
  promptWord: string;
  options: ChoiceOption[];
  answerId: string;
};

export function buildImageChoice(input: ImageChoiceInput): ImageChoiceActivity {
  return {
    ...base({
      ...input,
      skill: input.skill ?? "vocabulary",
      prompt: input.prompt ?? {
        es: `Toca la imagen de "${input.promptWord}".`,
        en: `Tap the picture of "${input.promptWord}".`,
      },
    }),
    type: "image-choice",
    content: { promptWord: input.promptWord, options: input.options },
    answerKey: { optionId: input.answerId },
  };
}

export type MatchingPairsInput = BaseInput & {
  pairs: MatchingPair[];
};

export function buildMatchingPairs(input: MatchingPairsInput): MatchingPairsActivity {
  return {
    ...base({
      ...input,
      skill: input.skill ?? "reading",
      prompt: input.prompt ?? {
        es: "Une cada palabra con su dibujo.",
        en: "Match each word with its picture.",
      },
      instructions: input.instructions ?? {
        es: "Toca una palabra y luego su dibujo. Tambien puedes usar el teclado.",
        en: "Tap a word and then its picture. You can use the keyboard too.",
      },
    }),
    type: "matching-pairs",
    content: { pairs: input.pairs },
    answerKey: {
      pairs: input.pairs.map((pair) => ({ leftId: pair.left.id, rightId: pair.right.id })),
    },
  };
}

export type WordBuilderInput = BaseInput & {
  answer: string;
  mode?: "letters" | "words";
  translation: string;
  /** Tokens extra opcionales para que el ejercicio tenga distractores. */
  extraTokens?: string[];
};

export function buildWordBuilder(input: WordBuilderInput): WordBuilderActivity {
  const mode = input.mode ?? "letters";
  const extra = input.extraTokens ?? [];
  const tokens =
    mode === "letters"
      ? [...input.answer.replace(/\s/g, "").split(""), ...extra]
      : [...input.answer.split(" "), ...extra];

  return {
    ...base({
      ...input,
      skill: "writing",
      prompt:
        input.prompt ??
        (mode === "letters"
          ? { es: "Ordena las letras para escribir la palabra.", en: "Put the letters in order." }
          : { es: "Ordena las palabras para formar la frase.", en: "Put the words in order." }),
    }),
    type: "word-builder",
    content: { mode, tokens, translation: input.translation },
    answerKey: { text: input.answer },
  };
}

export type SentenceCompletionInput = BaseInput & {
  sentence: string;
  translation: string;
  options: ChoiceOption[];
  answerId: string;
};

export function buildSentenceCompletion(
  input: SentenceCompletionInput,
): SentenceCompletionActivity {
  return {
    ...base({
      ...input,
      skill: input.skill ?? "reading",
      prompt: input.prompt ?? { es: "Completa la frase.", en: "Complete the sentence." },
    }),
    type: "sentence-completion",
    content: {
      sentence: input.sentence,
      translation: input.translation,
      options: input.options,
    },
    answerKey: { optionId: input.answerId },
  };
}

/** Opcion con solo texto (para completar frases y distractores). */
export const textOption = (id: string, label: string): ChoiceOption => ({ id, label });
