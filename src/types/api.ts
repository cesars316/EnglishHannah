/** Contratos HTTP de la API `/api/v1`. */

import type {
  ActivityEvaluation,
  ActivityResponse,
  Badge,
  Lesson,
  LocalizedText,
  PublicActivity,
  VocabularyItem,
  WorldTheme,
} from "./content";
import type {
  ActivityAttempt,
  Challenge,
  GameState,
  Profile,
  ProgressRecord,
  ProgressSummary,
} from "./domain";

/* -------------------------------------------------------------------------- */
/* Sobre de respuesta                                                          */
/* -------------------------------------------------------------------------- */

export type ApiSuccess<T> = {
  data: T;
  meta: { requestId: string };
};

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "PARENT_AUTH_REQUIRED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PAYLOAD_TOO_LARGE"
  | "DB_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type ApiErrorBody = {
  code: ApiErrorCode;
  message: string;
  details?: { field: string; message: string }[];
};

export type ApiFailure = {
  error: ApiErrorBody;
  meta: { requestId: string };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function isApiFailure<T>(response: ApiResponse<T>): response is ApiFailure {
  return "error" in response;
}

/* -------------------------------------------------------------------------- */
/* Salud                                                                       */
/* -------------------------------------------------------------------------- */

export type HealthStatus = {
  status: "ok" | "degraded";
  database: "up" | "down" | "unconfigured";
  contentVersion: number;
  time: string;
};

/* -------------------------------------------------------------------------- */
/* Perfiles                                                                    */
/* -------------------------------------------------------------------------- */

export type ProfilesView = { profiles: Profile[] };
export type ProfileView = { profile: Profile };

/* -------------------------------------------------------------------------- */
/* Progreso                                                                    */
/* -------------------------------------------------------------------------- */

export type ProgressSummaryView = { summary: ProgressSummary };

/** Plan de repaso: palabras prioritarias, nivel de reto y actividades listas. */
export type ReviewPlan = {
  vocabularyIds: string[];
  activities: PublicActivity[];
  /** Nivel de reto elegido segun el progreso del perfil (Fase 7). */
  challenge: Challenge;
};

export type RewardsView = {
  gameState: GameState;
  badges: Badge[];
};

/* -------------------------------------------------------------------------- */
/* Catalogo                                                                    */
/* -------------------------------------------------------------------------- */

export type WorldSummary = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  goal: LocalizedText;
  order: number;
  level: string;
  theme: WorldTheme;
  prerequisites: string[];
  badgeId: string;
  unlocked: boolean;
  completed: boolean;
  lessonsCompleted: number;
  lessonsTotal: number;
};

export type LessonSummary = {
  id: string;
  worldId: string;
  order: number;
  title: LocalizedText;
  intro: LocalizedText;
  objectives: string[];
  estimatedMinutes: number;
  isFinalMission: boolean;
  vocabularyCount: number;
  activityCount: number;
  completed: boolean;
};

export type WorldsView = { worlds: WorldSummary[] };
export type WorldDetailView = { world: WorldSummary; lessons: LessonSummary[] };
export type LessonDetailView = {
  lesson: LessonSummary;
  activities: PublicActivity[];
  vocabulary: VocabularyItem[];
};

/* -------------------------------------------------------------------------- */
/* Juego                                                                       */
/* -------------------------------------------------------------------------- */

/** Payload de `POST /api/v1/activities/:activityId/answer`. */
export type AnswerActivityInput = {
  profileId: string;
  clientAttemptId: string;
  response: ActivityResponse;
  /** Intento dentro de esta sesion (1 = primero). */
  attemptNumber: number;
  durationMs: number;
  hintUsed: boolean;
  isReview: boolean;
};

export type AnswerActivityResult = {
  /** `true` si el `clientAttemptId` ya se habia registrado (reintento de red). */
  duplicate: boolean;
  evaluation: ActivityEvaluation;
  feedback: LocalizedText;
  xpAwarded: number;
  coinsAwarded: number;
  attemptNumber: number;
  solved: boolean;
  revealed: boolean;
  totalAttempts: number;
  gameState: GameState;
  earnedBadgeIds: string[];
};

/** Payload de `POST /api/v1/lessons/:lessonId/complete`. */
export type CompleteLessonInput = {
  profileId: string;
  clientAttemptId: string;
};

export type CompleteLessonResult = {
  duplicate: boolean;
  lessonId: string;
  xpAwarded: number;
  coinsAwarded: number;
  newlyCompletedWorldIds: string[];
  gameState: GameState;
  earnedBadgeIds: string[];
};

/* -------------------------------------------------------------------------- */
/* Zona parental                                                               */
/* -------------------------------------------------------------------------- */

export type ParentStatus = {
  hasPasscode: boolean;
  unlocked: boolean;
};

export type ParentOverview = {
  profile: Profile;
  summary: ProgressSummary;
};

export type ParentOverviewView = { profiles: ParentOverview[] };

/* -------------------------------------------------------------------------- */
/* Privacidad                                                                  */
/* -------------------------------------------------------------------------- */

export type ExportBundle = {
  schemaVersion: number;
  exportedAt: string;
  profile: Profile;
  gameState: GameState;
  progress: ProgressRecord[];
  attempts: ActivityAttempt[];
};

/** Reexport util para los consumidores de la API. */
export type { Badge, Lesson };
