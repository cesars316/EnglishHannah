/** Entidades de dominio persistidas en MongoDB. */

import type { Skill } from "./content";

export type MasteryStatus = "new" | "learning" | "practicing" | "review" | "mastered";

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
  "fox-explorer" | "owl-scholar" | "cat-artist" | "panda-pilot" | "dolphin-diver" | "bee-builder";

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
