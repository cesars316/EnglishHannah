/** Entidades de dominio persistidas en MongoDB. */

import type { Difficulty, LocalizedText, Skill } from "./content";

export type MasteryStatus = "new" | "learning" | "practicing" | "review" | "mastered";

export type ChallengeLevel = "gentle" | "steady" | "champion";

/**
 * Ajuste de dificultad calculado a partir del progreso (Fase 7).
 *
 * El contenido es codigo versionado y NO cambia en ejecucion: lo que se adapta
 * es que actividades de repaso (dificultad 1, 2 o 3) se proponen primero.
 * Nunca se persiste; se deriva de registros e intentos en cada lectura.
 */
export type Challenge = {
  level: ChallengeLevel;
  /** Dificultad de las actividades que conviene practicar ahora. */
  preferredDifficulty: Difficulty;
  /** Etiqueta amable del nivel, para la interfaz. */
  label: LocalizedText;
  /** Motivo del nivel elegido, en frases amables y sin notas. */
  reason: LocalizedText;
  /** Precision sobre intentos con respuesta (0-1); `null` sin datos. */
  accuracy: number | null;
  attemptedActivities: number;
  masteredWords: number;
};

export type ProgressEntityType = "vocabulary" | "skill" | "world" | "lesson";

export type ProfileSettings = {
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
};

export type Profile = {
  id: string;
  displayName: string;
  avatarId: string;
  locale: string;
  targetLanguage: string;
  settings: ProfileSettings;
  createdAt: string;
  updatedAt: string;
};

export type ProgressRecord = {
  id: string;
  profileId: string;
  entityType: ProgressEntityType;
  entityId: string;
  status: MasteryStatus;
  seenCount: number;
  correctCount: number;
  incorrectCount: number;
  activityTypesCompleted: string[];
  /** Sesiones distintas (por dia) en las que se practico correctamente. */
  distinctPracticeDays: number;
  lastPracticedAt: string | null;
  nextReviewAt: string | null;
  masteryScore: number;
  source: "session" | "review" | "story";
  updatedAt: string;
};

export type ActivityAttemptResult = "correct" | "incorrect" | "self-reported";

export type ActivityAttempt = {
  id: string;
  profileId: string;
  activityId: string;
  lessonId: string;
  worldId: string;
  skill: Skill;
  result: ActivityAttemptResult;
  attemptNumber: number;
  durationMs: number;
  hintUsed: boolean;
  xpAwarded: number;
  createdAt: string;
};

export type GameState = {
  profileId: string;
  xp: number;
  coins: number;
  currentWorldId: string | null;
  unlockedWorldIds: string[];
  completedLessonIds: string[];
  completedWorldIds: string[];
  earnedBadgeIds: string[];
  activityCount: number;
  lastActivityAt: string | null;
  updatedAt: string;
};

export type AvatarId =
  | "fox-explorer"
  | "owl-scholar"
  | "cat-artist"
  | "panda-pilot"
  | "dolphin-diver"
  | "bee-builder"
  | "unicorn-dreamer";

export type Avatar = {
  id: AvatarId;
  label: string;
  emoji: string;
  /** Colores usados por la ilustracion SVG original. */
  primary: string;
  soft: string;
};

/** Resumen agregado para el panel parental. */
export type ProgressSummary = {
  /** Nivel de reto vigente para la sesion de repaso. */
  challenge: Challenge;
  xp: number;
  coins: number;
  activitiesCompleted: number;
  minutesPracticed: number;
  worldsVisited: number;
  worldsCompleted: number;
  vocabularySeen: number;
  vocabularyMastered: number;
  /** Estado de cada palabra practicada (pantalla de coleccion). */
  vocabulary: {
    entityId: string;
    status: MasteryStatus;
    seenCount: number;
    correctCount: number;
  }[];
  bySkill: Record<Skill, { attempts: number; correct: number }>;
  reviewSuggestions: {
    entityId: string;
    word: string;
    translation: string;
    status: MasteryStatus;
    nextReviewAt: string | null;
  }[];
  recentActivity: {
    activityId: string;
    worldId: string;
    skill: Skill;
    result: ActivityAttemptResult;
    createdAt: string;
  }[];
  earnedBadgeIds: string[];
};
