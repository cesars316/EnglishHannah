/**
 * Modelo de contenido pedagogico.
 *
 * Fuente de verdad: codigo versionado en `src/content` (ver ADR 0002).
 * MongoDB guarda solo progreso, nunca contenido.
 */

export type LanguageCode = "es" | "en";

export type LocalizedText = {
  es: string;
  en: string;
};

export type Skill = "listening" | "reading" | "vocabulary" | "speaking" | "writing";

export type ActivityType =
  | "listen-and-choose"
  | "image-choice"
  | "matching-pairs"
  | "word-builder"
  | "sentence-completion"
  | "speak-and-check"
  | "camera-hunt"
  | "story-quiz";

export type Difficulty = 1 | 2 | 3;

export type ContentSourceKind = "original" | "public-domain" | "cc0" | "cc-by" | "own-audio";

export type ContentSource = {
  kind: ContentSourceKind;
  license: string;
  url: string | null;
};

/**
 * Representacion visual de una palabra.
 *
 * Se evitan archivos ficticios: o existe un SVG original versionado, o el
 * visual se dibuja a partir de datos (`color`, `count`).
 */
export type VocabularyVisual =
  | { kind: "image"; src: string; alt: string }
  | { kind: "color"; hex: string; alt: string }
  | { kind: "count"; count: number; alt: string };

export type VocabularyItem = {
  id: string;
  worldId: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  /** Ayuda de pronunciacion simplificada. NO es transcripcion IPA. */
  phonetic: string;
  visual: VocabularyVisual;
  /** `null` => se usa sintesis de voz del navegador (TTS). */
  audio: string | null;
  example: LocalizedText;
  acceptedAnswers: string[];
  tags: string[];
  objective: string;
  source: ContentSource;
  contentVersion: number;
};

/** Opcion visual/auditiva reutilizada por varias actividades. */
export type ChoiceOption = {
  id: string;
  label?: string;
  visual?: VocabularyVisual;
  audio?: string | null;
};

export type PairSide = {
  id: string;
  label?: string;
  visual?: VocabularyVisual;
  audio?: string | null;
};

export type MatchingPair = {
  id: string;
  left: PairSide;
  right: PairSide;
};

export type StorySentence = {
  en: string;
  es: string;
};

export type QuizQuestion = {
  id: string;
  prompt: LocalizedText;
  options: ChoiceOption[];
  answerKey: { optionId: string };
};

type ActivityBase = {
  id: string;
  worldId: string;
  lessonId: string;
  skill: Skill;
  prompt: LocalizedText;
  instructions: LocalizedText;
  hints: LocalizedText[];
  xp: number;
  difficulty: Difficulty;
  vocabularyIds: string[];
  audio: string | null;
  /** Orden dentro de la leccion. */
  order: number;
  contentVersion: number;
};

export type ListenAndChooseActivity = ActivityBase & {
  type: "listen-and-choose";
  content: {
    stimulus: { type: "audio" | "text"; value: string };
    options: ChoiceOption[];
  };
  answerKey: { optionId: string };
};

export type ImageChoiceActivity = ActivityBase & {
  type: "image-choice";
  content: {
    promptWord: string;
    options: ChoiceOption[];
  };
  answerKey: { optionId: string };
};

export type MatchingPairsActivity = ActivityBase & {
  type: "matching-pairs";
  content: { pairs: MatchingPair[] };
  answerKey: { pairs: { leftId: string; rightId: string }[] };
};

export type WordBuilderActivity = ActivityBase & {
  type: "word-builder";
  content: {
    mode: "letters" | "words";
    tokens: string[];
    translation: string;
  };
  answerKey: { text: string };
};

export type SentenceCompletionActivity = ActivityBase & {
  type: "sentence-completion";
  content: {
    /** Oracion con el hueco marcado como `___`. */
    sentence: string;
    translation: string;
    options: ChoiceOption[];
  };
  answerKey: { optionId: string };
};

export type SpeakAndCheckActivity = ActivityBase & {
  type: "speak-and-check";
  content: {
    target: string;
    translation: string;
    acceptedAnswers: string[];
  };
  answerKey: { acceptedAnswers: string[] };
};

export type CameraHuntActivity = ActivityBase & {
  type: "camera-hunt";
  content: {
    target: string;
    translation: string;
    why: LocalizedText;
    fallbackOptions: ChoiceOption[];
  };
  answerKey: { optionId: string };
};

export type StoryQuizActivity = ActivityBase & {
  type: "story-quiz";
  content: {
    title: LocalizedText;
    sentences: StorySentence[];
    questions: QuizQuestion[];
  };
  answerKey: { questions: { questionId: string; optionId: string }[] };
};

export type Activity =
  | ListenAndChooseActivity
  | ImageChoiceActivity
  | MatchingPairsActivity
  | WordBuilderActivity
  | SentenceCompletionActivity
  | SpeakAndCheckActivity
  | CameraHuntActivity
  | StoryQuizActivity;

/** `Omit` distributivo sobre uniones. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * Actividad tal como se envia al cliente: nunca incluye `answerKey`
 * (ver ADR 0004).
 */
export type PublicActivity = DistributiveOmit<Activity, "answerKey">;

export type Lesson = {
  id: string;
  worldId: string;
  order: number;
  title: LocalizedText;
  intro: LocalizedText;
  objectives: string[];
  vocabularyIds: string[];
  activityIds: string[];
  estimatedMinutes: number;
  isFinalMission: boolean;
  contentVersion: number;
  published: boolean;
};

export type WorldTheme = {
  primary: string;
  soft: string;
  emoji: string;
};

export type World = {
  id: string;
  title: LocalizedText;
  order: number;
  description: LocalizedText;
  goal: LocalizedText;
  level: string;
  prerequisites: string[];
  lessonIds: string[];
  badgeId: string;
  theme: WorldTheme;
  contentVersion: number;
  published: boolean;
};

export type BadgeKind = "world" | "milestone";

export type Badge = {
  id: string;
  kind: BadgeKind;
  title: LocalizedText;
  description: LocalizedText;
  emoji: string;
  worldId: string | null;
};

/* -------------------------------------------------------------------------- */
/* Respuestas y evaluacion                                                    */
/* -------------------------------------------------------------------------- */

export type ChoiceResponse = { kind: "choice"; optionId: string };
export type PairsResponse = { kind: "pairs"; pairs: { leftId: string; rightId: string }[] };
export type TextResponse = { kind: "text"; text: string };
export type SpeechResponse = { kind: "speech"; transcript: string | null };
export type SelfReportResponse = { kind: "self-report"; practiced: boolean };

export type ActivityResponse =
  ChoiceResponse | PairsResponse | TextResponse | SpeechResponse | SelfReportResponse;

/** Tipo de respuesta que espera cada actividad. */
export type ResponseKind = ActivityResponse["kind"];

export type ActivityEvaluation = {
  isCorrect: boolean;
  /** Opciones correctas, para resaltarlas en la interfaz. */
  correctOptionIds: string[];
  /** Texto esperado cuando aplica (word-builder / speak-and-check). */
  expectedText?: string;
  /** Pares correctos cuando aplica (matching-pairs). */
  correctPairs?: { leftId: string; rightId: string }[];
  /** Indica que la actividad se completo por autoevaluacion (sin penalizacion). */
  selfReported?: boolean;
};
