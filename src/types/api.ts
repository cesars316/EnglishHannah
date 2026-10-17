/** Contratos HTTP de la API `/api/v1`. */

import type { ActivityResponse, LocalizedText } from "./content";
import type { MasteryStatus } from "./domain";

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

/** Payload de `POST /api/v1/activities/:activityId/answer`. */
export type AnswerActivityInput = {
  profileId: string;
  clientAttemptId: string;
  response: ActivityResponse;
  durationMs: number;
  hintUsed: boolean;
};

export type AnswerActivityResult = {
  isCorrect: boolean;
  duplicate: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  feedback: LocalizedText;
  nextReviewAt: string | null;
  masteryStatus: MasteryStatus;
};

export type CompleteLessonInput = {
  profileId: string;
  clientAttemptId: string;
};

export type CompleteLessonResult = {
  duplicate: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  earnedBadgeIds: string[];
  unlockedWorldIds: string[];
  completedWorld: string | null;
};
